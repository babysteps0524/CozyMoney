import { describe, expect, it } from 'bun:test';
import { onRequest } from '../../functions/_middleware';

describe('security response headers', () => {
  it('adds baseline security headers and preserves existing response headers', async () => {
    const response = await onRequest({
      request: new Request('https://cozymoney.kr/account/'),
      next: async () =>
        new Response('ok', {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-store',
          },
        }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(response.headers.get('X-Frame-Options')).toBe('DENY');
    expect(response.headers.get('Referrer-Policy')).toBe('no-referrer');
    expect(response.headers.get('Permissions-Policy')).toBe(
      'camera=(), microphone=(), geolocation=()',
    );
    expect(response.headers.get('X-Permitted-Cross-Domain-Policies')).toBe(
      'none',
    );
    expect(response.headers.get('Cross-Origin-Opener-Policy')).toBe(
      'same-origin',
    );
    expect(response.headers.get('Strict-Transport-Security')).toBe(
      'max-age=31536000; includeSubDomains',
    );
    expect(response.headers.get('Content-Type')).toContain('text/html');
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(await response.text()).toBe('ok');
  });

  it('does not send HSTS over HTTP', async () => {
    const response = await onRequest({
      request: new Request('http://localhost:8788/'),
      next: async () => new Response('ok'),
    });

    expect(response.headers.get('Strict-Transport-Security')).toBeNull();
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
  });

  it('disables caching on auth token pages with or without a trailing slash', async () => {
    const paths = [
      '/verify-email',
      '/verify-email/',
      '/reset-password',
      '/reset-password/',
    ];

    for (const path of paths) {
      const response = await onRequest({
        request: new Request(`https://cozymoney.kr${path}?token=example`),
        next: async () =>
          new Response('ok', {
            headers: { 'Cache-Control': 'public, max-age=3600' },
          }),
      });

      expect(response.headers.get('Cache-Control')).toBe('no-store');
      expect(response.headers.get('Referrer-Policy')).toBe('no-referrer');
    }
  });
});
