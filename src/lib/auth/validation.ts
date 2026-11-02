import type { SignupInput, ValidationResult } from './types';

export const EMAIL_REGEX =
  /^(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-zA-Z0-9-]*[a-zA-Z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)])$/;

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) {
    return '이메일 주소를 입력해주세요.';
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return '올바른 이메일 형식을 입력해주세요.';
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) {
    return '비밀번호를 입력해주세요.';
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `비밀번호는 최소 ${PASSWORD_MIN_LENGTH}자 이상이어야 합니다.`;
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return `비밀번호는 최대 ${PASSWORD_MAX_LENGTH}자까지 입력할 수 있습니다.`;
  }
  return null;
}

export function validateConfirmPassword(
  password: string,
  confirmPassword: string,
): string | null {
  if (!confirmPassword) {
    return '비밀번호 확인을 입력해주세요.';
  }
  if (password !== confirmPassword) {
    return '비밀번호가 일치하지 않습니다.';
  }
  return null;
}

export function validateSignup(input: SignupInput): ValidationResult {
  const errors: Array<{ field: string; message: string }> = [];

  const emailError = validateEmail(input.email);
  if (emailError) {
    errors.push({ field: 'email', message: emailError });
  }

  const passwordError = validatePassword(input.password);
  if (passwordError) {
    errors.push({ field: 'password', message: passwordError });
  }

  const confirmError = validateConfirmPassword(
    input.password,
    input.confirmPassword,
  );
  if (confirmError) {
    errors.push({ field: 'confirmPassword', message: confirmError });
  }

  if (!input.agreePrivacy) {
    errors.push({
      field: 'agreePrivacy',
      message: '개인정보처리방침에 동의해야 회원가입할 수 있습니다.',
    });
  }

  if (!input.agreeTerms) {
    errors.push({
      field: 'agreeTerms',
      message: '이용약관에 동의해야 회원가입할 수 있습니다.',
    });
  }

  return { valid: errors.length === 0, errors };
}
