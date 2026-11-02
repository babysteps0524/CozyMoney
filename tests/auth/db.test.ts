import { describe, expect, test } from 'bun:test';
import {
  findUserByEmail,
  createUser,
  verifyEmailToken,
  createEmailVerificationToken,
  resendEmailVerificationToken,
  createPasswordResetToken,
  verifyAndResetPassword,
  createSession,
  validateSession,
  invalidateSession,
  countRecentFailedAttempts,
  recordLoginAttempt,
  toAuthUser,
} from '../../src/lib/auth/db';
import { hashPassword } from '../../src/lib/auth/password';

// 모킹된 D1 데이터베이스 - SQL 패턴 기반으로 결과 반환
class MockD1PreparedStatement {
  private handler: (values: unknown[]) => Promise<unknown>;
  private bindValues: unknown[] = [];

  constructor(_sql: string, handler: (values: unknown[]) => Promise<unknown>) {
    this.handler = handler;
  }

  bind(...values: unknown[]) {
    this.bindValues = values;
    return this;
  }

  async first() {
    return this.handler(this.bindValues);
  }

  async all() {
    const result = await this.handler(this.bindValues);
    return { results: Array.isArray(result) ? result : [result] };
  }

  async run() {
    await this.handler(this.bindValues);
    return { success: true, meta: { changes: 1 } };
  }
}

class MockD1Database {
  private users: Map<string, any> = new Map();
  private sessions: Map<string, any> = new Map();
  private loginAttempts: any[] = [];

