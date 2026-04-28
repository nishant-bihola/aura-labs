import { Client } from '@notionhq/client';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const NOTION_TOKEN = process.env.VITE_NOTION_TOKEN || process.env.NOTION_TOKEN || 'ntn_u684166844597jG2iHrb1RhYFIhxIT0mwsna3GHwVVS4X3';
const NOTION_DB_ID = process.env.VITE_NOTION_DATABASE_ID || process.env.NOTION_DATABASE_ID || '34e197cb935d800893b3e3ac38f27dda';

const notion = new Client({ auth: NOTION_TOKEN });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const data = req.body;
  console.log('[Notion] Incoming lead:', JSON.stringify(data));

  try {
    // Build properties
    const properties: any = {
      Name: {
        title: [{ text: { content: data.name || 'Unknown Lead' } }]
      },
      Phone: {
        phone_number: data.phone || ''
      },
      Message: {
        rich_text: [{ text: { content: data.message || 'No message provided' } }]
      },
      Source: {
        select: { name: data.source === 'AI Agent' ? 'AI Agent' : 'Website Form' }
      },
      Date: {
        date: { start: new Date().toISOString() }
      },
      Status: {
        status: { name: 'Not started' }
      }
    };

    // Add Email field if provided
    if (data.email) {
      properties['Email'] = { email: data.email };
    }

    // Add Service Type field if provided
    if (data.serviceType || data.type || data.plan) {
      properties['Type'] = {
        select: { name: data.serviceType || data.type || data.plan || "Contact" }
      };
    }

    const response = await notion.pages.create({
      parent: { database_id: NOTION_DB_ID },
      properties
    });

    console.log('[Notion] Success! Page ID:', response.id);
    return res.status(200).json({ success: true, id: response.id });

  } catch (err: any) {
    console.error('[Notion] Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}
