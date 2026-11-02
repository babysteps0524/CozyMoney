import {
  type AuthEnv,
  getCurrentUser,
  json,
  originIsAllowed,
  parseJson,
  requireDb,
} from '../../auth/_shared';
import { sendEmail, type EmailEnv } from '../../_email';
import { renderInquiryAnswerEmail } from '../../_email-templates';

interface Context {
  request: Request;
  env: AuthEnv & EmailEnv;
  params: { id: string };
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

interface AnswerBody {
  answer?: unknown;
}

function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
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
  params,
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

  const inquiry = await env.D1_AUTH_DB.prepare(
    'SELECT id, user_id, name, email, subject, message, status, answer, answered_at, answered_by, created_at, updated_at FROM inquiries WHERE id = ? LIMIT 1',
  )
    .bind(params.id)
    .first<InquiryRow>();

  if (!inquiry) {
    return json({ error: '문의를 찾을 수 없습니다.' }, 404);
  }

  return json({ inquiry });
};

export const onRequestPost = async ({
  request,
  env,
  params,
}: Context): Promise<Response> => {
  if (!originIsAllowed(request)) {
    return json({ error: '요청을 확인할 수 없습니다.' }, 403);
  }

  const dbError = requireDb(env);
  if (dbError) return dbError;

  const adminCheck = requireAdmin(env);
  if (adminCheck) return adminCheck;

  const user = await getCurrentUser(request, env);
  const adminEmail = env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!user || !adminEmail || user.email.trim().toLowerCase() !== adminEmail) {
    return json({ error: '관리자만 접근할 수 있습니다.' }, 403);
  }

  const inquiry = await env.D1_AUTH_DB.prepare(
    'SELECT id, user_id, name, email, subject, message, status FROM inquiries WHERE id = ? LIMIT 1',
  )
    .bind(params.id)
    .first<InquiryRow>();

  if (!inquiry) {
    return json({ error: '문의를 찾을 수 없습니다.' }, 404);
  }

  const body = await parseJson(request);
  if (!body) {
    return json({ error: '올바른 JSON 요청이 필요합니다.' }, 400);
  }

  const answerBody = body as AnswerBody;
  const answer =
    typeof answerBody.answer === 'string' ? answerBody.answer.trim() : '';

  if (!answer || answer.length > 5000) {
    return json({ error: '답변 내용을 확인해 주세요. (1~5000자)' }, 400);
  }

  const now = nowSeconds();

  await env.D1_AUTH_DB.prepare(
    'UPDATE inquiries SET answer = ?, answered_at = ?, answered_by = ?, status = ?, updated_at = ? WHERE id = ?',
  )
    .bind(answer, now, user.id, 'answered', now, params.id)
    .run();

  // Use the active deployment URL so Preview answer emails stay on Preview.
  const siteUrl =
    env.AUTH_SITE_URL || env.PUBLIC_SITE_URL || 'https://cozymoney.kr';
  const answeredEmail = renderInquiryAnswerEmail(
    { siteUrl },
    inquiry.name,
    inquiry.email,
    inquiry.id,
    inquiry.subject,
    answer,
    new Date(now * 1000).toISOString(),
  );

  const emailEnv: EmailEnv = {
    BREVO_API_KEY: env.BREVO_API_KEY,
    BREVO_FROM_EMAIL: env.BREVO_FROM_EMAIL,
    BREVO_FROM_NAME: env.BREVO_FROM_NAME,
    PUBLIC_SITE_URL: siteUrl,
  };

  await sendEmail(emailEnv, {
    to: inquiry.email,
    subject: answeredEmail.subject,
    text: answeredEmail.text,
    html: answeredEmail.html,
  }).catch((error: unknown) => {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[admin:inquiries:answer] user email failed:', msg);
  });

  const updated = await env.D1_AUTH_DB.prepare(
    'SELECT id, status, answer, answered_at, answered_by, updated_at FROM inquiries WHERE id = ? LIMIT 1',
  )
    .bind(params.id)
    .first<{
      id: string;
      status: string;
      answer: string | null;
      answered_at: number | null;
      answered_by: string | null;
      updated_at: number;
    }>();

  return json({
    message: '답변이 전송되었습니다.',
    inquiry: updated,
  });
};
