import { Database } from 'bun:sqlite';
import { describe, expect, it } from 'bun:test';
import { onRequestGet as session } from '../../functions/api/auth/session';
import { sha256, type AuthEnv } from '../../functions/api/auth/_shared';

describe('authentication session expiry', () => {
  it('does not authenticate a session whose database expiry has passed', async () => {
    const database = new Database(':memory:');
    database.run('PRAGMA foreign_keys = ON');
    database.run(
      'CREATE TABLE users (id TEXT PRIMARY KEY, email TEXT NOT NULL COLLATE NOCASE UNIQUE, password_hash TEXT NOT NULL, email_verified_at INTEGER, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)',
    );
    database.run(
      'CREATE TABLE auth_sessions (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires_at INTEGER NOT NULL, created_at INTEGER NOT NULL)',
    );

    const now = Math.floor(Date.now() / 1000);
    database
      .query(
        'INSERT INTO users (id, email, password_hash, email_verified_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      )
      .run('user-1', 'session@example.com', 'test-hash', now, now, now);

    const rawToken = 'expired-session-token';
    const tokenHash = await sha256(rawToken);
    database
      .query(
        'INSERT INTO auth_sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)',
      )
      .run(tokenHash, 'user-1', now - 1, now - 3600);

    const env: AuthEnv = {
      D1_AUTH_DB: {
        prepare(query: string) {
          return {
            bind(...values: unknown[]) {
              return {
                first: async <T = Record<string, unknown>>() =>
                  database.query(query).get(...(values as never[])) as T | null,
                all: async <T = Record<string, unknown>>() => ({
                  results: database
                    .query(query)
                    .all(...(values as never[])) as T[],
                }),
                run: async () => {
                  const result = database
                    .query(query)
                    .run(...(values as never[]));
                  return { success: true, meta: { changes: result.changes } };
                },
              };
            },
          };
        },
        async batch() {
          return [];
        },
      },
    };

    const response = await session({
      request: new Request('https://cozymoney.kr/api/auth/session', {
        headers: { Cookie: 'cm_session=' + rawToken },
      }),
      env,
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ user: null, isAdmin: false });
    expect(response.headers.get('Cache-Control')).toBe('no-store');

    database.close();
  });
});
