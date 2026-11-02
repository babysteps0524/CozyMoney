import { type AuthEnv, getCurrentUser, json, requireDb } from './_shared';

interface Context {
  request: Request;
  env: AuthEnv;
}

export const onRequestGet = async ({
  request,
  env,
}: Context): Promise<Response> => {
  const dbError = requireDb(env);
  if (dbError) return dbError;
  const user = await getCurrentUser(request, env);
  if (!user) return json({ user: null, isAdmin: false }, 200);
  const adminEmail = env.ADMIN_EMAIL?.trim().toLowerCase();
  const isAdmin = Boolean(
    adminEmail && user.email.trim().toLowerCase() === adminEmail,
  );
  return json({ user: { id: user.id, email: user.email }, isAdmin });
};
