import { describe, expect, it } from 'bun:test';
import {
  getCookie,
  hashPassword,
  normalizeEmail,
  parseJson,
  randomToken,
  sessionCookie,
  sha256,
  verifyPassword,
} from '../../functions/api/auth/_shared';

describe('authentication primitives', () => {
  it('parses only bounded JSON object request bodies', async () => {
    const valid = new Request('https://cozymoney.kr/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ email: 'test@example.com' }),
    });
    expect(await parseJson(valid)).toEqual({ email: 'test@example.com' });

    const wrongContentType = new Request(
      'https://cozymoney.kr/api/auth/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/jsonp' },
        body: JSON.stringify({ email: 'test@example.com' }),
      },
    );
    expect(await parseJson(wrongContentType)).toBeNull();

    const malformed = new Request('https://cozymoney.kr/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"email":',
    });
    expect(await parseJson(malformed)).toBeNull();

    const arrayBody = new Request('https://cozymoney.kr/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '[]',
    });
    expect(await parseJson(arrayBody)).toBeNull();

    const oversizedPayload = JSON.stringify({ value: 'x'.repeat(17 * 1024) });
    const oversized = new Request('https://cozymoney.kr/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: oversizedPayload,
    });
    expect(await parseJson(oversized)).toBeNull();

    const declaredOversized = new Request(
      'https://cozymoney.kr/api/auth/login',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': String(
            new TextEncoder().encode(oversizedPayload).byteLength,
          ),
        },
        body: oversizedPayload,
      },
    );
    expect(await parseJson(declaredOversized)).toBeNull();
  });

  it('normalizes valid email addresses and rejects invalid ones', () => {
    expect(normalizeEmail('  Example.User@Example.com ')).toBe(
      'example.user@example.com',
    );
    expect(normalizeEmail('not-an-email')).toBeNull();
    expect(normalizeEmail('a @example.com')).toBeNull();
    expect(normalizeEmail(null)).toBeNull();
  });

  it('creates URL-safe random tokens', () => {
    const token = randomToken();
    expect(token.length).toBeGreaterThanOrEqual(40);
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('hashes passwords and verifies only the matching password', async () => {
    const password = 'correct horse battery staple 2026';
    const stored = await hashPassword(password);
    expect(stored.split('$')[1]).toBe('100000');
    expect(await verifyPassword(password, stored)).toBe(true);
    expect(await verifyPassword('incorrect password', stored)).toBe(false);
  });

  it('hashes tokens consistently', async () => {
    expect(await sha256('test-token')).toBe(await sha256('test-token'));
    expect(await sha256('test-token')).not.toBe(
      await sha256('different-token'),
    );
  });

  it('sets HttpOnly SameSite session cookies and reads cookie values', () => {
    const request = new Request('https://cozymoney.kr/api/auth/login');
    const cookie = sessionCookie(request, 'test_token', 3600);
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('SameSite=Lax');
    expect(cookie).toContain('Secure');
    const cookieRequest = new Request('https://cozymoney.kr/', {
      headers: { Cookie: 'other=value; cm_session=test_token' },
    });
    expect(getCookie(cookieRequest, 'cm_session')).toBe('test_token');

    const insecureProductionRequest = new Request(
      'http://cozymoney.kr/api/auth/login',
    );
    expect(
      sessionCookie(insecureProductionRequest, 'test_token', 3600),
    ).toContain('Secure');

    const localRequest = new Request('http://localhost:8788/api/auth/login');
    const localCookie = sessionCookie(localRequest, 'test_token', 3600);
    expect(localCookie).not.toContain('Secure');
    expect(localCookie).toContain('HttpOnly');
    expect(localCookie).toContain('SameSite=Lax');

    const secureLocalRequest = new Request(
      'https://localhost:8788/api/auth/login',
    );
    expect(sessionCookie(secureLocalRequest, 'test_token', 3600)).toContain(
      'Secure',
    );
  });
});
