import { describe, expect, test } from 'bun:test';
import {
  hashPassword,
  verifyPassword,
  generateAuthToken,
} from '../../src/lib/auth/password';

describe('hashPassword / verifyPassword', () => {
  test('같은 비밀번호로 생성한 해시는 검증에 성공한다', async () => {
    const { hash, salt } = await hashPassword('StrongPass123!');
    expect(typeof hash).toBe('string');
    expect(typeof salt).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
    expect(salt.length).toBeGreaterThan(0);

    const valid = await verifyPassword('StrongPass123!', hash, salt);
    expect(valid).toBe(true);
  });

  test('다른 비밀번호는 검증에 실패한다', async () => {
    const { hash, salt } = await hashPassword('StrongPass123!');
    const valid = await verifyPassword('WrongPass123!', hash, salt);
    expect(valid).toBe(false);
  });

  test('빈 비밀번호도 해시 및 검증이 수행된다', async () => {
    const { hash, salt } = await hashPassword('');
    const valid = await verifyPassword('', hash, salt);
    expect(valid).toBe(true);
  });

  test('동일 비밀번호라도 솔트가 다르면 해시가 다르다', async () => {
    const a = await hashPassword('SamePassword1!');
    const b = await hashPassword('SamePassword1!');
    expect(a.hash).not.toBe(b.hash);
    expect(a.salt).not.toBe(b.salt);
  });
});

describe('generateAuthToken', () => {
  test('예측 불가능한 토큰을 생성한다', () => {
    const token1 = generateAuthToken();
    const token2 = generateAuthToken();
    expect(token1).toHaveLength(64); // 32 bytes -> 64 hex chars
    expect(token2).toHaveLength(64);
    expect(token1).not.toBe(token2);
    expect(/^[0-9a-f]+$/.test(token1)).toBe(true);
  });

  test('지정한 길이만큼 토큰을 생성한다', () => {
    const token = generateAuthToken(16);
    expect(token).toHaveLength(32);
  });
});
