import { useState, useRef, useEffect } from "react";
import { Plus, Upload, Edit, Trash2, Search, FileText, CheckCircle2, AlertTriangle, X, Database, ListFilter, ArrowUpDown, ChevronRight, Hash, Box, Package, Activity, Loader2, Sparkles, Layers, Save } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { PageHeader } from "../components/PageHeader.jsx";




import { API_URL } from '@/lib/api.js';

function parsePrice(raw) {
  if (!raw || typeof raw !== "string") return 0;
  // Clean all characters except numbers, comma, and dot
  let cleaned = raw.replace(/[^0-9.,]/g, "");
  if (!cleaned) return 0;

  // In IDR, decimal separators are rare and usually just clutter
  // If we have "1.500,00", we want "1500"
  // If we have "1.500", we want "1500"
  // If we have "1,500,000", we want "1500000"
  
  const segments = cleaned.split(/[.,]/);
  
  if (segments.length === 1) {
    return parseInt(cleaned, 10) || 0;
  }

  const lastSegment = segments[segments.length - 1];
  
  // If last segment is exactly 2 digits, it's highly likely a decimal (cents/perak)
  // in which case we ignore it for IDR pricing.
  if (lastSegment.length <= 2 && segments.length > 1) {
    return parseInt(segments.slice(0, -1).join(""), 10) || 0;
  }

  // Otherwise, treat all segments of the whole number (thousands)
  return parseInt(segments.join(""), 10) || 0;
}

function formatPrice(num) {
  return "Rp " + num.toLocaleString("id-ID");
}

