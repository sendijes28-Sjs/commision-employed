import { useState } from "react";
import { Link } from "react-router";
import { Check, X, Eye, AlertTriangle, CheckCircle2 } from "lucide-react";

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

const initialInvoices: ValidationInvoice[] = [
  { number: "INV-2024-002", userName: "Jane Smith",     team: "Shopee", sales: "Rp 3.450.000", hasWarning: false, submittedBy: "Jane Smith",     date: "2024-03-11", status: "pending" },
  { number: "INV-2024-006", userName: "Jane Smith",     team: "Shopee", sales: "Rp 6.780.000", hasWarning: true,  submittedBy: "Jane Smith",     date: "2024-03-09", status: "pending" },
  { number: "INV-2024-008", userName: "Mike Johnson",   team: "Lelang", sales: "Rp 5.120.000", hasWarning: true,  submittedBy: "Mike Johnson",   date: "2024-03-08", status: "pending" },
  { number: "INV-2024-010", userName: "Sarah Williams", team: "Shopee", sales: "Rp 4.230.000", hasWarning: false, submittedBy: "Sarah Williams", date: "2024-03-07", status: "pending" },
  { number: "INV-2024-012", userName: "John Doe",       team: "Lelang", sales: "Rp 7.850.000", hasWarning: true,  submittedBy: "John Doe",       date: "2024-03-07", status: "pending" },
  { number: "INV-2024-014", userName: "David Lee",      team: "Shopee", sales: "Rp 2.910.000", hasWarning: false, submittedBy: "David Lee",      date: "2024-03-06", status: "pending" },
];

export function InvoiceValidationPage() {
  const [invoices, setInvoices] = useState<ValidationInvoice[]>(initialInvoices);

  const approve = (number: string) => {
    setInvoices((prev) => prev.map((inv) => inv.number === number ? { ...inv, status: "approved" } : inv));
  };

  const reject = (number: string) => {
    setInvoices((prev) => prev.map((inv) => inv.number === number ? { ...inv, status: "rejected" } : inv));
  };

  const pendingCount  = invoices.filter((i) => i.status === "pending").length;
  const warningCount  = invoices.filter((i) => i.hasWarning && i.status === "pending").length;
  const approvedCount = invoices.filter((i) => i.status === "approved").length;
  const rejectedCount = invoices.filter((i) => i.status === "rejected").length;

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
        <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">With Warnings</p>
          <p className="text-2xl text-orange-600">{warningCount}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Approved</p>
          <p className="text-2xl text-green-600">{approvedCount}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Rejected</p>
          <p className="text-2xl text-red-600">{rejectedCount}</p>
        </div>
      </div>

      {/* Warning Legend */}
      {warningCount > 0 && (
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
                <th className="px-4 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">Sales Team</th>
                <th className="px-4 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">Total Sales</th>
                <th className="px-4 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">Bottom Price Warning</th>
                <th className="px-4 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">Submitted By</th>
                <th className="px-4 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoices.map((invoice) => {
                const isWarningRow = invoice.hasWarning && invoice.status === "pending";
                return (
                  <tr
                    key={invoice.number}
                    className={`transition-colors ${
                      invoice.status === "approved"
                        ? "opacity-60 bg-green-50/40"
                        : invoice.status === "rejected"
                        ? "opacity-60 bg-red-50/40"
                        : isWarningRow
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

                    {/* Sales Team */}
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex px-2 py-1 rounded text-xs ${
                          invoice.team === "Lelang"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-orange-50 text-orange-700"
                        }`}
                      >
                        {invoice.team}
                      </span>
                    </td>

                    {/* Total Sales */}
                    <td className="px-4 py-4 text-sm">{invoice.sales}</td>

                    {/* Bottom Price Warning */}
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

                    {/* Submitted By */}
                    <td className="px-4 py-4 text-sm">{invoice.submittedBy}</td>

                    {/* Date */}
                    <td className="px-4 py-4 text-muted-foreground text-sm">{invoice.date}</td>

                    {/* Actions */}
                    <td className="px-4 py-4">
                      {invoice.status === "pending" ? (
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
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs ${
                              invoice.status === "approved"
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
