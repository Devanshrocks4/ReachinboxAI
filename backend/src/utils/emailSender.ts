import nodemailer from 'nodemailer';
import { config } from '../config';

let transporterPromise = (async () => {
  // If SMTP credentials are not provided, create a test account (Ethereal)
  try {
    if (!config.smtp.host || !config.smtp.user || !config.smtp.pass) {
      const testAccount = await nodemailer.createTestAccount();
      const t = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log('Using Ethereal test account:', testAccount.user);
      return t;
    }

    const t = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: false,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });
    return t;
  } catch (err) {
    // Final fallback: direct transport (no-op) to avoid crashes
    console.log('Failed to create SMTP transporter, emails will not be sent:', err instanceof Error ? err.message : err);
    return nodemailer.createTransport({ jsonTransport: true });
  }
})();

export interface SendEmailData {
  to: string[];
  subject: string;
  body: string;
  from: string;
}

export async function sendEmail(data: SendEmailData) {
  const transporter = await transporterPromise;
  const info = await transporter.sendMail({
    from: data.from,
    to: data.to.join(','),
    subject: data.subject,
    html: data.body,
  });

  // If Ethereal, log preview URL
  try {
    // @ts-ignore
    if (nodemailer.getTestMessageUrl && nodemailer.getTestMessageUrl(info)) {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }
  } catch {}

  return info;
}
