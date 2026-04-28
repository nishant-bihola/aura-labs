/**
 * API for handling booking and contact requests.
 * Sends to Vercel Serverless (Supabase + Email) AND directly to /api/notion (Notion) in parallel.
 */

export interface BookingRequest {
  name: string;
  email: string;
  phone?: string;
  serviceType: string;
  message?: string;
  plan?: string;
  timestamp: string;
  source: 'Website Form' | 'AI Agent' | 'Newsletter';
}

// Ensure it works locally and in prod
const BOOKING_URL = import.meta.env.PROD
  ? '/api/contact'
  : 'http://localhost:5000/api/contact';

const SUBSCRIBE_URL = import.meta.env.PROD
  ? '/api/subscribe'
  : 'http://localhost:5000/api/subscribe';

// Dedicated Notion endpoint — always available on Vercel
const NOTION_URL = '/api/notion';

export const submitServiceRequest = async (data: BookingRequest) => {
  console.log(`--- SENDING REQUEST FROM ${data.source} ---`);

  // Fire Notion call immediately in parallel — don't await, don't block form submission
  if (import.meta.env.PROD) {
    fetch(NOTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then(r => r.json())
      .then(result => console.log('[Frontend] Notion parallel success:', result))
      .catch(err => console.error('[Frontend] Notion parallel failed:', err));
  } else {
    fetch(NOTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch(() => console.log('Notion parallel skipped in local mode without vercel dev'));
  }

  const endpoint = data.source === 'Newsletter' ? SUBSCRIBE_URL : BOOKING_URL;
  const payload = data.source === 'Newsletter' 
    ? { email: data.email } 
    : {
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
        plan: data.plan,
        type: data.serviceType,
      };

  // Await the primary email + supabase insertion
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to submit request');
  }

  return response.json();
};

