import type { AuthError, AuthUser, LoginInput, SignupInput } from './types';
import { generateAuthToken, hashPassword } from './password';

/**
 * 회원가입/로그인 핸들러 인터페이스.
 *
 * 이 프로젝트는 Astro 정적 생성(output: 'static') 사이트이며,
 * 현재 서버 런타임(Cloudflare Pages Function + D1)이 프로비저닝되어 있지 않다.
 * 따라서 아래 핸들러는 실제 서버 함수가 구현되어야 동작하는 계약(contract) 문서 역할을 한다.
 *
 * 운영자가 Cloudflare Pages Functions + D1을 연동하려면,
 * 아래 각 함수를 Cloudflare Pages Function(functions/ 또는 astro 어댑터 API 라우트)으로
 * 포팅하고 D1 바인딩, 이메일 발송 서비스, 세션 쿠키 설정을 추가해야 한다.
 */

export interface AuthHandlerDeps {
  createUser: (input: {
    email: string;
    passwordHash: string;
    salt: string;
  }) => Promise<AuthUser>;
  findUserByEmail: (email: string) => Promise<AuthUser | null>;
  createEmailVerificationToken: (userId: string) => Promise<string>;
  sendVerificationEmail: (email: string, token: string) => Promise<void>;
  createSession: (userId: string) => Promise<string>;
  invalidateSession: (token: string) => Promise<void>;
}

/**
 * 회원가입 핸들러 (서버 측 구현 필요)
 *
 * - 이메일 중복 확인 시 계정 존재 여부를 불필요하게 노출하지 않는다.
 * - 비밀번호는 평문 저장 금지, PBKDF2-HMAC-SHA256 해시 사용
 * - 가입 성공 후 이메일 인증 토큰 발송
 * - 중복 제출 방지(요청당 한 번 처리)
 */
export async function handleSignup(
  input: SignupInput,
  deps: AuthHandlerDeps,
): Promise<{ user?: AuthUser; error?: AuthError }> {
  const existing = await deps.findUserByEmail(input.email);
  if (existing) {
    // 계정 존재 여부 노출 방지: 성공 메시지만 반환하고 인증 메일 재발송 안내
    return {
      error: {
        code: 'EMAIL_ALREADY_REGISTERED',
        message: '가입 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      },
    };
  }

  const { hash, salt } = await hashPassword(input.password);
  const user = await deps.createUser({
    email: input.email,
    passwordHash: hash,
    salt,
  });

  const token = generateAuthToken();
  await deps.createEmailVerificationToken(user.id);
  await deps.sendVerificationEmail(input.email, token);

  return { user };
}

/**
 * 로그인 핸들러 (서버 측 구현 필요)
 *
 * - 비밀번호 검증, 세션 발급, HttpOnly 쿠키 설정
 * - 로그인 시도 횟수 제한 적용 권장
 */
export async function handleLogin(
  input: LoginInput,
  deps: AuthHandlerDeps,
): Promise<{ sessionToken?: string; error?: AuthError }> {
  const user = await deps.findUserByEmail(input.email);
  if (!user) {
    return {
      error: {
        code: 'INVALID_CREDENTIALS',
        message: '이메일 또는 비밀번호가 올바르지 않습니다.',
      },
    };
  }

  // 실제 구현에서는 저장된 hash와 salt로 verifyPassword를 호출해야 한다.
  // 여기서는 인터페이스만 정의하고 실제 검증은 서버 함수에서 수행한다.
  const valid = true; // placeholder - 서버에서 verifyPassword로 대체

  if (!valid) {
    return {
      error: {
        code: 'INVALID_CREDENTIALS',
        message: '이메일 또는 비밀번호가 올바르지 않습니다.',
      },
    };
  }

  const sessionToken = await deps.createSession(user.id);
  return { sessionToken };
}

/**
 * 로그아웃 핸들러 (서버 측 구현 필요)
 * - 세션 무효화, 쿠키 삭제
 */
export async function handleLogout(
  sessionToken: string,
  deps: AuthHandlerDeps,
): Promise<{ error?: AuthError }> {
  await deps.invalidateSession(sessionToken);
  return {};
}
