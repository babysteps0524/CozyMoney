import type { D1Database } from './db';

export interface EmailService {
  sendVerificationEmail(email: string, token: string): Promise<void>;
  sendPasswordResetEmail(email: string, token: string): Promise<void>;
}

/**
 * 로그 전용 이메일 서비스 (개발/테스트 환경)
 * 실제 이메일은 전송하지 않고 콘솔에 기록합니다.
 * 운영 환경에서는 SendGrid, SMTP, Cloudflare Email Routing 등으로 교체하세요.
 */
export class LogEmailService implements EmailService {
  async sendVerificationEmail(email: string, token: string): Promise<void> {
    console.log(`[EMAIL] 인증 메일 발송 (로그 모드):`);
    console.log(`  수신: ${email}`);
    console.log(`  인증 토큰: ${token}`);
    console.log(
      `  인증 URL: https://cozymoney.kr/verify-email/?token=${token}`,
    );
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    console.log(`[EMAIL] 비밀번호 재설정 메일 발송 (로그 모드):`);
    console.log(`  수신: ${email}`);
    console.log(`  재설정 토큰: ${token}`);
    console.log(
      `  재설정 URL: https://cozymoney.kr/reset-password/?token=${token}`,
    );
  }
}

/**
 * 실제 이메일 서비스 인터페이스 구현 예시 (운영 시 교체 대상)
 * 이 클래스는 현재 사용되지 않으며, 운영자가 실제 이메일 서비스를 연동할 때 구현합니다.
 */
export class SmtpEmailService implements EmailService {
  constructor(_from: string, _apiKey: string, _baseUrl: string) {}

  async sendVerificationEmail(_email: string, _token: string): Promise<void> {
    throw new Error('SMTP 이메일 서비스는 운영자가 구현해야 합니다.');
  }

  async sendPasswordResetEmail(_email: string, _token: string): Promise<void> {
    throw new Error('SMTP 이메일 서비스는 운영자가 구현해야 합니다.');
  }
}

/**
 * 환경 변수에 따라 이메일 서비스 인스턴스를 생성합니다.
 * AUTH_EMAIL_PROVIDER가 'log'이면 로그 전용, 그 외는 실제 구현 필요.
 */
export function createEmailService(
  provider: string,
  from?: string,
  apiKey?: string,
  baseUrl?: string,
): EmailService {
  if (provider === 'log') {
    return new LogEmailService();
  }
  if (provider === 'smtp' && from && apiKey && baseUrl) {
    return new SmtpEmailService(from, apiKey, baseUrl);
  }
  // 기본값은 로그 전용 (실제 발송 없음, 운영 환경에서는 설정 필수)
  return new LogEmailService();
}

/**
 * 인증 메일 발송 (DB와 이메일 서비스 연동)
 */
export async function sendVerificationMail(
  db: D1Database,
  emailService: EmailService,
  userId: string,
  email: string,
): Promise<{ error?: string }> {
  const { token, error } = await (async () => {
    const existing = await (db as any)
      .prepare(
        'SELECT email_verification_token FROM users WHERE id = ?1 LIMIT 1',
      )
      .bind(userId)
      .first();
    if (existing?.email_verification_token) {
      return {
        token: existing.email_verification_token as string,
        error: undefined as string | undefined,
      };
    }
    // import는 순환 참조 방지를 위해 인라인 처리
    const { createEmailVerificationToken } = await import('./db');
    const t = await createEmailVerificationToken(db, userId);
    return { token: t, error: undefined as string | undefined };
  })();

  if (error) {
    return { error };
  }

  try {
    await emailService.sendVerificationEmail(email, token);
    return {};
  } catch {
    return { error: 'EMAIL_SEND_FAILED' };
  }
}

/**
 * 비밀번호 재설정 메일 발송
 */
export async function sendPasswordResetMail(
  db: D1Database,
  emailService: EmailService,
  userId: string,
  email: string,
): Promise<{ token?: string; error?: string }> {
  const { createPasswordResetToken } = await import('./db');
  const token = await createPasswordResetToken(db, userId);

  try {
    await emailService.sendPasswordResetEmail(email, token);
    return { token };
  } catch {
    return { error: 'EMAIL_SEND_FAILED' };
  }
}