  prepare(sql: string) {
    const normalized = sql.trim().replace(/\s+/g, ' ');

    // 사용자 조회 (이메일)
    if (normalized.startsWith('SELECT * FROM users WHERE email =')) {
      return new MockD1PreparedStatement(sql, async (values) => {
        const email = values[0] as string;
        const user = [...this.users.values()].find(
          (u) => u.email === email?.toLowerCase(),
        );
        return user ?? null;
      });
    }

    // 사용자 조회 (ID)
    if (normalized.startsWith('SELECT * FROM users WHERE id =')) {
      return new MockD1PreparedStatement(sql, async (values) => {
        const id = values[0] as string;
        return this.users.get(id) ?? null;
      });
    }

    // 사용자 삽입
    if (normalized.startsWith('INSERT INTO users (')) {
      return new MockD1PreparedStatement(sql, async (values) => {
        const [id, email, passwordHash, passwordSalt, , createdAt] = values as [
          string,
          string,
          string,
          string,
          unknown,
          string,
        ];
        this.users.set(id, {
          id,
          email,
          password_hash: passwordHash,
          password_salt: passwordSalt,
          email_verified: 0,
          email_verification_token: null,
          email_verification_token_expires_at: null,
          password_reset_token: null,
          password_reset_token_expires_at: null,
          password_reset_token_used: 0,
          created_at: createdAt,
          updated_at: createdAt,
        });
      });
    }

    // 동의 기록 삽입
    if (normalized.startsWith('INSERT INTO consent_records (')) {
      return new MockD1PreparedStatement(sql, async () => {});
    }

    // 이메일 인증 토큰 업데이트 (createEmailVerificationToken: 4개 파라미터)
    if (
      normalized.startsWith('UPDATE users') &&
      normalized.includes('email_verification_token = ?1') &&
      normalized.includes('updated_at = ?3')
    ) {
      return new MockD1PreparedStatement(sql, async (values) => {
        const [token, expiresAt, updatedAt, userId] = values as [
          string,
          string,
          string,
          string,
        ];
        const user = this.users.get(userId);
        if (user) {
          user.email_verification_token = token;
          user.email_verification_token_expires_at = expiresAt;
          user.updated_at = updatedAt;
        }
      });
    }

    // 이메일 인증 토큰 업데이트 (테스트 직접 호출: 3개 파라미터)
    if (
      normalized.startsWith('UPDATE users') &&
      normalized.includes('email_verification_token = ?1') &&
      !normalized.includes('updated_at')
    ) {
      return new MockD1PreparedStatement(sql, async (values) => {
        const [token, expiresAt, userId] = values as [string, string, string];
        const user = this.users.get(userId);
        if (user) {
          user.email_verification_token = token;
          user.email_verification_token_expires_at = expiresAt;
        }
      });
    }

    // 이메일 인증 검증 (SELECT)
    if (
      normalized.startsWith(
        'SELECT id, email_verification_token_expires_at, email_verified FROM users WHERE email_verification_token =',
      )
    ) {
      return new MockD1PreparedStatement(sql, async (values) => {
        const token = values[0] as string;
        const user = [...this.users.values()].find(
          (u) => u.email_verification_token === token,
        );
        if (!user) return null;
        return {
          id: user.id,
          email_verification_token_expires_at:
            user.email_verification_token_expires_at,
          email_verified: user.email_verified,
        };
      });
    }

    // 이메일 인증 완료 업데이트
    if (
      normalized.startsWith('UPDATE users') &&
      normalized.includes('email_verified = 1')
    ) {
      return new MockD1PreparedStatement(sql, async (values) => {
        const [updatedAt, userId] = values;
        const user = this.users.get(userId as string);
        if (user) {
          user.email_verified = 1;
          user.email_verification_token = null;
          user.email_verification_token_expires_at = null;
          user.updated_at = updatedAt as string;
        }
      });
    }

    // 비밀번호 재설정 토큰 업데이트 (createPasswordResetToken: 4개 파라미터)
    if (
      normalized.startsWith('UPDATE users') &&
      normalized.includes('password_reset_token = ?1') &&
      normalized.includes('updated_at = ?3')
    ) {
      return new MockD1PreparedStatement(sql, async (values) => {
        const [token, expiresAt, updatedAt, userId] = values as [
          string,
          string,
          string,
          string,
        ];
        const user = this.users.get(userId);
        if (user) {
          user.password_reset_token = token;
          user.password_reset_token_expires_at = expiresAt;
          user.password_reset_token_used = 0;
          user.updated_at = updatedAt;
        }
      });
    }

    // 비밀번호 재설정 토큰 업데이트 (테스트 직접 호출: 3개 파라미터)
    if (
      normalized.startsWith('UPDATE users') &&
      normalized.includes('password_reset_token = ?1') &&
      !normalized.includes('updated_at')
    ) {
      return new MockD1PreparedStatement(sql, async (values) => {
        const [token, expiresAt, userId] = values as [string, string, string];
        const user = this.users.get(userId);
        if (user) {
          user.password_reset_token = token;
          user.password_reset_token_expires_at = expiresAt;
          user.password_reset_token_used = 0;
        }
      });
    }

    // 비밀번호 재설정 검증 (SELECT)
    if (
      normalized.startsWith(
        'SELECT id, password_reset_token_expires_at, password_reset_token_used FROM users WHERE password_reset_token =',
      )
    ) {
      return new MockD1PreparedStatement(sql, async (values) => {
        const token = values[0] as string;
        const user = [...this.users.values()].find(
          (u) => u.password_reset_token === token,
        );
        if (!user) return null;
        return {
          id: user.id,
          password_reset_token_expires_at: user.password_reset_token_expires_at,
          password_reset_token_used: user.password_reset_token_used,
        };
      });
    }

    // 비밀번호 재설정 업데이트 (토큰은 NULL로 만들지 않고 사용 표시만 함)
    if (
      normalized.startsWith('UPDATE users') &&
      normalized.includes('password_hash = ?1')
    ) {
      return new MockD1PreparedStatement(sql, async (values) => {
        const [passwordHash, passwordSalt, updatedAt, userId] = values as [
          string,
          string,
          string,
          string,
        ];
        const user = this.users.get(userId);
        if (user) {
          user.password_hash = passwordHash;
          user.password_salt = passwordSalt;
          user.password_reset_token_used = 1;
          user.updated_at = updatedAt;
        }
      });
    }

    // 세션 삽입
    if (normalized.startsWith('INSERT INTO sessions (')) {
      return new MockD1PreparedStatement(sql, async (values) => {
        const [id, userId, expiresAt, createdAt] = values as [
          string,
          string,
          string,
          string,
        ];
        this.sessions.set(id, {
          id,
          user_id: userId,
          expires_at: expiresAt,
          created_at: createdAt,
        });
      });
    }

    // 세션 조회
    if (
      normalized.startsWith(
        'SELECT user_id, expires_at FROM sessions WHERE id =',
      )
    ) {
      return new MockD1PreparedStatement(sql, async (values) => {
        const id = values[0] as string;
        return this.sessions.get(id) ?? null;
      });
    }

    // 세션 삭제
    if (normalized.startsWith('DELETE FROM sessions WHERE id =')) {
      return new MockD1PreparedStatement(sql, async (values) => {
        const id = values[0] as string;
        this.sessions.delete(id);
      });
    }

    // 사용자별 세션 삭제
    if (normalized.startsWith('DELETE FROM sessions WHERE user_id =')) {
      return new MockD1PreparedStatement(sql, async (values) => {
        const userId = values[0] as string;
        for (const [id, session] of this.sessions.entries()) {
          if (session.user_id === userId) {
            this.sessions.delete(id);
          }
        }
      });
    }

    // 로그인 시도 삽입
    if (normalized.startsWith('INSERT INTO login_attempts (')) {
      return new MockD1PreparedStatement(sql, async (values) => {
        const [id, email, attemptedAt, success] = values;
        this.loginAttempts.push({
          id,
          email,
          attempted_at: attemptedAt,
          success,
        });
      });
    }

    // 로그인 시도 삭제 (정리)
    if (
      normalized.startsWith('DELETE FROM login_attempts WHERE attempted_at <')
    ) {
      return new MockD1PreparedStatement(sql, async () => {});
    }

    // 최근 실패 시도 카운트
    if (
      normalized.startsWith(
        'SELECT COUNT(*) as count FROM login_attempts WHERE email =',
      )
    ) {
      return new MockD1PreparedStatement(sql, async (values) => {
        const [email, cutoff] = values as [string, string];
        const count = this.loginAttempts.filter(
          (a) =>
            a.email === email && a.success === 0 && a.attempted_at > cutoff,
        ).length;
        return { count };
      });
    }

    // 사용자 삭제
    if (normalized.startsWith('DELETE FROM users WHERE id =')) {
      return new MockD1PreparedStatement(sql, async (values) => {
        const id = values[0] as string;
        this.users.delete(id);
      });
    }

    // 기본: 아무 작업도 하지 않음
    return new MockD1PreparedStatement(sql, async () => null);
  }

