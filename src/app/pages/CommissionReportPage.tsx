import { useState, useEffect } from "react";
import { Download, Calendar, Users, Clock, DollarSign } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface CommissionEntry {
  invoiceNum: string;
  custName: string;
  team: string;
  sales: string;
  percentage: string;
  amount: string;
  status: string;
  date: string;
  userId: number;
}

// We now fetch data from API

export function CommissionReportPage() {
  const { user } = useAuth();
  const isUserRole = user?.role === "user";

  const [allCommissions, setAllCommissions] = useState<CommissionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/api/invoices")
      .then(res => res.json())
      .then(data => {
        let formatted: CommissionEntry[] = data.map((inv: any) => {
          let percentage = 3; // Default
          if (inv.team === "Lelang") percentage = 5;
          if (inv.team === "User") percentage = 4.5;
          if (inv.team === "Offline") percentage = 4;

          const amount = inv.total_amount * (percentage / 100);

          return {
            invoiceNum: inv.invoice_number,
            custName: inv.customer_name,
            team: inv.team,
            sales: "Rp " + inv.total_amount.toLocaleString("id-ID"),
            percentage: percentage + "%",
            amount: "Rp " + amount.toLocaleString("id-ID"),
            status: inv.status?.toLowerCase() === "approved" ? "Paid" : "Pending", // Compare case-insensitively
            date: inv.date.substring(0, 10),
            userId: inv.user_id,
          };
        });

        setAllCommissions(formatted);
      })
      .catch(err => console.error("Failed to fetch commissions", err))
      .finally(() => setIsLoading(false));
  }, []);

  // For user role: filter to only show their own data
  const commissions = isUserRole
    ? allCommissions.filter((c) => c.userId === user?.id)
    : allCommissions;

  // Admin summary cards
  const paidCount = commissions.filter((c) => c.status === "Paid").length;
  const pendingCount = commissions.filter((c) => c.status === "Pending").length;
  const totalCommission = commissions.reduce((sum, c) => {
    const num = parseInt(c.amount.replace(/[^0-9]/g, ""), 10) || 0;
    return sum + num;
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Commission Reports</h1>
          <p className="text-muted-foreground mt-1">
            {isUserRole ? "Your personal commission history" : "Track employee commission calculations"}
          </p>
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export to Excel
        </button>
      </div>

      {/* Admin/Super Admin Summary Cards */}
      {!isUserRole && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl p-5 border border-border shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Paid</p>
              <p className="text-2xl font-semibold text-green-600">{paidCount}</p>
            </div>
          </div>
          <div className="bg-card rounded-xl p-5 border border-border shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Pending</p>
              <p className="text-2xl font-semibold text-yellow-600">{pendingCount}</p>
            </div>
          </div>
          <div className="bg-card rounded-xl p-5 border border-border shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Commission</p>
              <p className="text-2xl font-semibold text-blue-600">Rp {totalCommission.toLocaleString("id-ID")}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2 bg-secondary rounded-lg p-1">
            <button className="px-4 py-2 bg-card rounded-md shadow-sm transition-colors">Daily</button>
            <button className="px-4 py-2 hover:bg-card rounded-md transition-colors">Weekly</button>
            <button className="px-4 py-2 hover:bg-card rounded-md transition-colors">Monthly</button>
          </div>
          <div className="relative flex-1 max-w-xs">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="date"
              className="w-full pl-10 pr-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">Invoice Num</th>
                <th className="px-6 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">Customer Name</th>
                {!isUserRole && (
                  <>
                    <th className="px-6 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">Sales Team</th>
                    <th className="px-6 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">Total Sales</th>
                    <th className="px-6 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">Commission %</th>
                  </>
                )}
                <th className="px-6 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">Commission Amount</th>
                <th className="px-6 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {commissions.length === 0 ? (
                <tr>
                  <td colSpan={isUserRole ? 5 : 8} className="px-6 py-12 text-center text-muted-foreground">
                    No commission data found.
                  </td>
                </tr>
              ) : (
                commissions.map((commission, index) => (
                  <tr key={index} className="hover:bg-secondary/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-primary text-sm">{commission.invoiceNum}</span>
                    </td>
                    <td className="px-6 py-4 text-sm">{commission.custName}</td>
                    {!isUserRole && (
                      <>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-2 py-1 rounded bg-secondary">{commission.team}</span>
                        </td>
                        <td className="px-6 py-4">{commission.sales}</td>
                        <td className="px-6 py-4 text-muted-foreground">{commission.percentage}</td>
                      </>
                    )}
                    <td className="px-6 py-4 text-primary">{commission.amount}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 rounded text-sm ${commission.status === "Paid"
                          ? "bg-success/10 text-success"
                          : "bg-warning/10 text-warning"
                          }`}
                      >
                        {commission.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{commission.date}</td>
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
