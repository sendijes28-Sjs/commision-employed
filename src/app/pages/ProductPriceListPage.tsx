import { Plus, Upload, Edit, Trash2, Search } from "lucide-react";

const products = [
  { sku: "SKU-001", name: "Laptop Dell XPS 13", bottomPrice: "$899.00", lastUpdated: "2024-03-10" },
  { sku: "SKU-002", name: "iPhone 15 Pro", bottomPrice: "$999.00", lastUpdated: "2024-03-10" },
  { sku: "SKU-003", name: "Samsung Galaxy S24", bottomPrice: "$799.00", lastUpdated: "2024-03-09" },
  { sku: "SKU-004", name: "MacBook Air M3", bottomPrice: "$1,199.00", lastUpdated: "2024-03-09" },
  { sku: "SKU-005", name: "iPad Pro 12.9\"", bottomPrice: "$1,099.00", lastUpdated: "2024-03-08" },
  { sku: "SKU-006", name: "Sony WH-1000XM5", bottomPrice: "$349.00", lastUpdated: "2024-03-08" },
  { sku: "SKU-007", name: "AirPods Pro 2", bottomPrice: "$249.00", lastUpdated: "2024-03-07" },
];

export function ProductPriceListPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Product Price List</h1>
          <p className="text-muted-foreground mt-1">Manage product bottom prices</p>
        </div>
        <div className="flex gap-3">
          <button className="border border-input px-4 py-2 rounded-lg hover:bg-secondary transition-colors flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import Excel
          </button>
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">Product Name</th>
                <th className="px-6 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">Bottom Price</th>
                <th className="px-6 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">Last Updated</th>
                <th className="px-6 py-3 text-left text-xs text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((product) => (
                <tr key={product.sku} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 rounded bg-secondary text-sm">{product.sku}</span>
                  </td>
                  <td className="px-6 py-4">{product.name}</td>
                  <td className="px-6 py-4 text-primary">{product.bottomPrice}</td>
                  <td className="px-6 py-4 text-muted-foreground">{product.lastUpdated}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1 hover:bg-secondary rounded transition-colors">
                        <Edit className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button className="p-1 hover:bg-secondary rounded transition-colors">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
