export interface AuthBoundStatement {
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
  run(): Promise<{ success: boolean; meta?: { changes?: number } }>;
}

interface AuthDbStatement {
  bind(...values: unknown[]): AuthBoundStatement;
}

export interface AuthEnv {
  D1_AUTH_DB: {
    prepare(query: string): AuthDbStatement;
    batch(
      statements: AuthBoundStatement[],
    ): Promise<Array<{ success: boolean; meta?: { changes?: number } }>>;
  };
  AUTH_SITE_URL?: string;
  AUTH_EMAIL_PROVIDER?: string;
  AUTH_SESSION_SECRET?: string;
  PUBLIC_SITE_URL?: string;
  BREVO_API_KEY?: string;
  BREVO_FROM_EMAIL?: string;
  BREVO_FROM_NAME?: string;
  ADMIN_EMAIL?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  email_verified_at: number | null;
}

export function json(
  data: unknown,
  status = 200,
  headers: HeadersInit = {},
): Response {
  const responseHeaders = new Headers(headers);
  responseHeaders.set('Content-Type', 'application/json; charset=utf-8');
  responseHeaders.set('Cache-Control', 'no-store');
  return new Response(JSON.stringify(data), {
    status,
    headers: responseHeaders,
  });
}

export function requireDb(env: AuthEnv): Response | null {
  if (!env.D1_AUTH_DB) {
    return json(
      {
        error:
          '현재 환경에서 데이터베이스를 사용할 수 없습니다. 잠시 후 다시 시도해 주세요.',
      },
      503,
    );
  }
  return null;
}

export function getCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get('Cookie') || '';
  for (const part of cookieHeader.split(';')) {
    const separator = part.indexOf('=');
    if (separator < 0) continue;
    if (part.slice(0, separator).trim() === name) {
      try {
        return decodeURIComponent(part.slice(separator + 1).trim());
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function sessionCookie(
  request: Request,
  token: string,
  maxAge: number,
): string {
  const url = new URL(request.url);
  const isLocalDevelopment = ['localhost', '127.0.0.1', '[::1]'].includes(
    url.hostname,
  );
  // Require Secure outside local HTTP development, even if a proxy or
  // misconfigured route reaches the handler over HTTP.
  const secure =
    url.protocol === 'https:' || !isLocalDevelopment ? '; Secure' : '';
  return (
    'cm_session=' +
    encodeURIComponent(token) +
    '; Path=/; HttpOnly; SameSite=Lax; Max-Age=' +
    maxAge +
    secure
  );
}

export function clearSessionCookie(request: Request): string {
  return sessionCookie(request, '', 0);
}

export function randomToken(bytes = 32): string {
  const buffer = crypto.getRandomValues(new Uint8Array(bytes));
  let binary = '';
  for (const byte of buffer) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

export async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

const CURRENT_PASSWORD_ITERATIONS = 100000;
const LEGACY_PASSWORD_ITERATIONS = 100000;

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: new Uint8Array(salt).buffer,
      iterations: CURRENT_PASSWORD_ITERATIONS,
    },
    key,
    256,
  );
  return (
    'pbkdf2-sha256$' +
    CURRENT_PASSWORD_ITERATIONS +
    '$' +
    toBase64(salt) +
    '$' +
    toBase64(new Uint8Array(bits))
  );
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2-sha256') return false;
  const iterations = Number(parts[1]);
  if (
    !Number.isInteger(iterations) ||
    ![LEGACY_PASSWORD_ITERATIONS, CURRENT_PASSWORD_ITERATIONS].includes(
      iterations,
    )
  )
    return false;
  try {
    const salt = fromBase64(parts[2]);
    const expected = fromBase64(parts[3]);
    if (salt.length !== 16 || expected.length !== 32) return false;
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      'PBKDF2',
      false,
      ['deriveBits'],
    );
    const bits = new Uint8Array(
      await crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          hash: 'SHA-256',
          salt: new Uint8Array(salt).buffer,
          iterations,
        },
        key,
        expected.length * 8,
      ),
    );
    let difference = 0;
    for (let index = 0; index < bits.length; index++)
      difference |= bits[index] ^ expected[index];
    return difference === 0;
  } catch {
    return false;
  }
}

export function needsPasswordRehash(_stored: string): boolean {
  // Cloudflare Pages Web Crypto rejects PBKDF2 iteration counts above 100,000.
  // Keep the supported runtime configuration stable instead of rehashing every
  // successful login repeatedly.
  return false;
}

export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return null;
  return email;
}

const MAX_AUTH_REQUEST_BODY_BYTES = 16 * 1024;