  // 테스트용 헬퍼: 사용자 직접 추가
  addUser(user: any) {
    this.users.set(user.id, {
      ...user,
      email_verified: user.email_verified ?? 0,
    });
  }

  // 테스트용 헬퍼: 세션 직접 추가
  addSession(session: any) {
    this.sessions.set(session.id, session);
  }

  clear() {
    this.users.clear();
    this.sessions.clear();
    this.loginAttempts = [];
  }
}

function createMockDb(): MockD1Database {
  return new MockD1Database();
}

describe('db - findUserByEmail', () => {
  test('존재하는 이메일로 사용자 조회', async () => {
    const db = createMockDb();
    db.addUser({
      id: 'usr_1',
      email: 'user@example.com',
      password_hash: 'hash',
      password_salt: 'salt',
      email_verified: 1,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    });

    const user = await findUserByEmail(db, 'USER@Example.COM');
    expect(user).not.toBeNull();
    expect(user?.email).toBe('user@example.com');
    expect(user?.id).toBe('usr_1');
  });

  test('존재하지 않는 이메일은 null 반환', async () => {
    const db = createMockDb();
    const user = await findUserByEmail(db, 'none@example.com');
    expect(user).toBeNull();
  });
});

describe('db - createUser', () => {
  test('새 사용자 생성 및 반환', async () => {
    const db = createMockDb();
    const { hash, salt } = await hashPassword('SecurePass1!');

    const user = await createUser(db, {
      email: 'new@example.com',
      passwordHash: hash,
      salt,
      agreePrivacy: true,
      agreeTerms: true,
    });

    expect(user.id).toStartWith('usr_');
    expect(user.email).toBe('new@example.com');
    expect(user.emailVerified).toBe(false);
    expect(user.createdAt).toBeDefined();
  });

  test('이메일은 소문자로 저장', async () => {
    const db = createMockDb();
    const { hash, salt } = await hashPassword('SecurePass1!');

    const user = await createUser(db, {
      email: 'New@Example.COM',
      passwordHash: hash,
      salt,
      agreePrivacy: true,
      agreeTerms: true,
    });

    expect(user.email).toBe('new@example.com');
  });
});

