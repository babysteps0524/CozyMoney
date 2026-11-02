export interface TemplateVars {
  siteUrl: string;
}

export interface RenderedEmail {
  subject: string;
  text: string;
  html: string;
}

function baseUrl(siteUrl: string): string {
  return siteUrl.replace(/\/$/, '');
}

function styleBlock(): string {
  return (
    '<style>' +
    'body { font-family: Pretendard, -apple-system, BlinkMacSystemFont, ' +
    'Segoe UI, Roboto, sans-serif; line-height: 1.6; color: #1f2937; ' +
    'margin: 0; padding: 0; background-color: #f3f4f6; }' +
    '.card { max-width: 600px; margin: 24px auto; background: #ffffff; ' +
    'border-radius: 12px; border: 1px solid #e5e7eb; padding: 32px; }' +
    '.header { text-align: center; margin-bottom: 24px; }' +
    '.title { font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 8px; }' +
    '.subtitle { font-size: 14px; color: #6b7280; margin: 0; }' +
    '.body { font-size: 14px; color: #374151; margin: 0 0 16px; }' +
    '.button { display: inline-block; background: #2563eb; color: #ffffff; ' +
    'text-decoration: none; padding: 12px 24px; border-radius: 8px; ' +
    'font-weight: 600; font-size: 14px; }' +
    '.button:hover { background: #1d4ed8; }' +
    '.footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; ' +
    'font-size: 12px; color: #9ca3af; text-align: center; }' +
    '.label { font-size: 12px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 4px; }' +
    '.value { font-size: 14px; color: #111827; margin: 0 0 16px; word-break: break-all; }' +
    '</style>'
  );
}

function wrapper(title: string, bodyHtml: string, siteUrl: string): string {
  const contactUrl = baseUrl(siteUrl) + '/contact/';
  return (
    '<!DOCTYPE html>' +
    '<html lang="ko">' +
    '<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">' +
    '<title>' +
    title +
    '</title>' +
    styleBlock() +
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

export function renderInquiryReceivedEmail(
  vars: TemplateVars,
  name: string,
  email: string,
  inquiryId: string,
): RenderedEmail {
  const subject = 'CozyMoney 문의 접수 완료';
  const body =
    '<p class="body">안녕하세요, <strong>' +
    name +
    '</strong>님!</p>' +
    '<p class="body">문의 내용을 접수했어요. 담당자가 확인한 뒤 답변을 드릴게요.</p>' +
    '<p class="label">문의 ID</p>' +
    '<p class="value">' +
    inquiryId +
    '</p>' +
    '<p class="label">문의 이메일</p>' +
    '<p class="value">' +
    email +
    '</p>' +
    '<p class="body">답변은 입력해 주신 이메일로 전송됩니다.</p>' +
    '<p class="body">문의 상태는 CozyMoney에서 확인할 수 있어요.</p>';
  return {
    subject: subject,
    text:
      'CozyMoney 문의 접수 완료\n\n안녕하세요, ' +
      name +
      '님!\n\n' +
      '문의 내용을 접수했어요. 담당자가 확인한 뒤 답변을 드릴게요.\n\n' +
      '문의 ID: ' +
      inquiryId +
      '\n' +
      '문의 이메일: ' +
      email +
      '\n\n' +
      '답변은 입력해 주신 이메일로 전송됩니다.\n\n' +
      baseUrl(vars.siteUrl) +
      '/contact/',
    html: wrapper(subject, body, vars.siteUrl),
  };
}

export function renderAdminInquiryAlertEmail(
  vars: TemplateVars,
  inquiryId: string,
  name: string,
  email: string,
  subjectLine: string,
  message: string,
  createdAt: string,
): RenderedEmail {
  const site = baseUrl(vars.siteUrl);
  const title = '새 문의가 접수되었습니다.';
  const body =
    '<p class="body">사용자가 새로운 문의를 보냈어요.</p>' +
    '<p class="label">문의 ID</p>' +
    '<p class="value">' +
    inquiryId +
    '</p>' +
    '<p class="label">이름</p>' +
    '<p class="value">' +
    name +
    '</p>' +
    '<p class="label">이메일</p>' +
    '<p class="value">' +
    email +
    '</p>' +
    '<p class="label">제목</p>' +
    '<p class="value">' +
    subjectLine +
    '</p>' +
    '<p class="label">내용</p>' +
    '<p class="value" style="white-space: pre-wrap;">' +
    message +
    '</p>' +
    '<p class="label">접수 일시</p>' +
    '<p class="value">' +
    createdAt +
    '</p>' +
    '<p class="body" style="margin-top: 24px;">' +
    '<a href="' +
    site +
    '/admin/inquiries" class="button">문의 관리 페이지로 이동</a>' +
    '</p>';
  return {
    subject: '[CozyMoney] 새 문의 접수 알림 - ' + subjectLine,
    text:
      '새 문의가 접수되었습니다.\n\n' +
      '문의 ID: ' +
      inquiryId +
      '\n' +
      '이름: ' +
      name +
      '\n' +
      '이메일: ' +
      email +
      '\n' +
      '제목: ' +
      subjectLine +
      '\n' +
      '내용:\n' +
      message +
      '\n' +
      '접수 일시: ' +
      createdAt +
      '\n\n' +
      site +
      '/admin/inquiries',
    html: wrapper(title, body, vars.siteUrl),
  };
}

export function renderInquiryAnswerEmail(
  vars: TemplateVars,
  name: string,
  _email: string,
  inquiryId: string,
  subjectLine: string,
  answer: string,
  answeredAt: string,
): RenderedEmail {
  const subject = 'CozyMoney 문의 답변이 도착했어요.';
  const body =
    '<p class="body">안녕하세요, <strong>' +
    name +
    '</strong>님!</p>' +
    '<p class="body">보내 주신 문의에 대한 답변이 도착했어요.</p>' +
    '<p class="label">문의 ID</p>' +
    '<p class="value">' +
    inquiryId +
    '</p>' +
    '<p class="label">문의 제목</p>' +
    '<p class="value">' +
    subjectLine +
    '</p>' +
    '<p class="label">답변</p>' +
    '<p class="value" style="white-space: pre-wrap; background: #f9fafb; padding: 16px; border-radius: 8px;">' +
    answer +
    '</p>' +
    '<p class="label">답변 일시</p>' +
    '<p class="value">' +
    answeredAt +
    '</p>' +
    '<p class="body">추가로 궁금한 점이 있으면 언제든지 다시 문의해 주세요.</p>';
  return {
    subject: subject,
    text:
      'CozyMoney 문의 답변이 도착했어요.\n\n' +
      '안녕하세요, ' +
      name +
      '님!\n\n' +
      '보내 주신 문의에 대한 답변이 도착했어요.\n\n' +
      '문의 ID: ' +
      inquiryId +
      '\n' +
      '문의 제목: ' +
      subjectLine +
      '\n\n' +
      '답변:\n' +
      answer +
      '\n\n' +
      '답변 일시: ' +
      answeredAt +
      '\n\n' +
      '추가로 궁금한 점이 있으면 언제든지 다시 문의해 주세요.\n\n' +
      baseUrl(vars.siteUrl) +
      '/contact/',
    html: wrapper(subject, body, vars.siteUrl),
  };
}
