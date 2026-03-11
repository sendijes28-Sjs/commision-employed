import { DollarSign, FileText, AlertCircle, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const kpiData = [
  { label: "Total Sales Today", value: "$45,230", icon: DollarSign, color: "text-primary", bg: "bg-primary/10" },
  { label: "Total Invoices Today", value: "28", icon: FileText, color: "text-success", bg: "bg-success/10" },
  { label: "Pending Invoice Validation", value: "7", icon: AlertCircle, color: "text-warning", bg: "bg-warning/10" },
  { label: "Total Commission This Month", value: "$8,450", icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
];

const chartData = [
  { date: "Mon", sales: 12000 },
  { date: "Tue", sales: 19000 },
  { date: "Wed", sales: 15000 },
  { date: "Thu", sales: 25000 },
  { date: "Fri", sales: 22000 },
  { date: "Sat", sales: 30000 },
  { date: "Sun", sales: 28000 },
];

const invoices = [
  { number: "INV-2024-001", team: "Lelang", sales: "$5,230", status: "Approved", date: "2024-03-11" },
  { number: "INV-2024-002", team: "Shopee", sales: "$3,450", status: "Pending", date: "2024-03-11" },
  { number: "INV-2024-003", team: "Lelang", sales: "$7,890", status: "Approved", date: "2024-03-10" },
  { number: "INV-2024-004", team: "Shopee", sales: "$2,100", status: "Rejected", date: "2024-03-10" },
  { number: "INV-2024-005", team: "Lelang", sales: "$4,560", status: "Approved", date: "2024-03-10" },
];

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1>Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">Monitor your sales performance and commission metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-card rounded-xl p-6 border border-border shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{kpi.label}</p>
                  <p className="text-3xl mt-2">{kpi.value}</p>
                </div>
                <div className={`${kpi.bg} ${kpi.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
        <h2 className="mb-6">Sales Performance</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip />
            <Line type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2>Latest Invoices</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">Invoice Number</th>
                <th className="px-6 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">Sales Team</th>
                <th className="px-6 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">Total Sales</th>
                <th className="px-6 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoices.map((invoice) => (
                <tr key={invoice.number} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-6 py-4">{invoice.number}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 rounded bg-secondary text-sm">{invoice.team}</span>
                  </td>
                  <td className="px-6 py-4">{invoice.sales}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 rounded text-sm ${
                        invoice.status === "Approved"
                          ? "bg-success/10 text-success"
                          : invoice.status === "Pending"
                          ? "bg-warning/10 text-warning"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{invoice.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
