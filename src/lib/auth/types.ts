export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
}

export interface SignupInput {
  email: string;
  password: string;
  confirmPassword: string;
  agreePrivacy: boolean;
  agreeTerms: boolean;
  agreeMarketing?: boolean;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthError {
  code: string;
  message: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export type AuthStatus =
  'unauthenticated' | 'authenticating' | 'authenticated' | 'error';
