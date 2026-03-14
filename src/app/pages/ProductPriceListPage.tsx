import { useState, useRef, useEffect } from "react";
import { Plus, Upload, Edit, Trash2, Search, FileText, CheckCircle2, AlertTriangle, X } from "lucide-react";
import axios from "axios";

interface Product {
  id: number;
  sku: string;
  name: string;
  bottomPrice: string;
  lastUpdated: string;
}

interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: string[];
}

interface MappingFields {
  skuCol: number;
  nameCol: number;
  priceCol: number;
  qtyCol?: number; // Optional, if they want Price = Amount / Qty
}

const API_URL = "http://localhost:3001/api";

function parsePrice(raw: string): number {
  if (!raw || typeof raw !== "string") return 0;
  
  // Remove "Rp", currency symbols, and whitespace
  let cleaned = raw.replace(/Rp/gi, "").replace(/\s/g, "");

  // Split by any common separator (dot or comma)
  const segments = cleaned.split(/[.,]/);
  
  if (segments.length === 1) {
    return parseInt(cleaned, 10) || 0;
  }

  const lastSegment = segments[segments.length - 1];
  
  // Logic: if the last part is 1 or 2 digits, it's likely a decimal (e.g., .50 or ,5)
  // Since the user wants to "remove commas" (hapus koma/desimal), we drop the last segment.
  // If it's 3 digits or more, it's likely a thousand separator (e.g., .000), so we keep it.
  if (lastSegment.length <= 2) {
    const integerPart = segments.slice(0, -1).join("");
    return parseInt(integerPart, 10) || 0;
  } else {
    const fullNumber = segments.join("");
    return parseInt(fullNumber, 10) || 0;
  }
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

  // Identify potential name/price column pairs from the first few header rows
  const headerRows = csvRows.slice(0, 3);
  const pairs: { nameCol: number; priceCol: number }[] = [];

  for (const headerRow of headerRows) {
    for (let c = 0; c < headerRow.length; c++) {
      const cell = headerRow[c]?.toUpperCase()?.trim() || "";
      if (cell.includes("NAMA BARANG") || cell.includes("NAMA")) {
        for (let p = c + 1; p < Math.min(c + 3, headerRow.length); p++) {
          const priceCell = headerRow[p]?.toUpperCase()?.trim() || "";
          if (priceCell.includes("HARGA") || priceCell === "HARGA") {
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
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  
  // Mapping States
  const [showMapping, setShowMapping] = useState(false);
  const [csvRows, setCsvRows] = useState<string[][]>([]);
  const [headerIndex, setHeaderIndex] = useState(0);
  const [mapping, setMapping] = useState<MappingFields>({
    skuCol: -1,
    nameCol: -1,
    priceCol: -1,
    qtyCol: -1
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/products`);
      const formatted = res.data.map((p: any) => ({
        id: p.id,
        sku: p.sku || `P-${String(p.id).padStart(3, "0")}`,
        name: p.name,
        bottomPrice: formatPrice(p.bottom_price),
        lastUpdated: new Date().toISOString().split("T")[0],
      }));
      setProducts(formatted);
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

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

    try {
      const text = await file.text();
      const rows = parseCSV(text);
      
      if (rows.length < 2) {
        setImportResult({
          success: false,
          imported: 0,
          skipped: 0,
          errors: ["CSV file is empty or too small."],
        });
        return;
      }

      setCsvRows(rows);
      
      // Auto-detect header row and columns
      let foundHeaderIx = 0;
      let nameC = -1, priceC = -1, skuC = -1, qtyC = -1;

      for (let i = 0; i < Math.min(rows.length, 10); i++) {
        const row = rows[i];
        if (row.some(c => c.toUpperCase().includes("NAMA") || c.toUpperCase().includes("BARANG") || c.toUpperCase().includes("SKU"))) {
          foundHeaderIx = i;
          row.forEach((cell, idx) => {
            const up = cell.toUpperCase();
            if (up.includes("NAMA") || up.includes("KETERANGAN")) nameC = idx;
            if (up.includes("HARGA") || up.includes("JUMLAH") || up.includes("PRICE")) priceC = idx;
            if (up.includes("NO") || up.includes("SKU") || up.includes("PART")) skuC = idx;
            if (up.includes("QTY") || up.includes("KUANTITAS")) qtyC = idx;
          });
          break;
        }
      }

      setHeaderIndex(foundHeaderIx);
      setMapping({ nameCol: nameC, priceCol: priceC, skuCol: skuC, qtyCol: qtyC });
      setShowMapping(true);
      
    } catch (err: any) {
      setImportResult({
        success: false,
        imported: 0,
        skipped: 0,
        errors: ["Failed to read file."],
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const processImport = async () => {
    if (mapping.nameCol === -1 || mapping.priceCol === -1) {
      alert("Please map at least Product Name and Price columns.");
      return;
    }

    setIsImporting(true);
    setShowMapping(false);

    try {
      const productsToImport: any[] = [];
      const dataRows = csvRows.slice(headerIndex + 1);

      for (const row of dataRows) {
        const name = row[mapping.nameCol];
        const rawPrice = row[mapping.priceCol];
        
        if (!name || name.trim() === "") continue;

        // Skip if this row looks like a header (common in multi-section reports)
        const nameUpper = name.toUpperCase();
        if (nameUpper.includes("NAMA BARANG") || 
            nameUpper.includes("KETERANGAN") || 
            nameUpper.includes("JUMLAH") ||
            nameUpper.includes("TOTAL")) {
          continue;
        }

        let price = parsePrice(rawPrice);
        const rawQty = mapping.qtyCol !== undefined && mapping.qtyCol !== -1 ? row[mapping.qtyCol] : "1";
        const qty = parsePrice(rawQty) || 1;

        // If qty is mapped, we assume rawPrice might be the TOTAL amount for that row (like in HARGA.csv 'Jumlah' column)
        // So we divide to get the unit price
        if (mapping.qtyCol !== undefined && mapping.qtyCol !== -1 && qty > 0) {
          price = price / qty;
        }
        
        if (price > 0) {
          productsToImport.push({
            sku: mapping.skuCol !== -1 ? row[mapping.skuCol] : null,
            name: name.trim(),
            price: price
          });
        }
      }

      const res = await axios.post(`${API_URL}/products/import`, { products: productsToImport });
      setImportResult({
        success: true,
        imported: res.data.imported,
        skipped: res.data.skipped,
        errors: [],
      });
      fetchProducts();
    } catch (err: any) {
      setImportResult({
        success: false,
        imported: 0,
        skipped: 0,
        errors: [err.response?.data?.error || "Import failed"],
      });
    } finally {
      setIsImporting(false);
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
            <p>• You can map any CSV columns to Product Name, Price, and SKU</p>
            <p>• Price format: "Rp 150.000", "Rp 150,000.00", or plain numbers</p>
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
                <tr key={product.sku + product.name} className="hover:bg-secondary/50 transition-colors text-sm">
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 rounded bg-secondary font-mono text-xs">{product.sku}</span>
                  </td>
                  <td className="px-6 py-4 font-medium">{product.name}</td>
                  <td className="px-6 py-4 text-primary font-semibold">{product.bottomPrice}</td>
                  <td className="px-6 py-4 text-muted-foreground">{product.lastUpdated}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1 hover:bg-secondary rounded transition-colors">
                        <Edit className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button className="p-1 hover:bg-secondary rounded transition-colors hover:bg-destructive/10">
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

      {/* Mapping Modal */}
      {showMapping && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-secondary/30">
              <h2 className="text-xl font-bold">Map CSV Fields</h2>
              <button 
                onClick={() => setShowMapping(false)}
                className="p-1 hover:bg-secondary rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl flex gap-3 text-sm text-foreground">
                <FileText className="w-5 h-5 flex-shrink-0 text-primary" />
                <div>
                  <p className="font-semibold">Match your CSV columns</p>
                  <p className="text-muted-foreground mt-0.5">We found {csvRows.length} rows. Please select the correct columns for each field.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2">
                    Header Row
                    <span className="text-xs font-normal text-muted-foreground">(Row containing column names)</span>
                  </label>
                  <select 
                    value={headerIndex}
                    onChange={(e) => setHeaderIndex(parseInt(e.target.value))}
                    className="w-full p-2.5 bg-input-background border border-input rounded-xl outline-none focus:ring-2 focus:ring-ring"
                  >
                    {csvRows.slice(0, 15).map((row, i) => (
                      <option key={i} value={i}>
                        Row {i + 1}: {row.filter(Boolean).slice(0, 3).join(", ")}...
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">SKU Column (Optional)</label>
                  <select 
                    value={mapping.skuCol}
                    onChange={(e) => setMapping({ ...mapping, skuCol: parseInt(e.target.value) })}
                    className="w-full p-2.5 bg-input-background border border-input rounded-xl outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value={-1}>-- Ignore --</option>
                    {csvRows[headerIndex]?.map((cell, i) => (
                      <option key={i} value={i}>{cell || `Column ${i + 1}`}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-primary">Product Name Column *</label>
                  <select 
                    value={mapping.nameCol}
                    onChange={(e) => setMapping({ ...mapping, nameCol: parseInt(e.target.value) })}
                    className="w-full p-2.5 bg-input-background border border-primary/50 rounded-xl outline-none ring-2 ring-primary/10"
                  >
                    <option value={-1}>-- Select --</option>
                    {csvRows[headerIndex]?.map((cell, i) => (
                      <option key={i} value={i}>{cell || `Column ${i + 1}`}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-primary">Bottom Price Column *</label>
                  <select 
                    value={mapping.priceCol}
                    onChange={(e) => setMapping({ ...mapping, priceCol: parseInt(e.target.value) })}
                    className="w-full p-2.5 bg-input-background border border-primary/50 rounded-xl outline-none ring-2 ring-primary/10"
                  >
                    <option value={-1}>-- Select --</option>
                    {csvRows[headerIndex]?.map((cell, i) => (
                      <option key={i} value={i}>{cell || `Column ${i + 1}`}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Data Preview
                </h3>
                <div className="overflow-x-auto border border-border rounded-xl bg-secondary/10">
                  <table className="w-full text-xs">
                    <thead className="bg-secondary/50">
                      <tr>
                        {csvRows[headerIndex]?.map((cell, idx) => (
                          <th key={idx} className={`px-4 py-3 text-left border-r border-border min-w-[120px] ${
                            idx === mapping.nameCol || idx === mapping.priceCol || idx === mapping.skuCol ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground font-medium"
                          }`}>
                            {cell || `Col ${idx + 1}`}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvRows.slice(headerIndex + 1, headerIndex + 6).map((row, i) => (
                        <tr key={i} className="border-t border-border hover:bg-white/50 transition-colors">
                          {row.map((cell, idx) => (
                            <td key={idx} className={`px-4 py-2 border-r border-border truncate max-w-[250px] ${
                              idx === mapping.nameCol || idx === mapping.priceCol || idx === mapping.skuCol ? "bg-primary/5 font-medium" : ""
                            }`}>
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-secondary/30 border-t border-border flex items-center justify-end gap-3">
              <button 
                onClick={() => setShowMapping(false)}
                className="px-6 py-2.5 text-sm font-semibold hover:bg-secondary rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={processImport}
                disabled={mapping.nameCol === -1 || mapping.priceCol === -1}
                className="bg-primary text-primary-foreground px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
              >
                Start Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
