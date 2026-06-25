import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, Search, LogOut, Sparkles, X, Copy, Check,
  TrendingUp, Users, MessageSquare, Bot,
} from "lucide-react";

interface Lead {
  id: number;
  name: string;
  email: string;
  plan: string;
  details: string;
  addons: string | null;
  createdAt: string;
}

type Proposal = { proposal: string; emailSubject: string; emailBody: string; estimateRange: string };

interface Conversation {
  id: number;
  sessionId: string | null;
  email: string | null;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  preview: string;
  messages: { role: string; content: string }[];
}

const KEY_STORAGE = "aura_admin_key";
const ACCENT = "#00D54B"; // Cash App green

function initials(name: string) {
  return (name || "?").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export default function AdminDashboard() {
  const [authKey, setAuthKey] = useState(() => sessionStorage.getItem(KEY_STORAGE) || "");
  const [authed, setAuthed] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [authError, setAuthError] = useState("");

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  const [activeLead, setActiveLead] = useState<Lead | null>(null);

  const [tab, setTab] = useState<"leads" | "chats">("leads");
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [convosLoaded, setConvosLoaded] = useState(false);
  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null);

  const loadConvos = async (key: string) => {
    try {
      const res = await fetch("/api/admin-chats", { headers: { "x-admin-key": key } });
      const data = await res.json().catch(() => ({}));
      setConvos(Array.isArray(data.conversations) ? data.conversations : []);
    } catch {
      /* ignore */
    } finally {
      setConvosLoaded(true);
    }
  };

  const openChats = () => {
    setTab("chats");
    setQuery("");
    if (!convosLoaded) loadConvos(authKey);
  };

  const loadLeads = async (key: string) => {
    setLoading(true);
    setAuthError("");
    try {
      const res = await fetch("/api/admin-leads", { headers: { "x-admin-key": key } });
      if (res.status === 401 || res.status === 503) {
        const data = await res.json().catch(() => ({}));
        sessionStorage.removeItem(KEY_STORAGE);
        setAuthed(false); setAuthKey("");
        setAuthError(data.error || "Unauthorized. Check your admin key.");
        return;
      }
      const data = await res.json();
      setLeads(Array.isArray(data.leads) ? data.leads : []);
      sessionStorage.setItem(KEY_STORAGE, key);
      setAuthKey(key); setAuthed(true);
    } catch {
      setAuthError("Could not reach the server. Try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authKey) loadLeads(authKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = () => {
    sessionStorage.removeItem(KEY_STORAGE);
    setAuthed(false); setAuthKey(""); setLeads([]); setKeyInput("");
    setConvos([]); setConvosLoaded(false); setTab("leads");
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter((l) =>
      [l.name, l.email, l.plan, l.details].some((f) => f?.toLowerCase().includes(q))
    );
  }, [leads, query]);

  const filteredConvos = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return convos;
    return convos.filter((c) =>
      [c.email, c.preview, ...c.messages.map((m) => m.content)].some((f) => f?.toLowerCase().includes(q))
    );
  }, [convos, query]);

  const stats = useMemo(() => {
    const now = Date.now();
    const week = leads.filter((l) => now - new Date(l.createdAt).getTime() < 7 * 864e5).length;
    const today = leads.filter((l) => new Date(l.createdAt).toDateString() === new Date().toDateString()).length;
    return { total: leads.length, week, today };
  }, [leads]);

  // ── Login gate (Cash App style) ──────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <form
          onSubmit={(e) => { e.preventDefault(); if (keyInput.trim()) loadLeads(keyInput.trim()); }}
          className="w-full max-w-sm bg-[#121212] rounded-[28px] p-8 shadow-2xl"
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ background: ACCENT }}>
            <ShieldCheck className="text-black w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Aura Admin</h1>
          <p className="text-white/40 text-sm mb-7">Enter your key to view the lead pipeline.</p>
          <input
            type="password" autoFocus value={keyInput}
            onChange={(e) => { setKeyInput(e.target.value); if (authError) setAuthError(""); }}
            placeholder="Admin key"
            className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-base text-white placeholder-white/30 outline-none focus:border-white/30 transition-all"
          />
          {authError && <p className="text-red-400 text-sm mt-3">{authError}</p>}
          <button
            type="submit" disabled={loading || !keyInput.trim()}
            className="mt-5 w-full py-4 rounded-2xl text-black text-base font-bold transition-all disabled:opacity-40 hover:brightness-110"
            style={{ background: ACCENT }}
          >
            {loading ? "Verifying…" : "Unlock"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Top bar */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-black/70 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: ACCENT }}>
              <ShieldCheck className="text-black w-5 h-5" />
            </div>
            <span className="font-bold tracking-tight">Aura Admin</span>
          </div>
          <button onClick={logout} className="flex items-center gap-2 text-white/50 hover:text-white text-sm font-medium transition-colors">
            <LogOut size={16} /> <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 md:px-8 pt-8">
        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-3 md:gap-5 mb-6">
          <StatCard icon={<Users size={16} />} label="Total leads" value={stats.total} />
          <StatCard icon={<TrendingUp size={16} />} label="This week" value={stats.week} accent />
          <StatCard icon={<MessageSquare size={16} />} label="Conversations" value={convosLoaded ? convos.length : stats.today} />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          <button onClick={() => setTab("leads")}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${tab === "leads" ? "text-black" : "bg-[#121212] text-white/60 hover:text-white"}`}
            style={tab === "leads" ? { background: ACCENT } : undefined}>
            Leads
          </button>
          <button onClick={openChats}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${tab === "chats" ? "text-black" : "bg-[#121212] text-white/60 hover:text-white"}`}
            style={tab === "chats" ? { background: ACCENT } : undefined}>
            Conversations
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 bg-[#121212] rounded-2xl px-5 py-3.5 mb-5">
          <Search size={18} className="text-white/40 shrink-0" />
          <input
            value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder={tab === "leads" ? "Search leads by name, email, or plan…" : "Search conversations…"}
            className="bg-transparent w-full text-[15px] outline-none placeholder:text-white/30"
          />
        </div>

        {tab === "leads" ? (
          loading ? (
            <div className="py-20 text-center text-white/40 animate-pulse">Loading pipeline…</div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-white/40">
              {leads.length === 0 ? "No leads yet. They'll appear here the moment one comes in." : "No leads match your search."}
            </div>
          ) : (
            <div className="space-y-2.5">
              {filtered.map((lead, i) => (
                <motion.button
                  key={lead.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  onClick={() => setActiveLead(lead)}
                  className="w-full text-left bg-[#121212] hover:bg-[#181818] rounded-2xl p-4 md:p-5 flex items-center gap-4 transition-colors group"
                >
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-black font-bold text-sm shrink-0" style={{ background: ACCENT }}>
                    {initials(lead.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate">{lead.name}</p>
                    <p className="text-white/40 text-sm truncate">{lead.email}</p>
                  </div>
                  <div className="hidden sm:block text-right shrink-0">
                    <span className="inline-block text-[11px] font-bold uppercase tracking-wide px-3 py-1 rounded-full bg-white/5 text-white/70">{lead.plan}</span>
                    <p className="text-white/30 text-xs mt-1.5">{new Date(lead.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Sparkles size={18} className="text-white/20 group-hover:text-[var(--accent)] shrink-0 transition-colors" style={{ ["--accent" as any]: ACCENT }} />
                </motion.button>
              ))}
            </div>
          )
        ) : !convosLoaded ? (
          <div className="py-20 text-center text-white/40 animate-pulse">Loading conversations…</div>
        ) : filteredConvos.length === 0 ? (
          <div className="py-20 text-center text-white/40">
            {convos.length === 0 ? "No conversations yet. Chats with Aura AI will appear here." : "No conversations match your search."}
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredConvos.map((c, i) => (
              <motion.button
                key={c.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
                onClick={() => setActiveConvo(c)}
                className="w-full text-left bg-[#121212] hover:bg-[#181818] rounded-2xl p-4 md:p-5 flex items-center gap-4 transition-colors group"
              >
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-black shrink-0" style={{ background: ACCENT }}>
                  <MessageSquare size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate">{c.email || "Anonymous visitor"}</p>
                  <p className="text-white/40 text-sm truncate">{c.preview || "—"}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="inline-block text-[11px] font-bold px-3 py-1 rounded-full bg-white/5 text-white/70">{c.messageCount} msgs</span>
                  <p className="text-white/30 text-xs mt-1.5">{new Date(c.updatedAt).toLocaleDateString()}</p>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </main>

      {/* Drawers */}
      <AnimatePresence>
        {activeLead && (
          <ProposalDrawer lead={activeLead} authKey={authKey} onClose={() => setActiveLead(null)} />
        )}
        {activeConvo && (
          <ConversationDrawer convo={activeConvo} onClose={() => setActiveConvo(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: number; accent?: boolean }) {
  return (
    <div className="bg-[#121212] rounded-2xl md:rounded-3xl p-4 md:p-6" style={accent ? { background: ACCENT } : undefined}>
      <div className={`flex items-center gap-1.5 text-xs font-medium mb-3 ${accent ? "text-black/70" : "text-white/40"}`}>
        {icon} <span className="hidden sm:inline">{label}</span>
      </div>
      <p className={`text-3xl md:text-5xl font-bold tracking-tight ${accent ? "text-black" : "text-white"}`}>{value}</p>
      <p className={`text-xs mt-1 sm:hidden ${accent ? "text-black/70" : "text-white/40"}`}>{label}</p>
    </div>
  );
}

function ProposalDrawer({ lead, authKey, onClose }: { lead: Lead; authKey: string; onClose: () => void }) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [data, setData] = useState<Proposal | null>(null);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState<string>("");

  const generate = async () => {
    setStatus("loading"); setErr("");
    try {
      const res = await fetch("/api/generate-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": authKey },
        body: JSON.stringify({ name: lead.name, email: lead.email, plan: lead.plan, details: lead.details }),
      });
      const json = await res.json();
      if (!res.ok || json.error || !json.proposal) {
        setErr(json.error || "Generation failed."); setStatus("error"); return;
      }
      setData(json); setStatus("done");
    } catch {
      setErr("Network error."); setStatus("error");
    }
  };

  const copy = async (label: string, text: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(label); setTimeout(() => setCopied(""), 1500); } catch { /* ignore */ }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 34 }}
        className="fixed right-0 top-0 bottom-0 z-50 w-full sm:max-w-md bg-[#0d0d0d] border-l border-white/10 overflow-y-auto"
      >
        <div className="sticky top-0 bg-[#0d0d0d]/90 backdrop-blur-md p-5 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-black font-bold text-sm shrink-0" style={{ background: ACCENT }}>{initials(lead.name)}</div>
            <div className="min-w-0">
              <p className="font-semibold truncate">{lead.name}</p>
              <p className="text-white/40 text-sm truncate">{lead.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center shrink-0"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-5">
          <div className="bg-[#161616] rounded-2xl p-4 space-y-2 text-sm">
            <Row k="Plan" v={lead.plan} />
            <Row k="Received" v={new Date(lead.createdAt).toLocaleString()} />
            {lead.addons && <Row k="Add-ons" v={lead.addons} />}
            <div>
              <p className="text-white/40 text-xs mb-1">Details</p>
              <p className="text-white/80 leading-relaxed whitespace-pre-wrap">{lead.details || "—"}</p>
            </div>
          </div>

          <a href={`mailto:${lead.email}`} className="block text-center w-full py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-sm font-semibold transition-colors">
            Email {lead.name.split(" ")[0]}
          </a>

          {status !== "done" && (
            <button onClick={generate} disabled={status === "loading"}
              className="w-full py-4 rounded-2xl text-black font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:brightness-110"
              style={{ background: ACCENT }}>
              <Sparkles size={18} /> {status === "loading" ? "Drafting proposal…" : "Generate AI proposal"}
            </button>
          )}
          {status === "error" && <p className="text-red-400 text-sm">{err}</p>}

          {status === "done" && data && (
            <div className="space-y-5">
              {data.estimateRange && (
                <div className="rounded-2xl p-4" style={{ background: ACCENT }}>
                  <p className="text-black/60 text-xs font-semibold uppercase tracking-wide">Estimated investment</p>
                  <p className="text-black text-2xl font-bold">{data.estimateRange}</p>
                </div>
              )}

              <Block title="Proposal" onCopy={() => copy("proposal", data.proposal)} copied={copied === "proposal"}>
                <pre className="whitespace-pre-wrap font-sans text-sm text-white/80 leading-relaxed">{data.proposal}</pre>
              </Block>

              <Block title={`Follow-up email · ${data.emailSubject}`} onCopy={() => copy("email", `Subject: ${data.emailSubject}\n\n${data.emailBody}`)} copied={copied === "email"}>
                <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{data.emailBody}</p>
              </Block>

              <button onClick={generate} className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors">Regenerate</button>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

function ConversationDrawer({ convo, onClose }: { convo: Conversation; onClose: () => void }) {
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 34 }}
        className="fixed right-0 top-0 bottom-0 z-50 w-full sm:max-w-md bg-[#0d0d0d] border-l border-white/10 overflow-y-auto"
      >
        <div className="sticky top-0 bg-[#0d0d0d]/90 backdrop-blur-md p-5 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-black shrink-0" style={{ background: ACCENT }}><MessageSquare size={18} /></div>
            <div className="min-w-0">
              <p className="font-semibold truncate">{convo.email || "Anonymous visitor"}</p>
              <p className="text-white/40 text-xs truncate">{convo.messageCount} messages · {new Date(convo.updatedAt).toLocaleString()}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center shrink-0"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-4">
          {convo.messages.length === 0 && <p className="text-white/40 text-sm text-center py-10">No transcript stored.</p>}
          {convo.messages.map((m, i) => {
            const isUser = m.role === "user";
            return (
              <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                <div className={`flex gap-2 max-w-[85%] ${isUser ? "flex-row-reverse" : ""}`}>
                  <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center ${isUser ? "bg-white/10" : ""}`} style={!isUser ? { background: ACCENT } : undefined}>
                    {isUser ? <span className="text-[10px] font-bold text-white/70">YOU</span> : <Bot size={14} className="text-black" />}
                  </div>
                  <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${isUser ? "bg-white/10 text-white rounded-br-sm" : "bg-[#161616] text-white/85 rounded-bl-sm"}`}>
                    {m.content}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between gap-4"><span className="text-white/40">{k}</span><span className="text-white/80 text-right">{v}</span></div>;
}

function Block({ title, children, onCopy, copied }: { title: string; children: React.ReactNode; onCopy: () => void; copied: boolean }) {
  return (
    <div className="bg-[#161616] rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3 gap-3">
        <p className="text-xs uppercase tracking-wide text-white/40 font-bold truncate">{title}</p>
        <button onClick={onCopy} className="flex items-center gap-1.5 text-xs font-semibold text-white/60 hover:text-white shrink-0">
          {copied ? <><Check size={13} style={{ color: ACCENT }} /> Copied</> : <><Copy size={13} /> Copy</>}
        </button>
      </div>
      {children}
    </div>
  );
}
