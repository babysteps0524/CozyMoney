import {
  isRateLimited,
  type AuthEnv,
  json,
  normalizeEmail,
  originIsAllowed,
  parseJson,
  requireDb,
  randomToken,
  sendPasswordResetEmail,
  sha256,
} from './_shared';

interface Context {
  request: Request;
  env: AuthEnv;
}

const genericMessage =
  '해당 이메일로 계정이 있다면 비밀번호 재설정 안내를 보냈어요.';

const rateLimitMessage = '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.';

export const onRequestPost = async ({
  request,
  env,
}: Context): Promise<Response> => {
  if (!originIsAllowed(request))
    return json({ error: '요청을 확인할 수 없습니다.' }, 403);
  const dbError = requireDb(env);
  if (dbError) return dbError;
  if (await isRateLimited(request, env, 'forgot-password', 3, 3600)) {
    return json({ error: rateLimitMessage }, 429, { 'Retry-After': '3600' });
  }
  const body = await parseJson(request);
  const email = normalizeEmail(body?.email);
  if (!email)
    return json({ error: '올바른 이메일 주소를 입력해 주세요.' }, 400);

  // Apply an independent per-email limit after the shared per-IP limit.
  if (await isRateLimited(request, env, 'forgot-password', 3, 3600, email)) {
    return json({ error: rateLimitMessage }, 429, { 'Retry-After': '3600' });
  }

  const user = await env.D1_AUTH_DB.prepare(
    'SELECT id FROM users WHERE email = ? COLLATE NOCASE AND email_verified_at IS NOT NULL LIMIT 1',
  )
    .bind(email)
    .first<{ id: string }>();

  if (!user) return json({ message: genericMessage });

  const now = Math.floor(Date.now() / 1000);
  const token = randomToken();
  const tokenHash = await sha256(token);
  await env.D1_AUTH_DB.prepare(
    'DELETE FROM password_reset_tokens WHERE user_id = ?',
  )
    .bind(user.id)
    .run();
  await env.D1_AUTH_DB.prepare(
    'INSERT INTO password_reset_tokens (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)',
  )
    .bind(tokenHash, user.id, now + 3600, now)
    .run();

  try {
    await sendPasswordResetEmail(env, email, token);
  } catch {
    // Do not expose provider failures only for addresses that belong to users.
    console.error('[auth] Password reset email delivery failed.');
  }

  return json({ message: genericMessage });
};
