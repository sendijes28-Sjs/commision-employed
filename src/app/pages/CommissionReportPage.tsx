import { useState, useEffect } from "react";
import { Download, Calendar, Users, Clock, DollarSign, FileSpreadsheet, TrendingUp, Search, ArrowUpRight, BarChart3, PieChart, Wallet, CreditCard, ChevronRight, Loader2, CheckCircle2, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import * as XLSX from "xlsx";
import axios from "axios";

const API_URL = "http://localhost:3001/api";

interface CommissionEntry {
  invoiceNum: string;
  custName: string;
  team: string;
  sales: string;
  percentage: string;
  amount: string;
  status: string;
  date: string;
  userId: number;
}

export function CommissionReportPage() {
  const { user } = useAuth();
  const isUserRole = user?.role === "user";

  const [allCommissions, setAllCommissions] = useState<CommissionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invRes, settingsRes] = await Promise.all([
          axios.get(`${API_URL}/invoices`),
          axios.get(`${API_URL}/settings`)
        ]);

        const settings = settingsRes.data || {};
        const lelangPerc = parseFloat(settings.lelang_commission || "5.0");
        const userPerc = parseFloat(settings.user_commission || "4.5");
        const offlinePerc = parseFloat(settings.offline_commission || "4.0");
        const defaultPerc = parseFloat(settings.default_commission || "3.0");

        const formatted: CommissionEntry[] = invRes.data.map((inv: any) => {
          let perc = defaultPerc;
          if (inv.team === "Lelang") perc = lelangPerc;
          else if (inv.team === "User") perc = userPerc;
          else if (inv.team === "Offline") perc = offlinePerc;

          const salesAmt = Number(inv.total_amount) || 0;
          const commAmt = salesAmt * (perc / 100);

          return {
            invoiceNum: inv.invoice_number,
            custName: inv.customer_name,
            team: inv.team,
            sales: "Rp " + salesAmt.toLocaleString("id-ID"),
            percentage: perc + "%",
            amount: "Rp " + Math.floor(commAmt).toLocaleString("id-ID"),
            status: (inv.status || "Pending").toLowerCase() === "approved" ? "Paid" : "Pending",
            date: inv.date?.substring(0, 10) || "",
            userId: inv.user_id,
          };
        });

        setAllCommissions(formatted);
      } catch (err) {
        console.error("Failed to fetch commissions", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const commissions = isUserRole
    ? allCommissions.filter((c) => String(c.userId) === String(user?.id))
    : allCommissions;

  const filtered = commissions.filter(c => 
    c.invoiceNum.toLowerCase().includes(search.toLowerCase()) || 
    c.custName.toLowerCase().includes(search.toLowerCase())
  );

  const totalPaidAmt = filtered
    .filter(c => c.status === "Paid")
    .reduce((sum, c) => sum + (parseInt(c.amount.replace(/[^0-9]/g, "")) || 0), 0);
    
  const totalPendingAmt = filtered
    .filter(c => c.status === "Pending")
    .reduce((sum, c) => sum + (parseInt(c.amount.replace(/[^0-9]/g, "")) || 0), 0);

  const handleExport = () => {
    const exportData = filtered.map(c => ({
      "Serial": c.invoiceNum,
      "Client": c.custName,
      "Division": c.team,
      "Total Sales": c.sales,
      "Rate": c.percentage,
      "Payout": c.amount,
      "State": c.status,
      "Logged Date": c.date,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Commission Ledger");
    XLSX.writeFile(workbook, `Report_Export_${new Date().getTime()}.xlsx`);
  };

  return (
    <div className="space-y-12 pb-20 max-w-7xl mx-auto">
      {/* Premium Multi-Layer Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
        <div>
          <h1 className="text-4xl font-black tracking-tighter flex items-center gap-4">
            <span className="bg-gradient-to-tr from-primary to-blue-600 text-white p-3.5 rounded-[1.75rem] shadow-2xl shadow-primary/20">
              <BarChart3 className="w-10 h-10" />
            </span>
            Financial Ledger
          </h1>
          <p className="text-muted-foreground mt-3 font-medium text-lg leading-relaxed">
            {isUserRole ? "Real-time auditing of your performance bonuses and payout pipeline" : "Global governance of commission distribution and fiscal performance"}
          </p>
        </div>
        <button 
          onClick={handleExport}
          className="bg-slate-900 text-white pl-8 pr-10 py-5 rounded-[2.5rem] hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 active:scale-95 flex items-center gap-4 font-black uppercase tracking-[0.2em] text-xs border border-white/5"
        >
          <FileSpreadsheet className="w-5 h-5 text-primary" />
          Export Spreadsheet
        </button>
      </div>

      {/* Modern Fiscal Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="bg-white rounded-[3.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-12 text-primary/5 group-hover:scale-125 transition-transform duration-1000">
              <PieChart className="w-40 h-40" />
           </div>
           <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                 <Wallet className="w-6 h-6" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Gross Accumulated</p>
           </div>
           <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Rp {(totalPaidAmt + totalPendingAmt).toLocaleString("id-ID")}</h3>
           <p className="text-[10px] text-slate-400 font-bold mt-4 uppercase tracking-widest flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Combined Value Streams
           </p>
        </div>

        <div className="bg-emerald-600 rounded-[3.5rem] p-10 text-white shadow-2xl shadow-emerald-200 relative group overflow-hidden">
           <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-125 transition-transform duration-1000">
              <CheckCircle2 className="w-40 h-40" />
           </div>
           <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                 <CreditCard className="w-6 h-6" />
              </div>
              <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em]">Certified Payouts</p>
           </div>
           <h3 className="text-4xl font-black tracking-tighter">Rp {totalPaidAmt.toLocaleString("id-ID")}</h3>
           <div className="mt-4 flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-white/10 px-4 py-2 rounded-full border border-white/5 backdrop-blur-md">
                 {filtered.filter(c => c.status === 'Paid').length} Certified Transactions
              </span>
           </div>
        </div>

        <div className="bg-orange-500 rounded-[3.5rem] p-10 text-white shadow-2xl shadow-orange-200 relative group overflow-hidden">
           <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-125 transition-transform duration-1000">
              <Clock className="w-40 h-40" />
           </div>
           <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                 <TrendingUp className="w-6 h-6" />
              </div>
              <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em]">Pipeline Float</p>
           </div>
           <h3 className="text-4xl font-black tracking-tighter">Rp {totalPendingAmt.toLocaleString("id-ID")}</h3>
           <div className="mt-4 flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-white/10 px-4 py-2 rounded-full border border-white/5 backdrop-blur-md">
                 {filtered.filter(c => c.status === 'Pending').length} Pending Validation
              </span>
           </div>
        </div>
      </div>

      {/* Main Ledger Architecture */}
      <div className="bg-white rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden mt-12">
        <div className="p-10 border-b border-slate-50 flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-slate-50/30">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black">
                 <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Financial Transcript History</h2>
           </div>
           <div className="relative group min-w-[350px]">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Query serial identification or client entities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-16 pr-6 py-4 bg-white border border-slate-200 rounded-[2rem] outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-black text-sm shadow-sm"
              />
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-8 text-left text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Serial Registry</th>
                <th className="px-10 py-8 text-left text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Entity Identity</th>
                {!isUserRole && (
                  <th className="px-10 py-8 text-left text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Division Code</th>
                )}
                <th className="px-10 py-8 text-left text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Basis & Rate</th>
                <th className="px-10 py-8 text-left text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Net Payout</th>
                <th className="px-10 py-8 text-left text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Settlement Date</th>
                <th className="px-10 py-8 text-center text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Sec State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                   <td colSpan={10} className="p-32 text-center">
                      <Loader2 className="w-14 h-14 animate-spin mx-auto text-primary" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-6 animate-pulse">Accessing Banking Streams...</p>
                   </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                   <td colSpan={10} className="p-32 text-center">
                      <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
                         <BarChart3 className="w-10 h-10 opacity-10" />
                      </div>
                      <p className="font-black text-2xl tracking-tighter text-slate-900">Transcript Empty</p>
                      <p className="text-sm font-medium text-slate-400 mt-2">No matching records identified for current filter context.</p>
                   </td>
                </tr>
              ) : (
                filtered.map((entry, idx) => (
                  <tr key={idx} className="group hover:bg-slate-50/50 transition-all">
                    <td className="px-10 py-8 font-black text-sm text-slate-900 flex items-center gap-4">
                       <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest bg-slate-100 p-2 rounded-lg">ID-{idx + 1}</span>
                       {entry.invoiceNum}
                    </td>
                    <td className="px-10 py-8">
                       <p className="text-sm font-black text-slate-700 leading-tight">{entry.custName}</p>
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Certified Client</p>
                    </td>
                    {!isUserRole && (
                      <td className="px-10 py-8">
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl border ${
                           entry.team === 'Lelang' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                           entry.team === 'User' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>{entry.team}</span>
                      </td>
                    )}
                    <td className="px-10 py-8">
                       <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-400 tracking-tighter">{entry.sales}</span>
                          <div className="flex items-center gap-2 mt-1">
                             <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                             <span className="text-[9px] font-black text-primary uppercase tracking-widest">Logic: {entry.percentage} Apply</span>
                          </div>
                       </div>
                    </td>
                    <td className="px-10 py-8 text-lg font-black text-emerald-600 tracking-tighter">{entry.amount}</td>
                    <td className="px-10 py-8 text-xs font-black text-slate-400">{entry.date}</td>
                    <td className="px-10 py-8">
                       <div className="flex items-center justify-center">
                          <span className={`text-[9px] font-black uppercase tracking-[0.3em] px-5 py-2.5 rounded-2xl flex items-center gap-2 border ${
                            entry.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100 shadow-sm'
                          }`}>
                             <div className={`w-1.5 h-1.5 rounded-full ${entry.status === 'Paid' ? 'bg-emerald-500' : 'bg-orange-500 animate-pulse'}`} />
                             {entry.status}
                          </span>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-10 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm">
                 <ShieldCheck className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Certified Audit Log Signature</p>
           </div>
           <button className="text-slate-400 hover:text-slate-900 transition-colors">
              <ArrowUpRight className="w-6 h-6" />
           </button>
        </div>
      </div>
    </div>
  );
}
