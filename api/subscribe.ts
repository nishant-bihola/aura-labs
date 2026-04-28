import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);

const EMAIL_USER = process.env.BREVO_USER || process.env.EMAIL_USER || "nishant15bihola@gmail.com";
const EMAIL_PASS = process.env.BREVO_SMTP_KEY || process.env.EMAIL_PASS || "";
const OWNER_EMAIL = "nishant15bihola@gmail.com";

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS.replace(/\s+/g, '')
  }
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email } = req.body;
  console.log('--- NEW SUBSCRIPTION ---', email);

  if (!email) {
    return res.status(400).json({ success: false, error: 'Email is required.' });
  }

  try {
    // 1. Save to Supabase subscribers table (best-effort)
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email }]);
      if (error && error.code !== '23505') { // Ignore unique violation if already subscribed
        console.warn('Supabase subscriber insert warning:', error.message);
      }
    }

    if (!EMAIL_PASS) {
      console.warn('No EMAIL_PASS — skipping emails.');
      return res.status(200).json({ success: true, message: 'Subscribed (emails skipped in dev).' });
    }

    // 2. Notify owner
    try {
      await transporter.sendMail({
        from: `"Aura Labs System" <${EMAIL_USER}>`,
        to: OWNER_EMAIL,
        subject: `New Journal Subscriber: ${email}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#111;color:#fff;padding:40px;">
            <h3 style="color:#fff;">📬 New Subscriber</h3>
            <p><strong>Email:</strong> ${email}</p>
            <p><em>They have subscribed to The Journal.</em></p>
          </div>
        `
      });
    } catch (err: any) {
      console.error('Owner notification email failed:', err.message);
    }

    // 3. Confirmation email to subscriber
    try {
      await transporter.sendMail({
        from: `"Aura Labs" <${EMAIL_USER}>`,
        to: email,
        subject: "Welcome to The Journal | Aura Labs",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin:0;padding:0;background:#0A0A0A;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0A;padding:40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#111111;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.1);">
                    <!-- Header Banner -->
                    <tr>
                      <td style="padding:36px 40px;text-align:center;">
                        <h1 style="margin:0;color:#ffffff;font-size:28px;letter-spacing:2px;font-family:serif;font-style:italic;">AURA LABS</h1>
                        <p style="margin:8px 0 0;color:#ffffff;font-size:11px;opacity:0.4;letter-spacing:4px;text-transform:uppercase;">Digital Residency Studio</p>
                      </td>
                    </tr>
                    <!-- Hero Message -->
                    <tr>
                      <td style="padding:48px 40px 32px;text-align:center;">
                        <h2 style="margin:0 0 16px;color:#ffffff;font-size:26px;font-weight:400;font-family:serif;font-style:italic;">You're on the list.</h2>
                        <p style="margin:0;color:#aaaaaa;font-size:15px;line-height:1.7;max-width:440px;margin:0 auto;">
                          Welcome to The Journal. You'll now receive exclusive insights into our latest projects, design philosophies, and technological explorations.
                        </p>
                      </td>
                    </tr>
                    <!-- Divider -->
                    <tr>
                      <td style="padding:0 40px;">
                        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:0;">
                      </td>
                    </tr>
                    <!-- CTA Button -->
                    <tr>
                      <td style="padding:48px 40px;text-align:center;">
                        <a href="https://aura-labs-one.vercel.app" 
                           style="display:inline-block;background:#ffffff;color:#000000;text-decoration:none;font-weight:700;font-size:11px;padding:16px 40px;border-radius:100px;letter-spacing:2px;text-transform:uppercase;">
                          Explore Aura Labs
                        </a>
                      </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                      <td style="background:#050505;padding:24px 40px;text-align:center;border-top:1px solid rgba(255,255,255,0.05);">
                        <p style="margin:0;color:#666666;font-size:10px;line-height:1.7;letter-spacing:1px;text-transform:uppercase;">
                          © 2026 AURA LABS. ALL RIGHTS RESERVED.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `
      });
      console.log('Subscription confirmation email sent to:', email);
    } catch (err: any) {
      console.error('Subscription confirmation email failed:', err.message);
    }

    return res.status(200).json({ success: true, message: 'Subscribed and confirmation email sent.' });
  } catch (error: any) {
    console.error('Subscribe API Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
