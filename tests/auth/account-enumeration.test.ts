import { Database } from 'bun:sqlite';
import { afterEach, describe, expect, it } from 'bun:test';
import { onRequestPost as signup } from '../../functions/api/auth/signup';
import { onRequestPost as forgotPassword } from '../../functions/api/auth/forgot-password';
import { onRequestPost as resendVerification } from '../../functions/api/auth/resend-verification';
import type {
  AuthBoundStatement,
  AuthEnv,
} from '../../functions/api/auth/_shared';

class TestD1 {
  private database = new Database(':memory:');

  constructor() {
    this.database.run('PRAGMA foreign_keys = ON');
    this.database.run(
      'CREATE TABLE users (id TEXT PRIMARY KEY, email TEXT NOT NULL COLLATE NOCASE UNIQUE, password_hash TEXT NOT NULL, email_verified_at INTEGER, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)',
    );
    this.database.run(
      'CREATE TABLE pending_signups (email TEXT PRIMARY KEY COLLATE NOCASE, password_hash TEXT NOT NULL, token_hash TEXT NOT NULL UNIQUE, expires_at INTEGER NOT NULL, created_at INTEGER NOT NULL)',
    );
    this.database.run(
      'CREATE TABLE password_reset_tokens (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at INTEGER NOT NULL, created_at INTEGER NOT NULL)',
    );
    this.database.run(
      'CREATE TABLE auth_rate_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, window_started_at INTEGER NOT NULL)',
    );
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
    return this.database.transaction(() =>
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
  }

  addVerifiedUser(email: string) {
    const now = Math.floor(Date.now() / 1000);
    this.database
      .query(
        'INSERT INTO users (id, email, password_hash, email_verified_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      )
      .run('user-1', email, 'test-hash', now, now, now);
  }

  close() {
    this.database.close();
  }
}

function makeRequest(path: string, body: unknown): Request {
  return new Request('http://localhost:8788' + path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'http://localhost:8788',
      'CF-Connecting-IP': '192.0.2.10',
    },
    body: JSON.stringify(body),
  });
}

const envFor = (database: TestD1): AuthEnv => ({
  D1_AUTH_DB: database,
  AUTH_SITE_URL: 'https://cozymoney.kr',
  AUTH_EMAIL_PROVIDER: 'brevo',
});

afterEach(() => {
  // Each test uses an isolated in-memory database.
});

describe('authentication account privacy', () => {
  it('returns the same signup status and message for new and existing addresses', async () => {
    const database = new TestD1();
    database.addVerifiedUser('existing@example.com');
    const env = envFor(database);

    const existing = await signup({
      request: makeRequest('/api/auth/signup', {
        email: 'existing@example.com',
        password: 'a sufficiently long password',
      }),
      env,
    });
    const fresh = await signup({
      request: makeRequest('/api/auth/signup', {
        email: 'new@example.com',
        password: 'a sufficiently long password',
      }),
      env,
    });

    expect(existing.status).toBe(202);
    expect(fresh.status).toBe(202);
    expect(await existing.json()).toEqual(await fresh.json());
    database.close();
  });

  it('returns the same password-reset response when an address exists or does not exist', async () => {
    const database = new TestD1();
    database.addVerifiedUser('existing@example.com');
    const env = envFor(database);

    const existing = await forgotPassword({
      request: makeRequest('/api/auth/forgot-password', {
        email: 'existing@example.com',
      }),
      env,
    });
    const missing = await forgotPassword({
      request: makeRequest('/api/auth/forgot-password', {
        email: 'missing@example.com',
      }),
      env,
    });

    expect(existing.status).toBe(200);
    expect(missing.status).toBe(200);
    expect(await existing.json()).toEqual(await missing.json());
    database.close();
  });

  it('returns the same verification-resend response for pending and unknown addresses', async () => {
    const database = new TestD1();
    const now = Math.floor(Date.now() / 1000);
    await database
      .prepare(
        'INSERT INTO pending_signups (email, password_hash, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)',
      )
      .bind(
        'pending@example.com',
        'test-hash',
        'existing-token-hash',
        now + 3600,
        now,
      )
      .run();
    const env = envFor(database);

    const pending = await resendVerification({
      request: makeRequest('/api/auth/resend-verification', {
        email: 'pending@example.com',
      }),
      env,
    });
    const missing = await resendVerification({
      request: makeRequest('/api/auth/resend-verification', {
        email: 'missing@example.com',
      }),
      env,
    });

    expect(pending.status).toBe(200);
    expect(missing.status).toBe(200);
    expect(await pending.json()).toEqual(await missing.json());
    database.close();
  });
});
