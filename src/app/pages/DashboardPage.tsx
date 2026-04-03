import { useState, useEffect, useMemo } from "react";
import { DollarSign, FileText, AlertCircle, TrendingUp, ShieldCheck, Clock, Users, AlertTriangle, ArrowUpRight, LayoutGrid, Activity, Sparkles, Wallet, PieChart, BarChart3, ChevronRight, Globe, Fingerprint, BadgeCheck, XCircle, Search, ChevronDown } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router";
import { StatusBadge } from "../components/StatusBadge";

const API_URL = `http://${window.location.hostname}:4000/api`;

export function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<{ date: string; sales: number }[]>([]);
  const [latestInvoices, setLatestInvoices] = useState<any[]>([]);

  const [unpaidCommission, setUnpaidCommission] = useState(0);
  const [paidCommission, setPaidCommission] = useState(0);
  const [allTimeSales, setAllTimeSales] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [teamStats, setTeamStats] = useState<any[]>([]);

  const [dailyTarget, setDailyTarget] = useState(0);
  const [todaySales, setTodaySales] = useState(0);
  const [userBreakdown, setUserBreakdown] = useState<any[]>([]);
  const [userTimeSeries, setUserTimeSeries] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("all");

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, invRes, settingsRes] = await Promise.all([
          axios.get(`${API_URL}/stats`),
          axios.get(`${API_URL}/invoices?limit=10`),
          axios.get(`${API_URL}/settings`)
        ]);

        const statsData = statsRes.data;
        const summary = statsData.summary || [];
        const settings = settingsRes.data || {};

        setDailyTarget(statsData.dailyTarget || 0);
        setTodaySales(statsData.todaySales || 0);
        if (isAdmin) {
          setUserBreakdown(statsData.userBreakdown || []);
          setUserTimeSeries(statsData.userTimeSeries || []);
        }

        const lelangPerc = parseFloat(settings.lelang_commission || "5.0");
        const userPerc = parseFloat(settings.user_commission || "4.5");
        const defaultPerc = parseFloat(settings.default_commission || "3.0");

        let curTotalSales = 0;
        let curUnpaidComm = 0;
        let curPaidComm = 0;
        let curPending = 0;
        let curRejected = 0;

        summary.forEach((s: any) => {
          const status = (s.status || "Pending").toLowerCase();
          const amt = Number(s.total_sales) || 0;
          curTotalSales += amt;

          if (status === "pending") curPending += s.total_invoices;
          if (status === "rejected") curRejected += s.total_invoices;

          const getPerc = () => {
            if (user?.team === "Lelang") return lelangPerc;
            if (user?.team === "User") return userPerc;
            return defaultPerc;
          };
          const perc = isAdmin ? defaultPerc : getPerc();
          const comm = amt * (perc / 100);

          if (status === "approved" || status === "pending") curUnpaidComm += comm;
          if (status === "paid") curPaidComm += comm;
        });

        setAllTimeSales(curTotalSales);
        setUnpaidCommission(Math.floor(curUnpaidComm));
        setPaidCommission(Math.floor(curPaidComm));
        setPendingCount(curPending);
        setRejectedCount(curRejected);

        if (isAdmin && statsData.teamBreakdown) {
          setTeamStats(statsData.teamBreakdown);
        }

        const recentInvoices = invRes.data?.data || [];
        setLatestInvoices(recentInvoices.slice(0, 6));

        const salesByDate: Record<string, number> = {};
        recentInvoices.forEach((inv: any) => {
          const d = inv.date?.substring(0, 10);
          if (d) salesByDate[d] = (salesByDate[d] || 0) + Number(inv.total_amount);
        });
        const formattedChart = Object.keys(salesByDate).sort().map(d => ({
          date: new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short" }),
          sales: salesByDate[d]
        }));
        setChartData(formattedChart);

      } catch (error) {
        console.error("Dashboard Load Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAdmin, user?.id, user?.team]);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (isDropdownOpen && !event.target.closest('.user-monitor-dropdown')) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const filteredMembers = useMemo(() => {
    return userBreakdown
      .filter(u => u.role !== 'admin' && u.role !== 'super_admin' && u.id !== user?.id)
      .filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [userBreakdown, searchTerm, user?.id]);

  const selectedUser = useMemo(() => {
    if (selectedUserId === "all") return null;
    return userBreakdown.find(u => u.id.toString() === selectedUserId);
  }, [selectedUserId, userBreakdown]);

  const filteredChartData = useMemo(() => {
    if (!isAdmin || selectedUserId === "all") return chartData;
    const userSalesByDate: Record<string, number> = {};
    const filteredSeries = userTimeSeries.filter(pts => pts.user_id.toString() === selectedUserId);
    if (filteredSeries.length === 0) return [{ date: 'No Data', sales: 0 }];
    filteredSeries.forEach(pts => {
      const d = pts.date?.substring(0, 10);
      if (d) userSalesByDate[d] = (userSalesByDate[d] || 0) + Number(pts.daily_sales);
    });
    return Object.keys(userSalesByDate).sort().map(d => ({
      date: new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short" }),
      sales: userSalesByDate[d]
    }));
  }, [selectedUserId, chartData, userTimeSeries, isAdmin]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-40 space-y-4">
        <div className="w-10 h-10 border-2 border-slate-200 border-t-primary rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Loading dashboard...</p>
      </div>
    );
  }

  const targetProgress = dailyTarget > 0 ? (todaySales / dailyTarget) * 100 : 0;
  const isTargetAchieved = targetProgress >= 100;

  // Build stat cards (Progressive disclosure: reduced density)
  const statCards = [
    { label: "Awaiting Payout", value: `Rp ${unpaidCommission.toLocaleString("id-ID")}`, icon: Wallet, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
    { label: "Total Paid", value: `Rp ${paidCommission.toLocaleString("id-ID")}`, icon: BadgeCheck, color: "text-primary", bg: "bg-blue-50", border: "border-blue-100" },
    { label: "Pending Review", value: pendingCount, icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100" },
    { label: "Rejected", value: rejectedCount, icon: XCircle, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" },
  ];

  return (
    <div className="space-y-6 pb-10 max-w-7xl mx-auto">
      {/* Header — greeting style */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {getGreeting()}, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isAdmin ? "Here's your company performance overview." : "Here's your commission performance."}
          </p>
        </div>

        {/* Daily Target Progress — horizontal bar version */}
        {dailyTarget > 0 && (
          <div className="flex items-center gap-4 bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-sm">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Daily Target</p>
              <p className="text-sm font-semibold text-slate-900 mt-0.5">
                Rp {todaySales.toLocaleString("id-ID")} <span className="text-slate-400 font-normal">/ {dailyTarget.toLocaleString("id-ID")}</span>
              </p>
            </div>
            <div className="w-24">
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${isTargetAchieved ? "bg-emerald-500" : "bg-primary"}`}
                  style={{ width: `${Math.min(targetProgress, 100)}%` }}
                />
              </div>
              <p className={`text-[10px] font-semibold mt-1 text-right ${isTargetAchieved ? "text-emerald-600" : "text-primary"}`}>
                {Math.floor(targetProgress)}%
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Stat Cards — 4 column max */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-9 h-9 rounded-lg ${card.bg} ${card.color} flex items-center justify-center border ${card.border}`}>
                <card.icon className="w-4 h-4" />
              </div>
              <p className="text-xs font-medium text-slate-500">{card.label}</p>
            </div>
            <p className={`text-lg font-semibold ${card.color} tracking-tight truncate font-mono`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Sales Activity</h2>
                <p className="text-xs text-slate-400 mt-0.5">Daily revenue trend</p>
              </div>

              {/* Member filter dropdown (Admin only) */}
              {isAdmin && (
                <div className="relative user-monitor-dropdown">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2.5 px-3 py-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-slate-300 transition-all active:scale-[0.98]"
                  >
                    <div className={`w-6 h-6 rounded-md bg-slate-900 text-white flex items-center justify-center text-[9px] font-bold ${selectedUserId !== 'all' ? 'ring-2 ring-primary ring-offset-1' : ''}`}>
                      {selectedUserId === 'all' ? <Users className="w-3 h-3" /> : selectedUser?.name?.split(" ").map((n: string) => n[0]).join("")}
                    </div>
                    <div className="text-left pr-2">
                      <p className="text-[10px] font-medium text-slate-400">Monitoring</p>
                      <p className="text-xs font-semibold text-slate-900 leading-none truncate max-w-[100px]">
                        {selectedUserId === 'all' ? 'All Teams' : selectedUser?.name}
                      </p>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl border border-slate-100 shadow-xl z-[99] overflow-hidden">
                      {/* Search */}
                      <div className="p-2.5 border-b border-slate-50">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                          <input
                            autoFocus
                            type="text"
                            placeholder="Search member..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-xs font-medium text-slate-900 focus:border-primary transition-all"
                          />
                        </div>
                      </div>

                      <div className="max-h-[280px] overflow-y-auto p-1.5 space-y-0.5">
                        {/* All teams option */}
                        <button
                          onClick={() => { setSelectedUserId("all"); setIsDropdownOpen(false); }}
                          className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-all ${selectedUserId === 'all' ? 'bg-primary text-white' : 'hover:bg-slate-50 text-slate-900'}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-md flex items-center justify-center ${selectedUserId === 'all' ? 'bg-white/20' : 'bg-slate-100'}`}>
                              <Users className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-semibold">All Teams</span>
                          </div>
                          {selectedUserId === 'all' && <BadgeCheck className="w-4 h-4" />}
                        </button>

                        {/* Section label */}
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2.5 pt-2 pb-1">Members</p>

                        {filteredMembers.length === 0 ? (
                          <div className="p-6 text-center">
                            <p className="text-xs text-slate-400">No members found</p>
                          </div>
                        ) : (
                          filteredMembers.map(m => (
                            <button
                              key={m.id}
                              onClick={() => { setSelectedUserId(m.id.toString()); setIsDropdownOpen(false); }}
                              className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-all ${selectedUserId === m.id.toString() ? 'bg-primary text-white' : 'hover:bg-slate-50 text-slate-900'}`}
                            >
                              <div className="flex items-center gap-2.5">
                                <div className={`w-7 h-7 rounded-md flex items-center justify-center text-[9px] font-bold ${selectedUserId === m.id.toString() ? 'bg-white/20' : 'bg-slate-900 text-white'}`}>
                                  {m.name?.split(" ").map((n: string) => n[0]).join("")}
                                </div>
                                <div className="text-left">
                                  <p className="text-xs font-semibold leading-none">{m.name}</p>
                                  <span className={`text-[10px] font-medium ${selectedUserId === m.id.toString() ? 'text-white/60' : 'text-slate-400'}`}>
                                    {m.team}
                                  </span>
                                </div>
                              </div>
                              {selectedUserId === m.id.toString() && <BadgeCheck className="w-4 h-4" />}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Chart */}
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredChartData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={selectedUserId === 'all' ? "#2563eb" : "#f59e0b"} stopOpacity={0.08} />
                      <stop offset="95%" stopColor={selectedUserId === 'all' ? "#2563eb" : "#f59e0b"} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }} tickFormatter={(val) => `Rp${(val / 1000000).toFixed(0)}M`} />
                  <Tooltip
                    cursor={{ stroke: selectedUserId === 'all' ? '#2563eb' : '#f59e0b', strokeWidth: 1 }}
                    contentStyle={{ borderRadius: '10px', border: '1px solid #f1f5f9', padding: '10px 14px', background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                    itemStyle={{ fontWeight: 600, fontSize: '12px', color: '#0f172a' }}
                    labelStyle={{ fontWeight: 500, marginBottom: '4px', color: '#64748b', fontSize: '11px' }}
                    formatter={(value: number) => [`Rp ${value.toLocaleString("id-ID")}`, selectedUserId === 'all' ? 'Team Sales' : 'Member Sales']}
                  />
                  <Area type="monotone" dataKey="sales" stroke={selectedUserId === 'all' ? "#2563eb" : "#f59e0b"} strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* User Rankings Table (Admin only) */}
          {isAdmin && userBreakdown.length > 0 && (
            <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Sales Rankings</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Top performing members</p>
                </div>
                <span className="text-[10px] font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                  Real-time
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="pb-3 text-xs font-medium text-slate-400">Member</th>
                      <th className="pb-3 text-xs font-medium text-slate-400">Division</th>
                      <th className="pb-3 text-xs font-medium text-slate-400">Invoices</th>
                      <th className="pb-3 text-xs font-medium text-slate-400 text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {userBreakdown.map((u, i) => (
                      <tr key={u.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold group-hover:scale-105 transition-transform">
                              {u.name?.split(" ").map((n: string) => n[0]).join("")}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900 leading-none">{u.name}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">Rank #{i + 1}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className="text-xs font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded-md">{u.team}</span>
                        </td>
                        <td className="py-3 text-xs text-slate-500 font-mono">{u.total_invoices}</td>
                        <td className="py-3 text-right">
                          <p className="text-sm font-semibold text-primary font-mono">Rp {Number(u.total_sales).toLocaleString("id-ID")}</p>
                          <div className="flex justify-end mt-1.5">
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="bg-primary h-full rounded-full" style={{ width: `${Math.min((Number(u.total_sales) / (allTimeSales || 1)) * 300, 100)}%` }} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Recent Activity */}
          <div className="bg-slate-900 rounded-xl p-5 text-white shadow-sm flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
                <p className="text-xs text-slate-500 mt-0.5">Latest invoices</p>
              </div>
              <Link to="/invoices" className="w-7 h-7 bg-white/5 rounded-lg flex items-center justify-center hover:bg-primary transition-all border border-white/5">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-1.5 flex-1">
              {latestInvoices.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-4">
                  <FileText className="w-8 h-8 text-white/10 mb-2" />
                  <p className="text-xs text-white/30">No recent activity</p>
                </div>
              ) : (
                latestInvoices.map((inv, i) => (
                  <Link
                    key={i}
                    to={`/invoices/${inv.invoice_number}`}
                    className="flex items-center justify-between p-2.5 bg-white/[0.04] rounded-lg border border-white/[0.04] hover:bg-white/[0.08] transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-md bg-white/5 text-primary flex items-center justify-center text-[10px] font-bold">
                        {inv.team?.[0] || 'S'}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">{inv.invoice_number}</p>
                        <p className="text-[10px] text-white/30">{inv.date?.substring(0, 10)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-white font-mono">Rp {(Number(inv.total_amount) / 1000).toFixed(0)}k</p>
                      <StatusBadge status={inv.status} />
                    </div>
                  </Link>
                ))
              )}
            </div>

            <Link to="/invoices" className="w-full bg-white/5 border border-white/5 rounded-lg py-2.5 mt-4 text-xs font-medium hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-slate-300">
              View All Activity <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
