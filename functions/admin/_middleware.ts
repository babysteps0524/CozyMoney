import { getCurrentUser, type AuthEnv } from '../api/auth/_shared';

interface AdminMiddlewareContext {
  request: Request;
  env: AuthEnv;
  next: () => Promise<Response>;
}

function htmlResponse(message: string, status: number): Response {
  return new Response(
    '<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>관리자 접근 제한 | CozyMoney</title></head><body style="font-family:system-ui,sans-serif;max-width:640px;margin:4rem auto;padding:0 1rem;line-height:1.7"><h1>관리자 접근 제한</h1><p>' +
      message +
      '</p><p><a href="/">홈으로 이동</a></p></body></html>',
    {
      status,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    },
  );
}

export async function onRequest(
  context: AdminMiddlewareContext,
): Promise<Response> {
  const { request, env, next } = context;
  if (!env.D1_AUTH_DB) {
    return htmlResponse(
      '현재 환경에서 데이터베이스를 사용할 수 없습니다. 잠시 후 다시 시도해 주세요.',
      503,
    );
  }
  const user = await getCurrentUser(request, env);

  if (!user) {
    const loginUrl = new URL('/login/', request.url);
    loginUrl.searchParams.set('redirect', new URL(request.url).pathname);
    return Response.redirect(loginUrl.toString(), 302);
  }

  const adminEmail = env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!adminEmail) {
    return htmlResponse(
      '관리자 이메일이 설정되지 않았습니다. 사이트 관리자에게 문의해 주세요.',
      503,
    );
  }

  if (user.email.trim().toLowerCase() !== adminEmail) {
    return htmlResponse(
      '이 페이지는 관리자 계정으로만 접근할 수 있습니다.',
      403,
    );
  }

  const response = await next();
  const headers = new Headers(response.headers);
  headers.set('X-Robots-Tag', 'noindex, nofollow');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
