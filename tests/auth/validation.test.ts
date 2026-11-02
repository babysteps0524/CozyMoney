import { describe, expect, test } from 'bun:test';
import {
  validateSignup,
  validateEmail,
  validatePassword,
} from '../../src/lib/auth/validation';

describe('validateEmail', () => {
  test('올바른 이메일 형식은 null을 반환한다', () => {
    expect(validateEmail('user@example.com')).toBeNull();
    expect(validateEmail('user.name+tag@sub.example.co.kr')).toBeNull();
  });

  test('빈 이메일은 오류 메시지를 반환한다', () => {
    expect(validateEmail('')).toBe('이메일 주소를 입력해주세요.');
    expect(validateEmail('   ')).toBe('이메일 주소를 입력해주세요.');
  });

  test('잘못된 이메일 형식은 오류 메시지를 반환한다', () => {
    expect(validateEmail('not-an-email')).not.toBeNull();
    expect(validateEmail('missing@domain')).not.toBeNull();
    expect(validateEmail('@example.com')).not.toBeNull();
    expect(validateEmail('user@')).not.toBeNull();
  });
});

describe('validatePassword', () => {
  test('비밀번호가 너무 짧으면 오류 메시지를 반환한다', () => {
    expect(validatePassword('short')).toContain('8자');
  });

  test('비밀번호가 너무 길면 오류 메시지를 반환한다', () => {
    expect(validatePassword('a'.repeat(129))).toContain('128자');
  });

  test('적절한 길이의 비밀번호는 null을 반환한다', () => {
    expect(validatePassword('SecurePass1!')).toBeNull();
  });

  test('빈 비밀번호는 오류 메시지를 반환한다', () => {
    expect(validatePassword('')).toBe('비밀번호를 입력해주세요.');
  });
});

describe('validateSignup', () => {
  const baseInput = {
    email: 'user@example.com',
    password: 'SecurePass1!',
    confirmPassword: 'SecurePass1!',
    agreePrivacy: true,
    agreeTerms: true,
  };

  test('정상 입력은 valid true를 반환한다', () => {
    const result = validateSignup(baseInput);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('선택 마케팅 동의 없이도 유효하다', () => {
    const result = validateSignup({ ...baseInput, agreeMarketing: false });
    expect(result.valid).toBe(true);
  });

  test('이메일 오류 시 해당 필드 에러를 포함한다', () => {
    const result = validateSignup({ ...baseInput, email: 'invalid' });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === 'email')).toBe(true);
  });

  test('비밀번호 불일치 시 confirmPassword 필드 에러를 포함한다', () => {
    const result = validateSignup({
      ...baseInput,
      confirmPassword: 'Different1!',
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === 'confirmPassword')).toBe(true);
  });

  test('필수 동의 누락 시 해당 필드 에러를 포함한다', () => {
    const noPrivacy = validateSignup({ ...baseInput, agreePrivacy: false });
    expect(noPrivacy.valid).toBe(false);
    expect(noPrivacy.errors.some((e) => e.field === 'agreePrivacy')).toBe(true);

    const noTerms = validateSignup({ ...baseInput, agreeTerms: false });
    expect(noTerms.valid).toBe(false);
    expect(noTerms.errors.some((e) => e.field === 'agreeTerms')).toBe(true);
  });

  test('모든 항목이 누락된 경우 모든 에러를 포함한다', () => {
    const result = validateSignup({
      email: '',
      password: '',
      confirmPassword: '',
      agreePrivacy: false,
      agreeTerms: false,
    });
    expect(result.valid).toBe(false);
    const fields = result.errors.map((e) => e.field);
    expect(fields).toContain('email');
    expect(fields).toContain('password');
    expect(fields).toContain('confirmPassword');
    expect(fields).toContain('agreePrivacy');
    expect(fields).toContain('agreeTerms');
  });
});
