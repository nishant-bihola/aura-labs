import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Support both VITE_ prefixed (frontend) and plain (serverless) env vars
import { newsletterWelcomeHTML } from './_lib/emails';
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
// Server-side: prefer service_role key to bypass RLS for inserts
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const EMAIL_USER = process.env.BREVO_USER || 'nishant15bihola@gmail.com';
const EMAIL_PASS = (process.env.BREVO_SMTP_KEY || '').replace(/\s+/g, '');
const OWNER_EMAIL = 'nishant15bihola@gmail.com';

// Primary: Brevo
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: { user: EMAIL_USER, pass: EMAIL_PASS },
});

// Fallback: Gmail
const GMAIL_USER = process.env.EMAIL_USER || OWNER_EMAIL;
const GMAIL_PASS = process.env.EMAIL_PASS || '';
const gmailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: GMAIL_USER, pass: GMAIL_PASS },
});

// ─── Handler ──────────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email } = req.body;
  console.log('[Subscribe] Processing subscriber:', email);

  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, error: 'Valid email is required.' });
  }

  // 1. Supabase Task
  const supabaseTask = (async () => {
    if (!SUPABASE_URL || !SUPABASE_KEY) return false;
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const { error } = await supabase
      .from('newsletter_subscribers')
      .upsert([{ email, status: 'active' }], { onConflict: 'email' });
    if (error) throw new Error(`Supabase: ${error.message}`);
    return true;
  })();

  // 2. Emails Task (Parallel)
  const emailTask = (async () => {
    if (!EMAIL_PASS && !GMAIL_PASS) return false;
    
    // Fire owner notification
    transporter.sendMail({
      from: `"Aura Labs" <${EMAIL_USER}>`,
      to: OWNER_EMAIL,
      subject: `New Journal Subscriber: ${email}`,
      html: `<div style="font-family:sans-serif;padding:24px;background:#111;color:#fff;border-radius:12px;max-width:480px;"><h3 style="color:#00f0ff;margin:0 0 12px;">📬 New Subscriber</h3><p style="color:#aaa;margin:0;"><strong style="color:#fff;">${email}</strong> just subscribed to The Journal.</p></div>`,
    }).catch(err => console.error('[Subscribe] Owner email failed:', err.message));

    // Await user confirmation with fallback
    try {
      await transporter.sendMail({
        from: `"Aura Labs" <${EMAIL_USER}>`,
        to: email,
        subject: 'Welcome to The Journal | Aura Labs',
        html: newsletterWelcomeHTML(email),
      });
      return true;
    } catch (err: any) {
      console.warn('[Subscribe] Brevo failed, trying Gmail fallback...', err.message);
      if (GMAIL_PASS) {
        try {
          await gmailTransporter.sendMail({
            from: `"Aura Labs" <${GMAIL_USER}>`,
            to: email,
            subject: 'Welcome to The Journal | Aura Labs',
            html: newsletterWelcomeHTML(email),
          });
          return true;
        } catch (gerr: any) {
          console.error('[Subscribe] Gmail fallback failed:', gerr.message);
        }
      }
    }
    return false;
  })();

  // EXECUTE IN PARALLEL
  const results = await Promise.allSettled([supabaseTask, emailTask]);
  const [sbRes, mailRes] = results;

  console.log('[Subscribe] Performance Results:', {
    database: sbRes.status,
    email: mailRes.status
  });

  return res.status(200).json({ 
    success: true, 
    message: 'Subscribed successfully.',
    delivered: mailRes.status === 'fulfilled'
  });
}
