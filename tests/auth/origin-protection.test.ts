import { describe, expect, it } from 'bun:test';
import { onRequestDelete as deleteAccount } from '../../functions/api/auth/account';
import { onRequestPost as forgotPassword } from '../../functions/api/auth/forgot-password';
import { onRequestPost as login } from '../../functions/api/auth/login';
import { onRequestPost as logout } from '../../functions/api/auth/logout';
import { onRequestPost as resendVerification } from '../../functions/api/auth/resend-verification';
import { onRequestPost as resetPassword } from '../../functions/api/auth/reset-password';
import { onRequestPost as signup } from '../../functions/api/auth/signup';
import { onRequestPost as verifyEmail } from '../../functions/api/auth/verify-email';
import type { AuthEnv } from '../../functions/api/auth/_shared';

const env = {} as AuthEnv;

function foreignOriginRequest(path: string, method: string): Request {
  return new Request('https://cozymoney.kr' + path, {
    method,
    headers: {
      Origin: 'https://attacker.example',
      'Content-Type': 'application/json',
    },
    body: method === 'GET' ? undefined : '{}',
  });
}

describe('authentication Origin protection', () => {
  it('rejects cross-origin requests before any state-changing auth handler runs', async () => {
    const responses = await Promise.all([
      signup({
        request: foreignOriginRequest('/api/auth/signup', 'POST'),
        env,
      }),
      login({
        request: foreignOriginRequest('/api/auth/login', 'POST'),
        env,
      }),
      logout({
        request: foreignOriginRequest('/api/auth/logout', 'POST'),
        env,
      }),
      verifyEmail({
        request: foreignOriginRequest('/api/auth/verify-email', 'POST'),
        env,
      }),
      resendVerification({
        request: foreignOriginRequest('/api/auth/resend-verification', 'POST'),
        env,
      }),
      forgotPassword({
        request: foreignOriginRequest('/api/auth/forgot-password', 'POST'),
        env,
      }),
      resetPassword({
        request: foreignOriginRequest('/api/auth/reset-password', 'POST'),
        env,
      }),
      deleteAccount({
        request: foreignOriginRequest('/api/auth/account', 'DELETE'),
        env,
      }),
    ]);

    expect(responses.map((response) => response.status)).toEqual([
      403, 403, 403, 403, 403, 403, 403, 403,
    ]);

    for (const response of responses) {
      expect(await response.json()).toEqual({
        error: '요청을 확인할 수 없습니다.',
      });
      expect(response.headers.get('Cache-Control')).toBe('no-store');
    }

    // A rejected cross-origin logout must not alter the browser's session cookie.
    expect(responses[2]?.headers.get('Set-Cookie')).toBeNull();
  });

  it('rejects requests without an Origin header', async () => {
    const response = await signup({
      request: new Request('https://cozymoney.kr/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      }),
      env,
    });

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({
      error: '요청을 확인할 수 없습니다.',
    });
  });
});
