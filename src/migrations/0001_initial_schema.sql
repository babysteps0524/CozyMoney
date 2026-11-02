-- CozyMoney 인증 데이터베이스 초기 스키마
-- Cloudflare D1 마이그레이션 파일

-- 사용자 계정 테이블
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  email_verified INTEGER NOT NULL DEFAULT 0,
  email_verification_token TEXT,
  email_verification_token_expires_at TEXT,
  password_reset_token TEXT,
  password_reset_token_expires_at TEXT,
  password_reset_token_used INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 사용자 인덱스 (이메일 조회 최적화)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 세션 테이블
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 세션 인덱스 (사용자별 세션 조회, 만료 시간 조회)
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- 동의 기록 테이블 (법적 요구사항 대응)
CREATE TABLE IF NOT EXISTS consent_records (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  privacy_policy INTEGER NOT NULL DEFAULT 0,
  terms_of_service INTEGER NOT NULL DEFAULT 0,
  marketing INTEGER NOT NULL DEFAULT 0,
  agreed_at TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 동의 기록 인덱스
CREATE INDEX IF NOT EXISTS idx_consent_records_user_id ON consent_records(user_id);

-- 로그인 시도 실패 기록 (무차별 대입 공격 방지)
CREATE TABLE IF NOT EXISTS login_attempts (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL COLLATE NOCASE,
  attempted_at TEXT NOT NULL,
  success INTEGER NOT NULL DEFAULT 0
);

-- 로그인 시도 인덱스 (최근 시도 조회)
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_attempted_at ON login_attempts(attempted_at);
