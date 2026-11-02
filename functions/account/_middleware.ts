import { getCurrentUser, type AuthEnv } from '../api/auth/_shared';

export async function onRequest(context: {
  request: Request;
  env: AuthEnv;
  next: () => Promise<Response>;
}): Promise<Response> {
  const { request, env, next } = context;

  const user = await getCurrentUser(request, env);
  if (user) {
    return next();
  }

  return Response.redirect(`${new URL(request.url).origin}/login/`, 302);
}
