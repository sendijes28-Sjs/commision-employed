import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Plus, Search, Eye, Edit, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface Invoice {
  number: string;
  userName: string;
  team: string;
  customer: string;
  sales: string;
  status: string;
  date: string;
  userId: number;
}

// We fetch invoices dynamically now
const userNames = ["All Users", "Herman Lelang", "Asep User", "Siti Offline"];

export function InvoiceListPage() {
  const { user } = useAuth();
  const isUserRole = user?.role === "user";

  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("All Teams");
  const [userFilter, setUserFilter] = useState("All Users");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/api/invoices")
      .then((res) => res.json())
      .then((data) => {
        const formatted: Invoice[] = data.map((inv: any) => ({
          number: inv.invoice_number,
          userName: inv.user_name || "Unknown User",
          team: inv.team,
          customer: inv.customer_name,
          sales: "Rp " + inv.total_amount.toLocaleString("id-ID"),
          status: inv.status.charAt(0).toUpperCase() + inv.status.slice(1),
          // format date as YYYY-MM-DD
          date: inv.date.substring(0, 10),
          userId: inv.user_id,
        }));
        setInvoices(formatted);
      })
      .catch((err) => console.error("Failed to fetch invoices", err))
      .finally(() => setIsLoading(false));
  }, []);

  // For user role: only show their own invoices
  const baseInvoices = isUserRole
    ? invoices.filter((inv) => inv.userId === user?.id)
    : invoices;

  const filtered = baseInvoices.filter((inv) => {
    const matchSearch = inv.number.toLowerCase().includes(search.toLowerCase()) ||
      inv.customer.toLowerCase().includes(search.toLowerCase());
    const matchTeam = teamFilter === "All Teams" || inv.team === teamFilter;
    const matchUser = userFilter === "All Users" || inv.userName === userFilter;
    const matchDate = !dateFilter || inv.date === dateFilter;
    const matchStatus = statusFilter === "All Status" || inv.status === statusFilter;
    return matchSearch && matchTeam && matchUser && matchDate && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Invoices</h1>
          <p className="text-muted-foreground mt-1">
            {isUserRole ? "Your submitted invoices" : "Manage all sales invoices"}
          </p>
        </div>
        <Link
          to="/invoices/create"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Invoice
        </Link>
      </div>

      <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
        {/* Filters */}
        <div className={`grid grid-cols-1 gap-3 mb-6 ${isUserRole ? "md:grid-cols-3" : "md:grid-cols-3 lg:grid-cols-5"}`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search invoice or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
          </div>
          {!isUserRole && (
            <>
              <select
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
                className="px-3 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              >
                <option>All Teams</option>
                <option>Lelang</option>
                <option>User</option>
                <option>Offline</option>
              </select>
              <select
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className="px-3 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              >
                {userNames.map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
            </>
          )}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          >
            <option>All Status</option>
            <option>Approved</option>
            <option>Pending</option>
            <option>Rejected</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                <th className="px-4 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">Invoice Number</th>
                {!isUserRole && (
                  <>
                    <th className="px-4 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">User Name</th>
                    <th className="px-4 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">Sales Team</th>
                  </>
                )}
                <th className="px-4 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">Customer Name</th>
                <th className="px-4 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">Total Sales</th>
                <th className="px-4 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={isUserRole ? 6 : 8} className="px-4 py-10 text-center text-muted-foreground text-sm">
                    No invoices found matching your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((invoice) => (
                  <tr key={invoice.number} className="hover:bg-secondary/50 transition-colors">
                    <td className="px-4 py-4">
                      <span className="text-primary">{invoice.number}</span>
                    </td>
                    {!isUserRole && (
                      <>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">
                              {invoice.userName.split(" ").map((n) => n[0]).join("")}
                            </div>
                            <span className="text-sm">{invoice.userName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex px-2 py-1 rounded text-xs ${invoice.team === "Lelang"
                              ? "bg-blue-50 text-blue-700"
                              : invoice.team === "Offline"
                                ? "bg-purple-50 text-purple-700"
                                : "bg-orange-50 text-orange-700"
                              }`}
                          >
                            {invoice.team}
                          </span>
                        </td>
                      </>
                    )}
                    <td className="px-4 py-4 text-sm">{invoice.customer}</td>
                    <td className="px-4 py-4 text-sm">{invoice.sales}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex px-2 py-1 rounded text-xs ${invoice.status === "Approved"
                          ? "bg-green-50 text-green-700"
                          : invoice.status === "Pending"
                            ? "bg-yellow-50 text-yellow-700"
                            : "bg-red-50 text-red-700"
                          }`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground text-sm">{invoice.date}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <Link
                          to={`/invoices/${invoice.number}`}
                          className="p-1.5 hover:bg-blue-50 rounded transition-colors group"
                          title="View Detail"
                        >
                          <Eye className="w-4 h-4 text-muted-foreground group-hover:text-blue-600" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing {filtered.length} of {baseInvoices.length} invoices</span>
        </div>
      </div>
    </div>
  );
}
