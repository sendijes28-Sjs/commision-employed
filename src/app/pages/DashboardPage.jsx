import { useState, useEffect, useMemo } from "react";
import { FileText, TrendingUp, Users, AlertTriangle, ArrowUpRight, Activity, Wallet, ChevronRight, BadgeCheck, XCircle, Search, ChevronDown, Calendar } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import axios from "axios";
import { useAuth } from "../context/AuthContext.jsx";
import { Link } from "react-router";
import { StatusBadge } from "../components/StatusBadge.jsx";

import { API_URL } from '@/lib/api.js';

export function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [latestInvoices, setLatestInvoices] = useState([]);

  const [unpaidCommission, setUnpaidCommission] = useState(0);
  const [paidCommission, setPaidCommission] = useState(0);
  const [allTimeSales, setAllTimeSales] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [teamStats, setTeamStats] = useState([]);

  const [targetLelang, setTargetLelang] = useState(0);
  const [targetUser, setTargetUser] = useState(0);
  const [teamTodaySales, setTeamTodaySales] = useState(0);
  const [todaySales, setTodaySales] = useState(0);
  const [userBreakdown, setUserBreakdown] = useState([]);
  const [userTimeSeries, setUserTimeSeries] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("all");

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, commRes, invRes] = await Promise.all([
          axios.get(`${API_URL}/stats?startDate=${startDate}&endDate=${endDate}`),
          axios.get(`${API_URL}/commissions?startDate=${startDate}&endDate=${endDate}`),
          axios.get(`${API_URL}/invoices?limit=10&startDate=${startDate}&endDate=${endDate}`)
        ]);

        const statsData = statsRes.data;

        setTargetLelang(statsData.targetLelang || 0);
        setTargetUser(statsData.targetUser || 0);
        setTeamTodaySales(statsData.teamTodaySales || 0);
        setTodaySales(statsData.todaySales || 0);
        if (isAdmin) {
          setUserBreakdown(statsData.userBreakdown || []);
          setUserTimeSeries(statsData.userTimeSeries || []);
        }
        const commSummary = commRes.data?.summary || {};

        setAllTimeSales(commSummary.totalSales || 0);
        setUnpaidCommission(Math.floor(commSummary.unpaidCommission || 0));
        setPaidCommission(Math.floor(commSummary.paidCommission || 0));
        
        // Count statuses from full commission data instead of paginated invoices
        const allCommissions = commRes.data?.data || [];
        setPendingCount(allCommissions.filter((c) => c.status.toLowerCase() === 'pending').length);
        setRejectedCount(allCommissions.filter((c) => c.status.toLowerCase() === 'rejected').length);

        if (isAdmin && statsData.teamBreakdown) {
          setTeamStats(statsData.teamBreakdown);
        }

        // Recent invoices for sidebar activity
        const recentInvoices = invRes.data?.data || [];
        setLatestInvoices(recentInvoices.slice(0, 6));

        // Chart data: use userTimeSeries from stats when available (admin),
        // otherwise aggregate from all invoices in date range
        if (isAdmin && statsData.userTimeSeries?.length > 0) {
          const salesByDate = {};
          statsData.userTimeSeries.forEach((pts) => {
            const d = pts.date?.substring(0, 10);
            if (d) salesByDate[d] = (salesByDate[d] || 0) + Number(pts.daily_sales);
          });
          setChartData(Object.keys(salesByDate).sort().map(d => ({
            date: new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short" }),
            sales: salesByDate[d]
          })));
        } else {
          // For regular users, build chart from their invoices
          const salesByDate = {};
          recentInvoices.forEach((inv) => {
            const d = inv.date?.substring(0, 10);
            if (d) salesByDate[d] = (salesByDate[d] || 0) + Number(inv.total_amount);
          });
          setChartData(Object.keys(salesByDate).sort().map(d => ({
            date: new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short" }),
            sales: salesByDate[d]
          })));
        }

      } catch (error) {
        // Error handled silently on dashboard
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAdmin, user?.id, user?.team, startDate, endDate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.user-monitor-dropdown')) {
        setIsDropdownOpen(false);
      }
      if (isDateDropdownOpen && !event.target.closest('.date-filter-dropdown')) {
        setIsDateDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen, isDateDropdownOpen]);

  const filteredMembers = useMemo(() => {
    return userBreakdown
      .filter(u => u.role !== 'admin' && u.role !== 'super_admin' && u.id !== user?.id)
      .filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [userBreakdown, searchTerm, user?.id]);

  const rankingsMembers = useMemo(() => {
    let list = userBreakdown
      .filter(u => u.role !== 'admin' && u.role !== 'super_admin');
    
    if (selectedUserId === 'team_Lelang') {
      list = list.filter(u => u.team === 'Lelang');
    } else if (selectedUserId === 'team_User') {
      list = list.filter(u => u.team === 'User');
    } else if (selectedUserId !== 'all') {
      // filtering by individual user
      list = list.filter(u => u.id.toString() === selectedUserId);
    }
    
    return list.sort((a, b) => Number(b.total_sales) - Number(a.total_sales));
  }, [userBreakdown, selectedUserId]);

  const selectedUser = useMemo(() => {
    if (selectedUserId === "all") return null;
    return userBreakdown.find(u => u.id.toString() === selectedUserId);
  }, [selectedUserId, userBreakdown]);

  const dateRangeLabel = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (startDate === endDate) {
      if (startDate === new Date().toISOString().split('T')[0]) return "Today";
      return start.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
    }
    return `${start.toLocaleDateString("id-ID", { day: "2-digit", month: "short" })} - ${end.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}`;
  }, [startDate, endDate]);

  const filteredChartData = useMemo(() => {
    if (!isAdmin || selectedUserId === "all") return chartData;
    
    const userSalesByDate = {};
    let filteredSeries = [];
    
    if (selectedUserId === "team_Lelang") {
      filteredSeries = userTimeSeries.filter(pts => pts.team === "Lelang");
    } else if (selectedUserId === "team_User") {
      filteredSeries = userTimeSeries.filter(pts => pts.team === "User");
    } else {
      filteredSeries = userTimeSeries.filter(pts => pts.user_id.toString() === selectedUserId);
    }
    
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

  // Build stat cards
  const statCards = [];
  
  if (isAdmin) {
    let salesAmt = 0;
    let targetAmt = 0;
    let label = "Total Revenue";
    
    if (selectedUserId === 'team_Lelang') {
       salesAmt = teamStats.find(t => t.team === 'Lelang')?.total_sales || 0;
       targetAmt = targetLelang;
       label = "Lelang Revenue";
    } else if (selectedUserId === 'team_User') {
       salesAmt = teamStats.find(t => t.team === 'User')?.total_sales || 0;
       targetAmt = targetUser;
       label = "User Revenue";
    } else if (selectedUserId === 'all') {
       salesAmt = todaySales;
       targetAmt = targetLelang + targetUser;
       label = "Overall Revenue";
    } else {
       const userD = userBreakdown.find(u => u.id.toString() === selectedUserId);
       salesAmt = userD ? Number(userD.total_sales) : 0;
       targetAmt = 0; // No target for individual
       label = `${userD?.name?.split(" ")[0]}'s Revenue` || "Revenue";
    }
    
    statCards.push({ 
       label: label, 
       value: targetAmt > 0 ? `Rp ${salesAmt.toLocaleString("id-ID")} / ${targetAmt.toLocaleString("id-ID")}` : `Rp ${salesAmt.toLocaleString("id-ID")}`, 
       progress: targetAmt > 0 ? (salesAmt/targetAmt)*100, 
       icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" 
    });
  } else {
    // Non-admin shows their team's target
    const myTarget = user?.team === 'Lelang' ? targetLelang : (user?.team === 'User' ? targetUser : 0);
    if (myTarget > 0) {
      statCards.push({ label: `Team ${user?.team} Target`, value: `Rp ${teamTodaySales.toLocaleString("id-ID")} / ${myTarget.toLocaleString("id-ID")}`, progress: (teamTodaySales/myTarget)*100, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" });
    }
  }

  statCards.push(
    { label: "Awaiting Payout", value: `Rp ${unpaidCommission.toLocaleString("id-ID")}`, icon: Wallet, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
    { label: "Total Paid", value: `Rp ${paidCommission.toLocaleString("id-ID")}`, icon: BadgeCheck, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
    { label: "Pending Review", value: pendingCount, icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100" },
    { label: "Rejected", value: rejectedCount, icon: XCircle, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" }
  );

  return (
    <div className="space-y-6 pb-10 max-w-7xl mx-auto">
      {/* Header — greeting style */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {getGreeting()}, {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-sm text-slate-500">
          {isAdmin ? "Here's your company performance overview." : "Here's your commission performance."}
        </p>
      </div>

      {/* Toolbar / Filters */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-4 gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Filter Dropdown */}
          <div className="relative date-filter-dropdown">
            <button
              onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-slate-300 transition-all active:scale-[0.98] text-slate-600"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-semibold text-slate-700">{dateRangeLabel}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ml-2 ${isDateDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDateDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl border border-slate-100 shadow-2xl z-[100] p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Today', onClick: () => { const t = new Date().toISOString().split('T')[0]; setStartDate(t); setEndDate(t); setIsDateDropdownOpen(false); } },
                      { label: 'Yesterday', onClick: () => { const y = new Date(); y.setDate(y.getDate() - 1); const d = y.toISOString().split('T')[0]; setStartDate(d); setEndDate(d); setIsDateDropdownOpen(false); } },
                      { label: 'Last 7 Days', onClick: () => { const s = new Date(); s.setDate(s.getDate() - 7); setStartDate(s.toISOString().split('T')[0]); setEndDate(new Date().toISOString().split('T')[0]); setIsDateDropdownOpen(false); } },
                      { label: 'This Month', onClick: () => { const s = new Date(); s.setDate(1); setStartDate(s.toISOString().split('T')[0]); setEndDate(new Date().toISOString().split('T')[0]); setIsDateDropdownOpen(false); } },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        onClick={preset.onClick}
                        className="px-3 py-2 text-[11px] font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-center"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2.5 pt-2 border-t border-slate-50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Custom Range</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <p className="text-[9px] font-medium text-slate-400 mb-1 ml-1">Start Date</p>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:border-primary outline-none transition-all"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-[9px] font-medium text-slate-400 mb-1 ml-1">End Date</p>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:border-primary outline-none transition-all"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => setIsDateDropdownOpen(false)}
                      className="w-full py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-all mt-2"
                    >
                      Apply Filter
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Member filter dropdown (Admin only) */}
          {isAdmin && (
            <div className="relative user-monitor-dropdown">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-slate-300 transition-all active:scale-[0.98]"
              >
                <div className={`w-5 h-5 rounded bg-slate-900 text-white flex items-center justify-center text-[8px] font-bold ${selectedUserId !== 'all' && !selectedUserId.startsWith('team_') ? 'ring-2 ring-primary ring-offset-1' : ''}`}>
                  {selectedUserId === 'all' || selectedUserId.startsWith('team_') ? <Users className="w-3 h-3" /> : selectedUser?.name?.split(" ").map((n) => n[0]).join("")}
                </div>
                <span className="text-xs font-semibold text-slate-700 ml-1">
                  {selectedUserId === 'all' ? 'All Teams' : selectedUserId === 'team_Lelang' ? 'Team Lelang' : selectedUserId === 'team_User' ? 'Team User' : selectedUser?.name}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ml-2 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl border border-slate-100 shadow-xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
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
                    <button
                      onClick={() => { setSelectedUserId("all"); setIsDropdownOpen(false); }}
                      className={`w-full flex items-center justify-between p-2 rounded-lg transition-all ${selectedUserId === 'all' ? 'bg-primary text-white' : 'hover:bg-slate-50 text-slate-900'}`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded flex items-center justify-center ${selectedUserId === 'all' ? 'bg-white/20' : 'bg-slate-100'}`}>
                          <Users className="w-3 h-3" />
                        </div>
                        <span className="text-xs font-semibold">All Teams</span>
                      </div>
                      {selectedUserId === 'all' && <BadgeCheck className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => { setSelectedUserId("team_Lelang"); setIsDropdownOpen(false); }}
                      className={`w-full flex items-center justify-between p-2 rounded-lg transition-all ${selectedUserId === 'team_Lelang' ? 'bg-primary text-white' : 'hover:bg-slate-50 text-slate-900'}`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded flex items-center justify-center ${selectedUserId === 'team_Lelang' ? 'bg-white/20' : 'bg-slate-100'}`}>
                          <Users className="w-3 h-3" />
                        </div>
                        <span className="text-xs font-semibold">Team Lelang</span>
                      </div>
                      {selectedUserId === 'team_Lelang' && <BadgeCheck className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => { setSelectedUserId("team_User"); setIsDropdownOpen(false); }}
                      className={`w-full flex items-center justify-between p-2 rounded-lg transition-all ${selectedUserId === 'team_User' ? 'bg-primary text-white' : 'hover:bg-slate-50 text-slate-900'}`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded flex items-center justify-center ${selectedUserId === 'team_User' ? 'bg-white/20' : 'bg-slate-100'}`}>
                          <Users className="w-3 h-3" />
                        </div>
                        <span className="text-xs font-semibold">Team User</span>
                      </div>
                      {selectedUserId === 'team_User' && <BadgeCheck className="w-3.5 h-3.5" />}
                    </button>

                    <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider px-2 pt-2 pb-1">Members</p>

                    {filteredMembers.map(m => (
                      <button
                        key={m.id}
                        onClick={() => { setSelectedUserId(m.id.toString()); setIsDropdownOpen(false); }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg transition-all ${selectedUserId === m.id.toString() ? 'bg-primary text-white' : 'hover:bg-slate-50 text-slate-900'}`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded flex items-center justify-center text-[8px] font-bold ${selectedUserId === m.id.toString() ? 'bg-white/20' : 'bg-slate-900 text-white'}`}>
                            {m.name?.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <div className="text-left">
                            <p className="text-xs font-semibold leading-none">{m.name}</p>
                            <span className={`text-[9px] font-medium ${selectedUserId === m.id.toString() ? 'text-white/60' : 'text-slate-400'}`}>
                              {m.team}
                            </span>
                          </div>
                        </div>
                        {selectedUserId === m.id.toString() && <BadgeCheck className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="hidden md:flex items-center gap-2 text-[10px] font-medium text-slate-400">
           <Activity className="w-3 h-3 text-emerald-500" />
           <span>Dashboard Live Overview</span>
        </div>
      </div>

      {/* Stat Cards — 5 columns for compactness */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white rounded-xl p-3.5 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className={`w-8 h-8 rounded-lg ${card.bg} ${card.color} flex items-center justify-center border ${card.border}`}>
                <card.icon className="w-3.5 h-3.5" />
              </div>
              <p className="text-[11px] font-medium text-slate-500">{card.label}</p>
            </div>
            <p className={`text-sm md:text-base font-semibold ${card.color} tracking-tight truncate font-mono`}>
              {card.value}
            </p>
            {card.progress !== undefined && (
               <div className="w-full mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
                 <div className={`h-full rounded-full transition-all duration-1000 ease-out ${card.progress >= 100 ? "bg-emerald-500" : "bg-primary"}`} style={{ width: `${Math.min(card.progress, 100)}%` }} />
               </div>
            )}
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
                    formatter={(value) => [`Rp ${value.toLocaleString("id-ID")}`, selectedUserId === 'all' ? 'Team Sales' : 'Member Sales']}
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
                    {rankingsMembers.map((u, i) => (
                      <tr key={u.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold group-hover:scale-105 transition-transform">
                              {u.name?.split(" ").map((n) => n[0]).join("")}
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
                <h3 className="text-sm font-semibold text-white">Invoices Activity</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">{dateRangeLabel}</p>
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

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
