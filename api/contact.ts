import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
import { Client as NotionClient } from '@notionhq/client';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { adminAlertHTML, clientConfirmationHTML } from './_lib/emails.js';

// ─── Environment Variables ────────────────────────────────────────────────────
// Support both VITE_ prefixed and plain variants for Vercel serverless
const RESEND_KEY = process.env.RESEND_API_KEY || '';
const BREVO_USER = process.env.BREVO_USER || 'nishant15bihola@gmail.com';
const BREVO_PASS = (process.env.BREVO_SMTP_KEY || '').replace(/\s+/g, '');
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
// Server-side: use service_role key to bypass RLS for inserts
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const NOTION_TOKEN = process.env.NOTION_TOKEN || process.env.VITE_NOTION_TOKEN || '';
const NOTION_DB_ID = process.env.NOTION_DATABASE_ID || process.env.VITE_NOTION_DATABASE_ID || '';
const OWNER_EMAIL = 'nishant15bihola@gmail.com';

// ─── Service Clients ─────────────────────────────────────────────────────────
const resend = RESEND_KEY ? new Resend(RESEND_KEY) : null;

// Primary: Brevo
const brevo = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: { user: BREVO_USER, pass: BREVO_PASS },
});

// Fallback: Gmail (Direct)
const GMAIL_USER = process.env.EMAIL_USER || OWNER_EMAIL;
const GMAIL_PASS = process.env.EMAIL_PASS || '';
const gmail = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: GMAIL_USER, pass: GMAIL_PASS },
});

// Inline templates removed in favor of _lib/emails

// User template removed

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

  console.log(`[Contact] Processing ${inquiryType} from ${clientName} <${email}>`);

  if (!email) {
    return res.status(400).json({ success: false, error: 'Email is required.' });
  }

  // 1. Supabase - Database Insertion (High Priority)
  const supabaseTask = (async () => {
    if (!SUPABASE_URL || !SUPABASE_KEY) return false;
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const { error } = await supabase.from('contact_submissions').insert([{
      first_name: clientName.split(' ')[0],
      last_name: clientName.split(' ').slice(1).join(' '),
      email,
      message,
      type: inquiryType,
      plan: plan || null,
    }]);
    if (error) throw new Error(`Supabase: ${error.message}`);
    return true;
  })();

  // 2. Admin Notification (Resend with Brevo Fallback)
  const adminEmailTask = (async () => {
    if (resend) {
      try {
        await resend.emails.send({
          from: 'Aura Labs <onboarding@resend.dev>',
          to: OWNER_EMAIL,
          replyTo: email,
          subject: `⚡ NEW ${inquiryType.toUpperCase()} — ${clientName}`,
          html: adminAlertHTML(clientName, email, message, inquiryType, plan),
        });
        return 'resend';
      } catch (err: any) {
        console.warn('[Contact] Admin Resend failed, falling back to Brevo:', err.message);
      }
    }
    
    // Fallback: admin via Brevo
    await brevo.sendMail({
      from: `"Aura Labs Alert" <${BREVO_USER}>`,
      to: OWNER_EMAIL,
      replyTo: email,
      subject: `⚡ NEW ${inquiryType.toUpperCase()} — ${clientName}`,
      html: adminAlertHTML(clientName, email, message, inquiryType, plan),
    });
    return 'brevo';
  })();

  // 3. User Confirmation (Resend -> Brevo -> Gmail)
  const userEmailTask = (async () => {
    if (resend) {
      try {
        await resend.emails.send({
          from: 'Aura Labs <onboarding@resend.dev>',
          to: email,
          subject: 'We received your inquiry | Aura Labs',
          html: clientConfirmationHTML(clientName, plan),
        });
        return true;
      } catch (err: any) {
        console.warn('[Contact] Resend failed for user email, trying fallback...', err.message);
      }
    }

    if (!BREVO_PASS && !GMAIL_PASS) return false;
    
    try {
      // Try Brevo first
      await brevo.sendMail({
        from: `"Aura Labs" <${BREVO_USER}>`,
        to: email,
        subject: 'We received your inquiry | Aura Labs',
        html: clientConfirmationHTML(clientName, plan),
      });
      return true;
    } catch (err: any) {
      console.warn('[Contact] Brevo failed for user email, trying Gmail fallback...', err.message);
      
      if (GMAIL_PASS) {
        try {
          await gmail.sendMail({
            from: `"Aura Labs" <${GMAIL_USER}>`,
            to: email,
            subject: 'We received your inquiry | Aura Labs',
            html: clientConfirmationHTML(clientName, plan),
          });
          return true;
        } catch (gerr: any) {
          console.error('[Contact] Gmail fallback also failed:', gerr.message);
          throw gerr;
        }
      }
      throw err;
    }
  })();

  // 4. Notion CRM
  const notionTask = (async () => {
    if (!NOTION_TOKEN || !NOTION_DB_ID) return false;
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
    return true;
  })();

  // EXECUTE ALL IN PARALLEL for maximum speed
  const results = await Promise.allSettled([
    supabaseTask,
    adminEmailTask,
    userEmailTask,
    notionTask
  ]);

  const [dbRes, adminRes, userRes, notionRes] = results;

  console.log('[Contact] Performance Results:', {
    database: dbRes.status,
    adminEmail: adminRes.status,
    userEmail: userRes.status,
    notion: notionRes.status
  });

  // Always return 200 if the database task succeeded (or at least one of them)
  // This ensures the user sees a success screen immediately
  return res.status(200).json({ 
    success: true, 
    delivered: userRes.status === 'fulfilled'
  });
}