function parseCSV(text) {
  // Auto-detect delimiter: comma or semicolon
  const firstLine = text.split('\n')[0] || '';
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semiCount = (firstLine.match(/;/g) || []).length;
  const delimiter = semiCount > commaCount ? ';' : ',';

  const rows = [];
  let current = "";
  let inQuotes = false;
  let row = [];
  
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') { current += '"'; i++; }
      else if (ch === '"') inQuotes = false;
      else current += ch;
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === delimiter) { row.push(current.trim()); current = ""; }
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
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [importResult, setImportResult] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [showMapping, setShowMapping] = useState(false);
  const [csvRows, setCsvRows] = useState([]);
  const [headerIndex, setHeaderIndex] = useState(0);
  const [mapping, setMapping] = useState({ skuCol: -1, nameCol: -1, priceCol: -1, qtyCol: -1 });

  // Import Resolution State
  const [pendingNewProducts, setPendingNewProducts] = useState([]);
  const [pendingChangedProducts, setPendingChangedProducts] = useState([]);
  const [showBulkUpdateDialog, setShowBulkUpdateDialog] = useState(false);
  const [showSelectionModal, setShowSelectionModal] = useState(false);

  // Product CRUD Modal
  const [showProductModal, setShowProductModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({ sku: "", name: "", bottom_price: "" });

  const fileInputRef = useRef(null);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/products`);
      const formatted = res.data.map((p) => ({
        id: p.id,
        sku: p.sku || "",
        name: p.name,
        bottomPrice: formatPrice(p.bottom_price),
        rawPrice: p.bottom_price || 0,
        lastUpdated: new Date().toISOString().split("T")[0],
      }));
      setProducts(formatted);
    } catch (err) { toast.error("Failed to fetch products"); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const filteredProducts = products.filter(
    (p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileChange = async (e) => {
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
    } catch (err) { toast.error("An error occurred"); }
    finally { if (fileInputRef.current) fileInputRef.current.value = ""; }
  };

  const [showImportDetail, setShowImportDetail] = useState(false);

  const openProductModal = (product) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({ sku: product.sku, name: product.name, bottom_price: String(product.rawPrice) });
    } else {
      setEditingProduct(null);
      setProductForm({ sku: "", name: "", bottom_price: "" });
    }
    setShowProductModal(true);
  };

  const handleSaveProduct = async () => {
    if (!productForm.name.trim()) return toast.error("Nama barang wajib diisi");
    try {
      if (editingProduct) {
        await axios.put(`${API_URL}/products/${editingProduct.id}`, {
          sku: productForm.sku || null,
          name: productForm.name.trim(),
          bottom_price: parseInt(productForm.bottom_price) || 0,
        });
        toast.success("Produk berhasil diperbarui");
      } else {
        await axios.post(`${API_URL}/products`, {
          sku: productForm.sku || null,
          name: productForm.name.trim(),
          bottom_price: parseInt(productForm.bottom_price) || 0,
        });
        toast.success("Produk berhasil ditambahkan");
      }
      setShowProductModal(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.error || "Gagal menyimpan produk");
    }
  };

  const confirmDeleteProduct = (product) => {
    setProductToDelete(product);
  };

  const executeDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      await axios.delete(`${API_URL}/products/${productToDelete.id}`);
      toast.success("Produk berhasil dihapus");
      setProductToDelete(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.error || "Gagal menghapus produk");
      setProductToDelete(null);
    }
  };

  const processImport = async () => {
    setShowMapping(false);
    const newItems = [];
    const changedItems = [];

    const dataRows = csvRows.slice(headerIndex + 1);
    for (const row of dataRows) {
      const name = row[mapping.nameCol];
      if (!name || name.trim() === "") continue;
      let price = parsePrice(row[mapping.priceCol]);
      const qty = mapping.qtyCol !== -1 ? parsePrice(row[mapping.qtyCol || -1]) || 1 : 1;
      if (mapping.qtyCol !== -1 && qty > 0) price = price / qty;
      price = Math.floor(price);
      const sku = mapping.skuCol !== -1 ? (row[mapping.skuCol]?.trim() || null) : null;
      const itemName = name.trim();

      let existingMatch = null;
      if (sku) existingMatch = products.find(p => p.sku === sku);
      if (!existingMatch && !sku) existingMatch = products.find(p => p.name === itemName && (!p.sku || p.sku.trim() === ""));

      if (existingMatch) {
         if (existingMatch.rawPrice !== price) {
            changedItems.push({ sku, name: itemName, price, oldPrice: existingMatch.rawPrice, isSelected: true });
         }
      } else {
         newItems.push({ sku, name: itemName, price });
      }
    }

    if (changedItems.length === 0) {
      if (newItems.length > 0) {
        executeFinalImport(newItems);
      } else {
        toast.info("Tidak ada data produk atau harga baru.");
      }
    } else {
      setPendingNewProducts(newItems);
      setPendingChangedProducts(changedItems);
      setShowBulkUpdateDialog(true);
    }
  };

  const executeFinalImport = async (importData) => {
    if (importData.length === 0) {
      toast.info("Tidak ada pembaruan produk yang dilakukan.");
      return;
    }
    setIsImporting(true);
    try {
      const res = await axios.post(`${API_URL}/products/import`, { products: importData });
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
    } catch (err) {
      setImportResult({ success: false, imported: 0, skipped: 0, errors: [err.response?.data?.error || "Import failed"], missingPrice: [], importedItems: [] });
    } finally { setIsImporting(false); }
  };

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      <PageHeader
        title="Products"
        subtitle="Manage product SKU and bottom prices"
        actions={
          <>
            <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
            <button 
               onClick={() => fileInputRef.current?.click()}
               className="px-4 py-2 bg-white border border-slate-200 rounded-lg font-medium text-sm text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
            >
               <Upload className="w-4 h-4 text-primary" />
               Import
            </button>
            <button 
               onClick={() => openProductModal()}
               className="bg-primary text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm active:scale-95"
            >
               <Plus className="w-4 h-4" />
               Add Product
            </button>
          </>
        }
      />

      {importResult && (
        <div className={`rounded-xl border overflow-hidden shadow-sm ${importResult.success ? 'bg-white border-slate-200' : 'bg-rose-600 border-rose-500 text-white'}`}>
           {/* Header */}
           <div className={`p-4 flex items-center justify-between gap-4 ${importResult.success ? 'bg-emerald-600 text-white' : ''}`}>
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-lg flex items-center justify-center backdrop-blur-3xl border border-white/20 bg-white/10">
                    {importResult.success ? <Sparkles className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                 </div>
                 <div>
                    <p className="font-semibold uppercase tracking-wide text-[7px] mb-0.5 opacity-60">Import Report</p>
                    <p className="text-base font-semibold tracking-tight">
                       {importResult.success ? `Berhasil import ${importResult.imported} produk` : importResult.errors[0]}
                    </p>
                 </div>
              </div>
              <div className="flex items-center gap-2">
                {importResult.success && (
                  <button 
                    onClick={() => setShowImportDetail(!showImportDetail)} 
                    className="px-3 py-1.5 bg-white/20 rounded-lg text-xs font-semibold uppercase tracking-wide hover:bg-white/30 transition-all"
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
                 <p className="text-sm font-semibold text-amber-800">
                   {importResult.missingPrice.length} produk tanpa bottom price (di-set Rp 0)
                 </p>
                 <p className="text-xs text-amber-600 font-medium mt-0.5 opacity-70">
                   Silakan update harga produk berikut agar sistem bisa menghitung komisi dengan benar.
                 </p>
                 <div className="mt-2 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                   {importResult.missingPrice.map((name, i) => (
                     <span key={i} className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded border border-amber-200 truncate max-w-[200px]">
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
                 <span className="text-sm font-semibold text-slate-600">{importResult.imported} berhasil diimport</span>
               </div>
               {importResult.skipped > 0 && (
                 <div className="flex items-center gap-2">
                   <X className="w-3.5 h-3.5 text-slate-400" />
                   <span className="text-sm font-semibold text-slate-400">{importResult.skipped} dilewati</span>
                 </div>
               )}
               {importResult.missingPrice.length > 0 && (
                 <div className="flex items-center gap-2">
                   <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                   <span className="text-sm font-semibold text-amber-600">{importResult.missingPrice.length} tanpa harga</span>
                 </div>
               )}
             </div>
           )}

           {/* Expandable Detail */}
           {importResult.success && showImportDetail && (
             <div className="px-4 py-3 max-h-60 overflow-y-auto bg-white">
               <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 opacity-50">Daftar Produk Diimport</p>
               <div className="space-y-1">
                 {importResult.importedItems.map((name, i) => {
                   const isMissing = importResult.missingPrice.includes(name);
                   return (
                     <div key={i} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm font-semibold ${isMissing ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-slate-50 text-slate-600'}`}>
                       <span className="flex-shrink-0">
                         {isMissing ? <AlertTriangle className="w-3 h-3 text-amber-500" /> : <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                       </span>
                       <span className="truncate">{name}</span>
                       {isMissing && <span className="ml-auto text-xs bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide flex-shrink-0">No Price</span>}
                     </div>
                   );
                 })}
                 {importResult.imported > importResult.importedItems.length && (
                   <p className="text-xs text-slate-400 font-semibold text-center py-2">
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
                className="w-full pl-10 pr-4 py-2 bg-slate-50/50 border border-slate-200 rounded-lg outline-none focus:border-primary transition-all font-medium text-sm shadow-sm"
              />
           </div>
           <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400 hover:text-primary transition-colors opacity-70">
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
                <th className="px-5 py-3 text-left text-xs text-slate-400 font-semibold uppercase tracking-wide opacity-70">Kode Barang</th>
                <th className="px-5 py-3 text-left text-xs text-slate-400 font-semibold uppercase tracking-wide opacity-70">Nama Barang</th>
                <th className="px-5 py-3 text-left text-xs text-slate-400 font-semibold uppercase tracking-wide opacity-70">Harga Bawah</th>
                <th className="px-5 py-3 text-left text-xs text-slate-400 font-semibold uppercase tracking-wide opacity-70">Sync</th>
                <th className="px-5 py-3 text-center text-xs text-slate-400 font-semibold uppercase tracking-wide opacity-70">-</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="group hover:bg-slate-50/30 transition-all">
                  <td className="px-5 py-3">
                    <span className="text-sm font-semibold bg-slate-900 text-white px-2 py-1 rounded tracking-wide group-hover:bg-primary transition-colors">
                       {product.sku}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                          <Package className="w-4 h-4" />
                       </div>
                       <div>
                          <p className="text-sm font-semibold text-slate-800 leading-none">{product.name}</p>
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mt-1 opacity-50">Verified</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-sm font-semibold text-primary tracking-tight">{product.bottomPrice}</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                       <Activity className="w-2.5 h-2.5 text-emerald-500" />
                       <p className="text-xs font-semibold text-slate-400 opacity-50">{product.lastUpdated}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                       <button onClick={() => openProductModal(product)} className="w-8 h-8 hover:bg-slate-100 rounded text-slate-300 hover:text-slate-900 transition-all flex items-center justify-center">
                          <Edit className="w-4 h-4" />
                       </button>
                       <button onClick={() => confirmDeleteProduct(product)} className="w-8 h-8 hover:bg-rose-50 rounded text-slate-300 hover:text-rose-500 transition-all flex items-center justify-center">
                          <Trash2 className="w-4 h-4" />
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
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mt-1 opacity-50">Map CSV columns</p>
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
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-400 ml-1 opacity-50">SKU Field</label>
                      <div className="relative">
                         <select 
                           value={mapping.skuCol}
                           onChange={(e) => setMapping({ ...mapping, skuCol: parseInt(e.target.value) })}
                           className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-sm outline-none transition-all appearance-none shadow-sm"
                         >
                            <option value={-1}>IGNORE</option>
                            {csvRows[headerIndex]?.map((h, i) => <option key={i} value={i}>{h || `Column ${i+1}`}</option>)}
                         </select>
                         <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rotate-90 text-slate-300 pointer-events-none" />
                      </div>
                   </div>
                   <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wide text-primary ml-1 opacity-70">Name Field *</label>
                      <div className="relative">
                         <select 
                           value={mapping.nameCol}
                           onChange={(e) => setMapping({ ...mapping, nameCol: parseInt(e.target.value) })}
                           className="w-full px-4 py-2 bg-white border border-primary/30 rounded-lg font-medium text-sm outline-none transition-all appearance-none shadow-sm text-primary"
                         >
                            <option value={-1}>SELECT</option>
                            {csvRows[headerIndex]?.map((h, i) => <option key={i} value={i}>{h || `Column ${i+1}`}</option>)}
                         </select>
                         <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rotate-90 text-primary/40 pointer-events-none" />
                      </div>
                   </div>
                   <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wide text-primary ml-1 opacity-70">Price Field *</label>
                      <div className="relative">
                         <select 
                           value={mapping.priceCol}
                           onChange={(e) => setMapping({ ...mapping, priceCol: parseInt(e.target.value) })}
                           className="w-full px-4 py-2 bg-white border border-primary/30 rounded-lg font-medium text-sm outline-none transition-all appearance-none shadow-sm text-primary"
                         >
                            <option value={-1}>SELECT</option>
                            {csvRows[headerIndex]?.map((h, i) => <option key={i} value={i}>{h || `Column ${i+1}`}</option>)}
                         </select>
                         <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rotate-90 text-primary/40 pointer-events-none" />
                      </div>
                   </div>
                </div>

                <div className="bg-slate-900 rounded-xl p-4 relative overflow-hidden">
                   <h3 className="text-xs font-semibold uppercase tracking-wide text-white/30 mb-4 flex items-center gap-2">
                      <Box className="w-4 h-4 text-primary" /> PREVIEW
                   </h3>
                   <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm border-separate border-spacing-y-1">
                         <thead>
                            <tr className="text-white/20 uppercase tracking-wide font-semibold">
                               {csvRows[headerIndex]?.slice(0, 5).map((h, i) => (
                                  <th key={i} className="pb-1 px-3">{h || `Column ${i+1}`}</th>
                               ))}
                            </tr>
                         </thead>
                         <tbody>
                            {csvRows.slice(headerIndex + 1, headerIndex + 5).map((row, r) => (
                               <tr key={r} className="bg-white/5 rounded">
                                  {row.slice(0, 5).map((c, i) => (
                                     <td key={i} className="py-2 px-3 font-medium text-white/60 max-w-[100px] truncate opacity-70">{c}</td>
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
                 className="px-4 py-2 font-semibold uppercase tracking-wide text-xs text-slate-400 hover:text-slate-900 transition-colors"
               >
                 Cancel
               </button>
               <button 
                 onClick={processImport}
                 disabled={mapping.nameCol === -1 || mapping.priceCol === -1 || isImporting}
                 className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium text-sm shadow-sm hover:bg-primary/90 transition-all flex items-center gap-2 active:scale-95 text-center"
               >
                 {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                 Import Products
               </button>
             </div>
          </div>
        </div>
      )}

      {/* Product Add/Edit Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center shadow-sm">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 tracking-tight leading-none">{editingProduct ? 'Edit Produk' : 'Tambah Produk'}</h2>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mt-1 opacity-50">Manage product data</p>
                </div>
              </div>
              <button onClick={() => setShowProductModal(false)} className="w-8 h-8 bg-white border border-slate-100 rounded-lg flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all shadow-sm">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-400 ml-1 opacity-70">Kode Barang / SKU</label>
                <input
                  type="text"
                  value={productForm.sku}
                  onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                  placeholder="Opsional"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-sm outline-none focus:border-primary transition-all shadow-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-primary ml-1 opacity-70">Nama Barang *</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="Nama produk"
                  className="w-full px-4 py-2 bg-white border border-primary/30 rounded-lg font-medium text-sm outline-none focus:border-primary transition-all shadow-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-primary ml-1 opacity-70">Harga Bawah (Rp) *</label>
                <input
                  type="number"
                  value={productForm.bottom_price}
                  onChange={(e) => setProductForm({ ...productForm, bottom_price: e.target.value })}
                  placeholder="0"
                  className="w-full px-4 py-2 bg-white border border-primary/30 rounded-lg font-medium text-sm outline-none focus:border-primary transition-all shadow-sm"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button onClick={() => setShowProductModal(false)} className="px-4 py-2 font-semibold uppercase tracking-wide text-xs text-slate-400 hover:text-slate-900 transition-colors">Cancel</button>
              <button
                onClick={handleSaveProduct}
                className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium text-sm shadow-sm hover:bg-primary/90 transition-all flex items-center gap-2 active:scale-95 text-center"
              >
                <Save className="w-4 h-4" />
                {editingProduct ? 'Simpan' : 'Tambah'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-md">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 overflow-hidden animate-in zoom-in-95 duration-300">
             <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4 mx-auto">
               <AlertTriangle className="w-6 h-6" />
             </div>
             <h3 className="text-lg font-semibold text-center text-slate-900 mb-2">Hapus Produk?</h3>
             <p className="text-sm text-slate-500 text-center mb-6">
               Yakin ingin menghapus produk "{productToDelete.name}"?
             </p>
             <div className="flex items-center gap-3">
               <button 
                 onClick={() => setProductToDelete(null)}
                 className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors"
               >
                 Batal
               </button>
               <button 
                 onClick={executeDeleteProduct}
                 className="flex-1 px-4 py-2 bg-rose-600 text-white hover:bg-rose-700 rounded-lg text-sm font-medium transition-colors shadow-sm"
               >
                 Hapus
               </button>
             </div>
           </div>
        </div>
      )}
      {/* Import Resolution: Bulk Dialog */}
      {showBulkUpdateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-md">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 overflow-hidden animate-in zoom-in-95 duration-300">
             <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-4 mx-auto">
               <AlertTriangle className="w-6 h-6" />
             </div>
             <h3 className="text-lg font-semibold text-center text-slate-900 mb-2">Harga Berubah</h3>
             <p className="text-sm text-slate-500 text-center mb-6">
               Terdapat <span className="font-bold text-slate-800">{pendingChangedProducts.length} barang</span> yang sudah ada tetapi memiliki harga baru. Ingin perbarui semua harganya sekaligus?
             </p>
             <div className="flex flex-col gap-2">
               <button 
                 onClick={() => {
                   executeFinalImport([...pendingNewProducts, ...pendingChangedProducts]);
                   setShowBulkUpdateDialog(false);
                 }}
                 className="w-full px-4 py-2 bg-primary text-white hover:bg-primary/90 rounded-lg text-sm font-medium transition-colors shadow-sm"
               >
                 Iya, Ubah Semua Harga
               </button>
               {pendingChangedProducts.length > 1 && (
                 <button 
                   onClick={() => {
                     setShowSelectionModal(true);
                     setShowBulkUpdateDialog(false);
                   }}
                   className="w-full px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors"
                 >
                   Pilih Harga Secara Manual
                 </button>
               )}
               <button 
                 onClick={() => {
                   executeFinalImport(pendingNewProducts);
                   setShowBulkUpdateDialog(false);
                 }}
                 className="w-full px-4 py-2 bg-slate-50 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg text-sm transition-colors border border-slate-200"
               >
                 Abaikan (Hanya Impor Barang Baru)
               </button>
             </div>
           </div>
        </div>
      )}

      {/* Import Resolution: Manual Selection Modal */}
      {showSelectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-300 border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
               <div>
                  <h2 className="text-lg font-semibold text-slate-900 tracking-tight leading-none">Pilih Barang yang Mau Diperbarui</h2>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mt-1 opacity-70">
                    {pendingChangedProducts.filter(p => p.isSelected).length} dari {pendingChangedProducts.length} dipilih
                  </p>
               </div>
               <button onClick={() => setShowSelectionModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-50 transition-all text-slate-400">
                 <X className="w-4 h-4" />
               </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-0">
               <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-slate-50 sticky top-0 shadow-sm z-10">
                     <tr className="uppercase tracking-wide font-semibold text-xs text-slate-500">
                        <th className="py-3 px-4 w-12 text-center">
                           <input 
                              type="checkbox" 
                              checked={pendingChangedProducts.every(p => p.isSelected)}
                              onChange={(e) => {
                                 const checked = e.target.checked;
                                 setPendingChangedProducts(prev => prev.map(p => ({ ...p, isSelected: checked })));
                              }}
                              className="w-4 h-4 accent-primary rounded cursor-pointer"
                           />
                        </th>
                        <th className="py-3 px-4">Nama Barang & SKU</th>
                        <th className="py-3 px-4">Harga Lama</th>
                        <th className="py-3 px-4 text-emerald-600">Harga Baru</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {pendingChangedProducts.map((p, i) => (
                        <tr key={i} className={`hover:bg-slate-50/50 transition-colors ${p.isSelected ? 'bg-primary/5' : ''}`}>
                           <td className="py-3 px-4 text-center">
                              <input 
                                 type="checkbox" 
                                 checked={p.isSelected}
                                 onChange={(e) => {
                                    const checked = e.target.checked;
                                    setPendingChangedProducts(prev => prev.map((item, idx) => idx === i ? { ...item, isSelected: checked } : item));
                                 }}
                                 className="w-4 h-4 accent-primary rounded cursor-pointer"
                              />
                           </td>
                           <td className="py-3 px-4">
                              <p className="font-semibold text-slate-800">{p.name}</p>
                              {p.sku && <p className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 inline-block px-1.5 py-0.5 rounded mt-1">{p.sku}</p>}
                           </td>
                           <td className="py-3 px-4 font-medium text-slate-500 line-through decoration-rose-500/50">
                              {formatPrice(p.oldPrice)}
                           </td>
                           <td className="py-3 px-4 font-semibold text-emerald-600 bg-emerald-50/30">
                              {formatPrice(p.price)}
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>

            <div className="px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">
                {pendingNewProducts.length} barang baru akan otomatis ditambahkan.
              </span>
              <div className="flex gap-3">
                 <button 
                    onClick={() => setShowSelectionModal(false)}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all font-medium"
                 >
                    Batal
                 </button>
                 <button 
                    onClick={() => {
                       const selectedChanged = pendingChangedProducts.filter(p => p.isSelected);
                       executeFinalImport([...pendingNewProducts, ...selectedChanged]);
                       setShowSelectionModal(false);
                    }}
                    className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm"
                 >
                    Simpan Pilihan
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
