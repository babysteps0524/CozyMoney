import {
  type AuthEnv,
  hashPassword,
  isRateLimited,
  json,
  originIsAllowed,
  parseJson,
  requireDb,
  sha256,
} from './_shared';

interface Context {
  request: Request;
  env: AuthEnv;
}

export const onRequestPost = async ({
  request,
  env,
}: Context): Promise<Response> => {
  if (!originIsAllowed(request))
    return json({ error: '요청을 확인할 수 없습니다.' }, 403);
  const dbError = requireDb(env);
  if (dbError) return dbError;
  if (await isRateLimited(request, env, 'reset-password', 5, 3600)) {
    return json(
      {
        error:
          '비밀번호 재설정 시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.',
      },
      429,
      { 'Retry-After': '3600' },
    );
  }
  const body = await parseJson(request);
  if (!body) return json({ error: '올바른 JSON 요청이 필요합니다.' }, 400);

  const token = typeof body.token === 'string' ? body.token : '';
  const password = typeof body.password === 'string' ? body.password : '';
  if (token.length < 20 || token.length > 200) {
    return json({ error: '재설정 링크가 올바르지 않거나 만료됐습니다.' }, 400);
  }
  if (password.length < 12 || password.length > 128) {
    return json(
      { error: '비밀번호는 12자 이상 128자 이하로 입력해 주세요.' },
      400,
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const tokenHash = await sha256(token);
  const record = await env.D1_AUTH_DB.prepare(
    'SELECT user_id FROM password_reset_tokens WHERE token_hash = ? AND expires_at > ? LIMIT 1',
  )
    .bind(tokenHash, now)
    .first<{ user_id: string }>();
  if (!record)
    return json({ error: '재설정 링크가 올바르지 않거나 만료됐습니다.' }, 400);

  const passwordHash = await hashPassword(password);
  // D1 batches execute every statement even when an UPDATE affects zero rows.
  // Make token invalidation conditional on the password update succeeding.
  const results = await env.D1_AUTH_DB.batch([
    env.D1_AUTH_DB.prepare(
      'UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ? AND EXISTS (SELECT 1 FROM password_reset_tokens WHERE token_hash = ? AND expires_at > ?)',
    ).bind(passwordHash, now, record.user_id, tokenHash, now),
    env.D1_AUTH_DB.prepare(
      'DELETE FROM password_reset_tokens WHERE user_id = ? AND EXISTS (SELECT 1 FROM users WHERE id = ? AND password_hash = ?)',
    ).bind(record.user_id, record.user_id, passwordHash),
    env.D1_AUTH_DB.prepare(
      'DELETE FROM auth_sessions WHERE user_id = ? AND EXISTS (SELECT 1 FROM users WHERE id = ? AND password_hash = ?)',
    ).bind(record.user_id, record.user_id, passwordHash),
  ]);

  if ((results[0]?.meta?.changes ?? 0) !== 1) {
    return json({ error: '재설정 링크가 올바르지 않거나 만료됐습니다.' }, 400);
  }

  return json({
    message: '비밀번호가 변경됐습니다. 새 비밀번호로 로그인해 주세요.',
  });
};
