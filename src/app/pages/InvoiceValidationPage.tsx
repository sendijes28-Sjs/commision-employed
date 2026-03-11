import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Check, X, Eye, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface ValidationInvoice {
  number: string;
  userName: string;
  team: string;
  sales: string;
  hasWarning: boolean;
  submittedBy: string;
  date: string;
  status: "pending" | "approved" | "rejected";
}

// We now fetch data from API

export function InvoiceValidationPage() {
  const [invoices, setInvoices] = useState<ValidationInvoice[]>([]);
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/api/invoices")
      .then(res => res.json())
      .then(data => {
        let formatted: ValidationInvoice[] = data.map((inv: any) => ({
          number: inv.invoice_number,
          userName: inv.user_name || "Unknown User",
          team: inv.team,
          sales: "Rp " + inv.total_amount.toLocaleString("id-ID"),
          hasWarning: Boolean(inv.has_warning),
          submittedBy: inv.user_name || "Unknown User",
          date: inv.date.substring(0, 10),
          status: inv.status.toLowerCase(),
          userId: inv.user_id,
        }));

        // For user role, only show their own invoices
        if (user?.role === "user") {
          formatted = formatted.filter(inv => (inv as any).userId === user.id);
        }

        setInvoices(formatted);
      })
      .catch(err => console.error("Failed to fetch invoices", err))
      .finally(() => setIsLoading(false));
  }, [user]);

  const isUserRole = user?.role === "user";

  const updateStatus = async (number: string, newStatus: string) => {
    try {
      const res = await fetch(`http://localhost:3001/api/invoices/status?number=${encodeURIComponent(number)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error("Failed to update");

      setInvoices((prev) => prev.map((inv) => inv.number === number ? { ...inv, status: newStatus as any } : inv));
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Error updating invoice status.");
    }
  };

  const approve = (number: string) => updateStatus(number, "approved");
  const reject = (number: string) => updateStatus(number, "rejected");

  const pendingCount = invoices.filter((i) => i.status === "pending").length;
  const warningCount = invoices.filter((i) => i.hasWarning && i.status === "pending").length;
  const approvedCount = invoices.filter((i) => i.status === "approved").length;
  const rejectedCount = invoices.filter((i) => i.status === "rejected").length;

  const renderStatusBadge = (status: string) => {
    if (status === "approved") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-green-50 text-green-700">
          <CheckCircle2 className="w-3 h-3" />
          Approved
        </span>
      );
    }
    if (status === "rejected") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-red-50 text-red-700">
          <X className="w-3 h-3" />
          Rejected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-yellow-50 text-yellow-700">
        <Clock className="w-3 h-3" />
        On Review
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>Invoice Validation</h1>
        <p className="text-muted-foreground mt-1">Review and approve or reject pending invoices</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Pending</p>
          <p className="text-2xl text-yellow-600">{pendingCount}</p>
        </div>
        {!isUserRole && (
          <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">With Warnings</p>
            <p className="text-2xl text-orange-600">{warningCount}</p>
          </div>
        )}
        <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Approved</p>
          <p className="text-2xl text-green-600">{approvedCount}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Rejected</p>
          <p className="text-2xl text-red-600">{rejectedCount}</p>
        </div>
      </div>

      {/* Warning Legend - only for admin/super_admin */}
      {!isUserRole && warningCount > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>
            <strong>{warningCount}</strong> pending invoice{warningCount > 1 ? "s" : ""} contain items priced below the minimum bottom price — highlighted below.
          </span>
        </div>
      )}

      {/* Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                <th className="px-4 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">Invoice Number</th>
                <th className="px-4 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">User Name</th>
                {!isUserRole && (
                  <th className="px-4 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">Sales Team</th>
                )}
                <th className="px-4 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">Total Sales</th>
                {!isUserRole && (
                  <th className="px-4 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">Bottom Price Warning</th>
                )}
                <th className="px-4 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">Submitted By</th>
                <th className="px-4 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">
                  {isUserRole ? "Status" : "Actions"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoices.map((invoice) => {
                const isWarningRow = invoice.hasWarning && invoice.status === "pending";
                return (
                  <tr
                    key={invoice.number}
                    className={`transition-colors ${invoice.status === "approved"
                      ? "opacity-60 bg-green-50/40"
                      : invoice.status === "rejected"
                        ? "opacity-60 bg-red-50/40"
                        : isWarningRow && !isUserRole
                          ? "bg-yellow-50/70 hover:bg-yellow-50"
                          : "hover:bg-secondary/50"
                      }`}
                  >
                    {/* Invoice Number */}
                    <td className="px-4 py-4">
                      <span className="text-primary text-sm">{invoice.number}</span>
                    </td>

                    {/* User Name */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">
                          {invoice.userName.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <span className="text-sm">{invoice.userName}</span>
                      </div>
                    </td>

                    {/* Sales Team - hidden for user */}
                    {!isUserRole && (
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex px-2 py-1 rounded text-xs ${invoice.team === "Lelang"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-orange-50 text-orange-700"
                            }`}
                        >
                          {invoice.team}
                        </span>
                      </td>
                    )}

                    {/* Total Sales */}
                    <td className="px-4 py-4 text-sm">{invoice.sales}</td>

                    {/* Bottom Price Warning - hidden for user */}
                    {!isUserRole && (
                      <td className="px-4 py-4">
                        {invoice.hasWarning ? (
                          <div className="flex items-center gap-1.5 text-yellow-700">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                            <span className="text-xs">Below bottom price</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-green-700">
                            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                            <span className="text-xs">No issues</span>
                          </div>
                        )}
                      </td>
                    )}

                    {/* Submitted By */}
                    <td className="px-4 py-4 text-sm">{invoice.submittedBy}</td>

                    {/* Date */}
                    <td className="px-4 py-4 text-muted-foreground text-sm">{invoice.date}</td>

                    {/* Actions / Status */}
                    <td className="px-4 py-4">
                      {isUserRole ? (
                        /* User role: show status badge only */
                        renderStatusBadge(invoice.status)
                      ) : (
                        /* Admin/Super Admin: show action buttons */
                        invoice.status === "pending" ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => approve(invoice.number)}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors text-xs"
                              title="Approve"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Approve
                            </button>
                            <button
                              onClick={() => reject(invoice.number)}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors text-xs"
                              title="Reject"
                            >
                              <X className="w-3.5 h-3.5" />
                              Reject
                            </button>
                            <Link
                              to={`/invoices/${invoice.number}`}
                              className="p-1.5 hover:bg-secondary rounded-lg transition-colors group"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                            </Link>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs ${invoice.status === "approved"
                                ? "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-700"
                                }`}
                            >
                              {invoice.status === "approved" ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                              {invoice.status === "approved" ? "Approved" : "Rejected"}
                            </span>
                            <Link
                              to={`/invoices/${invoice.number}`}
                              className="p-1.5 hover:bg-secondary rounded-lg transition-colors group"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                            </Link>
                          </div>
                        )
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
