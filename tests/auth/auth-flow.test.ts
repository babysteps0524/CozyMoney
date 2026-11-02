import { Database } from 'bun:sqlite';
import { afterEach, describe, expect, it } from 'bun:test';
import { onRequestPost as signup } from '../../functions/api/auth/signup';
import { onRequestPost as verifyEmail } from '../../functions/api/auth/verify-email';
import { onRequestPost as login } from '../../functions/api/auth/login';
import { onRequestPost as logout } from '../../functions/api/auth/logout';
import { onRequestPost as forgotPassword } from '../../functions/api/auth/forgot-password';
import { onRequestPost as resetPassword } from '../../functions/api/auth/reset-password';
import { onRequestDelete as deleteAccount } from '../../functions/api/auth/account';
import { onRequestGet as session } from '../../functions/api/auth/session';
import {
  sha256,
  type AuthBoundStatement,
  type AuthEnv,
} from '../../functions/api/auth/_shared';

class TestD1 {
  private database = new Database(':memory:');

  constructor() {
    const schemaStatements = [
      'PRAGMA foreign_keys = ON',
      'CREATE TABLE users (id TEXT PRIMARY KEY, email TEXT NOT NULL COLLATE NOCASE UNIQUE, password_hash TEXT NOT NULL, email_verified_at INTEGER, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)',
      'CREATE TABLE pending_signups (email TEXT PRIMARY KEY COLLATE NOCASE, password_hash TEXT NOT NULL, token_hash TEXT NOT NULL UNIQUE, expires_at INTEGER NOT NULL, created_at INTEGER NOT NULL)',
      'CREATE TABLE auth_sessions (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at INTEGER NOT NULL, created_at INTEGER NOT NULL)',
      'CREATE TABLE password_reset_tokens (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at INTEGER NOT NULL, created_at INTEGER NOT NULL)',
      'CREATE TABLE auth_rate_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, window_started_at INTEGER NOT NULL)',
      "CREATE TABLE IF NOT EXISTS inquiries (id TEXT PRIMARY KEY, user_id TEXT REFERENCES users(id) ON DELETE SET NULL, name TEXT NOT NULL, email TEXT NOT NULL COLLATE NOCASE, subject TEXT NOT NULL, message TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'open', answer TEXT, answered_at INTEGER, answered_by TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)",
    ];

    for (const statement of schemaStatements) {
      this.database.run(statement);
    }
  }

  prepare(query: string) {
    const database = this.database;
    return {
      bind(...values: unknown[]) {
        return {
          query,
          values,
          first: async <T = Record<string, unknown>>() =>
            database.query(query).get(...(values as never[])) as T | null,
          all: async <T = Record<string, unknown>>() => ({
            results: database.query(query).all(...(values as never[])) as T[],
          }),
          run: async () => {
            const result = database.query(query).run(...(values as never[]));
            return { success: true, meta: { changes: result.changes } };
          },
        };
      },
    };
  }

  async batch(statements: AuthBoundStatement[]) {
    const results = this.database.transaction(() =>
      statements.map((statement) => {
        const bound = statement as AuthBoundStatement & {
          query: string;
          values: unknown[];
        };
        const result = this.database
          .query(bound.query)
          .run(...(bound.values as never[]));
        return { success: true, meta: { changes: result.changes } };
      }),
    )();
    return results;
  }

  close() {
    this.database.close();
  }
}

const originalInfo = console.info;
const originalError = console.error;
let verificationUrl = '';

afterEach(() => {
  console.info = originalInfo;
  console.error = originalError;
  verificationUrl = '';
});

