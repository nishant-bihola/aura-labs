import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { newsletterWelcomeHTML } from './_lib/emails.js';
import { sendEmail } from "./_lib/emailSender.js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const OWNER_EMAIL = process.env.ADMIN_EMAIL || 'nishant15bihola@gmail.com';

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
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      const { error } = await supabase
        .from('newsletter_subscribers')
        .upsert([{ email, status: 'active' }], { onConflict: 'email' });
      if (error) throw new Error(`Supabase: ${error.message}`);
      return true;
    } catch (err) {
      console.error("Supabase Error in subscribe:", err);
      return false;
    }
  })();

  // 2. Owner Alert Email
  const ownerEmailTask = sendEmail({
    to: OWNER_EMAIL,
    subject: `📬 New Journal Subscriber: ${email}`,
    html: `<div style="font-family:sans-serif;padding:24px;background:#111;color:#fff;border-radius:12px;max-width:480px;"><h3 style="color:#00f0ff;margin:0 0 12px;">📬 New Subscriber</h3><p style="color:#aaa;margin:0;"><strong style="color:#fff;">${email}</strong> just subscribed to The Journal.</p></div>`,
  });

  // 3. User Welcome Email
  const userEmailTask = sendEmail({
    to: email,
    subject: 'Welcome to The Journal | Aura Labs',
    html: newsletterWelcomeHTML(email),
  });

  // EXECUTE IN PARALLEL
  const results = await Promise.allSettled([supabaseTask, ownerEmailTask, userEmailTask]);
  const [sbRes, ownerRes, userRes] = results;

  console.log('[Subscribe] Performance Results:', {
    database: sbRes.status,
    ownerEmail: ownerRes.status,
    userEmail: userRes.status
  });

  const mailSuccess = userRes.status === 'fulfilled' && (userRes as PromiseFulfilledResult<any>).value?.success;

  return res.status(200).json({ 
    success: true, 
    message: 'Subscribed successfully.',
    delivered: mailSuccess
  });
}