export async function parseJson(
  request: Request,
): Promise<Record<string, unknown> | null> {
  const contentType = (request.headers.get('Content-Type') || '')
    .split(';', 1)[0]
    .trim()
    .toLowerCase();
  if (contentType !== 'application/json') return null;

  const contentLength = request.headers.get('Content-Length');
  if (contentLength !== null) {
    const declaredLength = Number(contentLength);
    if (
      !Number.isSafeInteger(declaredLength) ||
      declaredLength < 0 ||
      declaredLength > MAX_AUTH_REQUEST_BODY_BYTES
    )
      return null;
  }

  if (!request.body) return null;
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > MAX_AUTH_REQUEST_BODY_BYTES) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }

    const bytes = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }

    const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    const value: unknown = JSON.parse(text);
    if (!value || typeof value !== 'object' || Array.isArray(value))
      return null;
    return value as Record<string, unknown>;
  } catch {
    return null;
  } finally {
    reader.releaseLock();
  }
}

export function originIsAllowed(request: Request): boolean {
  const origin = request.headers.get('Origin');
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

async function sendBrevoEmail(
  env: AuthEnv,
  to: string,
  subject: string,
  text: string,
  html: string,
): Promise<void> {
  if (!env.BREVO_API_KEY || !env.BREVO_FROM_EMAIL) {
    throw new Error(
      'Brevo email settings are incomplete. Missing: ' +
        [
          !env.BREVO_API_KEY ? 'BREVO_API_KEY' : '',
          !env.BREVO_FROM_EMAIL ? 'BREVO_FROM_EMAIL' : '',
        ]
          .filter(Boolean)
          .join(', '),
    );
  }
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': env.BREVO_API_KEY,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      sender: {
        email: env.BREVO_FROM_EMAIL,
        name: env.BREVO_FROM_NAME || 'CozyMoney 코지머니',
      },
      to: [{ email: to }],
      subject,
      textContent: text,
      htmlContent: html,
    }),
  });
  if (!response.ok) {
    // Provider response bodies can contain recipient or request details.
    // Log only the status so secrets and personal data are not copied to logs.
    console.error('[auth:brevo] email send failed:', response.status);
    throw new Error('Email delivery failed with status ' + response.status);
  }
}

function emailStyleBlock(): string {
  return (
    '<style>' +
    'body { font-family: Pretendard, -apple-system, BlinkMacSystemFont, ' +
    'Segoe UI, Roboto, sans-serif; line-height: 1.6; color: #1f2937; ' +
    'margin: 0; padding: 0; background-color: #f3f4f6; }' +
    '.card { max-width: 600px; margin: 24px auto; background: #ffffff; ' +
    'border-radius: 12px; border: 1px solid #e5e7eb; padding: 32px; }' +
    '.header { text-align: center; margin-bottom: 24px; }' +
    '.title { font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 8px; }' +
    '.body { font-size: 14px; color: #374151; margin: 0 0 16px; }' +
    '.button { display: inline-block; background: #2563eb; color: #ffffff; ' +
    'text-decoration: none; padding: 12px 24px; border-radius: 8px; ' +
    'font-weight: 600; font-size: 14px; }' +
    '.button:hover { background: #1d4ed8; }' +
    '.footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; ' +
    'font-size: 12px; color: #9ca3af; text-align: center; }' +
    '</style>'
  );
}

function emailWrapper(
  title: string,
  bodyHtml: string,
  siteUrl?: string,
): string {
  const contactUrl = siteUrl
    ? siteUrl.replace(/\/$/, '') + '/contact/'
    : '/contact/';
  return (
    '<!DOCTYPE html>' +
    '<html lang="ko">' +
    '<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">' +
    '<title>' +
    title +
    '</title>' +
    emailStyleBlock() +
    '</head>' +
    '<body>' +
    '<div class="card">' +
    '<div class="header">' +
    '<p class="title">' +
    title +
    '</p>' +
    '</div>' +
    bodyHtml +
    '<div class="footer">' +
    'CozyMoney 코지머니 | 생활·금융·세금·급여·부동산 계산기<br>' +
    '문의: <a href="' +
    contactUrl +
    '">문의하기 페이지로 이동</a>' +
    '</div>' +
    '</div>' +
    '</body>' +
    '</html>'
  );
}

export async function sendVerificationEmail(
  env: AuthEnv,
  email: string,
  token: string,
): Promise<void> {
  if (!env.AUTH_SITE_URL) throw new Error('AUTH_SITE_URL is required.');
  const baseUrl = env.AUTH_SITE_URL.replace(/\/$/, '');
  const verificationUrl =
    baseUrl + '/verify-email/?token=' + encodeURIComponent(token);
  const hostname = new URL(baseUrl).hostname;
  const provider =
    env.AUTH_EMAIL_PROVIDER ||
    (hostname === 'localhost' || hostname === '127.0.0.1' ? 'log' : 'brevo');

  if (provider === 'log') {
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      throw new Error('The log email provider is allowed only on localhost.');
    }
    console.info(
      '[auth:local] Verification URL for ' + email + ': ' + verificationUrl,
    );
    return;
  }

  if (provider === 'brevo') {
    const subject = 'CozyMoney 이메일 주소를 확인해 주세요.';
    const text =
      'CozyMoney 회원가입을 완료하려면 아래 링크를 열어 주세요.\n\n' +
      verificationUrl +
      '\n\n링크는 24시간 동안 유효합니다.';
    const siteUrl = env.PUBLIC_SITE_URL || env.AUTH_SITE_URL;
    const html = emailWrapper(
      subject,
      '<p class="body">아래 링크를 열어 이메일 주소 확인해 주세요.</p><p class="body" style="margin: 24px 0;"><a href="' +
        verificationUrl +
        '" class="button">이메일 주소 확인</a></p><p class="body">링크는 24시간 동안 유효합니다.</p>',
      siteUrl,
    );
    await sendBrevoEmail(env, email, subject, text, html);
    return;
  }

  throw new Error('Unsupported AUTH_EMAIL_PROVIDER.');
}

