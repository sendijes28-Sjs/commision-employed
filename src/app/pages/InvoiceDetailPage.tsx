import { Link, useParams } from "react-router";
import { ArrowLeft, Printer, AlertTriangle, CheckCircle2, Clock, XCircle } from "lucide-react";

// Mock invoice data — keyed by invoice number
const invoiceData: Record<string, {
  number: string;
  userName: string;
  team: string;
  customer: string;
  date: string;
  status: string;
  items: { id: string; product: string; quantity: number; price: number; bottomPrice: number }[];
}> = {
  "INV-2024-001": {
    number: "INV-2024-001",
    userName: "John Doe",
    team: "Lelang",
    customer: "PT Maju Bersama",
    date: "2024-03-11",
    status: "Approved",
    items: [
      { id: "1", product: "Laptop Asus VivoBook", quantity: 2, price: 1500000, bottomPrice: 1400000 },
      { id: "2", product: "Mouse Wireless Logitech", quantity: 5, price: 95000, bottomPrice: 100000 },
      { id: "3", product: "Keyboard Mechanical", quantity: 3, price: 450000, bottomPrice: 400000 },
    ],
  },
  "INV-2024-002": {
    number: "INV-2024-002",
    userName: "Jane Smith",
    team: "Shopee",
    customer: "CV Sejahtera",
    date: "2024-03-11",
    status: "Pending",
    items: [
      { id: "1", product: "Headset Gaming JBL", quantity: 4, price: 280000, bottomPrice: 300000 },
      { id: "2", product: "Webcam HD Logitech", quantity: 2, price: 350000, bottomPrice: 320000 },
    ],
  },
  "INV-2024-003": {
    number: "INV-2024-003",
    userName: "Mike Johnson",
    team: "Lelang",
    customer: "UD Berkah Jaya",
    date: "2024-03-10",
    status: "Approved",
    items: [
      { id: "1", product: "Monitor Samsung 24\"", quantity: 3, price: 1800000, bottomPrice: 1700000 },
      { id: "2", product: "USB Hub 7-Port", quantity: 10, price: 120000, bottomPrice: 110000 },
      { id: "3", product: "HDMI Cable 2m", quantity: 20, price: 35000, bottomPrice: 30000 },
      { id: "4", product: "Desk Lamp LED", quantity: 5, price: 85000, bottomPrice: 90000 },
    ],
  },
  "INV-2024-004": {
    number: "INV-2024-004",
    userName: "Sarah Williams",
    team: "Shopee",
    customer: "PT Surya Abadi",
    date: "2024-03-10",
    status: "Rejected",
    items: [
      { id: "1", product: "Power Bank 20000mAh", quantity: 6, price: 180000, bottomPrice: 200000 },
      { id: "2", product: "Charging Cable Type-C", quantity: 15, price: 25000, bottomPrice: 30000 },
    ],
  },
  "INV-2024-005": {
    number: "INV-2024-005",
    userName: "John Doe",
    team: "Lelang",
    customer: "CV Karya Mandiri",
    date: "2024-03-10",
    status: "Approved",
    items: [
      { id: "1", product: "SSD 512GB Samsung", quantity: 5, price: 650000, bottomPrice: 600000 },
      { id: "2", product: "RAM DDR4 8GB", quantity: 4, price: 320000, bottomPrice: 300000 },
    ],
  },
  "INV-2024-006": {
    number: "INV-2024-006",
    userName: "Jane Smith",
    team: "Shopee",
    customer: "PT Graha Niaga",
    date: "2024-03-09",
    status: "Pending",
    items: [
      { id: "1", product: "Printer Canon PIXMA", quantity: 2, price: 1200000, bottomPrice: 1100000 },
      { id: "2", product: "Ink Cartridge Black", quantity: 10, price: 95000, bottomPrice: 100000 },
      { id: "3", product: "A4 Paper Ream", quantity: 20, price: 48000, bottomPrice: 45000 },
    ],
  },
  "INV-2024-007": {
    number: "INV-2024-007",
    userName: "Mike Johnson",
    team: "Lelang",
    customer: "UD Prima Lestari",
    date: "2024-03-09",
    status: "Approved",
    items: [
      { id: "1", product: "Smartphone Samsung A54", quantity: 2, price: 850000, bottomPrice: 800000 },
      { id: "2", product: "Phone Case Transparent", quantity: 5, price: 35000, bottomPrice: 30000 },
    ],
  },
};

const statusConfig: Record<string, { icon: React.ElementType; label: string; classes: string }> = {
  Approved: { icon: CheckCircle2, label: "Approved", classes: "bg-green-50 text-green-700 border-green-200" },
  Pending:  { icon: Clock,         label: "Pending",  classes: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  Rejected: { icon: XCircle,       label: "Rejected", classes: "bg-red-50 text-red-700 border-red-200" },
};

const formatRupiah = (val: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);

export function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const invoice = id ? invoiceData[id] : null;

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
  const hasBelowBottomPrice = (item: typeof invoice.items[0]) => item.price < item.bottomPrice;

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
              className={`inline-flex px-2 py-1 rounded text-sm ${
                invoice.team === "Lelang" ? "bg-blue-50 text-blue-700" : "bg-orange-50 text-orange-700"
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
