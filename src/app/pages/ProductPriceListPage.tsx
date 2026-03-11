import { useState, useRef } from "react";
import { Plus, Upload, Edit, Trash2, Search, FileText, CheckCircle2, AlertTriangle, X } from "lucide-react";

interface Product {
  sku: string;
  name: string;
  bottomPrice: string;
  lastUpdated: string;
}

const initialProducts: Product[] = [
  { sku: "SKU-001", name: "LIST PLAT GOLD PEREKAT 50M - 2 CM", bottomPrice: "Rp 150.000", lastUpdated: "2024-03-10" },
  { sku: "SKU-002", name: "LIST PLAT GOLD PEREKAT 50M - 3 CM", bottomPrice: "Rp 250.000", lastUpdated: "2024-03-10" },
  { sku: "SKU-003", name: "LIST PLATBLACK PEREKAT50M(2CM)", bottomPrice: "Rp 150.000", lastUpdated: "2024-03-09" },
];

interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: string[];
}

function parsePrice(raw: string): number {
  if (!raw || typeof raw !== "string") return 0;
  // Remove "Rp", spaces, dots (thousands separator) and replace comma with dot for decimals
  const cleaned = raw.replace(/Rp/gi, "").replace(/\s/g, "").replace(/\./g, "").replace(/,/g, ".");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function formatPrice(num: number): string {
  return "Rp " + num.toLocaleString("id-ID");
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let current = "";
  let inQuotes = false;
  let row: string[] = [];

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        row.push(current.trim());
        current = "";
      } else if (ch === "\n" || (ch === "\r" && next === "\n")) {
        row.push(current.trim());
        current = "";
        rows.push(row);
        row = [];
        if (ch === "\r") i++;
      } else {
        current += ch;
      }
    }
  }
  // Last row
  if (current || row.length > 0) {
    row.push(current.trim());
    rows.push(row);
  }
  return rows;
}

function extractProductsFromCSV(csvRows: string[][]): { name: string; price: number }[] {
  const products: { name: string; price: number }[] = [];

  // The CSV has multiple "NAMA BARANG" / "HARGA" column pairs scattered.
  // Strategy: scan headers (first 2 rows) to find all pairs of "NAMA BARANG" + "HARGA" columns,
  // then extract data from those.

  // Identify potential name/price column pairs from the first few header rows
  const headerRows = csvRows.slice(0, 3);
  const pairs: { nameCol: number; priceCol: number }[] = [];

  for (const headerRow of headerRows) {
    for (let c = 0; c < headerRow.length; c++) {
      const cell = headerRow[c].toUpperCase().trim();
      if (cell.includes("NAMA BARANG") || cell.includes("NAMA")) {
        // Look for a "HARGA" column nearby (next 1-2 cols)
        for (let p = c + 1; p < Math.min(c + 3, headerRow.length); p++) {
          const priceCell = headerRow[p].toUpperCase().trim();
          if (priceCell.includes("HARGA") || priceCell === "HARGA") {
            // Check this pair isn't already registered
            const exists = pairs.some((pair) => pair.nameCol === c && pair.priceCol === p);
            if (!exists) {
              pairs.push({ nameCol: c, priceCol: p });
            }
            break;
          }
        }
      }
    }
  }

  // If no pairs found, try columns 0 and 1 as fallback
  if (pairs.length === 0) {
    pairs.push({ nameCol: 0, priceCol: 1 });
  }

  // Extract data from all rows (skip header rows)
  const dataRows = csvRows.slice(2);
  for (const row of dataRows) {
    for (const pair of pairs) {
      const name = row[pair.nameCol]?.trim() || "";
      const priceRaw = row[pair.priceCol]?.trim() || "";
      if (name && name.length > 1 && !name.toUpperCase().includes("NAMA BARANG") && !name.toUpperCase().includes("HARGA USER")) {
        const price = parsePrice(priceRaw);
        if (price > 0) {
          products.push({ name, price });
        }
      }
    }
  }

  return products;
}

export function ProductPriceListPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const text = await file.text();
      const csvRows = parseCSV(text);
      const extracted = extractProductsFromCSV(csvRows);

      if (extracted.length === 0) {
        setImportResult({
          success: false,
          imported: 0,
          skipped: 0,
          errors: ["No valid products found in the CSV. Make sure the file has 'NAMA BARANG' and 'HARGA' columns."],
        });
        setIsImporting(false);
        return;
      }

      // Send to backend
      const response = await fetch("http://localhost:3001/api/products/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: extracted }),
      });

      if (response.ok) {
        const result = await response.json();
        setImportResult({
          success: true,
          imported: result.imported || extracted.length,
          skipped: result.skipped || 0,
          errors: [],
        });

        // Refresh products list
        const refreshed = await fetch("http://localhost:3001/api/products");
        if (refreshed.ok) {
          const data = await refreshed.json();
          setProducts(
            data.map((p: any, i: number) => ({
              sku: `SKU-${String(p.id || i + 1).padStart(3, "0")}`,
              name: p.name,
              bottomPrice: formatPrice(p.bottom_price),
              lastUpdated: new Date().toISOString().split("T")[0],
            }))
          );
        }
      } else {
        setImportResult({
          success: false,
          imported: 0,
          skipped: 0,
          errors: ["Server error during import. Please try again."],
        });
      }
    } catch (err) {
      setImportResult({
        success: false,
        imported: 0,
        skipped: 0,
        errors: ["Failed to process the file. Please check the format and try again."],
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Product Price List</h1>
          <p className="text-muted-foreground mt-1">Manage product bottom prices</p>
        </div>
        <div className="flex gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            onClick={handleImportClick}
            disabled={isImporting}
            className="border border-input px-4 py-2 rounded-lg hover:bg-secondary transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Upload className="w-5 h-5" />
            {isImporting ? "Importing..." : "Import CSV"}
          </button>
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        </div>
      </div>

      {/* Import Result */}
      {importResult && (
        <div
          className={`flex items-start gap-3 px-4 py-3 rounded-lg border text-sm ${importResult.success
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
            }`}
        >
          {importResult.success ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            {importResult.success ? (
              <p>
                <strong>{importResult.imported}</strong> products imported successfully
                {importResult.skipped > 0 && <>, <strong>{importResult.skipped}</strong> skipped</>}.
              </p>
            ) : (
              <>
                <p className="font-medium">Import failed</p>
                {importResult.errors.map((err, i) => (
                  <p key={i} className="mt-1">{err}</p>
                ))}
              </>
            )}
          </div>
          <button onClick={() => setImportResult(null)} className="p-1 hover:bg-black/5 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Import Info */}
      <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
          <div className="text-sm text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">CSV Import Guide</p>
            <p>• File format: .csv</p>
            <p>• The system will auto-detect "NAMA BARANG" and "HARGA" column pairs</p>
            <p>• Price format: "Rp 150.000" or plain numbers like "150000"</p>
            <p>• Multiple product groups in one CSV are supported</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
              {filteredProducts.map((product) => (
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
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