function request(
  path: string,
  method: string,
  body?: unknown,
  cookie?: string,
): Request {
  const headers = new Headers();
  if (body !== undefined) headers.set('Content-Type', 'application/json');
  headers.set('Origin', 'http://localhost:8788');
  if (cookie) headers.set('Cookie', cookie);
  return new Request('http://localhost:8788' + path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

describe('authentication flow', () => {
  it('supports signup, email verification, login, session lookup and logout', async () => {
    const database = new TestD1();
    const env: AuthEnv = {
      D1_AUTH_DB: database,
      AUTH_SITE_URL: 'http://localhost:8788',
      AUTH_EMAIL_PROVIDER: 'log',
    };

    console.info = (...args: unknown[]) => {
      const line = args.map(String).join(' ');
      const match = line.match(/https?:\/\/\S+/);
      if (match) verificationUrl = match[0];
    };

    const signupResponse = await signup({
      request: request('/api/auth/signup', 'POST', {
        email: 'Test.User@example.com',
        password: 'correct horse battery staple 2026',
      }),
      env,
    });
    expect(signupResponse.status).toBe(202);
    expect((await signupResponse.json()).message).toContain('이메일');

    expect(verificationUrl).not.toBe('');
    const verificationToken = new URL(verificationUrl).searchParams.get(
      'token',
    );
    expect(verificationToken).not.toBeNull();

    const unverifiedLogin = await login({
      request: request('/api/auth/login', 'POST', {
        email: 'test.user@example.com',
        password: 'correct horse battery staple 2026',
      }),
      env,
    });
    expect(unverifiedLogin.status).toBe(401);
    const unverifiedBody = await unverifiedLogin.json();

    const missingAccountLogin = await login({
      request: request('/api/auth/login', 'POST', {
        email: 'missing.user@example.com',
        password: 'correct horse battery staple 2026',
      }),
      env,
    });
    expect(missingAccountLogin.status).toBe(401);
    expect(await missingAccountLogin.json()).toEqual(unverifiedBody);

    // Two concurrent requests must not consume the same verification token twice.
    const verificationResults = await Promise.all([
      verifyEmail({
        request: request('/api/auth/verify-email', 'POST', {
          token: verificationToken,
        }),
        env,
      }),
      verifyEmail({
        request: request('/api/auth/verify-email', 'POST', {
          token: verificationToken,
        }),
        env,
      }),
    ]);
    expect(
      verificationResults.map((response) => response.status).sort(),
    ).toEqual([200, 400]);

    const loginResponse = await login({
      request: request('/api/auth/login', 'POST', {
        email: 'TEST.USER@example.com',
        password: 'correct horse battery staple 2026',
      }),
      env,
    });
    expect(loginResponse.status).toBe(200);
    const setCookie = loginResponse.headers.get('Set-Cookie');
    expect(setCookie).toContain('HttpOnly');
    expect(setCookie).toContain('SameSite=Lax');
    if (!setCookie) throw new Error('Expected a session cookie');
    const originalCookie = setCookie.split(';')[0];
    let cookie = originalCookie;

    const sessionResponse = await session({
      request: request('/api/auth/session', 'GET', undefined, originalCookie),
      env,
    });
    expect((await sessionResponse.json()).user.email).toBe(
      'test.user@example.com',
    );

    // The current policy keeps one active session per account. A new login
    // must invalidate the previous cookie in the database.
    const secondLoginResponse = await login({
      request: request('/api/auth/login', 'POST', {
        email: 'test.user@example.com',
        password: 'correct horse battery staple 2026',
      }),
      env,
    });
    expect(secondLoginResponse.status).toBe(200);
    const secondSetCookie = secondLoginResponse.headers.get('Set-Cookie');
    if (!secondSetCookie) throw new Error('Expected a second session cookie');

    const staleSessionResponse = await session({
      request: request('/api/auth/session', 'GET', undefined, originalCookie),
      env,
    });
    expect((await staleSessionResponse.json()).user).toBeNull();
    cookie = secondSetCookie.split(';')[0];

    const logoutResponse = await logout({
      request: request('/api/auth/logout', 'POST', {}, cookie),
      env,
    });
    expect(logoutResponse.status).toBe(200);
    expect(logoutResponse.headers.get('Set-Cookie')).toContain('Max-Age=0');

    const afterLogout = await session({
      request: request('/api/auth/session', 'GET', undefined, cookie),
      env,
    });
    expect((await afterLogout.json()).user).toBeNull();

    const forgotResponse = await forgotPassword({
      request: request('/api/auth/forgot-password', 'POST', {
        email: 'test.user@example.com',
      }),
      env,
    });
    expect(forgotResponse.status).toBe(200);
    expect(verificationUrl).toContain('/reset-password/?token=');
    const resetToken = new URL(verificationUrl).searchParams.get('token');
    expect(resetToken).not.toBeNull();

    // A reset token may succeed only once, even when requests overlap.
    const resetResults = await Promise.all([
      resetPassword({
        request: request('/api/auth/reset-password', 'POST', {
          token: resetToken,
          password: 'new secure password phrase 2026',
        }),
        env,
      }),
      resetPassword({
        request: request('/api/auth/reset-password', 'POST', {
          token: resetToken,
          password: 'new secure password phrase 2026',
        }),
        env,
      }),
    ]);
    expect(resetResults.map((response) => response.status).sort()).toEqual([
      200, 400,
    ]);

    const reloginResponse = await login({
      request: request('/api/auth/login', 'POST', {
        email: 'test.user@example.com',
        password: 'new secure password phrase 2026',
      }),
      env,
    });
    expect(reloginResponse.status).toBe(200);
    const reloginCookie = reloginResponse.headers.get('Set-Cookie');
    if (!reloginCookie)
      throw new Error('Expected a session cookie after password reset');

    // A subsequent password reset must revoke an already active session.
    const secondForgotResponse = await forgotPassword({
      request: request('/api/auth/forgot-password', 'POST', {
        email: 'test.user@example.com',
      }),
      env,
    });
    expect(secondForgotResponse.status).toBe(200);
    expect(verificationUrl).toContain('/reset-password/?token=');
    const secondResetToken = new URL(verificationUrl).searchParams.get('token');
    expect(secondResetToken).not.toBeNull();

    const secondResetResponse = await resetPassword({
      request: request('/api/auth/reset-password', 'POST', {
        token: secondResetToken,
        password: 'another secure password phrase 2026',
      }),
      env,
    });
    expect(secondResetResponse.status).toBe(200);

    const sessionAfterPasswordReset = await session({
      request: request(
        '/api/auth/session',
        'GET',
        undefined,
        reloginCookie.split(';')[0],
      ),
      env,
    });
    expect((await sessionAfterPasswordReset.json()).user).toBeNull();

    const loginAfterPasswordReset = await login({
      request: request('/api/auth/login', 'POST', {
        email: 'test.user@example.com',
        password: 'another secure password phrase 2026',
      }),
      env,
    });
    expect(loginAfterPasswordReset.status).toBe(200);
    const activeCookie = loginAfterPasswordReset.headers.get('Set-Cookie');
    if (!activeCookie)
      throw new Error(
        'Expected a session cookie after the second password reset',
      );

    const deniedDelete = await deleteAccount({
      request: request(
        '/api/auth/account',
        'DELETE',
        { password: 'wrong password' },
        activeCookie.split(';')[0],
      ),
      env,
    });
    expect(deniedDelete.status).toBe(403);

    const deleteResponse = await deleteAccount({
      request: request(
        '/api/auth/account',
        'DELETE',
        { password: 'another secure password phrase 2026' },
        activeCookie.split(';')[0],
      ),
      env,
    });
    expect(deleteResponse.status).toBe(200);

    const sessionAfterDelete = await session({
      request: request(
        '/api/auth/session',
        'GET',
        undefined,
        activeCookie.split(';')[0],
      ),
      env,
    });
    expect((await sessionAfterDelete.json()).user).toBeNull();

    database.close();
  });
  it('rate limits repeated login requests from one source', async () => {
    const database = new TestD1();
    const env: AuthEnv = {
      D1_AUTH_DB: database,
      AUTH_SITE_URL: 'http://localhost:8788',
      AUTH_EMAIL_PROVIDER: 'log',
    };

    for (let attempt = 0; attempt < 60; attempt++) {
      const response = await login({
        request: request('/api/auth/login', 'POST', {}),
        env,
      });
      expect(response.status).toBe(400);
    }

    const blocked = await login({
      request: request('/api/auth/login', 'POST', {}),
      env,
    });
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get('Retry-After')).toBe('900');
    database.close();
  });

  it('rejects signup requests with a missing or foreign Origin', async () => {
    const database = new TestD1();
    const env: AuthEnv = {
      D1_AUTH_DB: database,
      AUTH_SITE_URL: 'http://localhost:8788',
      AUTH_EMAIL_PROVIDER: 'log',
    };

    const missingOrigin = new Request('http://localhost:8788/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'csrf@example.com',
        password: 'a sufficiently long password',
      }),
    });
    const foreignOrigin = new Request('http://localhost:8788/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://attacker.example',
      },
      body: JSON.stringify({
        email: 'csrf@example.com',
        password: 'a sufficiently long password',
      }),
    });

    const missingResponse = await signup({ request: missingOrigin, env });
    const foreignResponse = await signup({ request: foreignOrigin, env });

    expect(missingResponse.status).toBe(403);
    expect(foreignResponse.status).toBe(403);
    const pending = await database
      .prepare('SELECT email FROM pending_signups WHERE email = ?')
      .bind('csrf@example.com')
      .first();
    expect(pending).toBeNull();
    database.close();
  });

  it('rate limits repeated signup requests from one source', async () => {
    const database = new TestD1();
    const env: AuthEnv = {
      D1_AUTH_DB: database,
      AUTH_SITE_URL: 'http://localhost:8788',
      AUTH_EMAIL_PROVIDER: 'log',
    };

    for (let attempt = 0; attempt < 15; attempt++) {
      const response = await signup({
        request: request('/api/auth/signup', 'POST', {}),
        env,
      });
      expect(response.status).toBe(400);
    }

    const blocked = await signup({
      request: request('/api/auth/signup', 'POST', {}),
      env,
    });
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get('Retry-After')).toBe('3600');
    database.close();
  });

  it('invalidates every outstanding reset token after a successful password reset', async () => {
    const database = new TestD1();
    const env: AuthEnv = {
      D1_AUTH_DB: database,
      AUTH_SITE_URL: 'http://localhost:8788',
      AUTH_EMAIL_PROVIDER: 'log',
    };
    const now = Math.floor(Date.now() / 1000);
    const firstToken = 'first-valid-password-reset-token-123456';
    const secondToken = 'second-valid-password-reset-token-123456';

    await database
      .prepare(
        'INSERT INTO users (id, email, password_hash, email_verified_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      )
      .bind(
        'multi-reset-user',
        'multi-reset@example.com',
        'original-hash',
        now,
        now,
        now,
      )
      .run();
    await database
      .prepare(
        'INSERT INTO password_reset_tokens (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)',
      )
      .bind(await sha256(firstToken), 'multi-reset-user', now + 3600, now)
      .run();
    await database
      .prepare(
        'INSERT INTO password_reset_tokens (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)',
      )
      .bind(await sha256(secondToken), 'multi-reset-user', now + 3600, now)
      .run();

    const firstResponse = await resetPassword({
      request: request('/api/auth/reset-password', 'POST', {
        token: firstToken,
        password: 'first secure reset password 2026',
      }),
      env,
    });
    expect(firstResponse.status).toBe(200);

    const secondResponse = await resetPassword({
      request: request('/api/auth/reset-password', 'POST', {
        token: secondToken,
        password: 'second secure reset password 2026',
      }),
      env,
    });
    expect(secondResponse.status).toBe(400);

    const remainingTokens = await database
      .prepare('SELECT token_hash FROM password_reset_tokens WHERE user_id = ?')
      .bind('multi-reset-user')
      .all();
    expect(remainingTokens.results).toHaveLength(0);
    database.close();
  });

  it('rejects expired email-verification tokens without creating an account', async () => {
    const database = new TestD1();
    const env: AuthEnv = {
      D1_AUTH_DB: database,
      AUTH_SITE_URL: 'http://localhost:8788',
      AUTH_EMAIL_PROVIDER: 'log',
    };
    const token = 'expired-verification-token-123456789';
    const now = Math.floor(Date.now() / 1000);
    await database
      .prepare(
        'INSERT INTO pending_signups (email, password_hash, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)',
      )
      .bind(
        'expired@example.com',
        'not-used-hash',
        await sha256(token),
        now - 1,
        now - 86401,
      )
      .run();

    const response = await verifyEmail({
      request: request('/api/auth/verify-email', 'POST', { token }),
      env,
    });
    expect(response.status).toBe(400);
    const user = await database
      .prepare('SELECT id FROM users WHERE email = ?')
      .bind('expired@example.com')
      .first();
    expect(user).toBeNull();
    database.close();
  });

  it('rejects expired password-reset tokens without changing the account password', async () => {
    const database = new TestD1();
    const env: AuthEnv = {
      D1_AUTH_DB: database,
      AUTH_SITE_URL: 'http://localhost:8788',
      AUTH_EMAIL_PROVIDER: 'log',
    };
    const token = 'expired-password-reset-token-123456';
    const now = Math.floor(Date.now() / 1000);
    await database
      .prepare(
        'INSERT INTO users (id, email, password_hash, email_verified_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      )
      .bind(
        'expired-user-id',
        'expired-reset@example.com',
        'original-hash',
        now,
        now,
        now,
      )
      .run();
    await database
      .prepare(
        'INSERT INTO password_reset_tokens (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)',
      )
      .bind(await sha256(token), 'expired-user-id', now - 1, now - 3601)
      .run();

    const response = await resetPassword({
      request: request('/api/auth/reset-password', 'POST', {
        token,
        password: 'a sufficiently secure new password',
      }),
      env,
    });
    expect(response.status).toBe(400);
    const user = await database
      .prepare('SELECT password_hash FROM users WHERE id = ?')
      .bind('expired-user-id')
      .first<{ password_hash: string }>();
    expect(user?.password_hash).toBe('original-hash');
    database.close();
  });
});
