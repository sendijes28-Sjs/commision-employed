import { useState, useEffect } from "react";
import { DollarSign, FileText, AlertCircle, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:3001/api";

export function DashboardPage() {
  const { user } = useAuth();
  const isUserRole = user?.role === "user";

  const [isLoading, setIsLoading] = useState(true);
  const [kpis, setKpis] = useState([
    { label: "Total Sales Today", value: "Rp 0", icon: DollarSign, color: "text-primary", bg: "bg-primary/10" },
    { label: "Total Invoices Today", value: "0", icon: FileText, color: "text-success", bg: "bg-success/10" },
    { label: "Pending Invoice Validation", value: "0", icon: AlertCircle, color: "text-warning", bg: "bg-warning/10" },
    { label: "Total Commission This Month", value: "Rp 0", icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
  ]);
  const [chartData, setChartData] = useState<{ date: string; sales: number }[]>([]);
  const [latestInvoices, setLatestInvoices] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get(`${API_URL}/invoices`);
        let allInvoices = response.data || [];

        // If regular user, only show their own invoices
        if (isUserRole) {
          allInvoices = allInvoices.filter((inv: any) => inv.user_id === user?.id);
        }

        const todayRaw = new Date();
        const todayStr = todayRaw.toISOString().split("T")[0]; // YYYY-MM-DD
        
        // Setup Date Logic for "This Month"
        const currentYear = todayRaw.getFullYear();
        const currentMonth = todayRaw.getMonth(); // 0-11

        let totalSales = 0;
        let totalInvoices = allInvoices.length;
        let pendingCount = 0;
        let commissionThisMonth = 0;

        // Chart data: group sales by date from all invoices
        const salesByDate: Record<string, number> = {};

        allInvoices.forEach((inv: any) => {
          const invDate = inv.date?.substring(0, 10);
          const amt = Number(inv.total_amount) || 0;
          const status = inv.status?.toLowerCase() || "";

          // Total Sales (all invoices regardless of status)
          totalSales += amt;

          // Pending
          if (status === "pending" || !status) {
            pendingCount++;
          }

          // Commission This Month (Only calculate on Approved/Paid)
          if (invDate) {
            const dateObj = new Date(invDate);
            if (dateObj.getFullYear() === currentYear && dateObj.getMonth() === currentMonth) {
               if (status === "approved" || status === "paid") {
                  let percentage = 3; // Default
                  if (inv.team === "Lelang") percentage = 5;
                  if (inv.team === "User") percentage = 4.5;
                  if (inv.team === "Offline") percentage = 4;
                  commissionThisMonth += amt * (percentage / 100);
               }
            }
          }

          // Chart: sum all invoice amounts by date
          if (invDate) {
            salesByDate[invDate] = (salesByDate[invDate] || 0) + amt;
          }
        });

        // Sort dates and format chart data
        const sortedDates = Object.keys(salesByDate).sort();
        const formattedChartData = sortedDates.map(dateStr => {
           const d = new Date(dateStr + "T00:00:00");
           return {
             date: d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" }),
             sales: salesByDate[dateStr]
           };
        });

        setKpis([
          { label: "Total Sales", value: "Rp " + totalSales.toLocaleString("id-ID"), icon: DollarSign, color: "text-primary", bg: "bg-primary/10" },
          { label: "Total Invoices", value: totalInvoices.toString(), icon: FileText, color: "text-success", bg: "bg-success/10" },
          { label: "Pending Invoice Validation", value: pendingCount.toString(), icon: AlertCircle, color: "text-warning", bg: "bg-warning/10" },
          { label: "Total Commission This Month", value: "Rp " + commissionThisMonth.toLocaleString("id-ID"), icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
        ]);

        setChartData(formattedChartData);
        
        // Get top 5 newest invoices
        setLatestInvoices(allInvoices.slice(0, 5));

      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [isUserRole, user?.id]);

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading dashboard data...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1>Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">
          {isUserRole ? "Monitor your personal sales performance and commission metrics" : "Monitor company sales performance and commission metrics"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => {
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
            <YAxis stroke="#6b7280" width={80} tickFormatter={(val) => `Rp ${(val / 1000000).toFixed(0)}M`} />
            <Tooltip formatter={(value: number) => `Rp ${value.toLocaleString("id-ID")}`} />
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
              {latestInvoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No recent invoices found.</td>
                </tr>
              ) : (
                latestInvoices.map((invoice) => (
                  <tr key={invoice.invoice_number} className="hover:bg-secondary/50 transition-colors">
                    <td className="px-6 py-4">{invoice.invoice_number}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 rounded bg-secondary text-sm">{invoice.team}</span>
                    </td>
                    <td className="px-6 py-4">Rp {Number(invoice.total_amount).toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 rounded text-sm capitalize ${invoice.status?.toLowerCase() === "approved"
                            ? "bg-success/10 text-success"
                            : invoice.status?.toLowerCase() === "pending"
                              ? "bg-warning/10 text-warning"
                              : "bg-destructive/10 text-destructive"
                          }`}
                      >
                        {invoice.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{invoice.date?.substring(0, 10)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
