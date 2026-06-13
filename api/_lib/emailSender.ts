import { Resend } from 'resend';
import nodemailer from 'nodemailer';

const RESEND_KEY = process.env.RESEND_API_KEY || '';
const BREVO_USER = process.env.BREVO_USER || 'nishant15bihola@gmail.com';
const BREVO_PASS = (process.env.BREVO_SMTP_KEY || '').replace(/\s+/g, '');
const GMAIL_USER = process.env.EMAIL_USER || 'nishant15bihola@gmail.com';
const GMAIL_PASS = process.env.EMAIL_PASS || '';

const resendClient = RESEND_KEY ? new Resend(RESEND_KEY) : null;

// Initialize transporters lazily or as singletons
let brevoTransporter: nodemailer.Transporter | null = null;
let gmailTransporter: nodemailer.Transporter | null = null;

function getBrevoTransporter() {
  if (!brevoTransporter && BREVO_PASS) {
    brevoTransporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false, // use STARTTLS
      auth: { user: BREVO_USER, pass: BREVO_PASS },
    });
  }
  return brevoTransporter;
}

function getGmailTransporter() {
  if (!gmailTransporter && GMAIL_PASS) {
    gmailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: GMAIL_USER, pass: GMAIL_PASS },
    });
  }
  return gmailTransporter;
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  fromName?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  replyTo,
  fromName = 'Aura Labs',
}: SendEmailParams): Promise<{ success: boolean; provider: string; error?: string }> {
  // 1. Try Resend
  if (resendClient) {
    try {
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
      const response = await resendClient.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to,
        subject,
        html,
        ...(replyTo && { replyTo }),
      });

      if (response.error) {
        throw new Error(response.error.message || 'Resend error');
      }
      return { success: true, provider: 'resend' };
    } catch (err: any) {
      console.warn('[emailSender] Resend failed, trying SMTP fallbacks...', err.message);
    }
  }

  // 2. Try Brevo SMTP
  const brevo = getBrevoTransporter();
  if (brevo) {
    try {
      await brevo.sendMail({
        from: `"${fromName}" <${BREVO_USER}>`,
        to,
        subject,
        html,
        ...(replyTo && { replyTo }),
      });
      return { success: true, provider: 'brevo' };
    } catch (err: any) {
      console.warn('[emailSender] Brevo SMTP failed, trying Gmail fallback...', err.message);
    }
  }

  // 3. Try Gmail SMTP
  const gmail = getGmailTransporter();
  if (gmail) {
    try {
      await gmail.sendMail({
        from: `"${fromName}" <${GMAIL_USER}>`,
        to,
        subject,
        html,
        ...(replyTo && { replyTo }),
      });
      return { success: true, provider: 'gmail' };
    } catch (err: any) {
      console.error('[emailSender] Gmail SMTP failed:', err.message);
      return { success: false, provider: 'none', error: err.message };
    }
  }

  const missingConfigError = 'No email credentials (RESEND_API_KEY, BREVO_SMTP_KEY, or EMAIL_PASS) are configured.';
  console.error('[emailSender] Error:', missingConfigError);
  return { success: false, provider: 'none', error: missingConfigError };
}
