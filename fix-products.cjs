const fs = require('fs');
const path = './src/app/pages/ProductPriceListPage.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add PageHeader import
if (!content.includes('import { PageHeader }')) {
  content = content.replace('import { toast } from "sonner";', 'import { toast } from "sonner";\nimport { PageHeader } from "../components/PageHeader";');
}

// Replace Page Header implementation
const oldHeaderRegex = /<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/;

const newHeader = `<PageHeader
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
      />`;

content = content.replace(/<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">[\s\S]*?(?={importResult && \()/, newHeader + "\n\n      ");


// Regex to clean up typography everywhere
content = content.replace(/ \bitalic\b/g, '');
content = content.replace(/ \btracking-widest\b/g, ' tracking-wide');
content = content.replace(/ \btracking-tighter\b/g, ' tracking-tight');
content = content.replace(/ \btext-\[7px\]\b/g, ' text-xs');
content = content.replace(/ \btext-\[8px\]\b/g, ' text-xs');
content = content.replace(/ \btext-\[9px\]\b/g, ' text-xs');
content = content.replace(/ \btext-\[10px\]\b/g, ' text-sm');
content = content.replace(/ \btext-\[11px\]\b/g, ' text-sm');

// State for delete modal
if (!content.includes('const [productToDelete')) {
  content = content.replace('const [showProductModal, setShowProductModal] = useState(false);', 'const [showProductModal, setShowProductModal] = useState(false);\n  const [productToDelete, setProductToDelete] = useState<Product | null>(null);');
}

// Replace delete window.confirm with state setter
const oldDeleteFn = `const handleDeleteProduct = async (product: Product) => {
    if (!window.confirm(\`Hapus produk "\${product.name}"?\`)) return;
    try {
      await axios.delete(\`\${API_URL}/products/\${product.id}\`);
      toast.success("Produk berhasil dihapus");
      fetchProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Gagal menghapus produk");
    }
  };`;

const newDeleteFn = `const confirmDeleteProduct = (product: Product) => {
    setProductToDelete(product);
  };

  const executeDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      await axios.delete(\`\${API_URL}/products/\${productToDelete.id}\`);
      toast.success("Produk berhasil dihapus");
      setProductToDelete(null);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Gagal menghapus produk");
      setProductToDelete(null);
    }
  };`;

content = content.replace(oldDeleteFn, newDeleteFn);
content = content.replace(/onClick=\{\(\) => handleDeleteProduct\(product\)\}/g, 'onClick={() => confirmDeleteProduct(product)}');

// Add delete confirmation dialog at the end
const deleteModal = `
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
    </div>
  );
}
`;

content = content.replace(/<\/div>\s*<\/div>\s*\)\s*\}\s*<\/div>\s*\);\s*}\s*$/, `</div>\n      )}\n${deleteModal}`);

fs.writeFileSync(path, content, 'utf8');
console.log('ProductPriceListPage.tsx updated successfully');
