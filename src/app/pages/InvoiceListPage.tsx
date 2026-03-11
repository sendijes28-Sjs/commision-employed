import { useState } from "react";
import { Link } from "react-router";
import { Plus, Search, Eye, Edit, Trash2 } from "lucide-react";

const invoices = [
  { number: "INV-2024-001", userName: "John Doe", team: "Lelang", customer: "PT Maju Bersama", sales: "Rp 5.230.000", status: "Approved", date: "2024-03-11" },
  { number: "INV-2024-002", userName: "Jane Smith", team: "Shopee", customer: "CV Sejahtera", sales: "Rp 3.450.000", status: "Pending", date: "2024-03-11" },
  { number: "INV-2024-003", userName: "Mike Johnson", team: "Lelang", customer: "UD Berkah Jaya", sales: "Rp 7.890.000", status: "Approved", date: "2024-03-10" },
  { number: "INV-2024-004", userName: "Sarah Williams", team: "Shopee", customer: "PT Surya Abadi", sales: "Rp 2.100.000", status: "Rejected", date: "2024-03-10" },
  { number: "INV-2024-005", userName: "John Doe", team: "Lelang", customer: "CV Karya Mandiri", sales: "Rp 4.560.000", status: "Approved", date: "2024-03-10" },
  { number: "INV-2024-006", userName: "Jane Smith", team: "Shopee", customer: "PT Graha Niaga", sales: "Rp 6.780.000", status: "Pending", date: "2024-03-09" },
  { number: "INV-2024-007", userName: "Mike Johnson", team: "Lelang", customer: "UD Prima Lestari", sales: "Rp 3.200.000", status: "Approved", date: "2024-03-09" },
];

const userNames = ["All Users", "John Doe", "Jane Smith", "Mike Johnson", "Sarah Williams"];

export function InvoiceListPage() {
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("All Teams");
  const [userFilter, setUserFilter] = useState("All Users");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const filtered = invoices.filter((inv) => {
    const matchSearch = inv.number.toLowerCase().includes(search.toLowerCase());
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
          <p className="text-muted-foreground mt-1">Manage all sales invoices</p>
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
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search invoice no..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
          </div>
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="px-3 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          >
            <option>All Teams</option>
            <option>Lelang</option>
            <option>Shopee</option>
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
                <th className="px-4 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">User Name</th>
                <th className="px-4 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">Sales Team</th>
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
                  <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground text-sm">
                    No invoices found matching your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((invoice) => (
                  <tr key={invoice.number} className="hover:bg-secondary/50 transition-colors">
                    <td className="px-4 py-4">
                      <span className="text-primary">{invoice.number}</span>
                    </td>
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
                        className={`inline-flex px-2 py-1 rounded text-xs ${
                          invoice.team === "Lelang"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-orange-50 text-orange-700"
                        }`}
                      >
                        {invoice.team}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm">{invoice.customer}</td>
                    <td className="px-4 py-4 text-sm">{invoice.sales}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex px-2 py-1 rounded text-xs ${
                          invoice.status === "Approved"
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
                        <button className="p-1.5 hover:bg-secondary rounded transition-colors group" title="Edit">
                          <Edit className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                        </button>
                        <button className="p-1.5 hover:bg-red-50 rounded transition-colors group" title="Delete">
                          <Trash2 className="w-4 h-4 text-muted-foreground group-hover:text-destructive" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing {filtered.length} of {invoices.length} invoices</span>
        </div>
      </div>
    </div>
  );
}
