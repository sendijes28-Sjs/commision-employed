 import { useState, useEffect } from "react";
import { StatusBadge } from "../components/StatusBadge.jsx";
import { FileSpreadsheet, TrendingUp, Search, Wallet, CreditCard, Loader2, X, Upload } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import * as XLSX from "xlsx";
import axios from "axios";
import { toast } from "sonner";

import { API_URL } from '@/lib/api.js';


export function CommissionReportPage() {
  const { user } = useAuth();
  const isUserRole = user?.role === "user";

  const [allCommissions, setAllCommissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");

  // Payout State
  const [selectedIds, setSelectedIds] = useState([]);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);
  const [paymentNotes, setPaymentNotes] = useState("");
  const [receiptFile, setReceiptFile] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/commissions`);
      const { data } = res.data;

      const formatted = data.map((inv) => ({
        id: inv.id,
        invoiceNum: inv.invoiceNumber,
        custName: inv.customerName,
        userName: inv.userName,
        team: inv.team,
        sales: "Rp " + (Number(inv.totalAmount) || 0).toLocaleString("id-ID"),
        percentage: inv.commissionPercentage + "%",
        amount: "Rp " + Math.floor(inv.commissionAmount).toLocaleString("id-ID"),
        status: inv.status || 'Pending',
        date: inv.date?.substring(0, 10) || "",
        userId: inv.userId,
      }));

      setAllCommissions(formatted);
    } catch (err) {
      toast.error("Failed to fetch commissions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const commissions = isUserRole
    ? allCommissions.filter((c) => String(c.userId) === String(user?.id))
    : allCommissions;

  const filtered = commissions.filter(c => {
    const matchSearch =
      c.invoiceNum.toLowerCase().includes(search.toLowerCase()) ||
      c.custName.toLowerCase().includes(search.toLowerCase()) ||
      c.userName.toLowerCase().includes(search.toLowerCase());
    const matchMonth = monthFilter === "" || c.date.startsWith(monthFilter);
    const matchTeam = teamFilter === "all" || c.team === teamFilter;
    const matchUser = userFilter === "all" || String(c.userId) === userFilter;
    return matchSearch && matchMonth && matchTeam && matchUser;
  });

  const uniqueUsers = Array.from(new Set(commissions.map(c => c.userId)))
    .map(id => commissions.find(c => c.userId === id))
    .filter(Boolean);

  const totalPaidAmt = filtered
    .filter(c => c.status.toLowerCase() === "paid")
    .reduce((sum, c) => sum + (parseInt(c.amount.replace(/[^0-9]/g, "")) || 0), 0);

  const totalPendingAmt = filtered
    .filter(c => c.status.toLowerCase() === "approved" || c.status.toLowerCase() === "acc" || c.status.toLowerCase() === "pending")
    .reduce((sum, c) => sum + (parseInt(c.amount.replace(/[^0-9]/g, "")) || 0), 0);

  const totalRejectedAmt = filtered
    .filter(c => c.status.toLowerCase() === "rejected")
    .reduce((sum, c) => sum + (parseInt(c.sales.replace(/[^0-9]/g, "")) || 0), 0);

  const handleExport = () => {
    const exportData = filtered.map(c => ({
      "Invoice #": c.invoiceNum,
      "Customer": c.custName,
      "Sales Person": c.userName,
      "Team": c.team,
      "Sales Amount": c.sales,
      "Commission Rate": c.percentage,
      "Commission Amount": c.amount,
      "Status": c.status,
      "Date": c.date,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Commission Ledger");
    XLSX.writeFile(workbook, `Report_Export_${new Date().getTime()}.xlsx`);
  };

  const handleSelectInvoice = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    // BUG-3 FIX: Only select Approved invoices for payout (not Pending)
    const payable = filtered.filter(c => c.status.toLowerCase() === 'approved');
    if (selectedIds.length === payable.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(payable.map(p => p.id));
    }
  };

  const calculateSelectedTotal = () => {
    return filtered
      .filter(c => selectedIds.includes(c.id))
      .reduce((sum, c) => sum + (parseInt(c.amount.replace(/[^0-9]/g, "")) || 0), 0);
  };

  const handlePaySubmit = async () => {
    if (selectedIds.length === 0) return;

    // BUG-4 FIX: Validate all selected invoices belong to same user
    const selectedEntries = filtered.filter(c => selectedIds.includes(c.id));
    const uniqueUserIds = [...new Set(selectedEntries.map(c => c.userId))];
    if (uniqueUserIds.length > 1) {
      toast.error("Cannot process payout for multiple users at once. Please select invoices from a single user.");
      return;
    }

    const targetUserId = uniqueUserIds[0];

    setIsSubmittingPayout(true);
    const formData = new FormData();
    formData.append("userId", String(targetUserId));
    formData.append("invoiceIds", JSON.stringify(selectedIds));
    formData.append("totalAmount", String(calculateSelectedTotal()));
    formData.append("notes", paymentNotes);
    formData.append("paymentDate", new Date().toISOString());
    if (receiptFile) formData.append("receipt", receiptFile);

    try {
      await axios.post(`${API_URL}/payouts`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success("Payments processed successfully!");
      setIsPayModalOpen(false);
      setSelectedIds([]);
      setPaymentNotes("");
      setReceiptFile(null);
      fetchData();
    } catch (err) {
      toast.error("Failed to format payout");
      const detail = err.response?.data?.detail || "";
      toast.error(`Failed to process payment. ${detail}`);
    } finally {
      setIsSubmittingPayout(false);
    }
  };


  return (
    <div className="space-y-6 pb-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Commission Report</h1>
          <p className="text-sm text-slate-500 mt-1">
            {isUserRole ? "Your commission earnings and payout status" : "Commission distributions and payout management"}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {!isUserRole && selectedIds.length > 0 && (
            <button
              onClick={() => setIsPayModalOpen(true)}
              className="bg-emerald-600 text-white px-4 py-2.5 rounded-lg hover:bg-emerald-700 transition-all shadow-sm active:scale-[0.98] flex items-center gap-2 text-xs font-semibold"
            >
              <Wallet className="w-4 h-4" />
              Pay {selectedIds.length} Selected (Rp {calculateSelectedTotal().toLocaleString("id-ID")})
            </button>
          )}
          {!isUserRole && (
            <>
              <select
                value={teamFilter}
                onChange={(e) => { setTeamFilter(e.target.value); setUserFilter("all"); }}
                className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium outline-none focus:border-primary transition-all shadow-sm text-slate-600 appearance-none min-w-[120px]"
              >
                <option value="all">All Teams</option>
                <option value="Lelang">Lelang</option>
                <option value="User">User</option>
                <option value="Offline">Offline</option>
              </select>
              <select
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className="px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium outline-none focus:border-primary transition-all shadow-sm text-slate-600 appearance-none min-w-[140px]"
              >
                <option value="all">All Members</option>
                {uniqueUsers
                  .filter(u => teamFilter === "all" || u?.team === teamFilter)
                  .map(u => (
                    <option key={u?.userId} value={String(u?.userId)}>{u?.userName}</option>
                  ))}
              </select>
            </>
          )}
          <input
            type="month"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="w-36 px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-medium outline-none focus:border-primary transition-all shadow-sm text-slate-600"
          />
          <button
            onClick={handleExport}
            className="bg-slate-900 text-white px-4 py-2.5 rounded-lg hover:bg-slate-800 transition-all shadow-sm active:scale-[0.98] flex items-center gap-2 text-xs font-semibold"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center text-primary border border-blue-100">
              <Wallet className="w-4 h-4" />
            </div>
            <p className="text-xs font-medium text-slate-500">Accumulated</p>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 font-mono">Rp {(totalPaidAmt + totalPendingAmt).toLocaleString("id-ID")}</h3>
          <p className="text-[10px] text-slate-400 mt-1">Combined total earnings</p>
        </div>

        <div className="bg-emerald-600 rounded-xl p-5 text-white shadow-sm">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <p className="text-xs font-medium text-white/60">Paid Out</p>
          </div>
          <h3 className="text-xl font-semibold font-mono">Rp {totalPaidAmt.toLocaleString("id-ID")}</h3>
          <p className="text-xs text-white/40 mt-1">
            {filtered.filter(c => c.status.toLowerCase() === 'paid').length} records
          </p>
        </div>

        <div className="bg-slate-900 rounded-xl p-5 text-white shadow-sm">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center text-primary">
              <TrendingUp className="w-4 h-4" />
            </div>
            <p className="text-xs font-medium text-white/50">Awaiting Payout</p>
          </div>
          <h3 className="text-xl font-semibold font-mono">Rp {totalPendingAmt.toLocaleString("id-ID")}</h3>
          <p className="text-xs text-white/30 mt-1">
            {filtered.filter(c => (c.status.toLowerCase() === 'approved' || c.status.toLowerCase() === 'acc' || c.status.toLowerCase() === 'pending')).length} records
          </p>
        </div>

        <div className="bg-rose-600 rounded-xl p-5 text-white shadow-sm">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center">
              <X className="w-4 h-4" />
            </div>
            <p className="text-xs font-medium text-white/60">Rejected</p>
          </div>
          <h3 className="text-xl font-semibold font-mono">Rp {totalRejectedAmt.toLocaleString("id-ID")}</h3>
          <p className="text-xs text-white/40 mt-1">
            {filtered.filter(c => c.status.toLowerCase() === 'rejected').length} records
          </p>
        </div>
      </div>

      {/* Commission Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-900">Record Details</h2>
          <div className="relative group min-w-[280px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search records..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary focus:bg-white transition-all text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                {!isUserRole && (
                  <th className="px-5 py-3 text-center">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={selectedIds.length > 0 && selectedIds.length === filtered.filter(c => c.status.toLowerCase() === 'approved').length}
                      className="w-4 h-4 rounded cursor-pointer accent-primary"
                    />
                  </th>
                )}
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Invoice #</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Customer</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Sales Person</th>
                {!isUserRole && (
                  <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Team</th>
                )}
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Sales</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Payout</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-slate-500">Date</th>
                <th className="px-5 py-3 text-center text-xs font-medium text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="p-16 text-center">
                    <Loader2 className="w-7 h-7 animate-spin mx-auto text-primary" />
                    <p className="text-xs text-slate-400 mt-3">Loading records...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-16 text-center">
                    <FileSpreadsheet className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-base font-semibold text-slate-900">No records found</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your search query</p>
                  </td>
                </tr>
              ) : (
                filtered.map((entry, idx) => (
                  <tr key={idx} className={`group hover:bg-slate-50/50 transition-colors ${selectedIds.includes(entry.id) ? 'bg-primary/[0.03]' : ''}`}>
                    {!isUserRole && (
                      <td className="px-5 py-3.5 text-center">
                      {/* BUG-3 FIX: Only Approved invoices are selectable for payout */}
                      {(entry.status.toLowerCase() === 'approved') ? (
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(entry.id)}
                            onChange={() => handleSelectInvoice(entry.id)}
                            className="w-4 h-4 rounded cursor-pointer accent-primary"
                          />
                        ) : (
                          <div className="w-1.5 h-1.5 bg-slate-100 rounded-full mx-auto" />
                        )}
                      </td>
                    )}
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-semibold text-slate-900">#{entry.invoiceNum}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-slate-700">{entry.custName}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-semibold text-slate-900">{entry.userName}</p>
                    </td>
                    {!isUserRole && (
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded-md">{entry.team}</span>
                      </td>
                    )}
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-slate-500 font-mono">{entry.sales}</p>
                      <p className="text-[10px] text-primary font-medium mt-0.5">{entry.percentage} rate</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-semibold text-emerald-700 font-mono">{entry.amount}</p>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-400">{entry.date}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-center">
                        <StatusBadge status={entry.status} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-400">{filtered.length} total records</p>
        </div>
      </div>

      {/* Payout Modal */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl border border-slate-100 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Record Payout</h3>
                <p className="text-xs text-white/50 mt-0.5">Disbursing commission to employee</p>
              </div>
              <button onClick={() => setIsPayModalOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-slate-500">Total Disbursement</p>
                  <p className="text-xs font-semibold text-primary">{selectedIds.length} invoices</p>
                </div>
                <h4 className="text-2xl font-bold text-slate-900 font-mono">
                  Rp {calculateSelectedTotal().toLocaleString("id-ID")}
                </h4>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5 ml-0.5">Notes / Payment Reference</label>
                  <textarea
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    placeholder="e.g. BCA Transfer - March Commission Payout"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary transition-all text-sm min-h-[80px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5 ml-0.5">Transfer Receipt (Image)</label>
                  <div className="relative group border-2 border-dashed border-slate-200 rounded-xl p-4 transition-all hover:bg-slate-50 cursor-pointer hover:border-primary/30">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">{receiptFile ? receiptFile.name : "Select Transfer Proof..."}</p>
                        <p className="text-xs text-slate-400 mt-0.5">JPG, PNG, or Screenshot</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsPayModalOpen(false)}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePaySubmit}
                disabled={isSubmittingPayout}
                className="bg-slate-900 text-white px-6 py-2.5 rounded-lg hover:bg-slate-800 transition-all shadow-sm active:scale-[0.98] text-sm font-semibold min-w-[140px] flex items-center justify-center gap-2"
              >
                {isSubmittingPayout ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
