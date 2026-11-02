import {
  isRateLimited,
  type AuthEnv,
  getCurrentUser,
  json,
  normalizeEmail,
  originIsAllowed,
  parseJson,
  randomToken,
  requireDb,
} from '../auth/_shared';
import { sendEmail, type EmailEnv } from '../_email';
import {
  renderAdminInquiryAlertEmail,
  renderInquiryReceivedEmail,
} from '../_email-templates';

interface Context {
  request: Request;
  env: AuthEnv & EmailEnv;
}

interface InquiryBody {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
}

function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

export const onRequestPost = async ({
  request,
  env,
}: Context): Promise<Response> => {
  if (!originIsAllowed(request)) {
    return json({ error: '요청을 확인할 수 없습니다.' }, 403);
  }

  const dbError = requireDb(env);
  if (dbError) return dbError;

  if (await isRateLimited(request, env, 'contact_inquiry', 5, 300)) {
    return json(
      { error: '문의 전송이 너무 많습니다. 5분 후 다시 시도해 주세요.' },
      429,
      { 'Retry-After': '300' },
    );
  }

  const body = await parseJson(request);
  if (!body) {
    return json({ error: '올바른 JSON 요청이 필요합니다.' }, 400);
  }

  const inquiryBody = body as InquiryBody;
  const name =
    typeof inquiryBody.name === 'string' ? inquiryBody.name.trim() : '';
  const email = normalizeEmail(inquiryBody.email);
  const subject =
    typeof inquiryBody.subject === 'string' ? inquiryBody.subject.trim() : '';
  const message =
    typeof inquiryBody.message === 'string' ? inquiryBody.message.trim() : '';

  if (!name || name.length > 100) {
    return json({ error: '이름을 확인해 주세요. (1~100자)' }, 400);
  }
  if (!email) {
    return json({ error: '올바른 이메일 주소를 입력해 주세요.' }, 400);
  }
  if (!subject || subject.length > 200) {
    return json({ error: '제목을 확인해 주세요. (1~200자)' }, 400);
  }
  if (!message || message.length > 2000) {
    return json({ error: '내용을 확인해 주세요. (1~2000자)' }, 400);
  }

  const id = 'inq_' + randomToken(16);
  const user = await getCurrentUser(request, env);
  const userId = user ? user.id : null;

  const now = nowSeconds();

  await env.D1_AUTH_DB.prepare(
    'INSERT INTO inquiries (id, user_id, name, email, subject, message, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
  )
    .bind(id, userId, name, email, subject, message, 'open', now, now)
    .run();

  // Use the active deployment's auth URL so Preview emails link back to Preview.
  const siteUrl =
    env.AUTH_SITE_URL || env.PUBLIC_SITE_URL || 'https://cozymoney.kr';
  const adminEmail = env.ADMIN_EMAIL || 'admin@example.com';

  const receivedEmail = renderInquiryReceivedEmail(
    { siteUrl },
    name,
    email,
    id,
  );
  const alertEmail = renderAdminInquiryAlertEmail(
    { siteUrl },
    id,
    name,
    email,
    subject,
    message,
    new Date(now * 1000).toISOString(),
  );

  await sendEmail(env, {
    to: email,
    subject: receivedEmail.subject,
    text: receivedEmail.text,
    html: receivedEmail.html,
  }).catch((error: unknown) => {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[contact:inquiry] user email failed:', msg);
  });

  await sendEmail(env, {
    to: adminEmail,
    subject: alertEmail.subject,
    text: alertEmail.text,
    html: alertEmail.html,
  }).catch((error: unknown) => {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[contact:inquiry] admin alert email failed:', msg);
  });

  return json(
    {
      message: '문의가 접수되었습니다.',
      inquiryId: id,
    },
    200,
  );
};
