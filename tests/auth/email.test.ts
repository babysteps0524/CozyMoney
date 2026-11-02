import { describe, expect, test } from 'bun:test';
import { LogEmailService, createEmailService } from '../../src/lib/auth/email';

describe('LogEmailService', () => {
  test('인증 메일 발송 (로그 모드)', async () => {
    const service = new LogEmailService();
    await service.sendVerificationEmail('user@example.com', 'testtoken123');
  });

  test('비밀번호 재설정 메일 발송 (로그 모드)', async () => {
    const service = new LogEmailService();
    await service.sendPasswordResetEmail('user@example.com', 'testtoken123');
  });
});

describe('createEmailService', () => {
  test('프로바이더가 log이면 LogEmailService 반환', () => {
    const service = createEmailService('log');
    expect(service).toBeInstanceOf(LogEmailService);
  });

  test('알 수 없는 프로바이더는 기본적으로 LogEmailService 반환', () => {
    const service = createEmailService('unknown');
    expect(service).toBeInstanceOf(LogEmailService);
  });
});
