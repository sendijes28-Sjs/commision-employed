import { useState, useEffect } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, Printer, AlertTriangle, CheckCircle2, Clock, XCircle, Loader2 } from "lucide-react";

interface InvoiceDetailType {
  number: string;
  userName: string;
  team: string;
  customer: string;
  date: string;
  status: string;
  items: { id: string; product: string; quantity: number; price: number; bottomPrice: number }[];
}

const statusConfig: Record<string, { icon: React.ElementType; label: string; classes: string }> = {
  Approved: { icon: CheckCircle2, label: "Approved", classes: "bg-green-50 text-green-700 border-green-200" },
  Pending: { icon: Clock, label: "Pending", classes: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  Rejected: { icon: XCircle, label: "Rejected", classes: "bg-red-50 text-red-700 border-red-200" },
};

const formatRupiah = (val: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);

export function InvoiceDetailPage() {
  const params = useParams();
  const id = params["*"] || "";
  const [invoice, setInvoice] = useState<InvoiceDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    fetch(`http://localhost:3001/api/invoice-detail?id=${encodeURIComponent(id)}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setInvoice(null);
        } else {
          setInvoice({
            number: data.invoice_number,
            userName: data.user_name || "Unknown User",
            team: data.team,
            customer: data.customer_name,
            date: data.date.substring(0, 10),
            status: data.status.charAt(0).toUpperCase() + data.status.slice(1),
            items: data.items.map((it: any) => ({
              id: it.id.toString(),
              product: it.product_name,
              quantity: it.quantity,
              price: it.price,
              bottomPrice: it.bottom_price
            }))
          });
        }
      })
      .catch(err => {
        console.error("Failed to fetch invoice details:", err);
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/invoices" className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1>Invoice Detail</h1>
        </div>
        <div className="bg-card rounded-xl p-12 border border-border shadow-sm text-center">
          <p className="text-muted-foreground">Invoice <strong>{id}</strong> not found.</p>
          <Link to="/invoices" className="mt-4 inline-block text-primary hover:underline text-sm">
            ← Back to Invoices
          </Link>
        </div>
      </div>
    );
  }

  const StatusIcon = statusConfig[invoice.status]?.icon ?? Clock;
  const statusClasses = statusConfig[invoice.status]?.classes ?? "bg-secondary text-foreground border-border";

  const subtotals = invoice.items.map((item) => item.quantity * item.price);
  const totalSales = subtotals.reduce((a, b) => a + b, 0);
  const hasBelowBottomPrice = (item: typeof invoice.items[0]) => item.bottomPrice > 0 && item.price < item.bottomPrice;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/invoices" className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1>Invoice Detail</h1>
            <p className="text-muted-foreground mt-1">{invoice.number}</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-input rounded-lg hover:bg-secondary transition-colors text-sm">
          <Printer className="w-4 h-4" />
          Print Invoice
        </button>
      </div>

      {/* Invoice Info Card */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-lg">Invoice Information</h2>
          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm ${statusClasses}`}>
            <StatusIcon className="w-4 h-4" />
            {invoice.status}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Invoice Number</p>
            <p className="text-primary">{invoice.number}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">User Name</p>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">
                {invoice.userName.split(" ").map((n) => n[0]).join("")}
              </div>
              <span>{invoice.userName}</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Sales Team</p>
            <span
              className={`inline-flex px-2 py-1 rounded text-sm ${invoice.team === "Lelang" ? "bg-blue-50 text-blue-700" : "bg-orange-50 text-orange-700"
                }`}
            >
              {invoice.team}
            </span>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Customer Name</p>
            <p>{invoice.customer}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Date</p>
            <p>{invoice.date}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Invoice Status</p>
            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded border text-sm ${statusClasses}`}>
              <StatusIcon className="w-3.5 h-3.5" />
              {invoice.status}
            </span>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
        <h2 className="mb-6">Items</h2>

        {invoice.items.some(hasBelowBottomPrice) && (
          <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>This invoice contains items priced below the minimum bottom price.</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                <th className="px-4 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">#</th>
                <th className="px-4 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">Product Name</th>
                <th className="px-4 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider w-24">Qty</th>
                <th className="px-4 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider w-36">Price</th>
                <th className="px-4 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider w-36">Bottom Price</th>
                <th className="px-4 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider w-36">Subtotal</th>
                <th className="px-4 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider w-40">Warning Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoice.items.map((item, index) => {
                const subtotal = item.quantity * item.price;
                const belowBottom = hasBelowBottomPrice(item);
                return (
                  <tr
                    key={item.id}
                    className={`${belowBottom ? "bg-yellow-50/60" : "hover:bg-secondary/30"} transition-colors`}
                  >
                    <td className="px-4 py-4 text-muted-foreground text-sm">{index + 1}</td>
                    <td className="px-4 py-4 text-sm">{item.product}</td>
                    <td className="px-4 py-4 text-sm">{item.quantity}</td>
                    <td className="px-4 py-4 text-sm">{formatRupiah(item.price)}</td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">{formatRupiah(item.bottomPrice)}</td>
                    <td className="px-4 py-4 text-sm">{formatRupiah(subtotal)}</td>
                    <td className="px-4 py-4">
                      {belowBottom ? (
                        <div className="flex items-center gap-1.5 text-yellow-700">
                          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                          <span className="text-xs">Below bottom price</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-green-700">
                          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                          <span className="text-xs">OK</span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="mt-6 flex justify-end border-t border-border pt-6">
          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-1">Total Sales</p>
            <p className="text-2xl text-primary">{formatRupiah(totalSales)}</p>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="flex justify-start pb-4">
        <Link
          to="/invoices"
          className="px-6 py-2 border border-input rounded-lg hover:bg-secondary transition-colors text-sm"
        >
          ← Back to Invoice List
        </Link>
      </div>
    </div>
  );
}
