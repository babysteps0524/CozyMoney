/**
 * Cloudflare Pages Functions 인증 API 공통 헬퍼
 *
 * 이 파일은 함수 간 공유 유틸리티이며, 라우트로 노출되지 않습니다.
 * (언더스코어 prefix는 Cloudflare Pages Functions에서 라우트에서 제외하는 관례입니다.)
 * 데이터베이스 및 비밀번호 함수는 각 함수 파일에서 직접 import합니다.
 */

import type { D1Database } from '../../../src/lib/auth/db';
import { validateSession } from '../../../src/lib/auth/db';
import { createEmailService } from '../../../src/lib/auth/email';

const SESSION_COOKIE_NAME = 'cozymoney_session';
const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30일 (초)
const RATE_LIMIT_MAX_ATTEMPTS = 5; // 15분당 최대 실패 시도
const PASSWORD_MIN_LENGTH = 8;

/**
 * Cloudflare Pages Functions 환경 변수 바인딩 타입
 */
export interface AuthEnv {
  D1_AUTH_DB: D1Database;
  AUTH_SESSION_SECRET?: string;
  AUTH_EMAIL_PROVIDER?: string;
  AUTH_EMAIL_FROM?: string;
  AUTH_EMAIL_API_KEY?: string;
  AUTH_EMAIL_BASE_URL?: string;
  AUTH_SITE_URL?: string;
  AUTH_FRONTEND_URL?: string;
}

/**
 * 환경 변수에서 보안 설정을 읽습니다.
 */
export function getEnv(env: unknown): AuthEnv {
  const e = env as Record<string, unknown>;
  return {
    D1_AUTH_DB: e.D1_AUTH_DB as D1Database,
    AUTH_SESSION_SECRET: e.AUTH_SESSION_SECRET as string | undefined,
    AUTH_EMAIL_PROVIDER: (e.AUTH_EMAIL_PROVIDER as string) ?? 'log',
    AUTH_EMAIL_FROM: e.AUTH_EMAIL_FROM as string | undefined,
    AUTH_EMAIL_API_KEY: e.AUTH_EMAIL_API_KEY as string | undefined,
    AUTH_EMAIL_BASE_URL: e.AUTH_EMAIL_BASE_URL as string | undefined,
    AUTH_SITE_URL: e.AUTH_SITE_URL as string | undefined,
    AUTH_FRONTEND_URL: e.AUTH_FRONTEND_URL as string | undefined,
  };
}

/**
 * 세션 쿠키를 구성합니다.
 */
export function buildSetCookieHeader(token: string): string {
  return `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_MAX_AGE}`;
}

/**
 * 세션 쿠키를 삭제합니다.
 */
export function buildClearCookieHeader(): string {
  return `${SESSION_COOKIE_NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Strict`;
}

/**
 * 요청에서 세션 토큰을 추출합니다.
 */
export function getSessionTokenFromRequest(request: Request): string | null {
  const cookie = request.headers.get('Cookie');
  if (!cookie) return null;
  const match = cookie.match(/(?:^|;\s*)cozymoney_session=([^;]+)/);
  return match ? match[1] : null;
}

/**
 * JSON 에러 응답을 생성합니다.
 */
export function jsonError(
  message: string,
  code: string,
  status: number,
): Response {
  return new Response(
    JSON.stringify({ success: false, error: { code, message } }),
    {
      status,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    },
  );
}

/**
 * JSON 성공 응답을 생성합니다.
 */
export function jsonSuccess(data: unknown, status = 200): Response {
  return new Response(JSON.stringify({ success: true, data }), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

/**
 * 요청 본문을 JSON으로 파싱합니다.
 */
export async function parseBody<T = unknown>(request: Request): Promise<T> {
  const contentType = request.headers.get('Content-Type') ?? '';
  if (!contentType.includes('application/json')) {
    throw new Error('Content-Type must be application/json');
  }
  return request.json() as Promise<T>;
}

/**
 * CORS 헤더를 응답에 추가합니다.
 */
export function withCorsHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return new Response(response.body, { status: response.status, headers });
}

/**
 * 비밀번호 정책 검증
 */
export function validatePasswordPolicy(password: string): string | null {
  if (!password) return '비밀번호를 입력해주세요.';
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `비밀번호는 최소 ${PASSWORD_MIN_LENGTH}자 이상이어야 합니다.`;
  }
  return null;
}

/**
 * 이메일 형식 검증 (간단)
 */
export function validateEmailFormat(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) return '이메일 주소를 입력해주세요.';
  if (!trimmed.includes('@') || !trimmed.includes('.')) {
    return '올바른 이메일 형식을 입력해주세요.';
  }
  return null;
}

/**
 * 인증된 사용자 ID를 세션 토큰에서 추출합니다.
 * 인증되지 않은 경우 null을 반환합니다.
 */
export async function getAuthUserId(
  db: D1Database,
  request: Request,
): Promise<{ userId: string; error?: string }> {
  const token = getSessionTokenFromRequest(request);
  if (!token) {
    return { userId: '', error: 'NO_SESSION' };
  }
  return validateSession(db, token);
}

/**
 * 이메일 서비스 인스턴스를 생성합니다.
 */
export function createEmailServiceFromEnv(env: AuthEnv) {
  return createEmailService(
    env.AUTH_EMAIL_PROVIDER ?? 'log',
    env.AUTH_EMAIL_FROM,
    env.AUTH_EMAIL_API_KEY,
    env.AUTH_EMAIL_BASE_URL,
  );
}

export {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE,
  RATE_LIMIT_MAX_ATTEMPTS,
  PASSWORD_MIN_LENGTH,
};
