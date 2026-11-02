const ENCODER = new TextEncoder();
const DECODER = new TextDecoder();

// OWASP 권장 PBKDF2 반복 횟수 (SHA-256 기준). 운영 환경에서 검토 후 조정할 수 있다.
const PBKDF2_ITERATIONS = 210000;
const PBKDF2_SALT_LENGTH = 16;
const DERIVED_BITS_LENGTH = 256;

function arrayToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(
    '',
  );
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

function randomBytes(length: number): Uint8Array {
  const buffer = new ArrayBuffer(length);
  const bytes = new Uint8Array(buffer);
  crypto.getRandomValues(bytes);
  return bytes;
}

function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * 평문 비밀번호를 PBKDF2-HMAC-SHA256으로 해시한다.
 * 비밀번호는 평문으로 저장하지 않으며, 임의의 솔트를 사용한다.
 * 이 함수는 서버 측(API 라우트/Cloudflare Pages Function)에서만 호출해야 한다.
 */
export async function hashPassword(
  password: string,
  salt?: Uint8Array,
): Promise<{ hash: string; salt: string }> {
  const saltBytes = salt ?? randomBytes(PBKDF2_SALT_LENGTH);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    ENCODER.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: saltBytes as unknown as BufferSource,
      iterations: PBKDF2_ITERATIONS,
    },
    keyMaterial,
    DERIVED_BITS_LENGTH,
  );

  const hashArray = new Uint8Array(bits);
  return {
    hash: arrayToHex(hashArray),
    salt: arrayToHex(saltBytes),
  };
}

/**
 * 입력 비밀번호가 저장된 해시와 일치하는지 상수 시간 비교로 검증한다.
 */
export async function verifyPassword(
  password: string,
  expectedHash: string,
  saltHex: string,
): Promise<boolean> {
  const saltBytes = hexToBytes(saltHex);
  const { hash } = await hashPassword(password, saltBytes);
  return constantTimeCompare(hash, expectedHash);
}

/**
 * 비밀번호 재설정/이메일 인증용 예측 불가능한 토큰을 생성한다.
 */
export function generateAuthToken(length = 32): string {
  const bytes = randomBytes(length);
  return arrayToHex(bytes);
}

export { DECODER };
