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
        sku: p.sku || `P-${String(p.id).padStart(3, "0")}`,
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
    } catch (err) { console.error(err); }
    finally { if (fileInputRef.current) fileInputRef.current.value = ""; }
  };

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
        if (price > 0) {
          productsToImport.push({ sku: mapping.skuCol !== -1 ? row[mapping.skuCol] : null, name: name.trim(), price: Math.floor(price) });
        }
      }
      const res = await axios.post(`${API_URL}/products/import`, { products: productsToImport });
      setImportResult({ success: true, imported: res.data.imported, skipped: res.data.skipped, errors: [] });
      fetchProducts();
    } catch (err: any) {
      setImportResult({ success: false, imported: 0, skipped: 0, errors: [err.response?.data?.error || "Import failed"] });
    } finally { setIsImporting(false); }
  };

  return (
    <div className="space-y-12 pb-20 max-w-7xl mx-auto">
      {/* Cinematic Header Architecture */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
        <div>
          <h1 className="text-4xl font-black tracking-tighter flex items-center gap-4">
            <span className="bg-slate-900 text-white p-3.5 rounded-[1.75rem] shadow-2xl shadow-slate-200">
              <Database className="w-10 h-10" />
            </span>
            Product Central
          </h1>
          <p className="text-muted-foreground mt-3 font-medium text-lg leading-relaxed italic">
            Coordinate master bottom prices and global SKU registry for enterprise-wide synchronization
          </p>
        </div>
        <div className="flex items-center gap-4">
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
          <button 
             onClick={() => fileInputRef.current?.click()}
             className="px-8 py-5 bg-white border border-slate-200 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-50 transition-all flex items-center gap-3 shadow-sm active:scale-95"
          >
             <Upload className="w-5 h-5 text-primary" />
             Bulk Intelligence Import
          </button>
          <button className="bg-primary text-white px-10 py-5 rounded-[2rem] hover:scale-[1.03] transition-all shadow-2xl shadow-primary/30 flex items-center gap-4 font-black uppercase tracking-[0.2em] text-[10px] active:scale-95">
             <Plus className="w-5 h-5" />
             Add New Unit
          </button>
        </div>
      </div>

      {importResult && (
        <div className={`p-10 rounded-[3rem] border animate-in slide-in-from-top-6 duration-700 overflow-hidden relative group shadow-2xl ${importResult.success ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-rose-600 border-rose-500 text-white'}`}>
           <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-125 transition-transform duration-1000">
              {importResult.success ? <CheckCircle2 className="w-40 h-40" /> : <AlertTriangle className="w-40 h-40" />}
           </div>
           <div className="flex items-center justify-between gap-8 relative z-10">
              <div className="flex items-center gap-8">
                 <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center backdrop-blur-3xl border border-white/20 shadow-2xl ${importResult.success ? 'bg-white/10' : 'bg-white/10'}`}>
                    {importResult.success ? <Sparkles className="w-10 h-10" /> : <AlertTriangle className="w-10 h-10" />}
                 </div>
                 <div>
                    <p className="font-black uppercase tracking-[0.3em] text-[10px] mb-2 opacity-60">Process Execution Report</p>
                    <p className="text-2xl font-black tracking-tighter">
                       {importResult.success ? `Successfully integrated ${importResult.imported} units into the master records.` : importResult.errors[0]}
                    </p>
                 </div>
              </div>
              <button 
                onClick={() => setImportResult(null)} 
                className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all backdrop-blur-md"
              >
                <X className="w-6 h-6" />
              </button>
           </div>
        </div>
      )}

      {/* Database Interface Registry */}
      <div className="bg-white rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
        <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-slate-50/20">
           <div className="relative group flex-1 max-w-xl">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Query SKU code or product nomenclature..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-16 pr-8 py-4.5 bg-white border border-slate-200 rounded-[2rem] outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-black text-sm shadow-sm"
              />
           </div>
           <div className="flex items-center gap-3">
              <button className="flex items-center gap-3 px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-primary transition-colors">
                 <ArrowUpDown className="w-4 h-4" />
                 Sort: Registry Date
              </button>
              <button className="w-14 h-14 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-primary hover:bg-slate-50 transition-all flex items-center justify-center shadow-sm">
                 <ListFilter className="w-6 h-6" />
              </button>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-8 text-left text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">SKU Signature</th>
                <th className="px-10 py-8 text-left text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Product Metadata</th>
                <th className="px-10 py-8 text-left text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Certified bottom price</th>
                <th className="px-10 py-8 text-left text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Last Audit</th>
                <th className="px-10 py-8 text-center text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Operation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                  <td className="px-10 py-8">
                    <span className="text-xs font-black bg-slate-900 text-white px-5 py-2.5 rounded-xl tracking-widest shadow-xl shadow-slate-200 block w-fit group-hover:bg-primary transition-colors">
                       {product.sku}
                    </span>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                          <Package className="w-6 h-6" />
                       </div>
                       <div>
                          <p className="text-sm font-black text-slate-800 leading-tight mb-1">{product.name}</p>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Inventory Level: Verified</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className="text-lg font-black text-primary tracking-tighter">{product.bottomPrice}</span>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-2">
                       <Activity className="w-3.5 h-3.5 text-emerald-500" />
                       <p className="text-xs font-black text-slate-400">{product.lastUpdated}</p>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center justify-center gap-3">
                       <button className="w-12 h-12 hover:bg-primary/10 rounded-[1.25rem] text-slate-300 hover:text-primary transition-all flex items-center justify-center">
                          <Edit className="w-5 h-5" />
                       </button>
                       <button className="w-12 h-12 hover:bg-rose-50 rounded-[1.25rem] text-slate-300 hover:text-rose-500 transition-all flex items-center justify-center">
                          <Trash2 className="w-5 h-5" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-slate-900/40 backdrop-blur-2xl">
          <div className="bg-white rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] w-full max-w-5xl overflow-hidden animate-in zoom-in-95 duration-500 border border-white/20">
            <div className="px-12 py-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <div className="flex items-center gap-6">
                 <div className="w-16 h-16 bg-primary text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-primary/40">
                    <Layers className="w-8 h-8" />
                 </div>
                 <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Intelligence Mapping Suite</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Cross-referencing incoming CSV clusters with master database nodes</p>
                 </div>
              </div>
              <button 
                onClick={() => setShowMapping(false)} 
                className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all shadow-sm"
              >
                <X className="w-7 h-7" />
              </button>
            </div>
            
            <div className="p-12 space-y-10 max-h-[65vh] overflow-y-auto">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Registry: SKU Code</label>
                     <div className="relative">
                        <select 
                          value={mapping.skuCol}
                          onChange={(e) => setMapping({ ...mapping, skuCol: parseInt(e.target.value) })}
                          className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[1.75rem] font-black text-xs outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all appearance-none"
                        >
                           <option value={-1}>IGNORE DATA STREAM</option>
                           {csvRows[headerIndex]?.map((h, i) => <option key={i} value={i}>{h || `Cluster Node ${i+1}`}</option>)}
                        </select>
                        <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 rotate-90 text-slate-300 pointer-events-none" />
                     </div>
                  </div>
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary ml-2">Primary: Unit Label *</label>
                     <div className="relative">
                        <select 
                          value={mapping.nameCol}
                          onChange={(e) => setMapping({ ...mapping, nameCol: parseInt(e.target.value) })}
                          className="w-full px-8 py-5 bg-white border-primary/20 border-2 rounded-[1.75rem] font-black text-xs outline-none focus:ring-8 focus:ring-primary/5 transition-all appearance-none text-primary"
                        >
                           <option value={-1}>SELECT SOURCE ENTITY</option>
                           {csvRows[headerIndex]?.map((h, i) => <option key={i} value={i}>{h || `Cluster Node ${i+1}`}</option>)}
                        </select>
                        <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 rotate-90 text-primary/40 pointer-events-none" />
                     </div>
                  </div>
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary ml-2">Metric: bottom price *</label>
                     <div className="relative">
                        <select 
                          value={mapping.priceCol}
                          onChange={(e) => setMapping({ ...mapping, priceCol: parseInt(e.target.value) })}
                          className="w-full px-8 py-5 bg-white border-primary/20 border-2 rounded-[1.75rem] font-black text-xs outline-none focus:ring-8 focus:ring-primary/5 transition-all appearance-none text-primary"
                        >
                           <option value={-1}>SELECT SOURCE ENTITY</option>
                           {csvRows[headerIndex]?.map((h, i) => <option key={i} value={i}>{h || `Cluster Node ${i+1}`}</option>)}
                        </select>
                        <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 rotate-90 text-primary/40 pointer-events-none" />
                     </div>
                  </div>
               </div>

               <div className="bg-slate-900 rounded-[3rem] p-10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-10 opacity-5">
                     <Sparkles className="w-32 h-32 text-white" />
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-8 flex items-center gap-3">
                     <Box className="w-5 h-5 text-primary" /> REAL-TIME PARSER PREVIEW
                  </h3>
                  <div className="overflow-x-auto">
                     <table className="w-full text-left text-[11px] border-separate border-spacing-y-2">
                        <thead>
                           <tr className="text-white/20 uppercase tracking-[0.2em] font-black">
                              {csvRows[headerIndex]?.slice(0, 5).map((h, i) => (
                                 <th key={i} className="pb-4 px-6">{h || `Node ${i+1}`}</th>
                              ))}
                           </tr>
                        </thead>
                        <tbody>
                           {csvRows.slice(headerIndex + 1, headerIndex + 5).map((row, r) => (
                              <tr key={r} className="bg-white/5 rounded-2xl">
                                 {row.slice(0, 5).map((c, i) => (
                                    <td key={i} className="py-5 px-6 font-bold text-white/70 max-w-[150px] truncate">{c}</td>
                                 ))}
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>

            <div className="px-12 py-10 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-6">
              <button 
                onClick={() => setShowMapping(false)}
                className="px-10 py-5 font-black uppercase tracking-[0.3em] text-[10px] text-slate-400 hover:text-slate-900 transition-colors"
              >
                Abort System Integration
              </button>
              <button 
                onClick={processImport}
                disabled={mapping.nameCol === -1 || mapping.priceCol === -1 || isImporting}
                className="bg-primary text-white px-14 py-6 rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-primary/30 hover:scale-[1.03] transition-all disabled:opacity-30 flex items-center gap-4 active:scale-95"
              >
                {isImporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                Execute Forensic Integration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