describe('db - email verification token', () => {
  test('토큰 생성 및 검증 성공', async () => {
    const db = createMockDb();
    const { hash, salt } = await hashPassword('SecurePass1!');
    const user = await createUser(db, {
      email: 'verify@example.com',
      passwordHash: hash,
      salt,
      agreePrivacy: true,
      agreeTerms: true,
    });

    const token = await createEmailVerificationToken(db, user.id);
    expect(token).toHaveLength(64);

    const result = await verifyEmailToken(db, token);
    expect(result.error).toBeUndefined();
    expect(result.userId).toBe(user.id);
  });

  test('잘못된 토큰은 INVALID_TOKEN 에러', async () => {
    const db = createMockDb();
    const result = await verifyEmailToken(db, 'invalidtoken');
    expect(result.error).toBe('INVALID_TOKEN');
  });

  test('만료된 토큰은 EXPIRED_TOKEN 에러', async () => {
    const db = createMockDb();
    const { hash, salt } = await hashPassword('SecurePass1!');
    const user = await createUser(db, {
      email: 'expired@example.com',
      passwordHash: hash,
      salt,
      agreePrivacy: true,
      agreeTerms: true,
    });

    // 만료된 토큰 직접 설정
    await (db as any)
      .prepare(
        'UPDATE users SET email_verification_token = ?1, email_verification_token_expires_at = ?2 WHERE id = ?3',
      )
      .bind('expiredtoken', '2000-01-01T00:00:00.000Z', user.id)
      .run();

    const result = await verifyEmailToken(db, 'expiredtoken');
    expect(result.error).toBe('EXPIRED_TOKEN');
  });

  test('재발송 토큰 생성', async () => {
    const db = createMockDb();
    const { hash, salt } = await hashPassword('SecurePass1!');
    const user = await createUser(db, {
      email: 'resend@example.com',
      passwordHash: hash,
      salt,
      agreePrivacy: true,
      agreeTerms: true,
    });

    const result = await resendEmailVerificationToken(db, user.id);
    expect(result.error).toBeUndefined();
    expect(result.token).toHaveLength(64);
  });

  test('이미 인증된 사용자 재발송은 ALREADY_VERIFIED', async () => {
    const db = createMockDb();
    const { hash, salt } = await hashPassword('SecurePass1!');
    const user = await createUser(db, {
      email: 'verified@example.com',
      passwordHash: hash,
      salt,
      agreePrivacy: true,
      agreeTerms: true,
    });
    await verifyEmailToken(db, await createEmailVerificationToken(db, user.id));

    const result = await resendEmailVerificationToken(db, user.id);
    expect(result.error).toBe('ALREADY_VERIFIED');
  });
});

describe('db - password reset token', () => {
  test('재설정 토큰 생성 및 검증 성공', async () => {
    const db = createMockDb();
    const { hash, salt } = await hashPassword('OldPass1!');
    const user = await createUser(db, {
      email: 'reset@example.com',
      passwordHash: hash,
      salt,
      agreePrivacy: true,
      agreeTerms: true,
    });

    const token = await createPasswordResetToken(db, user.id);
    expect(token).toHaveLength(64);

    const { hash: newHash, salt: newSalt } = await hashPassword('NewPass1!');
    const result = await verifyAndResetPassword(db, token, newHash, newSalt);
    expect(result.error).toBeUndefined();
    expect(result.userId).toBe(user.id);
  });

  test('사용된 토큰 재사용 방지', async () => {
    const db = createMockDb();
    const { hash, salt } = await hashPassword('OldPass1!');
    const user = await createUser(db, {
      email: 'reuse@example.com',
      passwordHash: hash,
      salt,
      agreePrivacy: true,
      agreeTerms: true,
    });

    const token = await createPasswordResetToken(db, user.id);
    const { hash: newHash, salt: newSalt } = await hashPassword('NewPass1!');
    await verifyAndResetPassword(db, token, newHash, newSalt); // 첫 번째 사용

    const result = await verifyAndResetPassword(db, token, newHash, newSalt); // 두 번째 사용 시도
    expect(result.error).toBe('TOKEN_ALREADY_USED');
  });

  test('만료된 토큰은 EXPIRED_TOKEN', async () => {
    const db = createMockDb();
    const { hash, salt } = await hashPassword('OldPass1!');
    const user = await createUser(db, {
      email: 'expired-reset@example.com',
      passwordHash: hash,
      salt,
      agreePrivacy: true,
      agreeTerms: true,
    });

    await (db as any)
      .prepare(
        'UPDATE users SET password_reset_token = ?1, password_reset_token_expires_at = ?2, password_reset_token_used = 0 WHERE id = ?3',
      )
      .bind('expiredtoken', '2000-01-01T00:00:00.000Z', user.id)
      .run();

    const { hash: newHash, salt: newSalt } = await hashPassword('NewPass1!');
    const result = await verifyAndResetPassword(
      db,
      'expiredtoken',
      newHash,
      newSalt,
    );
    expect(result.error).toBe('EXPIRED_TOKEN');
  });
});

