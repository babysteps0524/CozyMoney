interface MiddlewareContext {
  request: Request;
  next: () => Promise<Response>;
}

export const onRequest = async ({
  request,
  next,
}: MiddlewareContext): Promise<Response> => {
  const response = await next();
  const headers = new Headers(response.headers);
  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/+$/, '') || '/';

  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  // Prevent verification/reset tokens in page URLs from being sent in Referer.
  headers.set('Referrer-Policy', 'no-referrer');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  headers.set('Cross-Origin-Opener-Policy', 'same-origin');

  // Normalize optional trailing slashes so both route forms disable caching.
  if (pathname === '/verify-email' || pathname === '/reset-password') {
    headers.set('Cache-Control', 'no-store');
  }

  // Only send HSTS over HTTPS. Defer CSP until inline scripts and third-party
  // resource requirements have been audited to avoid breaking existing pages.
  if (url.protocol === 'https:') {
    headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains',
    );
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};
