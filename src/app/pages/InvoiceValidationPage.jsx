import { useState, useEffect } from "react";
import { PageHeader } from "../components/PageHeader.jsx";
import { StatusBadge } from "../components/StatusBadge.jsx";
import { Link } from "react-router";
import { Check, X, Eye, AlertTriangle, CheckCircle2, Clock, ShieldCheck, TrendingDown, LayoutGrid, List, ChevronRight, Activity, ShieldAlert, BadgeCheck, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import axios from "axios";

import { API_URL } from '@/lib/api.js';


export function InvoiceValidationPage() {
  const [invoices, setInvoices] = useState([]);
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("table");

  const fetchInvoices = async () => {
    try {
      const res = await axios.get(`${API_URL}/invoices?limit=9999`);
      const rawData = res.data?.data || res.data || [];
      let formatted: ValidationInvoice[] = rawData.map((inv) => ({
        number: inv.invoice_number,
        userName: inv.user_name || "Unknown User",
        team: inv.team,
        sales: "Rp " + (Number(inv.total_amount) || 0).toLocaleString("id-ID"),
        hasWarning: Boolean(inv.has_warning),
        submittedBy: inv.user_name || "Unknown User",
        date: inv.date?.substring(0, 10) || "",
        status: (inv.status || "Pending").toLowerCase(),
        userId: inv.user_id,
      }));

      if (user?.role === "user") {
        formatted = formatted.filter(inv => String(inv.userId) === String(user.id));
      }

      setInvoices(formatted);
    } catch (err) {
      toast.error("Failed to fetch invoices");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [user]);

  const updateStatus = async (number, newStatus) => {
    try {
      await axios.put(`${API_URL}/invoices/status?number=${encodeURIComponent(number)}`, { status: newStatus });
      setInvoices((prev) => prev.map((inv) => inv.number === number ? { ...inv, status: newStatus } : inv));
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const isSuperAdmin = user?.role === 'super_admin';
  const isAdminAtLeast = user?.role === "admin" || user?.role === "super_admin";
  const isUserRole = user?.role === "user";
  const pendingCount = invoices.filter((i) => i.status === "pending").length;
  const warningCount = invoices.filter((i) => i.hasWarning && i.status === "pending").length;
  const totalInvoices = invoices.length;
  const auditScore = totalInvoices === 0 ? 100 : Math.round(((totalInvoices - warningCount) / totalInvoices) * 100);


  return (
    <div className="space-y-6 pb-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Invoice Review</h1>
          <p className="text-sm text-slate-500 mt-1">
            {isUserRole ? "Review your pending submissions." : "Verify invoice status and price compliance."}
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-1 rounded-lg flex items-center gap-0.5 shadow-sm">
          <button
            onClick={() => setViewMode("table")}
            className={`px-3 py-1.5 rounded-md transition-all text-xs font-medium flex items-center gap-1.5 ${viewMode === 'table' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
          >
            <List className="w-3.5 h-3.5" /> Table
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`px-3 py-1.5 rounded-md transition-all text-xs font-medium flex items-center gap-1.5 ${viewMode === 'grid' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Grid
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Pending", value: pendingCount, icon: Clock, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100", desc: "Awaiting approval" },
          { label: "Warnings", value: warningCount, icon: ShieldAlert, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100", desc: "Pricing issues", show: !isUserRole },
          { label: "Processed", value: invoices.filter(i => i.status !== 'pending').length, icon: BadgeCheck, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", desc: "Completed reviews" },
          { label: "Audit Score", value: `${auditScore}%`, icon: Activity, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", desc: "Review accuracy" },
        ].filter(c => c.show !== false).map((card, idx) => (
          <div key={idx} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className={`w-9 h-9 rounded-lg ${card.bg} ${card.color} flex items-center justify-center mb-3 border ${card.border}`}>
              <card.icon className="w-4 h-4" />
            </div>
            <p className="text-xs font-medium text-slate-500 mb-1">{card.label}</p>
            <p className={`text-xl font-semibold ${card.color}`}>{card.value}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{card.desc}</p>
          </div>
        ))}
      </div>

      {/* Warning Banner */}
      {!isUserRole && warningCount > 0 && (
        <div className="bg-rose-600 rounded-xl p-5 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-semibold">Price Discrepancies Detected</h3>
              <p className="text-sm text-white/70 mt-0.5">
                {warningCount} invoices have prices below the required minimum.
              </p>
            </div>
          </div>
          <button className="bg-white text-rose-600 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-white/90 transition-all shadow-sm active:scale-[0.98] flex items-center gap-2">
            Review Discrepancies <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Table View */}
      {viewMode === "table" ? (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Invoice #</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">User</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Amount</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Compliance</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Date</th>
                  <th className="px-5 py-3 text-center text-xs font-medium text-slate-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <tr>
                    <td colSpan={10} className="p-16 text-center">
                      <Loader2 className="w-7 h-7 animate-spin mx-auto text-primary" />
                      <p className="text-xs text-slate-400 mt-3">Loading invoices...</p>
                    </td>
                  </tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-16 text-center">
                      <CheckCircle2 className="w-10 h-10 text-emerald-200 mx-auto mb-3" />
                      <p className="text-base font-semibold text-slate-900">All caught up!</p>
                      <p className="text-xs text-slate-400 mt-1">No pending invoices to review.</p>
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.number} className={`group hover:bg-slate-50/50 transition-colors ${inv.hasWarning && inv.status === 'pending' ? 'bg-rose-50/30' : ''}`}>
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-semibold text-slate-900">#{inv.number}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-900 flex items-center justify-center text-[9px] font-bold group-hover:bg-slate-900 group-hover:text-white transition-all">
                            {inv.userName.split(" ").map(n => n[0]).join("")}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 leading-none">{inv.userName}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{inv.team}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-semibold text-slate-900 font-mono">{inv.sales}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-md border ${
                          inv.hasWarning ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {inv.hasWarning ? 'Warning' : 'Normal'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-400">{inv.date}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-center gap-1.5">
                          {inv.status === 'pending' && isSuperAdmin ? (
                            <>
                              <button
                                onClick={() => updateStatus(inv.number, 'approved')}
                                className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all"
                                title="Approve"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => updateStatus(inv.number, 'rejected')}
                                className="w-8 h-8 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all"
                                title="Reject"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <StatusBadge status={inv.status} />
                          )}
                          <Link to={`/invoices/${inv.number}`} state={{ from: "/invoice-validation" }} className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary hover:bg-blue-50 transition-all">
                            <Eye className="w-4 h-4" />
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
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {isLoading ? (
            <div className="col-span-full p-16 flex flex-col items-center justify-center">
              <Loader2 className="w-7 h-7 animate-spin text-primary" />
              <p className="text-xs text-slate-400 mt-3">Loading invoices...</p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="col-span-full p-16 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-200 mx-auto mb-3" />
              <p className="text-base font-semibold text-slate-900">All caught up!</p>
              <p className="text-xs text-slate-400 mt-1">No pending invoices to review.</p>
            </div>
          ) : (
            invoices.map((inv) => (
              <div key={inv.number} className={`bg-white rounded-xl border transition-all p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 duration-200 ${inv.hasWarning && inv.status === 'pending' ? 'border-rose-200' : 'border-slate-100'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-sm font-semibold text-slate-900">#{inv.number}</span>
                    <p className="text-xs text-slate-400 mt-0.5">{inv.date}</p>
                  </div>
                  <StatusBadge status={inv.status} />
                </div>

                <div className="flex items-center gap-2.5 mb-4 p-3 bg-slate-50 rounded-lg">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 text-slate-900 flex items-center justify-center text-[10px] font-bold shadow-sm">
                    {inv.userName.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 leading-none">{inv.userName}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{inv.team}</p>
                  </div>
                </div>

                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Total Amount</p>
                    <p className="text-base font-semibold text-slate-900 font-mono">{inv.sales}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-md border ${
                    inv.hasWarning ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {inv.hasWarning ? 'Warning' : 'Normal'}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                  {inv.status === 'pending' && isSuperAdmin && (
                    <div className="flex gap-2 flex-1">
                      <button
                        onClick={() => updateStatus(inv.number, 'approved')}
                        className="flex-1 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => updateStatus(inv.number, 'rejected')}
                        className="flex-1 py-2 bg-rose-50 text-rose-700 rounded-lg text-xs font-semibold hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-1.5"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  )}
                  <Link
                    to={`/invoices/${inv.number}`}
                    state={{ from: "/invoice-validation" }}
                    className={`flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-900 hover:text-white transition-all ${inv.status === 'pending' && !isUserRole ? 'w-10 h-9 bg-slate-50' : 'w-full py-2 bg-slate-50 text-xs font-medium gap-2'}`}
                  >
                    {!isUserRole && inv.status === 'pending' ? <Eye className="w-4 h-4" /> : <><Eye className="w-3.5 h-3.5" /> View Details</>}
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
