import {
  isRateLimited,
  type AuthEnv,
  json,
  normalizeEmail,
  originIsAllowed,
  parseJson,
  requireDb,
  randomToken,
  sendVerificationEmail,
  sha256,
} from './_shared';

interface Context {
  request: Request;
  env: AuthEnv;
}

const genericMessage = '해당 이메일로 가입 요청이 있다면 인증 안내를 보냈어요.';
const rateLimitMessage = '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.';

export const onRequestPost = async ({
  request,
  env,
}: Context): Promise<Response> => {
  if (!originIsAllowed(request))
    return json({ error: '요청을 확인할 수 없습니다.' }, 403);
  const dbError = requireDb(env);
  if (dbError) return dbError;
  if (await isRateLimited(request, env, 'resend-verification', 3, 3600)) {
    return json({ error: rateLimitMessage }, 429, { 'Retry-After': '3600' });
  }
  const body = await parseJson(request);
  if (!body) return json({ error: '올바른 JSON 요청이 필요합니다.' }, 400);
  const email = normalizeEmail(body.email);
  if (!email)
    return json({ error: '올바른 이메일 주소를 입력해 주세요.' }, 400);

  if (
    await isRateLimited(request, env, 'resend-verification', 3, 3600, email)
  ) {
    return json({ error: rateLimitMessage }, 429, { 'Retry-After': '3600' });
  }

  const pending = await env.D1_AUTH_DB.prepare(
    'SELECT email FROM pending_signups WHERE email = ? COLLATE NOCASE LIMIT 1',
  )
    .bind(email)
    .first<{ email: string }>();

  if (pending) {
    const now = Math.floor(Date.now() / 1000);
    const token = randomToken();
    const tokenHash = await sha256(token);
    await env.D1_AUTH_DB.prepare(
      'UPDATE pending_signups SET token_hash = ?, expires_at = ? WHERE email = ? COLLATE NOCASE',
    )
      .bind(tokenHash, now + 86400, email)
      .run();

    try {
      await sendVerificationEmail(env, email, token);
    } catch {
      console.error('[auth] Verification email delivery failed.');
    }
  }

  return json({ message: genericMessage });
};
