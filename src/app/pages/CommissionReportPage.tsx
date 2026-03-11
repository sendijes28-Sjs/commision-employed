import { Download, Calendar } from "lucide-react";

const commissions = [
  { team: "Lelang", sales: "$45,230", percentage: "5%", amount: "$2,261.50", status: "Paid", date: "2024-03-11" },
  { team: "Shopee", sales: "$38,450", percentage: "4.5%", amount: "$1,730.25", status: "Pending", date: "2024-03-11" },
  { team: "Lelang", sales: "$52,890", percentage: "5%", amount: "$2,644.50", status: "Paid", date: "2024-03-10" },
  { team: "Shopee", sales: "$41,200", percentage: "4.5%", amount: "$1,854.00", status: "Paid", date: "2024-03-10" },
  { team: "Lelang", sales: "$48,560", percentage: "5%", amount: "$2,428.00", status: "Paid", date: "2024-03-09" },
  { team: "Shopee", sales: "$36,780", percentage: "4.5%", amount: "$1,655.10", status: "Paid", date: "2024-03-09" },
];

export function CommissionReportPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Commission Reports</h1>
          <p className="text-muted-foreground mt-1">Track employee commission calculations</p>
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export to Excel
        </button>
      </div>

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
                <th className="px-6 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">Sales Team</th>
                <th className="px-6 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">Total Sales</th>
                <th className="px-6 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">Commission %</th>
                <th className="px-6 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">Commission Amount</th>
                <th className="px-6 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {commissions.map((commission, index) => (
                <tr key={index} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 rounded bg-secondary">{commission.team}</span>
                  </td>
                  <td className="px-6 py-4">{commission.sales}</td>
                  <td className="px-6 py-4 text-muted-foreground">{commission.percentage}</td>
                  <td className="px-6 py-4 text-primary">{commission.amount}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 rounded text-sm ${
                        commission.status === "Paid"
                          ? "bg-success/10 text-success"
                          : "bg-warning/10 text-warning"
                      }`}
                    >
                      {commission.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{commission.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
