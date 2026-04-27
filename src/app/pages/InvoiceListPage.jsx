import { useState, useEffect } from "react";
import { StatusBadge } from "../components/StatusBadge.jsx";
import { Link } from "react-router";
import { Plus, Search, Eye, FileText, ChevronRight, Loader2, Trash2, AlertTriangle } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import axios from "axios";
import { toast } from "sonner";

import { API_URL } from '@/lib/api.js';


export function InvoiceListPage() {
  const { user } = useAuth();
  const isUserRole = user?.role === "user";

  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("All Teams");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Delete confirmation modal
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await axios.get(`${API_URL}/invoices?limit=9999`);
        const rawInvoices = res.data?.data || res.data || [];
        const formatted = rawInvoices.map((inv) => ({
          id: inv.id,
          number: inv.invoice_number,
          userName: inv.user_name || "Unknown User",
          team: inv.team,
          customer: inv.customer_name,
          salesRaw: Number(inv.total_amount) || 0,
          sales: "Rp " + (Number(inv.total_amount) || 0).toLocaleString("id-ID"),
          status: inv.status || "Pending",
          date: inv.date?.substring(0, 10) || "",
          userId: inv.user_id,
          hasWarning: !!inv.has_warning,
        }));
        setInvoices(formatted);
      } catch (err) {
        toast.error("Failed to fetch invoices");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const deleteInvoice = async (id, number) => {
    try {
      await axios.delete(`${API_URL}/invoices/${id}`);
      setInvoices(prev => prev.filter(inv => inv.id !== id));
      toast.success(`Invoice #${number} deleted`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to delete invoice");
    }
  };

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

  useEffect(() => {
    setCurrentPage(1);
  }, [search, teamFilter, statusFilter]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedInvoices = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);


  return (
    <div className="space-y-5 pb-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Invoices</h1>
          <p className="text-sm text-slate-500 mt-1">
            {isUserRole ? "Your transaction history" : "Manage and track all invoices"}
          </p>
        </div>
        <Link
          to="/invoices/create"
          className="bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-all text-xs font-semibold active:scale-[0.98] shadow-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Invoice
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-3">
        <div className="flex-1 relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search by invoice # or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary focus:bg-white transition-all text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          {!isUserRole && (
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg outline-none text-xs font-medium text-slate-600 shadow-sm"
            >
              <option>All Teams</option>
              <option>Lelang</option>
              <option>User</option>
              <option>Offline</option>
            </select>
          )}

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg outline-none text-xs font-medium text-slate-600 shadow-sm"
          >
            <option>All Status</option>
            <option>Approved</option>
            <option>Pending</option>
            <option>Rejected</option>
          </select>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Invoice #</th>
                {!isUserRole && (
                  <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">User</th>
                )}
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Customer</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Amount</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Date</th>
                <th className="px-5 py-3 text-center text-xs font-medium text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="px-10 py-20 text-center">
                    <Loader2 className="w-7 h-7 animate-spin mx-auto text-primary" />
                    <p className="text-xs text-slate-400 mt-3">Loading invoices...</p>
                  </td>
                </tr>
              ) : paginatedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-10 py-20 text-center">
                    <FileText className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-base font-semibold text-slate-900">No records found</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filters</p>
                    <Link to="/invoices/create" className="inline-flex items-center gap-1.5 mt-4 text-xs font-semibold text-primary hover:underline">
                      <Plus className="w-3.5 h-3.5" /> Create first invoice
                    </Link>
                  </td>
                </tr>
              ) : (
                paginatedInvoices.map((invoice) => (
                  <tr key={invoice.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">#{invoice.number}</span>
                        {invoice.hasWarning && (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" title="Low margin items detected" />
                        )}
                      </div>
                    </td>
                    {!isUserRole && (
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[9px] font-bold">
                            {invoice.userName.split(" ").map(n => n[0]).join("")}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 leading-none">{invoice.userName}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{invoice.team}</p>
                          </div>
                        </div>
                      </td>
                    )}
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-slate-600 truncate max-w-[180px]">{invoice.customer}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-semibold text-slate-900 font-mono">{invoice.sales}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={invoice.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-slate-400">{invoice.date}</span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link
                          to={`/invoices/${invoice.number}`}
                          className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 hover:text-primary hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        {!isUserRole && invoice.status.toLowerCase() === 'pending' && (
                          <button
                            onClick={() => setDeleteTarget(invoice)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            Showing {filtered.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}–{Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-primary hover:border-primary disabled:opacity-40 transition-all cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5 rotate-180" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let page;
              if (totalPages <= 5) {
                page = i + 1;
              } else if (currentPage <= 3) {
                page = i + 1;
              } else if (currentPage >= totalPages - 2) {
                page = totalPages - 4 + i;
              } else {
                page = currentPage - 2 + i;
              }
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer ${page === currentPage ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-white border border-transparent hover:border-slate-200'}`}
                >
                  {page}
                </button>
              );
            })}
            {totalPages === 0 && (
              <button className="w-8 h-8 rounded-lg text-xs font-semibold bg-slate-900 text-white cursor-default">1</button>
            )}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-primary hover:border-primary disabled:opacity-40 transition-all cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal (replaces window.confirm) */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl border border-slate-100 w-full max-w-sm overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-5 h-5 text-rose-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Delete Invoice</h3>
              <p className="text-sm text-slate-500">
                Are you sure you want to delete <span className="font-semibold text-slate-700">#{deleteTarget.number}</span>? This action cannot be undone.
              </p>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 text-sm font-medium text-slate-600 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteInvoice(deleteTarget.id, deleteTarget.number)}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-rose-500 rounded-lg hover:bg-rose-600 transition-all active:scale-[0.98]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
