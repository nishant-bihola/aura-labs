import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
import { Client as NotionClient } from '@notionhq/client';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// ─── Environment Variables ────────────────────────────────────────────────────
// Support both VITE_ prefixed and plain variants for Vercel serverless
const RESEND_KEY = process.env.RESEND_API_KEY || '';
const BREVO_USER = process.env.BREVO_USER || 'nishant15bihola@gmail.com';
const BREVO_PASS = (process.env.BREVO_SMTP_KEY || '').replace(/\s+/g, '');
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const NOTION_TOKEN = process.env.NOTION_TOKEN || process.env.VITE_NOTION_TOKEN || '';
const NOTION_DB_ID = process.env.NOTION_DATABASE_ID || process.env.VITE_NOTION_DATABASE_ID || '';
const OWNER_EMAIL = 'nishant15bihola@gmail.com';

// ─── Service Clients ─────────────────────────────────────────────────────────
const resend = RESEND_KEY ? new Resend(RESEND_KEY) : null;
const brevo = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: { user: BREVO_USER, pass: BREVO_PASS },
});

// ─── Email Templates ──────────────────────────────────────────────────────────
const adminEmailHTML = (name: string, email: string, message: string, type: string, plan?: string) => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:48px 20px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        <tr><td style="padding-bottom:40px;text-align:center;">
          <span style="font-size:10px;font-weight:700;letter-spacing:6px;text-transform:uppercase;color:rgba(255,255,255,0.25);">AURA LABS · ADMIN ALERT</span>
        </td></tr>
        <tr><td style="background:#111;border:1px solid rgba(255,255,255,0.06);border-radius:24px;overflow:hidden;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="height:3px;background:linear-gradient(90deg,#ff4d4d,#ff9900);"></td></tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:48px 48px 40px;">
              <p style="margin:0 0 8px;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#ff9900;">New ${type}</p>
              <h1 style="margin:0 0 32px;font-size:28px;font-weight:300;color:#ffffff;letter-spacing:-0.5px;line-height:1.3;">Incoming Inquiry</h1>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="padding:16px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
                    <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.3);">Name</p>
                    <p style="margin:0;font-size:15px;color:#fff;">${name}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
                    <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.3);">Email</p>
                    <a href="mailto:${email}" style="margin:0;font-size:15px;color:#00f0ff;text-decoration:none;">${email}</a>
                  </td>
                </tr>
                ${plan ? `
                <tr>
                  <td style="padding:16px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
                    <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.3);">Plan</p>
                    <p style="margin:0;font-size:15px;color:#fff;">${plan}</p>
                  </td>
                </tr>` : ''}
                <tr>
                  <td style="padding:16px 0;">
                    <p style="margin:0 0 8px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.3);">Message</p>
                    <p style="margin:0;font-size:14px;line-height:1.7;color:rgba(255,255,255,0.6);font-style:italic;">"${message || 'No message provided.'}"</p>
                  </td>
                </tr>
              </table>

              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr><td style="border-radius:100px;background:#ffffff;">
                  <a href="mailto:${email}" style="display:inline-block;padding:13px 32px;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#000;text-decoration:none;">Reply Now</a>
                </td></tr>
              </table>
            </td></tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:20px 48px;border-top:1px solid rgba(255,255,255,0.06);">
              <p style="margin:0;font-size:10px;color:rgba(255,255,255,0.2);letter-spacing:2px;text-transform:uppercase;">Aura Labs · Edmonton, Alberta · © 2026</p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
`;

const userConfirmationHTML = (name: string, plan?: string) => {
  const firstName = name.split(' ')[0] || name;
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:48px 20px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <!-- Logo -->
        <tr><td style="padding-bottom:48px;text-align:center;">
          <span style="font-size:10px;font-weight:700;letter-spacing:6px;text-transform:uppercase;color:rgba(255,255,255,0.25);">AURA LABS</span>
        </td></tr>

        <!-- Card -->
        <tr><td style="background:#111;border:1px solid rgba(255,255,255,0.06);border-radius:24px;overflow:hidden;">

          <!-- Accent bar -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="height:3px;background:linear-gradient(90deg,#00f0ff,#0055ff);"></td></tr>
          </table>

          <!-- Content -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:52px 48px 44px;">
              <p style="margin:0 0 16px;font-size:10px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:#00f0ff;">Transmission Received</p>
              <h1 style="margin:0 0 20px;font-size:34px;font-weight:300;color:#ffffff;letter-spacing:-1px;line-height:1.2;">
                We've got you,<br />${firstName}.
              </h1>
              <p style="margin:0 0 36px;font-size:15px;line-height:1.75;color:rgba(255,255,255,0.55);">
                Your inquiry has landed with our team. We review every submission personally and typically respond within <strong style="color:rgba(255,255,255,0.8);font-weight:600;">1–2 business days</strong>.
              </p>

              <!-- Divider -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr><td style="height:1px;background:rgba(255,255,255,0.06);"></td></tr>
              </table>

              <!-- What happens next -->
              <p style="margin:0 0 20px;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.25);">What Happens Next</p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:36px;">
                <tr><td style="padding:0 0 16px;">
                  <table role="presentation" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="width:28px;vertical-align:top;padding-top:2px;">
                        <div style="width:20px;height:20px;border-radius:50%;background:rgba(0,240,255,0.1);border:1px solid rgba(0,240,255,0.3);text-align:center;line-height:20px;font-size:9px;font-weight:700;color:#00f0ff;">1</div>
                      </td>
                      <td style="padding-left:14px;">
                        <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.6);line-height:1.6;">Our team reviews your project brief</p>
                      </td>
                    </tr>
                  </table>
                </td></tr>
                <tr><td style="padding:0 0 16px;">
                  <table role="presentation" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="width:28px;vertical-align:top;padding-top:2px;">
                        <div style="width:20px;height:20px;border-radius:50%;background:rgba(0,240,255,0.1);border:1px solid rgba(0,240,255,0.3);text-align:center;line-height:20px;font-size:9px;font-weight:700;color:#00f0ff;">2</div>
                      </td>
                      <td style="padding-left:14px;">
                        <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.6);line-height:1.6;">We reach out to schedule a strategy call</p>
                      </td>
                    </tr>
                  </table>
                </td></tr>
                <tr><td>
                  <table role="presentation" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="width:28px;vertical-align:top;padding-top:2px;">
                        <div style="width:20px;height:20px;border-radius:50%;background:rgba(0,240,255,0.1);border:1px solid rgba(0,240,255,0.3);text-align:center;line-height:20px;font-size:9px;font-weight:700;color:#00f0ff;">3</div>
                      </td>
                      <td style="padding-left:14px;">
                        <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.6);line-height:1.6;">We architect your digital experience together</p>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>

              ${plan ? `
              <!-- Plan badge -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:36px;">
                <tr><td style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:100px;padding:10px 20px;">
                  <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,0.5);">Enquiring about: <span style="color:#fff;">${plan} Plan</span></p>
                </td></tr>
              </table>` : ''}

              <!-- CTA -->
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr><td style="border-radius:100px;background:#fff;">
                  <a href="https://calendar.app.google/ZQNXkk3AFDSdbyReA" style="display:inline-block;padding:14px 36px;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#000;text-decoration:none;">Book a Call Now</a>
                </td></tr>
              </table>

            </td></tr>
          </table>

          <!-- Footer -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:24px 48px;border-top:1px solid rgba(255,255,255,0.06);">
              <p style="margin:0;font-size:10px;color:rgba(255,255,255,0.2);letter-spacing:2px;text-transform:uppercase;">
                © 2026 Aura Labs · Edmonton, Alberta · <a href="https://aura-labs-one.vercel.app" style="color:rgba(255,255,255,0.2);text-decoration:none;">aura-labs.com</a>
              </p>
            </td></tr>
          </table>

        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
`;
};

