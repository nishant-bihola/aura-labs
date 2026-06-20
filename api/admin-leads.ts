import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ── Auth gate ──────────────────────────────────────────────────────────────
  // This endpoint returns customer PII (names, emails, project details), so it
  // must never be public. Access requires the x-admin-key header to match the
  // ADMIN_KEY env var. Set ADMIN_KEY in your Vercel project + local .env.
  const ADMIN_KEY = process.env.ADMIN_KEY || '';
  const provided = (req.headers['x-admin-key'] as string) || '';
  if (!ADMIN_KEY) {
    return res.status(503).json({ error: "Admin access is not configured. Set ADMIN_KEY in the environment." });
  }
  if (provided !== ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({ leads });
  } catch (error: any) {
    console.error("Admin API Error:", error);
    return res.status(500).json({ error: "Internal server error", message: error.message });
  }
}