describe('db - session', () => {
  test('세션 생성 및 검증', async () => {
    const db = createMockDb();
    const { hash, salt } = await hashPassword('SecurePass1!');
    const user = await createUser(db, {
      email: 'session@example.com',
      passwordHash: hash,
      salt,
      agreePrivacy: true,
      agreeTerms: true,
    });

    const token = await createSession(db, user.id);
    expect(token).toStartWith('sess_');

    const result = await validateSession(db, token);
    expect(result.error).toBeUndefined();
    expect(result.userId).toBe(user.id);
  });

  test('잘못된 세션 토큰은 INVALID_SESSION', async () => {
    const db = createMockDb();
    const result = await validateSession(db, 'invalidsession');
    expect(result.error).toBe('INVALID_SESSION');
  });

  test('세션 무효화 후 검증 실패', async () => {
    const db = createMockDb();
    const { hash, salt } = await hashPassword('SecurePass1!');
    const user = await createUser(db, {
      email: 'invalidate@example.com',
      passwordHash: hash,
      salt,
      agreePrivacy: true,
      agreeTerms: true,
    });

    const token = await createSession(db, user.id);
    await invalidateSession(db, token);

    const result = await validateSession(db, token);
    expect(result.error).toBe('INVALID_SESSION');
  });
});

describe('db - login attempts', () => {
  test('최근 실패 시도 횟수 조회', async () => {
    const db = createMockDb();
    await recordLoginAttempt(db, 'fail@example.com', false);
    await recordLoginAttempt(db, 'fail@example.com', false);
    await recordLoginAttempt(db, 'fail@example.com', true);

    const count = await countRecentFailedAttempts(db, 'fail@example.com');
    expect(count).toBe(2);
  });

  test('다른 이메일의 실패 시도는 집계되지 않음', async () => {
    const db = createMockDb();
    await recordLoginAttempt(db, 'other@example.com', false);
    await recordLoginAttempt(db, 'target@example.com', false);

    const count = await countRecentFailedAttempts(db, 'target@example.com');
    expect(count).toBe(1);
  });
});

describe('db - toAuthUser', () => {
  test('DB 행을 AuthUser로 변환', () => {
    const row = {
      id: 'usr_1',
      email: 'user@example.com',
      password_hash: 'hash',
      password_salt: 'salt',
      email_verified: 1,
      email_verification_token: null,
      email_verification_token_expires_at: null,
      password_reset_token: null,
      password_reset_token_expires_at: null,
      password_reset_token_used: 0,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    };

    const user = toAuthUser(row);
    expect(user.id).toBe('usr_1');
    expect(user.email).toBe('user@example.com');
    expect(user.emailVerified).toBe(true);
    expect(user.createdAt).toBe('2026-01-01T00:00:00.000Z');
  });

  test('email_verified가 0이면 false', () => {
    const row = {
      id: 'usr_1',
      email: 'user@example.com',
      password_hash: 'hash',
      password_salt: 'salt',
      email_verified: 0,
      email_verification_token: null,
      email_verification_token_expires_at: null,
      password_reset_token: null,
      password_reset_token_expires_at: null,
      password_reset_token_used: 0,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    };

    const user = toAuthUser(row);
    expect(user.emailVerified).toBe(false);
  });
});