// ─── Handler ──────────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, phone, message, type, plan } = req.body;
  const inquiryType = type || 'Contact';
  const clientName = name || 'Anonymous';

  console.log(`[Contact] New ${inquiryType} from ${clientName} <${email}>`);

  if (!email) {
    return res.status(400).json({ success: false, error: 'Email is required.' });
  }

  const results: Record<string, boolean> = {};

  // 1. Supabase — best effort, never throw
  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      const { error } = await supabase.from('leads').insert([{
        name: clientName,
        email,
        phone: phone || null,
        message,
        service_type: inquiryType,
        plan: plan || null,
        status: 'New',
      }]);
      results.supabase = !error;
      if (error) console.warn('[Contact] Supabase warn:', error.message);
    } catch (err: any) {
      results.supabase = false;
      console.warn('[Contact] Supabase skipped:', err.message);
    }
  }

  // 2. Admin alert via Resend (preferred) — best effort
  if (resend) {
    try {
      await resend.emails.send({
        from: 'Aura Labs <onboarding@resend.dev>',
        to: OWNER_EMAIL,
        replyTo: email,
        subject: `⚡ NEW ${inquiryType.toUpperCase()} — ${clientName}`,
        html: adminEmailHTML(clientName, email, message, inquiryType, plan),
      });
      results.adminEmail = true;
    } catch (err: any) {
      results.adminEmail = false;
      console.error('[Contact] Admin email (Resend) failed:', err.message);
    }
  } else {
    // Fallback: admin via Brevo
    try {
      await brevo.sendMail({
        from: `"Aura Labs" <${BREVO_USER}>`,
        to: OWNER_EMAIL,
        replyTo: email,
        subject: `⚡ NEW ${inquiryType.toUpperCase()} — ${clientName}`,
        html: adminEmailHTML(clientName, email, message, inquiryType, plan),
      });
      results.adminEmail = true;
    } catch (err: any) {
      results.adminEmail = false;
      console.error('[Contact] Admin email (Brevo) failed:', err.message);
    }
  }

  // 3. User confirmation via Brevo — best effort
  if (BREVO_PASS) {
    try {
      await brevo.sendMail({
        from: `"Aura Labs" <${BREVO_USER}>`,
        to: email,
        subject: 'We received your inquiry | Aura Labs',
        html: userConfirmationHTML(clientName, plan),
      });
      results.userEmail = true;
      console.log('[Contact] Confirmation sent to:', email);
    } catch (err: any) {
      results.userEmail = false;
      console.error('[Contact] User confirmation email failed:', err.message);
    }
  } else {
    console.warn('[Contact] No BREVO_SMTP_KEY — user confirmation skipped.');
    results.userEmail = false;
  }

  // 4. Notion — best effort, never throw
  if (NOTION_TOKEN && NOTION_DB_ID) {
    try {
      const notion = new NotionClient({ auth: NOTION_TOKEN });
      await notion.pages.create({
        parent: { database_id: NOTION_DB_ID },
        properties: {
          Name: { title: [{ text: { content: clientName } }] },
          Email: { email },
          Phone: { phone_number: phone || '' },
          Message: { rich_text: [{ text: { content: message || 'No message' } }] },
          Type: { select: { name: inquiryType } },
          ...(plan && { Plan: { select: { name: plan } } }),
          Date: { date: { start: new Date().toISOString() } },
          Status: { status: { name: 'Not started' } },
        },
      });
      results.notion = true;
    } catch (err: any) {
      results.notion = false;
      console.warn('[Contact] Notion skipped:', err.message);
    }
  }

  console.log('[Contact] Results:', results);
  return res.status(200).json({ success: true, results });
}
