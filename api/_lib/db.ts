import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Single Supabase data layer for the app. The original Prisma/Postgres project
 * was deleted, so leads + conversations now live in Supabase (the same place
 * the contact form already writes). Every function degrades gracefully when
 * Supabase isn't configured — returning empty instead of throwing.
 *
 * Required tables (see README / setup):
 *   contact_submissions(first_name, last_name, email, message, type, plan, created_at)
 *   chat_conversations(session_id unique, email, history text, updated_at, created_at)
 */
let cached: SupabaseClient | null | undefined;

export function getSupabase(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    "";
  cached = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
  return cached;
}

export function dbConfigured(): boolean {
  return getSupabase() !== null;
}

export type AdminLead = {
  id: number | string;
  name: string;
  email: string;
  plan: string;
  details: string;
  addons: string | null;
  createdAt: string;
};

export async function dbListLeads(): Promise<{ ok: boolean; configured: boolean; leads: AdminLead[] }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, configured: false, leads: [] };
  try {
    const { data, error } = await sb
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw error;
    const leads: AdminLead[] = (data || []).map((r: any, i: number) => ({
      id: r.id ?? i,
      name: [r.first_name, r.last_name].filter(Boolean).join(" ") || r.name || "Anonymous",
      email: r.email || "",
      plan: r.plan || r.type || "—",
      details: r.message || r.details || "",
      addons: r.addons ?? null,
      createdAt: r.created_at || r.createdAt || new Date().toISOString(),
    }));
    return { ok: true, configured: true, leads };
  } catch (e) {
    console.error("[db] listLeads failed:", e);
    return { ok: false, configured: true, leads: [] };
  }
}

export async function dbSaveConversation(sessionId: string, history: unknown, email?: string): Promise<void> {
  const sb = getSupabase();
  if (!sb || !sessionId) return;
  try {
    await sb.from("chat_conversations").upsert(
      {
        session_id: sessionId,
        email: email || null,
        history: JSON.stringify(history ?? []).slice(0, 100000),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "session_id" }
    );
  } catch (e) {
    console.error("[db] saveConversation failed:", e);
  }
}

export type AdminConversation = {
  id: number | string;
  sessionId: string | null;
  email: string | null;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  preview: string;
  messages: { role: string; content: string }[];
};

export async function dbListConversations(): Promise<{ configured: boolean; conversations: AdminConversation[] }> {
  const sb = getSupabase();
  if (!sb) return { configured: false, conversations: [] };
  try {
    const { data, error } = await sb
      .from("chat_conversations")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    const conversations: AdminConversation[] = (data || []).map((r: any) => {
      let messages: { role: string; content: string }[] = [];
      try { messages = JSON.parse(r.history); } catch { messages = []; }
      const firstUser = messages.find((m) => m.role === "user")?.content || "";
      return {
        id: r.id ?? r.session_id,
        sessionId: r.session_id ?? null,
        email: r.email ?? null,
        createdAt: r.created_at || r.updated_at || "",
        updatedAt: r.updated_at || r.created_at || "",
        messageCount: messages.length,
        preview: firstUser.slice(0, 80),
        messages,
      };
    });
    return { configured: true, conversations };
  } catch (e) {
    console.error("[db] listConversations failed:", e);
    return { configured: true, conversations: [] };
  }
}
