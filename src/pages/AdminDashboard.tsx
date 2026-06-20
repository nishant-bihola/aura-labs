import { useEffect, useMemo, useState } from "react";
import { ShieldCheck, Users, Code, Activity, Search, LogOut } from "lucide-react";
import { motion } from "framer-motion";

interface Lead {
  id: number;
  name: string;
  email: string;
  plan: string;
  details: string;
  addons: string | null;
  createdAt: string;
}

const KEY_STORAGE = "aura_admin_key";

export default function AdminDashboard() {
  const [authKey, setAuthKey] = useState<string>(() => sessionStorage.getItem(KEY_STORAGE) || "");
  const [authed, setAuthed] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [authError, setAuthError] = useState("");

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  const loadLeads = async (key: string) => {
    setLoading(true);
    setAuthError("");
    try {
      const res = await fetch("/api/admin-leads", { headers: { "x-admin-key": key } });
      if (res.status === 401 || res.status === 503) {
        const data = await res.json().catch(() => ({}));
        sessionStorage.removeItem(KEY_STORAGE);
        setAuthed(false);
        setAuthKey("");
        setAuthError(data.error || "Unauthorized. Check your admin key.");
        return;
      }
      const data = await res.json();
      setLeads(Array.isArray(data.leads) ? data.leads : []);
      sessionStorage.setItem(KEY_STORAGE, key);
      setAuthKey(key);
      setAuthed(true);
    } catch (err) {
      console.error(err);
      setAuthError("Could not reach the server. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-authenticate if a key is already stored this session.
  useEffect(() => {
    if (authKey) loadLeads(authKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem(KEY_STORAGE);
    setAuthed(false);
    setAuthKey("");
    setLeads([]);
    setKeyInput("");
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter(
      (l) =>
        l.name?.toLowerCase().includes(q) ||
        l.email?.toLowerCase().includes(q) ||
        l.plan?.toLowerCase().includes(q) ||
        l.details?.toLowerCase().includes(q)
    );
  }, [leads, query]);

  // ── Login gate ──────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-4">
        <form
          onSubmit={(e) => { e.preventDefault(); if (keyInput.trim()) loadLeads(keyInput.trim()); }}
          className="w-full max-w-sm bg-white/5 border border-white/10 rounded-3xl p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="text-[#00f0ff] w-8 h-8" />
            <div>
              <h1 className="text-xl font-serif italic leading-tight">Aura Admin Core</h1>
              <p className="text-white/40 text-[10px] tracking-widest uppercase">Restricted Access</p>
            </div>
          </div>
          <label className="block text-[10px] uppercase tracking-widest text-white/50 font-bold mb-2">Admin Key</label>
          <input
            type="password"
            autoFocus
            value={keyInput}
            onChange={(e) => { setKeyInput(e.target.value); if (authError) setAuthError(""); }}
            placeholder="Enter admin key"
            className="w-full bg-black/40 border border-white/10 rounded-full px-5 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-[#00f0ff]/50 transition-all"
          />
          {authError && <p className="text-red-400/80 text-xs mt-3">{authError}</p>}
          <button
            type="submit"
            disabled={loading || !keyInput.trim()}
            className="mt-5 w-full py-3 rounded-full bg-white text-black text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-[#00f0ff] transition-colors disabled:opacity-50"
          >
            {loading ? "Verifying…" : "Unlock"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-32 pb-24 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-12 border-b border-white/10 pb-8">
          <div className="flex items-center gap-4">
            <ShieldCheck className="text-[#00f0ff] w-10 h-10 md:w-12 md:h-12 shrink-0" />
            <div>
              <h1 className="text-2xl md:text-3xl font-serif italic">Aura Admin Core</h1>
              <p className="text-white/40 text-xs tracking-widest uppercase">System Control Panel</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-white/50 hover:text-white text-[10px] uppercase tracking-widest font-bold border border-white/10 rounded-full px-4 py-2 transition-colors"
          >
            <LogOut size={14} /> <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-white/50 text-xs uppercase tracking-widest font-bold mb-4 flex items-center gap-2"><Users size={14}/> Total Leads</h3>
            <p className="text-4xl font-serif">{leads.length}</p>
          </div>
          <div className="bg-white/5 border border-[#00f0ff]/30 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00f0ff]/10 blur-[40px]" />
            <h3 className="text-[#00f0ff] text-xs uppercase tracking-widest font-bold mb-4 flex items-center gap-2"><Activity size={14}/> DB Status</h3>
            <p className="text-2xl font-serif">Online (PostgreSQL)</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-white/50 text-xs uppercase tracking-widest font-bold mb-4 flex items-center gap-2"><Code size={14}/> Prisma ORM</h3>
            <p className="text-2xl font-serif">v6.4.1 connected</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center bg-black/20">
            <h2 className="text-xl font-serif italic">Lead Pipeline</h2>
            <div className="bg-white/10 flex items-center px-4 py-2 rounded-full border border-white/5">
              <Search size={14} className="text-white/50 mr-2 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search leads..."
                className="bg-transparent text-sm focus:outline-none placeholder:text-white/30 w-full"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-white/40 animate-pulse">Synchronizing database...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-white/40">
              {leads.length === 0 ? "No leads captured yet." : "No leads match your search."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[640px]">
                <thead>
                  <tr className="border-b border-white/10 bg-black/40 text-[10px] uppercase tracking-widest text-white/50">
                    <th className="p-6 font-bold">Client</th>
                    <th className="p-6 font-bold">Contact</th>
                    <th className="p-6 font-bold">Requested Plan</th>
                    <th className="p-6 font-bold">Project Details</th>
                    <th className="p-6 font-bold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lead, i) => (
                    <motion.tr
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.04, 0.4) }}
                      key={lead.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="p-6 text-sm font-medium">{lead.name}</td>
                      <td className="p-6 text-sm text-white/60">{lead.email}</td>
                      <td className="p-6">
                        <span className="bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
                          {lead.plan}
                        </span>
                        {lead.addons && <div className="mt-2 text-[10px] text-white/40">+ {lead.addons}</div>}
                      </td>
                      <td className="p-6 text-xs text-white/50 max-w-xs truncate">{lead.details}</td>
                      <td className="p-6 text-xs text-white/40">{new Date(lead.createdAt).toLocaleDateString()}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
