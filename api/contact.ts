import { Client as NotionClient } from '@notionhq/client';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { adminAlertHTML, clientConfirmationHTML } from './_lib/emails.js';
import { sendEmail } from './_lib/emailSender.js';
import { getSupabase } from './_lib/db.js';

// ─── Environment Variables ────────────────────────────────────────────────────
const NOTION_TOKEN = process.env.NOTION_TOKEN || process.env.VITE_NOTION_TOKEN || '';
const NOTION_DB_ID = process.env.NOTION_DATABASE_ID || process.env.VITE_NOTION_DATABASE_ID || '';
const OWNER_EMAIL = process.env.ADMIN_EMAIL || 'nishant15bihola@gmail.com';

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

  // 1. Supabase — persist the lead so the admin dashboard can see it.
  const dbTask = (async () => {
    const supabase = getSupabase();
    if (!supabase) return false;
    try {
      const parts = clientName.split(" ");
      await supabase.from("contact_submissions").insert([{
        first_name: parts[0] || clientName,
        last_name: parts.slice(1).join(" ") || "",
        email,
        message: message || "",
        type: inquiryType,
        plan: plan || inquiryType,
      }]);
      return true;
    } catch (dbError) {
      console.error("Supabase Error in contact:", dbError);
      return false;
    }
  })();

  // 2. Admin Notification Email
  const adminEmailTask = sendEmail({
    to: OWNER_EMAIL,
    subject: `⚡ NEW ${inquiryType.toUpperCase()} — ${clientName}`,
    html: adminAlertHTML(clientName, email, message, inquiryType, plan),
    replyTo: email,
  });

  // 3. User Confirmation Email
  const userEmailTask = sendEmail({
    to: email,
    subject: 'We received your inquiry | Aura Labs',
    html: clientConfirmationHTML(clientName, plan),
  });

  // 4. Notion CRM
  const notionTask = (async () => {
    if (!NOTION_TOKEN || !NOTION_DB_ID) return false;
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
      return true;
    } catch (notionError) {
      console.error("Notion Error in contact:", notionError);
      return false;
    }
  })();

  // EXECUTE ALL IN PARALLEL for maximum speed
  const results = await Promise.allSettled([
    dbTask,
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

  const emailSent = userRes.status === 'fulfilled' && (userRes as PromiseFulfilledResult<any>).value?.success;

  return res.status(200).json({ 
    success: true, 
    delivered: emailSent
  });
}
