import {
  isRateLimited,
  type AuthEnv,
  hashPassword,
  needsPasswordRehash,
  json,
  normalizeEmail,
  originIsAllowed,
  parseJson,
  requireDb,
  randomToken,
  sessionCookie,
  sha256,
  verifyPassword,
} from './_shared';

interface Context {
  request: Request;
  env: AuthEnv;
}

interface StoredUser {
  id: string;
  email: string;
  password_hash: string;
  email_verified_at: number | null;
}

export const onRequestPost = async ({
  request,
  env,
}: Context): Promise<Response> => {
  if (!originIsAllowed(request))
    return json({ error: '요청을 확인할 수 없습니다.' }, 403);
  const dbError = requireDb(env);
  if (dbError) return dbError;
  if (await isRateLimited(request, env, 'login', 60, 900)) {
    return json(
      {
        error:
          '로그인 요청이 일시적으로 제한되었습니다. 15분 후 다시 시도해 주세요.',
      },
      429,
      { 'Retry-After': '900' },
    );
  }
  const body = await parseJson(request);
  if (!body) return json({ error: '올바른 JSON 요청이 필요합니다.' }, 400);

  const email = normalizeEmail(body.email);
  const password = typeof body.password === 'string' ? body.password : '';
  if (!email || !password || password.length > 128) {
    return json({ error: '이메일 또는 비밀번호를 확인해 주세요.' }, 400);
  }

  // Add an account-level bucket as well as the IP-level login limit.
  if (await isRateLimited(request, env, 'login-account', 30, 900, email)) {
    return json(
      {
        error:
          '해당 계정의 로그인 요청이 일시적으로 제한되었습니다. 15분 후 다시 시도해 주세요.',
      },
      429,
      { 'Retry-After': '900' },
    );
  }

  const user = await env.D1_AUTH_DB.prepare(
    'SELECT id, email, password_hash, email_verified_at FROM users WHERE email = ? COLLATE NOCASE LIMIT 1',
  )
    .bind(email)
    .first<StoredUser>();

  if (!user) {
    const pending = await env.D1_AUTH_DB.prepare(
      'SELECT password_hash FROM pending_signups WHERE email = ? COLLATE NOCASE AND expires_at > ? LIMIT 1',
    )
      .bind(email, Math.floor(Date.now() / 1000))
      .first<{ password_hash: string }>();

    if (pending) {
      await verifyPassword(password, pending.password_hash);
    } else {
      // Perform comparable PBKDF2 work when no account exists to reduce
      // response-time differences that can reveal registered addresses.
      await hashPassword(password);
    }

    return json({ error: '이메일 또는 비밀번호를 확인해 주세요.' }, 401);
  }
  if (!(await verifyPassword(password, user.password_hash))) {
    return json({ error: '이메일 또는 비밀번호를 확인해 주세요.' }, 401);
  }

  // Upgrade legacy 100k-iteration hashes after a successful login without
  // forcing existing users to reset their passwords.
  if (needsPasswordRehash(user.password_hash)) {
    const upgradedHash = await hashPassword(password);
    await env.D1_AUTH_DB.prepare(
      'UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ? AND password_hash = ?',
    )
      .bind(
        upgradedHash,
        Math.floor(Date.now() / 1000),
        user.id,
        user.password_hash,
      )
      .run();
  }

  if (!user.email_verified_at) {
    // Use the same response as other authentication failures to avoid
    // revealing whether an address belongs to an unverified account.
    return json({ error: '이메일 또는 비밀번호를 확인해 주세요.' }, 401);
  }

  const token = randomToken();
  const tokenHash = await sha256(token);
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + 7 * 86400;

  // Keep session replacement atomic: a failed insert must not leave the
  // account signed out, and concurrent logins must not create duplicate sessions.
  await env.D1_AUTH_DB.batch([
    env.D1_AUTH_DB.prepare(
      'DELETE FROM auth_sessions WHERE user_id = ? OR expires_at <= ?',
    ).bind(user.id, now),
    env.D1_AUTH_DB.prepare(
      'INSERT INTO auth_sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)',
    ).bind(tokenHash, user.id, expiresAt, now),
  ]);

  return json(
    { message: '로그인했습니다.', user: { id: user.id, email: user.email } },
    200,
    { 'Set-Cookie': sessionCookie(request, token, 7 * 86400) },
  );
};
