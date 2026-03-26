import { useState, useRef, useEffect } from "react";
import { Plus, Upload, Edit, Trash2, Search, FileText, CheckCircle2, AlertTriangle, X, Database, ListFilter, ArrowUpDown, ChevronRight, Hash, Box, Package, Activity, Loader2, Sparkles, Layers } from "lucide-react";
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
  missingPrice: string[];
  importedItems: string[];
}

interface MappingFields {
  skuCol: number;
  nameCol: number;
  priceCol: number;
  qtyCol?: number;
}

const API_URL = "http://localhost:3001/api";

function parsePrice(raw: string): number {
  if (!raw || typeof raw !== "string") return 0;
  let cleaned = raw.replace(/Rp/gi, "").replace(/\s/g, "");
  const segments = cleaned.split(/[.,]/);
  if (segments.length === 1) return parseInt(cleaned, 10) || 0;
  const lastSegment = segments[segments.length - 1];
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
      if (ch === '"' && next === '"') { current += '"'; i++; }
      else if (ch === '"') inQuotes = false;
      else current += ch;
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ",") { row.push(current.trim()); current = ""; }
      else if (ch === "\n" || (ch === "\r" && next === "\n")) {
        row.push(current.trim()); current = ""; rows.push(row); row = [];
        if (ch === "\r") i++;
      } else current += ch;
    }
  }
  if (current || row.length > 0) { row.push(current.trim()); rows.push(row); }
  return rows;
}

