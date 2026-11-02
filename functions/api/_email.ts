export interface EmailEnv {
  BREVO_API_KEY?: string;
  BREVO_FROM_EMAIL?: string;
  BREVO_FROM_NAME?: string;
  PUBLIC_SITE_URL?: string;
}
export interface EmailInput {
  to: string;
  subject: string;
  text: string;
  html: string;
}
export async function sendEmail(
  env: EmailEnv,
  input: EmailInput,
): Promise<void> {
  let hostname: string;
  try {
    hostname = new URL(env.PUBLIC_SITE_URL || 'http://localhost').hostname;
  } catch {
    throw new Error('PUBLIC_SITE_URL must be a valid URL.');
  }
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    console.info(
      '[email:local] To: ' +
        input.to +
        '\nSubject: ' +
        input.subject +
        '\n---TEXT---\n' +
        input.text +
        '\n---HTML---\n' +
        input.html,
    );
    return;
  }
  if (!env.BREVO_API_KEY || !env.BREVO_FROM_EMAIL)
    throw new Error('Brevo email settings are incomplete.');
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
      to: [{ email: input.to }],
      subject: input.subject,
      textContent: input.text,
      htmlContent: input.html,
    }),
  });
  if (!response.ok) {
    const details = await response.text();
    console.error('[email:brevo] send failed:', response.status, details);
    throw new Error('Email delivery failed with status ' + response.status);
  }
}
