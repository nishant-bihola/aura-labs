import { createClient } from '@supabase/supabase-js';
import { Client as NotionClient } from '@notionhq/client';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { adminAlertHTML, clientConfirmationHTML } from './_lib/emails.js';
import { sendEmail } from './_lib/emailSender.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── Environment Variables ────────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
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

  // 1. Prisma - Database Insertion (High Priority)
  const dbTask = (async () => {
    try {
      await prisma.lead.create({
        data: {
          name: clientName,
          email,
          plan: plan || inquiryType,
          details: message || "",
          addons: phone || null
        }
      });
      return true;
    } catch (dbError) {
      console.error("Prisma Error in contact:", dbError);
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
