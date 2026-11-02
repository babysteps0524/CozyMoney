import {
  type AuthEnv,
  clearSessionCookie,
  getCurrentUser,
  json,
  originIsAllowed,
  parseJson,
  requireDb,
  verifyPassword,
} from './_shared';

interface Context {
  request: Request;
  env: AuthEnv;
}

export const onRequestDelete = async ({
  request,
  env,
}: Context): Promise<Response> => {
  if (!originIsAllowed(request))
    return json({ error: '요청을 확인할 수 없습니다.' }, 403);
  const dbError = requireDb(env);
  if (dbError) return dbError;
  const user = await getCurrentUser(request, env);
  if (!user) return json({ error: '로그인이 필요합니다.' }, 401);

  const body = await parseJson(request);
  const password = typeof body?.password === 'string' ? body.password : '';
  if (!password || password.length > 128) {
    return json(
      { error: '계정 삭제를 확인하려면 비밀번호를 입력해 주세요.' },
      400,
    );
  }

  const stored = await env.D1_AUTH_DB.prepare(
    'SELECT password_hash FROM users WHERE id = ? LIMIT 1',
  )
    .bind(user.id)
    .first<{ password_hash: string }>();
  if (!stored || !(await verifyPassword(password, stored.password_hash))) {
    return json({ error: '비밀번호가 일치하지 않습니다.' }, 403);
  }

  await env.D1_AUTH_DB.prepare('DELETE FROM users WHERE id = ?')
    .bind(user.id)
    .run();
  return json({ message: '계정이 삭제됐어.' }, 200, {
    'Set-Cookie': clearSessionCookie(request),
  });
};
