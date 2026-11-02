import type { AuthUser } from './types';

const USER_ID_PREFIX = 'usr_';
const SESSION_ID_PREFIX = 'sess_';
const CONSENT_ID_PREFIX = 'consent_';
const ATTEMPT_ID_PREFIX = 'attempt_';

function generateId(prefix: string): string {
  return `${prefix}${crypto.randomUUID().replace(/-/g, '')}`;
}

function nowISO(): string {
  return new Date().toISOString();
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

export interface DBUserRow {
  id: string;
  email: string;
  password_hash: string;
  password_salt: string;
  email_verified: number;
  email_verification_token: string | null;
  email_verification_token_expires_at: string | null;
  password_reset_token: string | null;
  password_reset_token_expires_at: string | null;
  password_reset_token_used: number;
  created_at: string;
  updated_at: string;
}

export interface DBSessionRow {
  id: string;
  user_id: string;
  expires_at: string;
  created_at: string;
}

export interface D1Database {
  prepare(sql: string): D1PreparedStatement;
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first(): Promise<unknown | null>;
  all(): Promise<{ results: unknown[] }>;
  run(): Promise<{ success: boolean; meta?: { changes: number } }>;
}

/**
 * 이메일로 사용자 조회 (대소문자 구분 없이)
 */
export async function findUserByEmail(
  db: D1Database,
  email: string,
): Promise<DBUserRow | null> {
  const stmt = db.prepare(
    'SELECT * FROM users WHERE email = ?1 COLLATE NOCASE LIMIT 1',
  );
  return (await stmt
    .bind(email.trim().toLowerCase())
    .first()) as DBUserRow | null;
}

/**
 * ID로 사용자 조회
 */
export async function findUserById(
  db: D1Database,
  userId: string,
): Promise<DBUserRow | null> {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?1 LIMIT 1');
  return (await stmt.bind(userId).first()) as DBUserRow | null;
}

/**
 * 새로운 사용자 생성
 */
export async function createUser(
  db: D1Database,
  input: {
    email: string;
    passwordHash: string;
    salt: string;
    agreePrivacy: boolean;
    agreeTerms: boolean;
    agreeMarketing?: boolean;
  },
): Promise<AuthUser> {
  const userId = generateId(USER_ID_PREFIX);
  const now = nowISO();
  const email = input.email.trim().toLowerCase();

  const userStmt = db.prepare(
    `INSERT INTO users (id, email, password_hash, password_salt, email_verified, created_at, updated_at)
     VALUES (?1, ?2, ?3, ?4, 0, ?5, ?5)`,
  );
  await userStmt.bind(userId, email, input.passwordHash, input.salt, now).run();

  const consentId = generateId(CONSENT_ID_PREFIX);
  const consentStmt = db.prepare(
    `INSERT INTO consent_records (id, user_id, privacy_policy, terms_of_service, marketing, agreed_at, version)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, '1.0')`,
  );
  await consentStmt
    .bind(
      consentId,
      userId,
      input.agreePrivacy ? 1 : 0,
      input.agreeTerms ? 1 : 0,
      input.agreeMarketing ? 1 : 0,
      now,
    )
    .run();

  return {
    id: userId,
    email,
    emailVerified: false,
    createdAt: now,
  };
}

/**
 * 이메일 인증 토큰 저장
 */
export async function createEmailVerificationToken(
  db: D1Database,
  userId: string,
): Promise<string> {
  const token =
    crypto.randomUUID().replace(/-/g, '') +
    crypto.randomUUID().replace(/-/g, '');
  const expiresAt = addMinutes(new Date(), 60).toISOString(); // 60분 만료

  const stmt = db.prepare(
    `UPDATE users
     SET email_verification_token = ?1,
         email_verification_token_expires_at = ?2,
         updated_at = ?3
     WHERE id = ?4`,
  );
  await stmt.bind(token, expiresAt, nowISO(), userId).run();

  return token;
}

/**
 * 이메일 인증 토큰 검증 및 처리
 * 성공 시 email_verified = 1로 설정하고 토큰을 무효화
 */
export async function verifyEmailToken(
  db: D1Database,
  token: string,
): Promise<{ userId: string; error?: string }> {
  const stmt = db.prepare(
    `SELECT id, email_verification_token_expires_at, email_verified
     FROM users
     WHERE email_verification_token = ?1
     LIMIT 1`,
  );
  const row = (await stmt.bind(token).first()) as {
    id: string;
    email_verification_token_expires_at: string | null;
    email_verified: number;
  } | null;

  if (!row) {
    return { userId: '', error: 'INVALID_TOKEN' };
  }

  if (row.email_verified === 1) {
    return { userId: row.id, error: 'ALREADY_VERIFIED' };
  }

  const expiresAt = row.email_verification_token_expires_at;
  if (!expiresAt || new Date(expiresAt) < new Date()) {
    return { userId: row.id, error: 'EXPIRED_TOKEN' };
  }

  // 토큰 사용 처리: 인증 완료 및 토큰 무효화
  const updateStmt = db.prepare(
    `UPDATE users
     SET email_verified = 1,
         email_verification_token = NULL,
         email_verification_token_expires_at = NULL,
         updated_at = ?1
     WHERE id = ?2`,
  );
  await updateStmt.bind(nowISO(), row.id).run();

  return { userId: row.id };
}

/**
 * 이메일 인증 토큰 재발송용 새 토큰 생성
 */
export async function resendEmailVerificationToken(
  db: D1Database,
  userId: string,
): Promise<{ token: string; error?: string }> {
  const user = await findUserById(db, userId);
  if (!user) {
    return { token: '', error: 'USER_NOT_FOUND' };
  }
  if (user.email_verified === 1) {
    return { token: '', error: 'ALREADY_VERIFIED' };
  }

  const token = await createEmailVerificationToken(db, userId);
  return { token };
}

/**
 * 비밀번호 재설정 토큰 생성 (30분 만료, 사용 후 무효화)
 */
export async function createPasswordResetToken(
  db: D1Database,
  userId: string,
): Promise<string> {
  const token =
    crypto.randomUUID().replace(/-/g, '') +
    crypto.randomUUID().replace(/-/g, '');
  const expiresAt = addMinutes(new Date(), 30).toISOString(); // 30분 만료

  const stmt = db.prepare(
    `UPDATE users
     SET password_reset_token = ?1,
         password_reset_token_expires_at = ?2,
         password_reset_token_used = 0,
         updated_at = ?3
     WHERE id = ?4`,
  );
  await stmt.bind(token, expiresAt, nowISO(), userId).run();

  return token;
}

/**
 * 비밀번호 재설정 토큰 검증 및 새 비밀번호 적용
 */
export async function verifyAndResetPassword(
  db: D1Database,
  token: string,
  newPasswordHash: string,
  newSalt: string,
): Promise<{ userId: string; error?: string }> {
  const stmt = db.prepare(
    `SELECT id, password_reset_token_expires_at, password_reset_token_used
     FROM users
     WHERE password_reset_token = ?1
     LIMIT 1`,
  );
  const row = (await stmt.bind(token).first()) as {
    id: string;
    password_reset_token_expires_at: string | null;
    password_reset_token_used: number;
  } | null;

  if (!row) {
    return { userId: '', error: 'INVALID_TOKEN' };
  }

  if (row.password_reset_token_used === 1) {
    return { userId: row.id, error: 'TOKEN_ALREADY_USED' };
  }

  const expiresAt = row.password_reset_token_expires_at;
  if (!expiresAt || new Date(expiresAt) < new Date()) {
    return { userId: row.id, error: 'EXPIRED_TOKEN' };
  }

  // 비밀번호 업데이트 및 토큰 사용 처리.
  // 토큰은 NULL로 만들지 않고 사용 표시만 하여, 재사용 시도 시
  // TOKEN_ALREADY_USED로 명확하게 구분할 수 있도록 한다.
  const updateStmt = db.prepare(
    `UPDATE users
     SET password_hash = ?1,
         password_salt = ?2,
         password_reset_token_used = 1,
         updated_at = ?3
     WHERE id = ?4`,
  );
  await updateStmt.bind(newPasswordHash, newSalt, nowISO(), row.id).run();

  return { userId: row.id };
}

/**
 * 세션 생성 (만료: 30일)
 */
export async function createSession(
  db: D1Database,
  userId: string,
): Promise<string> {
  const sessionId = generateId(SESSION_ID_PREFIX);
  const now = nowISO();
  const expiresAt = addMinutes(new Date(), 30 * 24 * 60).toISOString(); // 30일

  const stmt = db.prepare(
    `INSERT INTO sessions (id, user_id, expires_at, created_at)
     VALUES (?1, ?2, ?3, ?4)`,
  );
  await stmt.bind(sessionId, userId, expiresAt, now).run();

  return sessionId;
}

/**
 * 세션 토큰 검증 (만료된 세션은 삭제)
 */
export async function validateSession(
  db: D1Database,
  token: string,
): Promise<{ userId: string; error?: string }> {
  const stmt = db.prepare(
    `SELECT user_id, expires_at
     FROM sessions
     WHERE id = ?1
     LIMIT 1`,
  );
  const row = (await stmt.bind(token).first()) as DBSessionRow | null;

  if (!row) {
    return { userId: '', error: 'INVALID_SESSION' };
  }

  if (new Date(row.expires_at) < new Date()) {
    // 만료된 세션 삭제
    const deleteStmt = db.prepare('DELETE FROM sessions WHERE id = ?1');
    await deleteStmt.bind(token).run();
    return { userId: '', error: 'EXPIRED_SESSION' };
  }

  return { userId: row.user_id };
}

/**
 * 세션 무효화 (로그아웃)
 */
export async function invalidateSession(
  db: D1Database,
  token: string,
): Promise<void> {
  const stmt = db.prepare('DELETE FROM sessions WHERE id = ?1');
  await stmt.bind(token).run();
}

/**
 * 사용자의 모든 세션 무효화 (회원 탈퇴 시)
 */
export async function invalidateAllSessions(
  db: D1Database,
  userId: string,
): Promise<void> {
  const stmt = db.prepare('DELETE FROM sessions WHERE user_id = ?1');
  await stmt.bind(userId).run();
}

/**
 * 로그인 시도 기록 (무차별 대입 공격 방지)
 */
export async function recordLoginAttempt(
  db: D1Database,
  email: string,
  success: boolean,
): Promise<void> {
  const id = generateId(ATTEMPT_ID_PREFIX);
  const stmt = db.prepare(
    `INSERT INTO login_attempts (id, email, attempted_at, success)
     VALUES (?1, ?2, ?3, ?4)`,
  );
  await stmt
    .bind(id, email.trim().toLowerCase(), nowISO(), success ? 1 : 0)
    .run();

  // 30일 이전 기록 정리
  const cutoff = addMinutes(new Date(), -30 * 24 * 60).toISOString();
  const cleanupStmt = db.prepare(
    'DELETE FROM login_attempts WHERE attempted_at < ?1',
  );
  await cleanupStmt.bind(cutoff).run();
}

/**
 * 최근 실패한 로그인 시도 횟수 조회 (15분 기준)
 */
export async function countRecentFailedAttempts(
  db: D1Database,
  email: string,
): Promise<number> {
  const cutoff = addMinutes(new Date(), -15).toISOString();
  const stmt = db.prepare(
    `SELECT COUNT(*) as count FROM login_attempts
     WHERE email = ?1 AND success = 0 AND attempted_at > ?2`,
  );
  const row = (await stmt.bind(email.trim().toLowerCase(), cutoff).first()) as {
    count: number;
  } | null;
  return row?.count ?? 0;
}

/**
 * 사용자 삭제 (회원 탈퇴)
 */
export async function deleteUser(
  db: D1Database,
  userId: string,
): Promise<void> {
  // 외래 키 CASCADE로 세션, 동의 기록 자동 삭제
  const stmt = db.prepare('DELETE FROM users WHERE id = ?1');
  await stmt.bind(userId).run();
}

/**
 * DBUserRow를 AuthUser 인터페이스로 변환
 */
export function toAuthUser(row: DBUserRow): AuthUser {
  return {
    id: row.id,
    email: row.email,
    emailVerified: row.email_verified === 1,
    createdAt: row.created_at,
  };
}
