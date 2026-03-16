import { useState, useEffect } from "react";
import { DollarSign, FileText, AlertCircle, TrendingUp, ShieldCheck, Clock, Users, AlertTriangle, ArrowUpRight, LayoutGrid, Activity, Sparkles, Wallet, PieChart, BarChart3, ChevronRight, Globe, Fingerprint, BadgeCheck } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router";

const API_URL = "http://localhost:3001/api";

export function DashboardPage() {
  const { user } = useAuth();
  const isUserRole = user?.role === "user";

  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<{ date: string; sales: number }[]>([]);
  const [latestInvoices, setLatestInvoices] = useState<any[]>([]);
  
  const [approvedCommission, setApprovedCommission] = useState(0);
  const [pendingCommission, setPendingCommission] = useState(0);
  const [totalSalesMonth, setTotalSalesMonth] = useState(0);
  const [allTimeSales, setAllTimeSales] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [invRes, settingsRes] = await Promise.all([
          axios.get(`${API_URL}/invoices`),
          axios.get(`${API_URL}/settings`)
        ]);

        let allInvoices = invRes.data || [];
        const settings = settingsRes.data || {};

        const lelangPerc = parseFloat(settings.lelang_commission || "5.0");
        const userPerc = parseFloat(settings.user_commission || "4.5");
        const offlinePerc = parseFloat(settings.offline_commission || "4.0");
        const defaultPerc = parseFloat(settings.default_commission || "3.0");

        if (isUserRole) {
          allInvoices = allInvoices.filter((inv: any) => String(inv.user_id) === String(user?.id));
        }

        const todayRaw = new Date();
        const currentYear = todayRaw.getFullYear();
        const currentMonth = todayRaw.getMonth();

        let currentApprovedCommission = 0;
        let currentPendingCommission = 0;
        let currentTotalSalesMonth = 0;
        let currentAllTimeSales = 0;
        let currentGlobalPendingCount = 0;
        const customerSet = new Set<string>();

        const salesByDate: Record<string, number> = {};

        allInvoices.forEach((inv: any) => {
          const invDate = inv.date?.substring(0, 10);
          const amt = Number(inv.total_amount) || 0;
          const status = (inv.status || "Pending").toLowerCase();

          currentAllTimeSales += amt;
          if (inv.customer_name) customerSet.add(inv.customer_name.trim().toLowerCase());

          if (status === "pending") {
            currentGlobalPendingCount++;
          }

          if (invDate) {
            const dateObj = new Date(invDate);
            const isThisMonth = dateObj.getFullYear() === currentYear && dateObj.getMonth() === currentMonth;
            
            if (isThisMonth) {
              currentTotalSalesMonth += amt;
              
              const getPercentage = () => {
                if (inv.team === "Lelang") return lelangPerc;
                if (inv.team === "User") return userPerc;
                if (inv.team === "Offline") return offlinePerc;
                return defaultPerc;
              };

              const comm = amt * (getPercentage() / 100);
              
              if (status === "approved" || status === "acc") {
                currentApprovedCommission += comm;
              } else if (status === "pending") {
                currentPendingCommission += comm;
              }
            }
            salesByDate[invDate] = (salesByDate[invDate] || 0) + amt;
          }
        });

        const sortedDates = Object.keys(salesByDate).sort();
        const formattedChartData = sortedDates.map(dateStr => {
           const d = new Date(dateStr + "T00:00:00");
           return {
             date: d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" }),
             sales: salesByDate[dateStr]
           };
        });

        setApprovedCommission(Math.floor(currentApprovedCommission));
        setPendingCommission(Math.floor(currentPendingCommission));
        setTotalSalesMonth(currentTotalSalesMonth);
        setAllTimeSales(currentAllTimeSales);
        setTotalCustomers(customerSet.size);
        setPendingCount(currentGlobalPendingCount);
        setChartData(formattedChartData);
        setLatestInvoices(allInvoices.slice(0, 6));

      } catch (error) {
        console.error("Dashboard Load Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [isUserRole, user?.id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-40 space-y-8">
        <div className="relative">
           <div className="w-20 h-20 border-8 border-primary/10 rounded-[2.5rem] rotate-45" />
           <div className="w-20 h-20 border-8 border-primary border-t-transparent rounded-[2.5rem] animate-spin absolute inset-0 rotate-45" />
           <div className="absolute inset-0 flex items-center justify-center">
              <Activity className="w-8 h-8 text-primary animate-pulse" />
           </div>
        </div>
        <div className="text-center">
           <p className="font-black text-2xl tracking-tighter text-slate-900">Synchronizing Global Intelligence...</p>
           <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mt-3 animate-pulse">Accessing Performance Node Core</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20 max-w-7xl mx-auto">
      {/* Cinematic Header Architecture */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
        <div className="flex items-center gap-8">
           <div className="relative">
              <div className="w-20 h-20 bg-slate-900 text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-slate-200 group overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-tr from-primary to-blue-600 opacity-20" />
                 <Fingerprint className="w-10 h-10 relative z-10" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-xl shadow-lg border-2 border-white">
                 <BadgeCheck className="w-4 h-4" />
              </div>
           </div>
           <div>
              <h1 className="text-5xl font-black tracking-tighter text-slate-900 leading-none">
                System Overview
              </h1>
              <p className="text-muted-foreground mt-4 font-medium text-lg flex items-center gap-3">
                <Globe className="w-5 h-5 text-primary opacity-60" />
                {isUserRole ? "Personal performance metrics and commission auditing" : "Enterprise-wide sales synchronization and fiscal monitoring"}
              </p>
           </div>
        </div>
        
        <div className="bg-white border border-slate-100 p-3 rounded-[2.5rem] flex items-center gap-3 shadow-xl shadow-slate-200/50">
           <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
              <Activity className="w-6 h-6" />
           </div>
           <div className="pr-6">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Session Entity</p>
              <p className="text-sm font-black text-slate-900 leading-none">{user?.name}</p>
           </div>
        </div>
      </div>

      {/* Modern High-Fidelity Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-8">
        {[
          { 
            label: "Cleared Payout", 
            value: `Rp ${approvedCommission.toLocaleString("id-ID")}`, 
            icon: ShieldCheck, 
            color: "text-emerald-500", 
            bg: "bg-emerald-50/50",
            border: "border-emerald-100",
            desc: "Disbursement ready"
          },
          { 
            label: "Floating Comm.", 
            value: `Rp ${pendingCommission.toLocaleString("id-ID")}`, 
            icon: Clock, 
            color: "text-orange-500", 
            bg: "bg-orange-50/50",
            border: "border-orange-100",
            desc: "Pending audit"
          },
          { 
            label: "Monthly Flow", 
            value: `Rp ${totalSalesMonth.toLocaleString("id-ID")}`, 
            icon: BarChart3, 
            color: "text-blue-500", 
            bg: "bg-blue-50/50",
            border: "border-blue-100",
            desc: "Current cycle"
          },
          { 
            label: "Gross Cumulative", 
            value: `Rp ${allTimeSales.toLocaleString("id-ID")}`, 
            icon: Wallet, 
            color: "text-slate-900", 
            bg: "bg-slate-50/50",
            border: "border-slate-200",
            desc: "Global total"
          },
          { 
            label: "Client Nodes", 
            value: totalCustomers, 
            icon: Users, 
            color: "text-indigo-500", 
            bg: "bg-indigo-50/50",
            border: "border-indigo-100",
            desc: "Managed portfolio"
          },
          { 
            label: "Critical Alerts", 
            value: pendingCount, 
            icon: AlertTriangle, 
            color: "text-rose-500", 
            bg: "bg-rose-50/50",
            border: "border-rose-100",
            desc: "Requires action"
          },
        ].map((card, idx) => (
          <div key={idx} className="bg-white rounded-[2.5rem] p-7 border border-slate-100 shadow-xl shadow-slate-200/30 group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-125 transition-transform duration-1000 grayscale group-hover:grayscale-0">
                <card.icon className="w-20 h-20" />
             </div>
             <div className={`w-14 h-14 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center mb-6 shadow-sm border ${card.border} group-hover:scale-110 transition-transform`}>
                <card.icon className="w-6 h-6" />
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">{card.label}</p>
             <p className={`text-xl font-black ${card.color} tracking-tighter truncate`}>{card.value}</p>
             <p className="text-[10px] text-slate-400 font-bold mt-3 uppercase tracking-widest opacity-60 flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${card.color.replace('text-', 'bg-')}`} />
                {card.desc}
             </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Advanced Growth Analytics */}
        <div className="lg:col-span-8 bg-white rounded-[4rem] p-12 border border-slate-100 shadow-2xl shadow-slate-200/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-20 opacity-[0.02] -mr-20 -mt-20">
             <TrendingUp className="w-96 h-96" />
          </div>
          <div className="flex items-center justify-between mb-12 relative z-10">
            <div className="flex items-center gap-6">
               <div className="w-14 h-14 bg-primary text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-primary/30 rotate-12">
                  <PieChart className="w-7 h-7" />
               </div>
               <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Growth Forensics</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1 italic">Real-time revenue distribution modeling</p>
               </div>
            </div>
            <div className="flex items-center gap-4">
               <span className="text-[10px] font-black bg-slate-50 text-slate-400 px-5 py-2.5 rounded-2xl uppercase tracking-[0.2em] border border-slate-100">Frequency: Daily</span>
            </div>
          </div>
          
          <div className="h-[450px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 900 }} 
                  dy={20}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 900 }}
                  tickFormatter={(val) => `Rp${(val/1000000).toFixed(1)}M`}
                />
                <Tooltip 
                  cursor={{ stroke: '#2563eb', strokeWidth: 2, strokeDasharray: '5 5' }}
                  contentStyle={{ borderRadius: '24px', border: 'none', padding: '24px', background: '#0f172a', color: '#fff', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)' }}
                  itemStyle={{ fontWeight: 900, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                  labelStyle={{ fontWeight: 900, marginBottom: '8px', color: '#64748b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em' }}
                  formatter={(value: number) => [`Rp ${value.toLocaleString("id-ID")}`, 'Sales Revenue']}
                />
                <Area type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={5} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Intelligence Ledger Fragment */}
        <div className="lg:col-span-4 flex flex-col gap-10">
          <div className="bg-slate-900 rounded-[3.5rem] p-10 text-white shadow-2xl shadow-slate-300 relative overflow-hidden group flex-1 flex flex-col">
            <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-all duration-1000">
               <FileText className="w-56 h-56" />
            </div>
            
            <div className="flex items-center justify-between mb-10 relative z-10">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-3xl border border-white/10">
                     <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-black tracking-tight">Recent Activity Log</h3>
               </div>
               <Link to="/invoices" className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-primary transition-all group/link shadow-sm border border-white/5">
                  <ArrowUpRight className="w-6 h-6 group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
               </Link>
            </div>
            
            <div className="space-y-6 relative z-10 flex-1">
              {latestInvoices.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-10">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Zero Active Records Identified</p>
                </div>
              ) : (
                latestInvoices.map((inv, i) => (
                  <div key={i} className="flex items-center justify-between p-5 bg-white/5 rounded-[2rem] border border-white/5 hover:bg-white/10 transition-all cursor-pointer group/item">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-slate-800 text-primary flex items-center justify-center font-black group-hover/item:bg-primary group-hover/item:text-white transition-all shadow-xl">
                        {inv.team?.[0] || 'I'}
                      </div>
                      <div>
                        <p className="text-sm font-black truncate max-w-[120px] mb-1">{inv.invoice_number}</p>
                        <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">{inv.date?.substring(0, 10)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-white tracking-widest mb-1">Rp{(Number(inv.total_amount) / 1000).toFixed(0)}k</p>
                      <div className={`px-4 py-1.5 rounded-full inline-block border ${
                        inv.status?.toLowerCase() === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        inv.status?.toLowerCase() === 'pending' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}>
                        <span className="text-[8px] font-black uppercase tracking-[0.2em]">{inv.status || 'Pending'}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <button className="w-full bg-white/5 border border-white/5 rounded-3xl py-5 mt-10 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/10 transition-all flex items-center justify-center gap-3 relative z-10 active:scale-95">
               Full Audit History <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="bg-primary rounded-[3rem] p-8 text-white shadow-2xl shadow-primary/30 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-125 transition-transform duration-1000">
                <Sparkles className="w-32 h-32" />
             </div>
             <div className="flex flex-col items-center text-center relative z-10 py-4">
                <div className="w-16 h-16 bg-white/20 rounded-[1.5rem] flex items-center justify-center backdrop-blur-3xl border border-white/20 mb-6">
                   <LayoutGrid className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black tracking-tight mb-3">Accelerate Entry</h3>
                <p className="text-xs font-medium text-white/60 mb-8 max-w-[200px] leading-relaxed">Ready to synchronize new commercial data?</p>
                <Link to="/invoices/create" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-slate-800 transition-all shadow-2xl shadow-slate-900/40">
                   Initialize Input Digitizer
                </Link>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
