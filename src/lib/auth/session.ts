import type { AuthUser } from './types';

const SESSION_STORAGE_KEY = 'cozymoney_auth_user';
const SESSION_STATUS_KEY = 'cozymoney_auth_status';

/**
 * 클라이언트 측 UI 상태만 관리한다.
 * 실제 인증 검증은 서버(Cloudflare Pages Function + D1)에서 수행하며,
 * 이 함수는 인증 토큰의 유효성을 서버에서 검증하지 않는다.
 * 마이페이지 진입 전 등 UI 렌더링 판단을 위해 최소한의 상태만 읽는다.
 */
export function getStoredAuthUser(): AuthUser | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setStoredAuthUser(user: AuthUser): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
  window.sessionStorage.setItem(SESSION_STATUS_KEY, 'authenticated');
}

export function clearStoredAuthUser(): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
  window.sessionStorage.removeItem(SESSION_STATUS_KEY);
}

export function isAuthenticatedUI(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.sessionStorage.getItem(SESSION_STATUS_KEY) === 'authenticated';
}

export interface SessionCookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'lax' | 'strict' | 'none';
  path?: string;
  maxAge?: number;
}

export function buildSessionCookie(
  token: string,
  options: SessionCookieOptions = {},
): string {
  const parts = [`cozymoney_session=${token}`];
  if (options.path) {
    parts.push(`path=${options.path}`);
  } else {
    parts.push('path=/');
  }
  if (options.maxAge) {
    parts.push(`max-age=${options.maxAge}`);
  }
  if (options.httpOnly) {
    parts.push('HttpOnly');
  }
  if (options.secure) {
    parts.push('Secure');
  }
  if (options.sameSite) {
    parts.push(`SameSite=${options.sameSite}`);
  }
  return parts.join('; ');
}

export function clearSessionCookie(): string {
  return 'cozymoney_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Strict';
}
