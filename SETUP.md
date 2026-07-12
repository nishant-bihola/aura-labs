# Aura Labs — Production Setup

Everything degrades gracefully without these, but to make the AI chatbot,
estimator, admin dashboard, leads and conversations fully work in production,
set the environment variables below in **Vercel → your project → Settings →
Environment Variables** (Production), then **Redeploy**.

## 1. AI chatbot + estimator (required)

The site uses one OpenAI-compatible layer and picks a provider automatically:
`LLM_PROVIDER` → `GROQ_API_KEY` → `GEMINI_API_KEY` → local Ollama.

| Variable | Value | Why |
|---|---|---|
| `GROQ_API_KEY` | your key from https://console.groq.com | **Free & fast.** Without it the bot falls back to the rate-limited Gemini key and shows the "getting a lot of requests" message. |

> Groq is free (no card). Create a key, paste it into Vercel, redeploy. Done.

## 2. Admin dashboard (required to view leads/chats)

| Variable | Value |
|---|---|
| `ADMIN_KEY` | `Nanu0511` (or any long secret) — this is the `/admin` password |

## 3. Database — leads & conversations (required to store data)

The old Prisma/Postgres project was deleted. The app now uses **Supabase** for
all persistence. Create a Supabase project (free) and set:

| Variable | Where in Supabase |
|---|---|
| `SUPABASE_URL` | Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Settings → API → `service_role` secret |

Then run this SQL in the Supabase **SQL Editor**:

```sql
-- Leads (contact form, checkout, chatbot, estimator all write here)
create table if not exists contact_submissions (
  id bigint generated always as identity primary key,
  first_name text,
  last_name text,
  email text,
  message text,
  type text,
  plan text,
  created_at timestamptz default now()
);

-- Chatbot conversations (admin "Conversations" tab)
create table if not exists chat_conversations (
  id bigint generated always as identity primary key,
  session_id text unique,
  email text,
  history text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Newsletter (The Journal signup)
create table if not exists newsletter_subscribers (
  id bigint generated always as identity primary key,
  email text unique,
  status text default 'active',
  created_at timestamptz default now()
);

-- Consultation bookings
create table if not exists booking_submissions (
  id bigint generated always as identity primary key,
  name text, email text, phone text, message text, plan text,
  created_at timestamptz default now()
);
```

## 4. Email + CRM (optional, already partly configured)

`RESEND_API_KEY` (or Brevo SMTP) sends the lead/estimate emails.
`NOTION_TOKEN` + `NOTION_DATABASE_ID` sync leads to Notion. `ADMIN_EMAIL`
sets where alerts go (defaults to nishant15bihola@gmail.com).

## 5. Journal (blog)

Already wired to Sanity project `y0p4aq65`. Create posts in the Studio
(`/studio` locally, or sanity.io) — they appear at `/journal` automatically
(fetched server-side, no CORS setup needed).

## Local development

`.env` + `.env.local` are git-ignored. For local AI, either set `GROQ_API_KEY`
in `.env.local`, or run a local model: `LLM_PROVIDER=ollama` + `OLLAMA_MODEL=…`.
