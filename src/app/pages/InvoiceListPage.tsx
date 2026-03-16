import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Plus, Search, Eye, Filter, Calendar, Users, ChevronRight, FileText, MoreHorizontal, ArrowUpRight, CheckCircle2, Clock, XCircle, Hash, Briefcase } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const API_URL = "http://localhost:3001/api";

interface Invoice {
  id: number;
  number: string;
  userName: string;
  team: string;
  customer: string;
  sales: string;
  status: string;
  date: string;
  userId: number;
}

export function InvoiceListPage() {
  const { user } = useAuth();
  const isUserRole = user?.role === "user";

  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("All Teams");
  const [statusFilter, setStatusFilter] = useState("All Status");
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await axios.get(`${API_URL}/invoices`);
        const formatted: Invoice[] = res.data.map((inv: any) => ({
          id: inv.id,
          number: inv.invoice_number,
          userName: inv.user_name || "Unknown User",
          team: inv.team,
          customer: inv.customer_name,
          sales: "Rp " + (Number(inv.total_amount) || 0).toLocaleString("id-ID"),
          status: inv.status || "Pending",
          date: inv.date?.substring(0, 10) || "",
          userId: inv.user_id,
        }));
        setInvoices(formatted);
      } catch (err) {
        console.error("Failed to fetch invoices", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const baseInvoices = isUserRole
    ? invoices.filter((inv) => String(inv.userId) === String(user?.id))
    : invoices;

  const filtered = baseInvoices.filter((inv) => {
    const matchSearch = inv.number.toLowerCase().includes(search.toLowerCase()) ||
      inv.customer.toLowerCase().includes(search.toLowerCase());
    const matchTeam = teamFilter === "All Teams" || inv.team === teamFilter;
    const matchStatus = statusFilter === "All Status" || inv.status === statusFilter;
    return matchSearch && matchTeam && matchStatus;
  });

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto">
      {/* Ultra Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-4">
            <span className="bg-slate-900 text-white p-3 rounded-[1.5rem] shadow-2xl shadow-slate-200">
              <FileText className="w-10 h-10" />
            </span>
            Registry Vault
          </h1>
          <p className="text-muted-foreground mt-3 font-medium italic">
            {isUserRole ? "Archive of your personal transaction history" : "Enterprise-wide ledger of all certified transactions"}
          </p>
        </div>
        <Link
          to="/invoices/create"
          className="bg-primary text-white pl-8 pr-10 py-5 rounded-[2rem] hover:scale-[1.03] active:scale-95 transition-all shadow-2xl shadow-primary/20 flex items-center gap-4 font-black uppercase tracking-[0.2em] text-xs"
        >
          <Plus className="w-5 h-5" />
          Capture New Records
        </Link>
      </div>

      {/* Advanced Command Center (Filters) */}
      <div className="bg-white rounded-[3rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col lg:flex-row gap-6">
        <div className="flex-1 relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Query serial identification or client entity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-16 pr-6 py-5 bg-slate-50 border border-transparent rounded-[2rem] outline-none focus:bg-white focus:border-slate-200 transition-all font-black text-sm"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          {!isUserRole && (
            <div className="relative">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                 <Briefcase className="w-4 h-4" />
              </div>
              <select
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
                className="pl-12 pr-12 py-5 bg-slate-50 border border-transparent rounded-[2rem] outline-none focus:bg-white focus:border-slate-200 transition-all font-black text-xs appearance-none min-w-[180px] uppercase tracking-widest text-slate-500"
              >
                <option>All Teams</option>
                <option>Lelang</option>
                <option>User</option>
                <option>Offline</option>
              </select>
            </div>
          )}
          
          <div className="relative">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
               <Hash className="w-4 h-4" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-12 pr-12 py-5 bg-slate-50 border border-transparent rounded-[2rem] outline-none focus:bg-white focus:border-slate-200 transition-all font-black text-xs appearance-none min-w-[180px] uppercase tracking-widest text-slate-500"
            >
              <option>All Status</option>
              <option>Approved</option>
              <option>Pending</option>
              <option>Rejected</option>
            </select>
          </div>

          <div className="h-10 w-[1px] bg-slate-100 mx-2 hidden lg:block" />
          
          <button className="w-14 h-14 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-slate-400 hover:text-primary hover:bg-white transition-all border border-transparent hover:border-slate-200 shadow-sm">
            <Calendar className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Ledger Architecture */}
      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-8 text-left text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Vault ID</th>
                {!isUserRole && (
                  <th className="px-10 py-8 text-left text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Personnel Assignment</th>
                )}
                <th className="px-10 py-8 text-left text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Entity Identity</th>
                <th className="px-10 py-8 text-left text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Valuation</th>
                <th className="px-10 py-8 text-left text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Security State</th>
                <th className="px-10 py-8 text-left text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Timestamp</th>
                <th className="px-10 py-8 text-center text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">-</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                   <td colSpan={10} className="px-10 py-32 text-center">
                      <div className="relative w-16 h-16 mx-auto mb-6">
                         <div className="absolute inset-0 border-4 border-primary/10 rounded-full" />
                         <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                      <p className="text-slate-400 font-black uppercase tracking-widest text-xs animate-pulse">Synchronizing Ledger Streams...</p>
                   </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-10 py-32 text-center text-slate-400">
                    <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                       <FileText className="w-10 h-10 opacity-20" />
                    </div>
                    <p className="font-black text-2xl tracking-tighter text-slate-900">Zero Matches Found</p>
                    <p className="text-sm font-medium mt-2">The vault does not contain records for this specific query.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((invoice) => (
                  <tr key={invoice.id} className="group hover:bg-slate-50/50 transition-all">
                    <td className="px-10 py-8">
                       <span className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors flex items-center gap-2">
                          <Hash className="w-3 h-3 opacity-20" />
                          {invoice.number}
                       </span>
                    </td>
                    {!isUserRole && (
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-[1.25rem] bg-slate-900 text-white flex items-center justify-center font-black text-[10px] shadow-xl shadow-slate-200">
                             {invoice.userName.split(" ").map(n => n[0]).join("")}
                          </div>
                          <div>
                             <p className="text-sm font-black text-slate-900 leading-none mb-1.5">{invoice.userName}</p>
                             <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${
                                  invoice.team === "Lelang" ? "bg-blue-500" : 
                                  invoice.team === "User" ? "bg-orange-500" : "bg-purple-500"
                                }`} />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{invoice.team}</span>
                             </div>
                          </div>
                        </div>
                      </td>
                    )}
                    <td className="px-10 py-8">
                       <p className="text-sm font-bold text-slate-600 truncate max-w-[180px]">{invoice.customer}</p>
                    </td>
                    <td className="px-10 py-8">
                       <p className="text-sm font-black text-primary tracking-tight">{invoice.sales}</p>
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Market Extended</p>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex">
                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl flex items-center gap-2 border ${
                          invoice.status.toLowerCase() === "approved" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                          invoice.status.toLowerCase() === "pending" ? "bg-orange-50 text-orange-600 border-orange-100" : "bg-rose-50 text-rose-600 border-rose-100"
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            invoice.status.toLowerCase() === 'approved' ? 'bg-emerald-500' :
                            invoice.status.toLowerCase() === 'pending' ? 'bg-orange-500' : 'bg-rose-500'
                          }`} />
                          {invoice.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                       <span className="text-xs font-black text-slate-400">{invoice.date}</span>
                    </td>
                    <td className="px-10 py-8 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <Link
                          to={`/invoices/${invoice.number}`}
                          className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-primary hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-slate-100 group/btn"
                          title="Inspect Transcript"
                        >
                          <ArrowUpRight className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                        </Link>
                        <button className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-slate-900 transition-colors">
                           <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-10 py-8 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
               INTEGRITY CHECK PASSED · {filtered.length} OF {baseInvoices.length} RECORDS
             </p>
           </div>
           <div className="flex items-center gap-2">
              <button 
                disabled 
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-300 disabled:opacity-40"
              >
                 <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
              <div className="flex items-center gap-1">
                 {[1].map(p => (
                   <button key={p} className={`w-10 h-10 rounded-xl font-black text-xs ${p === 1 ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'text-slate-400 hover:bg-white transition-all'}`}>
                      {p}
                   </button>
                 ))}
              </div>
              <button 
                disabled 
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-300 disabled:opacity-40"
              >
                 <ChevronRight className="w-4 h-4" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
