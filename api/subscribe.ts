import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Support both VITE_ prefixed (frontend) and plain (serverless) env vars
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const EMAIL_USER = process.env.BREVO_USER || 'nishant15bihola@gmail.com';
const EMAIL_PASS = (process.env.BREVO_SMTP_KEY || '').replace(/\s+/g, '');
const OWNER_EMAIL = 'nishant15bihola@gmail.com';

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: { user: EMAIL_USER, pass: EMAIL_PASS },
});

// Clean, premium email template
const welcomeEmailHTML = (email: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to The Journal | Aura Labs</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:48px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Logo -->
          <tr>
            <td style="padding-bottom:48px;text-align:center;">
              <span style="font-size:11px;font-weight:700;letter-spacing:6px;text-transform:uppercase;color:rgba(255,255,255,0.3);">AURA LABS</span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#111111;border:1px solid rgba(255,255,255,0.06);border-radius:24px;overflow:hidden;">

              <!-- Header accent bar -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="height:3px;background:linear-gradient(90deg,#00f0ff,#0055ff);"></td>
                </tr>
              </table>

              <!-- Body content -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:52px 48px 40px;">
                    <p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:#00f0ff;">The Journal</p>
                    <h1 style="margin:0 0 24px;font-size:36px;font-weight:300;line-height:1.2;color:#ffffff;letter-spacing:-1px;">You're in.</h1>
                    <p style="margin:0 0 32px;font-size:15px;line-height:1.75;color:rgba(255,255,255,0.55);font-weight:400;">
                      Welcome aboard. You'll receive curated insights on design, technology, and the craft behind building exceptional digital products — straight from our studio in Edmonton.
                    </p>

                    <!-- Divider -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                      <tr><td style="height:1px;background:rgba(255,255,255,0.06);"></td></tr>
                    </table>

                    <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.25);">Subscribed As</p>
                    <p style="margin:0 0 40px;font-size:14px;color:rgba(255,255,255,0.7);">${email}</p>

                    <!-- CTA -->
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="border-radius:100px;background:#ffffff;">
                          <a href="https://aura-labs-one.vercel.app" style="display:inline-block;padding:14px 36px;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#000000;text-decoration:none;">
                            Explore Our Work
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Footer -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:24px 48px;border-top:1px solid rgba(255,255,255,0.06);">
                    <p style="margin:0;font-size:10px;color:rgba(255,255,255,0.2);letter-spacing:2px;text-transform:uppercase;">
                      © 2026 Aura Labs · Edmonton, Alberta · <a href="https://aura-labs-one.vercel.app" style="color:rgba(255,255,255,0.2);text-decoration:none;">Unsubscribe</a>
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email } = req.body;
  console.log('[Subscribe] New subscriber:', email);

  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, error: 'Valid email is required.' });
  }

  // 1. Save to Supabase (best-effort, never fail the request if this fails)
  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      const { error } = await supabase
        .from('newsletter_subscribers')
        .upsert([{ email, subscribed_at: new Date().toISOString(), status: 'active' }], { onConflict: 'email' });
      if (error) console.warn('[Subscribe] Supabase warn:', error.message);
    } catch (err: any) {
      console.warn('[Subscribe] Supabase skipped:', err.message);
    }
  }

  // If no SMTP key, succeed silently (dev mode)
  if (!EMAIL_PASS) {
    console.warn('[Subscribe] No BREVO_SMTP_KEY — skipping emails.');
    return res.status(200).json({ success: true, message: 'Subscribed (email skipped in dev).' });
  }

  // 2. Send owner notification (fire-and-forget)
  transporter.sendMail({
    from: `"Aura Labs" <${EMAIL_USER}>`,
    to: OWNER_EMAIL,
    subject: `New Journal Subscriber: ${email}`,
    html: `<div style="font-family:sans-serif;padding:24px;background:#111;color:#fff;border-radius:12px;max-width:480px;"><h3 style="color:#00f0ff;margin:0 0 12px;">📬 New Subscriber</h3><p style="color:#aaa;margin:0;"><strong style="color:#fff;">${email}</strong> just subscribed to The Journal.</p></div>`,
  }).catch(err => console.error('[Subscribe] Owner email failed:', err.message));

  // 3. Send confirmation email to subscriber
  try {
    await transporter.sendMail({
      from: `"Aura Labs" <${EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to The Journal | Aura Labs',
      html: welcomeEmailHTML(email),
    });
    console.log('[Subscribe] Confirmation sent to:', email);
  } catch (err: any) {
    console.error('[Subscribe] Confirmation email failed:', err.message);
    // Still return success — subscriber was saved to DB
  }

  return res.status(200).json({ success: true, message: 'Subscribed successfully.' });
}