export async function sendPasswordResetEmail(
  env: AuthEnv,
  email: string,
  token: string,
): Promise<void> {
  if (!env.AUTH_SITE_URL) throw new Error('AUTH_SITE_URL is required.');
  const baseUrl = env.AUTH_SITE_URL.replace(/\/$/, '');
  const resetUrl =
    baseUrl + '/reset-password/?token=' + encodeURIComponent(token);
  const hostname = new URL(baseUrl).hostname;
  const provider =
    env.AUTH_EMAIL_PROVIDER ||
    (hostname === 'localhost' || hostname === '127.0.0.1' ? 'log' : 'brevo');

  if (provider === 'log') {
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      throw new Error('The log email provider is allowed only on localhost.');
    }
    console.info(
      '[auth:local] Password reset URL for ' + email + ': ' + resetUrl,
    );
    return;
  }

  if (provider === 'brevo') {
    const subject = 'CozyMoney 비밀번호 재설정';
    const text =
      'CozyMoney 비밀번호 재설정을 요청했어요.\n\n아래 링크에서 비밀번호를 재설정해 주세요.\n' +
      resetUrl +
      '\n\n링크는 1시간 동안 유효합니다.';
    const siteUrl = env.PUBLIC_SITE_URL || env.AUTH_SITE_URL;
    const html = emailWrapper(
      subject,
      '<p class="body">아래 링크를 열어 비밀번호 재설정해 주세요.</p><p class="body" style="margin: 24px 0;"><a href="' +
        resetUrl +
        '" class="button">비밀번호 재설정</a></p><p class="body">링크는 1시간 동안 유효합니다.</p>',
      siteUrl,
    );
    await sendBrevoEmail(env, email, subject, text, html);
    return;
  }

  throw new Error('Unsupported AUTH_EMAIL_PROVIDER.');
}

export async function isRateLimited(
  request: Request,
  env: AuthEnv,
  action: string,
  maxAttempts: number,
  windowSeconds: number,
  identifier?: string,
): Promise<boolean> {
  if (!env.D1_AUTH_DB) return true;

  try {
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const now = Math.floor(Date.now() / 1000);
    const cutoff = now - windowSeconds;
    // Keep IP and account buckets independent: an identifier-scoped check
    // must not create a second, stricter IP limit for the same request.
    const keys = identifier
      ? [await sha256(action + ':identifier:' + identifier)]
      : [await sha256(action + ':ip:' + ip)];

    if (now % 60 < 5) {
      await env.D1_AUTH_DB.prepare(
        'DELETE FROM auth_rate_limits WHERE window_started_at < ?',
      )
        .bind(now - 86400)
        .run();
    }

    for (const key of keys) {
      await env.D1_AUTH_DB.prepare(
        'INSERT INTO auth_rate_limits (key, count, window_started_at) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET count = CASE WHEN window_started_at <= ? THEN 1 ELSE count + 1 END, window_started_at = CASE WHEN window_started_at <= ? THEN ? ELSE window_started_at END',
      )
        .bind(key, now, cutoff, cutoff, now)
        .run();

      const record = await env.D1_AUTH_DB.prepare(
        'SELECT count FROM auth_rate_limits WHERE key = ? LIMIT 1',
      )
        .bind(key)
        .first<{ count: number }>();

      if ((record?.count ?? 0) > maxAttempts) return true;
    }
    return false;
  } catch {
    return true;
  }
}

export async function getCurrentUser(
  request: Request,
  env: AuthEnv,
): Promise<AuthUser | null> {
  const token = getCookie(request, 'cm_session');
  if (!token) return null;
  const tokenHash = await sha256(token);
  const now = Math.floor(Date.now() / 1000);
  return env.D1_AUTH_DB.prepare(
    'SELECT users.id, users.email, users.email_verified_at FROM auth_sessions JOIN users ON users.id = auth_sessions.user_id WHERE auth_sessions.token_hash = ? AND auth_sessions.expires_at > ? LIMIT 1',
  )
    .bind(tokenHash, now)
    .first<AuthUser>();
}
