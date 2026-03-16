import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Check, X, Eye, AlertTriangle, CheckCircle2, Clock, ShieldCheck, TrendingDown, LayoutGrid, List, ChevronRight, Activity, ShieldAlert, BadgeCheck, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const API_URL = "http://localhost:3001/api";

interface ValidationInvoice {
  number: string;
  userName: string;
  team: string;
  sales: string;
  hasWarning: boolean;
  submittedBy: string;
  date: string;
  status: "pending" | "approved" | "rejected";
  userId: number;
}

export function InvoiceValidationPage() {
  const [invoices, setInvoices] = useState<ValidationInvoice[]>([]);
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const fetchInvoices = async () => {
    try {
      const res = await axios.get(`${API_URL}/invoices`);
      let formatted: ValidationInvoice[] = res.data.map((inv: any) => ({
        number: inv.invoice_number,
        userName: inv.user_name || "Unknown User",
        team: inv.team,
        sales: "Rp " + (Number(inv.total_amount) || 0).toLocaleString("id-ID"),
        hasWarning: Boolean(inv.has_warning),
        submittedBy: inv.user_name || "Unknown User",
        date: inv.date?.substring(0, 10) || "",
        status: (inv.status || "Pending").toLowerCase() as any,
        userId: inv.user_id,
      }));

      if (user?.role === "user") {
        formatted = formatted.filter(inv => String(inv.userId) === String(user.id));
      }

      setInvoices(formatted);
    } catch (err) {
      console.error("Failed to fetch invoices", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [user]);

  const updateStatus = async (number: string, newStatus: string) => {
    try {
      await axios.put(`${API_URL}/invoices/status?number=${encodeURIComponent(number)}`, { status: newStatus });
      setInvoices((prev) => prev.map((inv) => inv.number === number ? { ...inv, status: newStatus as any } : inv));
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const isUserRole = user?.role === "user";
  const pendingCount = invoices.filter((i) => i.status === "pending").length;
  const warningCount = invoices.filter((i) => i.hasWarning && i.status === "pending").length;

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto">
      {/* Premium Header Architecture */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-4">
            <span className="bg-slate-900 text-white p-3 rounded-[1.5rem] shadow-2xl shadow-slate-200">
              <ShieldCheck className="w-10 h-10" />
            </span>
            Valuation Audit Hub
          </h1>
          <p className="text-muted-foreground mt-3 font-medium italic">
            {isUserRole ? "Review your pending ledger submissions" : "Enterprise verification of bottom-price integrity and team quota compliance"}
          </p>
        </div>
        
        <div className="bg-white border border-slate-100 p-2 rounded-[2rem] flex items-center gap-2 shadow-xl shadow-slate-200/50">
           <button 
             onClick={() => setViewMode("table")}
             className={`px-6 py-3 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2 ${viewMode === 'table' ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'text-slate-400 hover:bg-slate-50'}`}
           >
              <List className="w-4 h-4" /> Sequential
           </button>
           <button 
             onClick={() => setViewMode("grid")}
             className={`px-6 py-3 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2 ${viewMode === 'grid' ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'text-slate-400 hover:bg-slate-50'}`}
           >
              <LayoutGrid className="w-4 h-4" /> Grid-X
           </button>
        </div>
      </div>

      {/* Audit Intelligence Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: "Pending Review", value: pendingCount, icon: Clock, color: "text-orange-600", bg: "bg-orange-50", desc: "Awaiting final settlement sign-off" },
          { label: "Margin Warnings", value: warningCount, icon: ShieldAlert, color: "text-rose-600", bg: "bg-rose-50", desc: "Violations of bottom price integrity", show: !isUserRole },
          { label: "Processed Records", value: invoices.filter(i => i.status !== 'pending').length, icon: BadgeCheck, color: "text-emerald-600", bg: "bg-emerald-50", desc: "Audit logs for current cycle" },
          { label: "Ledger Confidence", value: "96.2%", icon: Activity, color: "text-blue-600", bg: "bg-blue-50", desc: "Real-time AI Match fidelity" },
        ].filter(c => c.show !== false).map((card, idx) => (
          <div key={idx} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40 group hover:shadow-2xl transition-all relative overflow-hidden">
             <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                <card.icon className="w-20 h-20" />
             </div>
             <div className={`w-14 h-14 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center mb-6 shadow-sm`}>
                <card.icon className="w-6 h-6" />
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">{card.label}</p>
             <p className={`text-4xl font-black ${card.color} tracking-tighter`}>{card.value}</p>
             <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest opacity-60 leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </div>

      {/* Critical Violation Isolation Banner */}
      {!isUserRole && warningCount > 0 && (
        <div className="relative overflow-hidden bg-rose-600 rounded-[3rem] p-10 text-white shadow-2xl shadow-rose-200 group">
          <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-125 transition-transform duration-1000">
             <ShieldAlert className="w-48 h-48" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex items-center gap-8">
               <div className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center backdrop-blur-3xl border border-white/20 shadow-2xl">
                  <AlertTriangle className="w-10 h-10 animate-pulse text-white" />
               </div>
               <div>
                  <h3 className="text-3xl font-black tracking-tight leading-tight">Margin Dilution Crisis</h3>
                  <p className="font-medium opacity-80 mt-3 max-w-2xl leading-relaxed">
                    Corporate forensics identified <strong>{warningCount}</strong> active submissions containing products optimized below the certified bottom price. Immediate auditor intervention is MANDATORY.
                  </p>
               </div>
            </div>
            <button className="bg-white text-rose-600 px-12 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-2xl shadow-rose-900/20 active:scale-95 flex items-center gap-3">
               ISOLATE VIOLATIONS <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Master Audit Logs */}
      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-10 py-8 text-left text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Audit Serial</th>
                <th className="px-10 py-8 text-left text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Assignee Personnel</th>
                <th className="px-10 py-8 text-left text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Registry Valuation</th>
                <th className="px-10 py-8 text-left text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Compliance Logic</th>
                <th className="px-10 py-8 text-left text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Logged Timestamp</th>
                <th className="px-10 py-8 text-center text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Audit Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                   <td colSpan={10} className="p-32 text-center text-slate-400 font-black uppercase tracking-widest text-[10px]">
                      <div className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                      Synchronizing Audit Queue...
                   </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                   <td colSpan={10} className="p-32 text-center text-slate-400">
                      <div className="w-20 h-20 bg-slate-50 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6">
                         <ShieldCheck className="w-10 h-10 opacity-10" />
                      </div>
                      <p className="font-black text-2xl tracking-tighter text-slate-900">Queue is Clear</p>
                      <p className="text-sm font-medium mt-2">Zero records awaiting auditor manual review.</p>
                   </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.number} className={`group hover:bg-slate-50/50 transition-all ${inv.hasWarning && inv.status === 'pending' ? 'bg-rose-50/10' : ''}`}>
                    <td className="px-10 py-8">
                       <span className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors">{inv.number}</span>
                    </td>
                    <td className="px-10 py-8">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-[1.25rem] bg-slate-100 text-slate-900 flex items-center justify-center text-[10px] font-black group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                             {inv.userName.split(" ").map(n => n[0]).join("")}
                          </div>
                          <div>
                             <p className="text-sm font-black text-slate-900 leading-none mb-1.5">{inv.userName}</p>
                             <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{inv.team}</span>
                             </div>
                          </div>
                       </div>
                    </td>
                    <td className="px-10 py-8 text-sm font-black text-primary tracking-tighter">{inv.sales}</td>
                    <td className="px-10 py-8">
                      {inv.hasWarning ? (
                        <div className="flex items-center gap-3 text-rose-600 bg-rose-50 px-5 py-2.5 rounded-2xl border border-rose-100 w-fit shadow-sm">
                          <ShieldAlert className="w-4 h-4" />
                          <span className="text-[9px] font-black uppercase tracking-[0.3em]">Critical Conflict</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 px-5 py-2.5 rounded-2xl border border-emerald-100 w-fit shadow-sm">
                          <BadgeCheck className="w-4 h-4" />
                          <span className="text-[9px] font-black uppercase tracking-[0.3em]">Compliant Registry</span>
                        </div>
                      )}
                    </td>
                    <td className="px-10 py-8 text-xs font-black text-slate-400">{inv.date}</td>
                    <td className="px-10 py-8">
                       <div className="flex items-center justify-center gap-4">
                          {inv.status === 'pending' && !isUserRole ? (
                            <>
                              <button 
                                onClick={() => updateStatus(inv.number, 'approved')}
                                className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-xl shadow-emerald-100 group/approve"
                                title="Approve Entry"
                              >
                                 <Check className="w-6 h-6 group-hover/approve:scale-125 transition-transform" />
                              </button>
                              <button 
                                onClick={() => updateStatus(inv.number, 'rejected')}
                                className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all shadow-xl shadow-rose-100 group/reject"
                                title="Reject Entry"
                              >
                                 <X className="w-6 h-6 group-hover/reject:scale-125 transition-transform" />
                              </button>
                            </>
                          ) : (
                            <span className={`text-[10px] font-black px-6 py-2.5 rounded-[1.25rem] uppercase tracking-[0.3em] border ${
                              inv.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                              inv.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                            }`}>
                               {inv.status}
                            </span>
                          )}
                          <Link to={`/invoices/${inv.number}`} className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all border border-transparent hover:border-slate-100">
                             <Eye className="w-5 h-5" />
                          </Link>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