export function ProductPriceListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [showMapping, setShowMapping] = useState(false);
  const [csvRows, setCsvRows] = useState<string[][]>([]);
  const [headerIndex, setHeaderIndex] = useState(0);
  const [mapping, setMapping] = useState<MappingFields>({ skuCol: -1, nameCol: -1, priceCol: -1, qtyCol: -1 });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/products`);
      const formatted = res.data.map((p: any) => ({
        id: p.id,
        sku: p.sku || "",
        name: p.name,
        bottomPrice: formatPrice(p.bottom_price),
        lastUpdated: new Date().toISOString().split("T")[0],
      }));
      setProducts(formatted);
    } catch (err) { console.error("Failed to fetch products", err); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const filteredProducts = products.filter(
    (p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const rows = parseCSV(text);
      if (rows.length < 2) return;
      setCsvRows(rows);
      let foundHeaderIx = 0, nameC = -1, priceC = -1, skuC = -1, qtyC = -1;
      for (let i = 0; i < Math.min(rows.length, 10); i++) {
        const row = rows[i];
        if (row.some(c => c.toUpperCase().includes("NAMA") || c.toUpperCase().includes("BARANG") || c.toUpperCase().includes("SKU") || c.toUpperCase().includes("DESKRIPSI"))) {
          foundHeaderIx = i;
          row.forEach((cell, idx) => {
            const up = cell.toUpperCase();
            if (up.includes("DESKRIPSI") || up.includes("NAMA") || up.includes("KETERANGAN")) nameC = idx;
            if (up.includes("HARGA") || up.includes("PRICE")) priceC = idx;
            if (up.includes("KODE") || up.includes("SKU") || up.includes("PART")) skuC = idx;
            if (up.includes("QTY") || up.includes("KUANTITAS")) qtyC = idx;
          });
          break;
        }
      }
      setHeaderIndex(foundHeaderIx);
      setMapping({ nameCol: nameC, priceCol: priceC, skuCol: skuC, qtyCol: qtyC });
      setShowMapping(true);
    } catch (err) { console.error(err); }
    finally { if (fileInputRef.current) fileInputRef.current.value = ""; }
  };

  const [showImportDetail, setShowImportDetail] = useState(false);

  const processImport = async () => {
    setIsImporting(true);
    setShowMapping(false);
    try {
      const productsToImport: any[] = [];
      const dataRows = csvRows.slice(headerIndex + 1);
      for (const row of dataRows) {
        const name = row[mapping.nameCol];
        if (!name || name.trim() === "") continue;
        let price = parsePrice(row[mapping.priceCol]);
        const qty = mapping.qtyCol !== -1 ? parsePrice(row[mapping.qtyCol || -1]) || 1 : 1;
        if (mapping.qtyCol !== -1 && qty > 0) price = price / qty;
        productsToImport.push({ sku: mapping.skuCol !== -1 ? row[mapping.skuCol] : null, name: name.trim(), price: Math.floor(price) });
      }
      const res = await axios.post(`${API_URL}/products/import`, { products: productsToImport });
      setImportResult({
        success: true,
        imported: res.data.imported,
        skipped: res.data.skipped,
        errors: [],
        missingPrice: res.data.missingPrice || [],
        importedItems: res.data.importedItems || [],
      });
      setShowImportDetail(false);
      fetchProducts();
    } catch (err: any) {
      setImportResult({ success: false, imported: 0, skipped: 0, errors: [err.response?.data?.error || "Import failed"], missingPrice: [], importedItems: [] });
    } finally { setIsImporting(false); }
  };

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-md shadow-slate-200">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tighter text-slate-900 leading-none">
              Products
            </h1>
            <p className="text-slate-400 mt-1.5 font-semibold text-xs italic opacity-70">
              Manage product SKU and bottom prices
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
          <button 
             onClick={() => fileInputRef.current?.click()}
             className="px-5 py-2 bg-white border border-slate-200 rounded-lg font-semibold uppercase tracking-widest text-[9px] hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm italic"
          >
             <Upload className="w-3.5 h-3.5 text-primary" />
             Import CSV
          </button>
          <button className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary/90 transition-all shadow-sm flex items-center gap-2 font-semibold uppercase tracking-widest text-[9px] active:scale-95 italic text-center">
             <Plus className="w-3.5 h-3.5" />
             Add Product
          </button>
        </div>
      </div>

      {importResult && (
        <div className={`rounded-xl border overflow-hidden shadow-sm ${importResult.success ? 'bg-white border-slate-200' : 'bg-rose-600 border-rose-500 text-white'}`}>
           {/* Header */}
           <div className={`p-4 flex items-center justify-between gap-4 ${importResult.success ? 'bg-emerald-600 text-white' : ''}`}>
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-lg flex items-center justify-center backdrop-blur-3xl border border-white/20 bg-white/10">
                    {importResult.success ? <Sparkles className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                 </div>
                 <div>
                    <p className="font-semibold uppercase tracking-widest text-[7px] mb-0.5 opacity-60 italic">Import Report</p>
                    <p className="text-base font-semibold tracking-tighter italic">
                       {importResult.success ? `Berhasil import ${importResult.imported} produk` : importResult.errors[0]}
                    </p>
                 </div>
              </div>
              <div className="flex items-center gap-2">
                {importResult.success && (
                  <button 
                    onClick={() => setShowImportDetail(!showImportDetail)} 
                    className="px-3 py-1.5 bg-white/20 rounded-lg text-[8px] font-semibold uppercase tracking-widest hover:bg-white/30 transition-all italic"
                  >
                    {showImportDetail ? 'Tutup Detail' : 'Lihat Detail'}
                  </button>
                )}
                <button 
                  onClick={() => setImportResult(null)} 
                  className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
           </div>

           {/* Missing Price Warning */}
           {importResult.success && importResult.missingPrice.length > 0 && (
             <div className="px-4 py-3 bg-amber-50 border-b border-amber-100 flex items-start gap-3">
               <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                 <AlertTriangle className="w-4 h-4 text-amber-600" />
               </div>
               <div className="flex-1 min-w-0">
                 <p className="text-[10px] font-semibold text-amber-800 italic">
                   ⚠ {importResult.missingPrice.length} produk tanpa bottom price (di-set Rp 0)
                 </p>
                 <p className="text-[8px] text-amber-600 font-medium mt-0.5 italic opacity-70">
                   Silakan update harga produk berikut agar sistem bisa menghitung komisi dengan benar.
                 </p>
                 <div className="mt-2 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                   {importResult.missingPrice.map((name, i) => (
                     <span key={i} className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[8px] font-semibold rounded border border-amber-200 italic truncate max-w-[200px]">
                       {name}
                     </span>
                   ))}
                 </div>
               </div>
             </div>
           )}

           {/* Stats Row */}
           {importResult.success && (
             <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-6 bg-slate-50/50">
               <div className="flex items-center gap-2">
                 <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                 <span className="text-[9px] font-semibold text-slate-600 italic">{importResult.imported} berhasil diimport</span>
               </div>
               {importResult.skipped > 0 && (
                 <div className="flex items-center gap-2">
                   <X className="w-3.5 h-3.5 text-slate-400" />
                   <span className="text-[9px] font-semibold text-slate-400 italic">{importResult.skipped} dilewati</span>
                 </div>
               )}
               {importResult.missingPrice.length > 0 && (
                 <div className="flex items-center gap-2">
                   <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                   <span className="text-[9px] font-semibold text-amber-600 italic">{importResult.missingPrice.length} tanpa harga</span>
                 </div>
               )}
             </div>
           )}

           {/* Expandable Detail */}
           {importResult.success && showImportDetail && (
             <div className="px-4 py-3 max-h-60 overflow-y-auto bg-white">
               <p className="text-[7px] font-semibold text-slate-400 uppercase tracking-widest mb-2 italic opacity-50">Daftar Produk Diimport</p>
               <div className="space-y-1">
                 {importResult.importedItems.map((name, i) => {
                   const isMissing = importResult.missingPrice.includes(name);
                   return (
                     <div key={i} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[9px] font-semibold ${isMissing ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-slate-50 text-slate-600'}`}>
                       <span className="flex-shrink-0">
                         {isMissing ? <AlertTriangle className="w-3 h-3 text-amber-500" /> : <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                       </span>
                       <span className="truncate italic">{name}</span>
                       {isMissing && <span className="ml-auto text-[7px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-widest flex-shrink-0">No Price</span>}
                     </div>
                   );
                 })}
                 {importResult.imported > importResult.importedItems.length && (
                   <p className="text-[8px] text-slate-400 italic font-semibold text-center py-2">
                     ... dan {importResult.imported - importResult.importedItems.length} produk lainnya
                   </p>
                 )}
               </div>
             </div>
           )}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-3 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-3">
           <div className="relative group flex-1 max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50/50 border border-slate-200 rounded-lg outline-none focus:border-primary transition-all font-semibold text-[10px] shadow-sm italic"
              />
           </div>
           <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-[8px] font-semibold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors italic opacity-70">
                 <ArrowUpDown className="w-3 h-3" />
                 Last Updated
              </button>
              <button className="w-9 h-9 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-50 transition-all flex items-center justify-center shadow-sm">
                 <ListFilter className="w-4 h-4" />
              </button>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-5 py-3 text-left text-[8px] text-slate-400 font-semibold uppercase tracking-widest italic opacity-70">Kode Barang</th>
                <th className="px-5 py-3 text-left text-[8px] text-slate-400 font-semibold uppercase tracking-widest italic opacity-70">Nama Barang</th>
                <th className="px-5 py-3 text-left text-[8px] text-slate-400 font-semibold uppercase tracking-widest italic opacity-70">Harga Bawah</th>
                <th className="px-5 py-3 text-left text-[8px] text-slate-400 font-semibold uppercase tracking-widest italic opacity-70">Sync</th>
                <th className="px-5 py-3 text-center text-[8px] text-slate-400 font-semibold uppercase tracking-widest italic opacity-70">-</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="group hover:bg-slate-50/30 transition-all">
                  <td className="px-5 py-3">
                    <span className="text-[10px] font-semibold bg-slate-900 text-white px-2 py-1 rounded tracking-widest group-hover:bg-primary transition-colors">
                       {product.sku}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                          <Package className="w-4 h-4" />
                       </div>
                       <div>
                          <p className="text-[11px] font-semibold text-slate-800 leading-none">{product.name}</p>
                          <p className="text-[7px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5 italic opacity-50">Verified</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-[11px] font-semibold text-primary tracking-tighter">{product.bottomPrice}</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                       <Activity className="w-2.5 h-2.5 text-emerald-500" />
                       <p className="text-[9px] font-semibold text-slate-400 italic opacity-50">{product.lastUpdated}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                       <button className="w-8 h-8 hover:bg-slate-100 rounded text-slate-300 hover:text-slate-900 transition-all flex items-center justify-center">
                          <Edit className="w-3.5 h-3.5" />
                       </button>
                       <button className="w-8 h-8 hover:bg-rose-50 rounded text-slate-300 hover:text-rose-500 transition-all flex items-center justify-center">
                          <Trash2 className="w-3.5 h-3.5" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

       {showMapping && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center shadow-sm">
                    <Layers className="w-4 h-4" />
                 </div>
                 <div>
                    <h2 className="text-lg font-semibold text-slate-900 tracking-tight leading-none">Import Mapping</h2>
                    <p className="text-[8px] font-semibold text-slate-400 uppercase tracking-widest mt-1 italic opacity-50">Map CSV columns</p>
                 </div>
              </div>
              <button 
                onClick={() => setShowMapping(false)} 
                className="w-8 h-8 bg-white border border-slate-100 rounded-lg flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all shadow-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
             <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div className="space-y-1">
                      <label className="text-[8px] font-semibold uppercase tracking-widest text-slate-400 ml-1 italic opacity-50">SKU Field</label>
                      <div className="relative">
                         <select 
                           value={mapping.skuCol}
                           onChange={(e) => setMapping({ ...mapping, skuCol: parseInt(e.target.value) })}
                           className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-[10px] outline-none transition-all appearance-none shadow-sm italic"
                         >
                            <option value={-1}>IGNORE</option>
                            {csvRows[headerIndex]?.map((h, i) => <option key={i} value={i}>{h || `Column ${i+1}`}</option>)}
                         </select>
                         <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 rotate-90 text-slate-300 pointer-events-none" />
                      </div>
                   </div>
                   <div className="space-y-1">
                      <label className="text-[8px] font-semibold uppercase tracking-widest text-primary ml-1 italic opacity-70">Name Field *</label>
                      <div className="relative">
                         <select 
                           value={mapping.nameCol}
                           onChange={(e) => setMapping({ ...mapping, nameCol: parseInt(e.target.value) })}
                           className="w-full px-4 py-2 bg-white border border-primary/30 rounded-lg font-semibold text-[10px] outline-none transition-all appearance-none shadow-sm text-primary italic"
                         >
                            <option value={-1}>SELECT</option>
                            {csvRows[headerIndex]?.map((h, i) => <option key={i} value={i}>{h || `Column ${i+1}`}</option>)}
                         </select>
                         <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 rotate-90 text-primary/40 pointer-events-none" />
                      </div>
                   </div>
                   <div className="space-y-1">
                      <label className="text-[8px] font-semibold uppercase tracking-widest text-primary ml-1 italic opacity-70">Price Field *</label>
                      <div className="relative">
                         <select 
                           value={mapping.priceCol}
                           onChange={(e) => setMapping({ ...mapping, priceCol: parseInt(e.target.value) })}
                           className="w-full px-4 py-2 bg-white border border-primary/30 rounded-lg font-semibold text-[10px] outline-none transition-all appearance-none shadow-sm text-primary italic"
                         >
                            <option value={-1}>SELECT</option>
                            {csvRows[headerIndex]?.map((h, i) => <option key={i} value={i}>{h || `Column ${i+1}`}</option>)}
                         </select>
                         <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 rotate-90 text-primary/40 pointer-events-none" />
                      </div>
                   </div>
                </div>

                <div className="bg-slate-900 rounded-xl p-4 relative overflow-hidden">
                   <h3 className="text-[8px] font-semibold uppercase tracking-widest text-white/30 mb-4 flex items-center gap-2 italic">
                      <Box className="w-3 h-3 text-primary" /> PREVIEW
                   </h3>
                   <div className="overflow-x-auto">
                      <table className="w-full text-left text-[9px] border-separate border-spacing-y-1">
                         <thead>
                            <tr className="text-white/20 uppercase tracking-widest font-semibold italic">
                               {csvRows[headerIndex]?.slice(0, 5).map((h, i) => (
                                  <th key={i} className="pb-1 px-3">{h || `Column ${i+1}`}</th>
                               ))}
                            </tr>
                         </thead>
                         <tbody>
                            {csvRows.slice(headerIndex + 1, headerIndex + 5).map((row, r) => (
                               <tr key={r} className="bg-white/5 rounded">
                                  {row.slice(0, 5).map((c, i) => (
                                     <td key={i} className="py-2 px-3 font-semibold text-white/60 max-w-[100px] truncate italic opacity-70">{c}</td>
                                  ))}
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>
             </div>

             <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
               <button 
                 onClick={() => setShowMapping(false)}
                 className="px-4 py-2 font-semibold uppercase tracking-widest text-[8px] text-slate-400 hover:text-slate-900 transition-colors italic"
               >
                 Cancel
               </button>
               <button 
                 onClick={processImport}
                 disabled={mapping.nameCol === -1 || mapping.priceCol === -1 || isImporting}
                 className="bg-primary text-white px-6 py-2.5 rounded-lg font-semibold uppercase tracking-widest text-[9px] shadow-sm hover:bg-primary/90 transition-all disabled:opacity-30 flex items-center gap-2 active:scale-95 italic text-center"
               >
                 {isImporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                 Import Products
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
