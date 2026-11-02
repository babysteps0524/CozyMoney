import {
  type AuthEnv,
  clearSessionCookie,
  getCookie,
  json,
  originIsAllowed,
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
  if (!originIsAllowed(request)) {
    // Rejected requests must not mutate client state. Only clear the cookie
    // after an accepted logout request has been processed.
    return json({ error: '요청을 확인할 수 없습니다.' }, 403);
  }

  const dbError = requireDb(env);
  if (dbError) return dbError;

  const token = getCookie(request, 'cm_session');
  if (token) {
    const tokenHash = await sha256(token);
    await env.D1_AUTH_DB.prepare(
      'DELETE FROM auth_sessions WHERE token_hash = ?',
    )
      .bind(tokenHash)
      .run();
  }

  return json({ message: '로그아웃했습니다.' }, 200, {
    'Set-Cookie': clearSessionCookie(request),
  });
};
