import { useState } from "react";
import { Link } from "react-router";
import { Plus, Trash2, AlertTriangle, ArrowLeft } from "lucide-react";

interface InvoiceItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  bottomPrice: number;
}

const users = ["John Doe", "Jane Smith", "Mike Johnson", "Sarah Williams", "David Lee"];

export function CreateInvoicePage() {
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: "1", productName: "", quantity: 1, price: 0, bottomPrice: 500000 },
  ]);

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), productName: "", quantity: 1, price: 0, bottomPrice: 500000 },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length === 1) return;
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const calculateSubtotal = (item: InvoiceItem) => item.quantity * item.price;
  const isBelowBottomPrice = (item: InvoiceItem) => item.price > 0 && item.price < item.bottomPrice;
  const calculateTotal = () => items.reduce((sum, item) => sum + calculateSubtotal(item), 0);
  const hasWarning = items.some(isBelowBottomPrice);

  const formatRupiah = (val: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/invoices" className="p-2 hover:bg-secondary rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1>Create New Invoice</h1>
          <p className="text-muted-foreground mt-1">Fill in the details below to create a new invoice</p>
        </div>
      </div>

      {/* Invoice Information */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
        <h2 className="mb-6">Invoice Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label htmlFor="invoiceNumber" className="block mb-2 text-sm">
              Invoice Number <span className="text-destructive">*</span>
            </label>
            <input
              id="invoiceNumber"
              type="text"
              placeholder="INV-2024-XXX"
              className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
          </div>
          <div>
            <label htmlFor="date" className="block mb-2 text-sm">
              Date <span className="text-destructive">*</span>
            </label>
            <input
              id="date"
              type="date"
              className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
          </div>
          <div>
            <label htmlFor="team" className="block mb-2 text-sm">
              Sales Team <span className="text-destructive">*</span>
            </label>
            <select
              id="team"
              className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            >
              <option value="">Select Team</option>
              <option value="Lelang">Lelang</option>
              <option value="Shopee">Shopee</option>
            </select>
          </div>
          <div>
            <label htmlFor="userName" className="block mb-2 text-sm">
              User Name <span className="text-destructive">*</span>
            </label>
            <select
              id="userName"
              className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            >
              <option value="">Select User</option>
              {users.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-muted-foreground">User responsible for this invoice</p>
          </div>
          <div className="md:col-span-1 lg:col-span-2">
            <label htmlFor="customer" className="block mb-2 text-sm">
              Customer Name <span className="text-destructive">*</span>
            </label>
            <input
              id="customer"
              type="text"
              placeholder="Enter customer name"
              className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
          </div>
        </div>
      </div>

      {/* Invoice Items */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2>Invoice Items</h2>
            <p className="text-muted-foreground text-sm mt-1">Add products to this invoice</p>
          </div>
          <button
            onClick={addItem}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>

        {hasWarning && (
          <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>One or more items are priced below the minimum bottom price. Please review before submitting.</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                <th className="px-4 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">Product Name</th>
                <th className="px-4 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider w-28">Qty</th>
                <th className="px-4 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider w-36">Price (Rp)</th>
                <th className="px-4 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider w-36">Bottom Price (Rp)</th>
                <th className="px-4 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider w-36">Subtotal</th>
                <th className="px-4 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider w-40">Warning</th>
                <th className="px-4 py-3 text-center text-xs text-muted-foreground uppercase tracking-wider w-16">Del</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item, index) => (
                <tr
                  key={item.id}
                  className={`${isBelowBottomPrice(item) ? "bg-yellow-50/60" : ""} transition-colors`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      placeholder={`Product ${index + 1}`}
                      value={item.productName}
                      onChange={(e) => updateItem(item.id, "productName", e.target.value)}
                      className="w-full px-3 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))}
                      className="w-full px-3 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      placeholder="0"
                      value={item.price || ""}
                      onChange={(e) => updateItem(item.id, "price", Number(e.target.value))}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm ${
                        isBelowBottomPrice(item)
                          ? "bg-yellow-50 border-yellow-400 focus:ring-yellow-300"
                          : "bg-input-background border-input focus:ring-ring"
                      }`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={item.bottomPrice}
                      onChange={(e) => updateItem(item.id, "bottomPrice", Number(e.target.value))}
                      className="w-full px-3 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {formatRupiah(calculateSubtotal(item))}
                  </td>
                  <td className="px-4 py-3">
                    {isBelowBottomPrice(item) ? (
                      <div className="flex items-center gap-1.5 text-yellow-700">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        <span className="text-xs">Below bottom price</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={items.length === 1}
                      className="p-1.5 hover:bg-red-50 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed group"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground group-hover:text-destructive" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total & Submit */}
        <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-border pt-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Invoice</p>
            <p className="text-2xl text-primary">{formatRupiah(calculateTotal())}</p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/invoices"
              className="px-6 py-2 border border-input rounded-lg hover:bg-secondary transition-colors text-sm"
            >
              Cancel
            </Link>
            <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm flex items-center gap-2">
              Submit Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
