import {
  isRateLimited,
  type AuthEnv,
  hashPassword,
  json,
  normalizeEmail,
  originIsAllowed,
  requireDb,
  parseJson,
  randomToken,
  sendVerificationEmail,
  sha256,
} from './_shared';

interface Context {
  request: Request;
  env: AuthEnv;
}

const genericMessage = '가입 요청을 처리했습니다. 이메일을 확인해 주세요.';
const rateLimitMessage = '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.';

export const onRequestPost = async ({
  request,
  env,
}: Context): Promise<Response> => {
  if (!originIsAllowed(request))
    return json({ error: '요청을 확인할 수 없습니다.' }, 403);
  const dbError = requireDb(env);
  if (dbError) return dbError;
  if (await isRateLimited(request, env, 'signup', 15, 3600)) {
    return json({ error: rateLimitMessage }, 429, { 'Retry-After': '3600' });
  }
  const body = await parseJson(request);
  if (!body) return json({ error: '올바른 JSON 요청이 필요합니다.' }, 400);

  const email = normalizeEmail(body.email);
  const password = typeof body.password === 'string' ? body.password : '';
  if (!email)
    return json({ error: '올바른 이메일 주소를 입력해 주세요.' }, 400);
  if (password.length < 12 || password.length > 128) {
    return json(
      { error: '비밀번호는 12자 이상 128자 이하로 입력해 주세요.' },
      400,
    );
  }

  if (await isRateLimited(request, env, 'signup', 5, 3600, email)) {
    return json({ error: rateLimitMessage }, 429, { 'Retry-After': '3600' });
  }

  await env.D1_AUTH_DB.prepare(
    'DELETE FROM pending_signups WHERE expires_at <= ?',
  )
    .bind(Math.floor(Date.now() / 1000))
    .run();

  const existingUser = await env.D1_AUTH_DB.prepare(
    'SELECT id FROM users WHERE email = ? COLLATE NOCASE LIMIT 1',
  )
    .bind(email)
    .first<{ id: string }>();

  if (existingUser) {
    return json({ message: genericMessage }, 202);
  }

  const now = Math.floor(Date.now() / 1000);
  const token = randomToken();
  const tokenHash = await sha256(token);
  const passwordHash = await hashPassword(password);

  await env.D1_AUTH_DB.prepare(
    'DELETE FROM pending_signups WHERE email = ? COLLATE NOCASE',
  )
    .bind(email)
    .run();
  await env.D1_AUTH_DB.prepare(
    'INSERT INTO pending_signups (email, password_hash, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)',
  )
    .bind(email, passwordHash, tokenHash, now + 86400, now)
    .run();

  try {
    await sendVerificationEmail(env, email, token);
  } catch {
    // Keep the public response consistent when the mail provider is unavailable.
    console.error('[auth] Signup verification email delivery failed.');
  }

  return json({ message: genericMessage }, 202);
};
