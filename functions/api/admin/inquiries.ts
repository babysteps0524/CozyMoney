import { type AuthEnv, getCurrentUser, json, requireDb } from '../auth/_shared';
import { type EmailEnv } from '../_email';

interface Context {
  request: Request;
  env: AuthEnv & EmailEnv;
}

interface InquiryRow {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  answer: string | null;
  answered_at: number | null;
  answered_by: string | null;
  created_at: number;
  updated_at: number;
}

function parsePage(value: unknown): number {
  const n = typeof value === 'string' ? parseInt(value, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : 1;
}

function parsePerPage(value: unknown): number {
  const n = typeof value === 'string' ? parseInt(value, 10) : NaN;
  if (!Number.isFinite(n) || n < 1) return 20;
  return n > 100 ? 100 : n;
}

function requireAdmin(env: AuthEnv): Response | null {
  if (!env.ADMIN_EMAIL) {
    return json({ error: '관리자 이메일이 설정되지 않았습니다.' }, 500);
  }
  return null;
}

export const onRequestGet = async ({
  request,
  env,
}: Context): Promise<Response> => {
  const dbError = requireDb(env);
  if (dbError) return dbError;

  const adminCheck = requireAdmin(env);
  if (adminCheck) return adminCheck;

  const user = await getCurrentUser(request, env);
  const adminEmail = env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!user || !adminEmail || user.email.trim().toLowerCase() !== adminEmail) {
    return json({ error: '관리자만 접근할 수 있습니다.' }, 403);
  }

  const url = new URL(request.url);
  const page = parsePage(url.searchParams.get('page'));
  const perPage = parsePerPage(url.searchParams.get('per_page'));
  const status = url.searchParams.get('status') || undefined;
  const offset = (page - 1) * perPage;

  let whereSql = '';
  const bindValues: unknown[] = [];

  if (status) {
    whereSql = 'WHERE status = ?';
    bindValues.push(status);
  }

  const countRow = await env.D1_AUTH_DB.prepare(
    'SELECT COUNT(*) AS total FROM inquiries ' + whereSql,
  )
    .bind(...bindValues)
    .first<{ total: number }>();

  const total = countRow?.total ?? 0;

  const rows = await env.D1_AUTH_DB.prepare(
    'SELECT id, user_id, name, email, subject, message, status, answer, answered_at, answered_by, created_at, updated_at FROM inquiries ' +
      whereSql +
      ' ORDER BY created_at DESC LIMIT ? OFFSET ?',
  )
    .bind(...bindValues, perPage, offset)
    .all<InquiryRow>();

  return json({
    inquiries: rows.results ?? [],
    pagination: {
      page,
      per_page: perPage,
      total,
      total_pages: Math.ceil(total / perPage),
    },
  });
};
