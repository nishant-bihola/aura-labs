import { useEffect, useState } from "react";
import { ShieldCheck, Users, Code, Activity, Search } from "lucide-react";
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

export default function AdminDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin-leads')
      .then(res => res.json())
      .then(data => {
        if (data.leads) setLeads(data.leads);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-32 pb-24 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-12 border-b border-white/10 pb-8">
          <ShieldCheck className="text-[#00f0ff] w-12 h-12" />
          <div>
            <h1 className="text-3xl font-serif italic">Aura Admin Core</h1>
            <p className="text-white/40 text-sm tracking-widest uppercase">System Control Panel</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-white/50 text-xs uppercase tracking-widest font-bold mb-4 flex items-center gap-2"><Users size={14}/> Total Leads</h3>
            <p className="text-4xl font-serif">{leads.length}</p>
          </div>
          <div className="bg-white/5 border border-[#00f0ff]/30 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00f0ff]/10 blur-[40px]" />
            <h3 className="text-[#00f0ff] text-xs uppercase tracking-widest font-bold mb-4 flex items-center gap-2"><Activity size={14}/> DB Status</h3>
            <p className="text-2xl font-serif">Online (SQLite)</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-white/50 text-xs uppercase tracking-widest font-bold mb-4 flex items-center gap-2"><Code size={14}/> Prisma ORM</h3>
            <p className="text-2xl font-serif">v6.4.1 connected</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
            <h2 className="text-xl font-serif italic">Lead Pipeline</h2>
            <div className="bg-white/10 flex items-center px-4 py-2 rounded-full border border-white/5 hidden md:flex">
              <Search size={14} className="text-white/50 mr-2" />
              <input type="text" placeholder="Search leads..." className="bg-transparent text-sm focus:outline-none placeholder:text-white/30" />
            </div>
          </div>
          
          {loading ? (
            <div className="p-12 text-center text-white/40 animate-pulse">Synchronizing database...</div>
          ) : leads.length === 0 ? (
            <div className="p-12 text-center text-white/40">No leads captured yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
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
                  {leads.map((lead, i) => (
                    <motion.tr 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
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
