import {
  type AuthEnv,
  isRateLimited,
  json,
  originIsAllowed,
  requireDb,
  parseJson,
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
  if (await isRateLimited(request, env, 'verify-email', 10, 3600)) {
    return json(
      { error: '인증 시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.' },
      429,
      { 'Retry-After': '3600' },
    );
  }
  const body = await parseJson(request);
  const token = typeof body?.token === 'string' ? body.token : '';
  if (token.length < 20 || token.length > 200) {
    return json({ error: '인증 링크가 올바르지 않거나 만료됐습니다.' }, 400);
  }

  const tokenHash = await sha256(token);
  const now = Math.floor(Date.now() / 1000);
  // Consume the one-time token and create the user in one D1 batch. A
  // conditional INSERT ... SELECT means concurrent requests cannot both
  // create an account from the same pending-signup token.
  const results = await env.D1_AUTH_DB.batch([
    env.D1_AUTH_DB.prepare(
      'INSERT OR IGNORE INTO users (id, email, password_hash, email_verified_at, created_at, updated_at) SELECT ?, email, password_hash, ?, created_at, ? FROM pending_signups WHERE token_hash = ? AND expires_at > ?',
    ).bind(crypto.randomUUID(), now, now, tokenHash, now),
    env.D1_AUTH_DB.prepare(
      'DELETE FROM pending_signups WHERE token_hash = ? AND expires_at > ?',
    ).bind(tokenHash, now),
  ]);

  if (
    (results[0]?.meta?.changes ?? 0) !== 1 ||
    (results[1]?.meta?.changes ?? 0) !== 1
  ) {
    return json({ error: '인증 링크가 올바르지 않거나 만료됐습니다.' }, 400);
  }

  return json({ message: '이메일 인증이 완료됐습니다. 로그인해 주세요.' });
};
