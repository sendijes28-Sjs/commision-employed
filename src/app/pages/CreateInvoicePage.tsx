import { useState, useEffect, useCallback, useMemo } from "react";
import { PageHeader } from "../components/PageHeader";
import { Link, useNavigate } from "react-router";
import { Plus, Trash2, AlertTriangle, ArrowLeft, Upload, Loader2, FileText, CheckCircle2, ChevronRight, Hash, Calendar, Users, ListFilter, DollarSign, Wand2, ShieldCheck, ShieldAlert, Tag } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import { InvoiceSchema, type InvoiceFormData } from "../schemas/invoiceSchema";
import { useAuth } from "../context/AuthContext";

interface User {
  id: number;
  name: string;
  team: string;
}

interface Product {
  id: number;
  sku: string;
  name: string;
  normal_price: number;
  bottom_price: number;
}

import { API_URL } from '@/lib/api';
const normalizeString = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, "");

export function CreateInvoicePage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verification, setVerification] = useState<any>(null);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isSuperAdmin = user?.role === 'super_admin';
  const itemsLocked = uploadSuccess && !isSuperAdmin;

  const { register, control, handleSubmit, setValue, watch, reset: resetForm, formState: { errors } } = useForm<InvoiceFormData>({
    resolver: zodResolver(InvoiceSchema) as any,
    defaultValues: {
      invoiceNumber: "",
      date: new Date().toISOString().split("T")[0],
      team: "",
      userId: "",
      customerName: "",
      items: [{ id: Date.now().toString(), productName: "", quantity: 1, price: 0, normalPrice: 0, bottomPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = watch("items");

  const findProductMatch = (inputName: string, productList: Product[]) => {
    if (!inputName) return null;
    const normInput = normalizeString(inputName);
    
    // Strict match only: Only auto-fill if the user types or selects the EXACT product name.
    // We leave the "guessing" to the backend OCR validation.
    return productList.find(p => normalizeString(p.name) === normInput) || null;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const promises: any[] = [axios.get(`${API_URL}/products`)];
        if (isAdmin) {
          promises.push(axios.get(`${API_URL}/users`));
        }
        
        const results = await Promise.all(promises);
        setProducts(results[0].data);
        if (isAdmin && results[1]) {
          setUsers(results[1].data);
        } else if (user) {
          // If not admin (or fetch failed), at least show the current user so their name appears
          setUsers([{ id: user.id, name: user.name, team: user.team || "" }]);
        }
      } catch (error) { toast.error("An error occurred"); }
    };
    fetchData();
  }, [isAdmin, user]);

  // Initialize form with current user details once the users list is loaded
  useEffect(() => {
    if (user && users.length > 0) {
      const currentId = watch("userId");
      const currentTeam = watch("team");
      
      // Only set if not already set by the user or by previous logic
      if (!currentId) {
        setValue("userId", String(user.id));
      }
      if (!currentTeam) {
        setValue("team", user.team || "");
      }
    }
  }, [user, users, setValue, watch]);

  // Auto-update team when selected user changes (Form Field watch)
  const watchedUserId = watch("userId");
  useEffect(() => {
    if (watchedUserId && users.length > 0) {
      const foundUser = users.find(u => String(u.id) === String(watchedUserId));
      if (foundUser && foundUser.team) {
        setValue("team", foundUser.team);
      }
    }
  }, [watchedUserId, users, setValue]);

  // Build a normalized lookup map once from the products array
  const productMap = useMemo(() => {
    const map = new Map<string, { normal: number, bottom: number }>();
    products.forEach(p => map.set(normalizeString(p.name), { normal: p.normal_price, bottom: p.bottom_price }));
    return map;
  }, [products]);

  // Use onBlur handler instead of useEffect to update bottomPrice
  // This fires ONLY when user leaves the input â€” not on every keystroke
  const handleProductBlur = useCallback((index: number) => {
    const currentName = watch(`items.${index}.productName`);
    if (!currentName) return;
    const pricing = productMap.get(normalizeString(currentName));
    if (pricing) {
      setValue(`items.${index}.normalPrice`, pricing.normal);
      setValue(`items.${index}.bottomPrice`, pricing.bottom);
    }
  }, [productMap, watch, setValue]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) handleFileUpload(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'image/*': ['.png', '.jpg', '.jpeg'] },
    multiple: true
  });

  const handleFileUpload = async (files: File[]) => {
    setIsProcessing(true);
    setUploadSuccess(false);
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const resp = await axios.post(`${API_URL}/ocr/scan`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const result = resp.data;

      if (result.error) {
        alert(`Error: ${result.error}`);
        return;
      }

      setValue("invoiceNumber", result.invoiceNumber || "");
      setValue("date", result.date || new Date().toISOString().split("T")[0]);
      setValue("customerName", result.customerName || "");
      // Removed generic 'Lelang' assignment here since it should either be auto-filled from the user (non-admin) or manually selected (admin)
      if (result.items && result.items.length > 0) {
        remove();
        result.items.forEach((item: any, idx: number) => {
          const vItem = result.verification?.items?.[idx];
          append({ 
            id: Date.now().toString() + Math.random(),
            productName: item.productName || "", 
            quantity: Number(item.quantity) || 1, 
            price: Math.floor(Number(item.price)) || 0, 
            normalPrice: vItem?.normalPrice ? Math.floor(Number(vItem.normalPrice)) : 0, 
            bottomPrice: vItem?.bottomPrice ? Math.floor(Number(vItem.bottomPrice)) : 0 
          });
        });
      }
      setVerification(result.verification);
      setUploadSuccess(true);
    } catch (e) {
      toast.error('OCR upload failed');
      alert('Gagal memproses dokumen. Silakan coba lagi atau input manual.');
    } finally { setIsProcessing(false); }
  };

  const formatRupiah = (val: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);

  const onSubmit = async (data: InvoiceFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        invoice_number: data.invoiceNumber,
        date: data.date,
        customer_name: data.customerName,
        total_amount: data.items.reduce((sum, item) => sum + (item.quantity * Math.floor(item.price)), 0),
        items: data.items.map((item) => ({ 
          productName: item.productName, 
          quantity: item.quantity, 
          price: Math.floor(item.price), 
          normalPrice: Math.floor(item.normalPrice || 0),
          bottomPrice: Math.floor(item.bottomPrice || 0) 
        })),
        userId: data.userId,
        team: data.team
      };
      await axios.post(`${API_URL}/invoices`, payload);
      navigate("/invoices");
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to save invoice.");
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/invoices" className="w-9 h-9 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all border border-slate-100">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 leading-none">New Invoice</h1>
            <p className="text-muted-foreground mt-1.5 font-medium text-xs opacity-70">Create a new invoice manually or by uploading a document for OCR.</p>
          </div>
        </div>
      </div>

      <div 
        {...getRootProps()} 
        className={`relative group bg-white border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 ${
          isDragActive ? "border-primary bg-primary/5" : "border-slate-200 hover:border-primary/30"
        } ${uploadSuccess ? "border-emerald-400 bg-emerald-50/10" : "shadow-sm"}`}
      >
        <input {...getInputProps()} />
        
        {isProcessing ? (
          <div className="flex flex-col items-center gap-3 py-1">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-lg animate-spin" />
            <div className="text-center">
              <p className="font-semibold text-base tracking-tight text-slate-900">Processing Document...</p>
              <p className="text-[8px] font-semibold text-primary uppercase tracking-wide mt-1 opacity-70">Extracting information</p>
            </div>
          </div>
        ) : uploadSuccess ? (
          <div className="flex flex-col items-center gap-2 py-1">
            <div className="w-10 h-10 bg-emerald-500 text-white rounded-lg flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-lg tracking-tight text-slate-900">Upload Complete</p>
              <p className="text-[8px] font-semibold text-emerald-600 uppercase tracking-wide opacity-70">Information extracted successfully</p>
            </div>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 bg-slate-900 text-white rounded-lg flex items-center justify-center shadow-md">
              <Upload className="w-5 h-5" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-xl tracking-tight text-slate-900">Upload Invoice</p>
              <p className="text-[10px] font-medium text-slate-400 mt-1 opacity-70">PDF or Image for automated data entry.</p>
            </div>
          </>
        )}
      </div>


      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* Metadata Grid */}
          <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm relative">
            <div className="flex items-center gap-3 mb-5 relative z-10">
               <div className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center font-semibold text-[10px]">01</div>
               <h2 className="text-lg font-semibold text-slate-900">Invoice Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
               <div className="space-y-2 relative">
                 <label className="text-[8px] font-semibold uppercase tracking-wide text-slate-400 ml-1 opacity-70 flex items-center justify-between">
                    Invoice Number
                    {verification && isAdmin && (
                      verification.found ? <ShieldCheck className="w-2.5 h-2.5 text-emerald-500" /> : <AlertTriangle className="w-2.5 h-2.5 text-rose-500" />
                    )}
                 </label>
                 <input
                   {...register("invoiceNumber")}
                   className={`w-full px-4 py-2.5 bg-slate-50/50 border rounded-lg outline-none focus:border-primary transition-all font-semibold text-[10px] ${
                      verification && isAdmin ? (verification.found ? 'border-emerald-100' : 'border-rose-100') : 'border-slate-100'
                   }`}
                   placeholder="INV/2026/001"
                 />
                 {verification && !verification.found && isAdmin && (
                    <span className="absolute -bottom-3 right-1 text-[6px] font-semibold text-rose-500 uppercase tracking-wide animate-pulse">Not Found in System</span>
                 )}
               </div>
               <div className="space-y-2 relative">
                 <label className="text-[8px] font-semibold uppercase tracking-wide text-slate-400 ml-1 opacity-70 flex items-center justify-between">
                    Date
                     {verification?.found && isAdmin && (
                       verification.dateMatched ? <ShieldCheck className="w-2.5 h-2.5 text-emerald-500" /> : <AlertTriangle className="w-2.5 h-2.5 text-orange-500" />
                     )}
                 </label>
                 <input
                   {...register("date")}
                   type="date"
                    className={`w-full px-4 py-2.5 bg-slate-50/50 border rounded-lg outline-none focus:border-primary transition-all font-semibold text-[10px] ${
                       verification?.found && isAdmin ? (verification.dateMatched ? 'border-emerald-100' : 'border-orange-100') : 'border-slate-100'
                    }`}
                 />
               </div>
              <div className="space-y-2">
                <label className="text-[8px] font-semibold uppercase tracking-wide text-slate-400 ml-1 opacity-70">Team</label>
                <select
                  {...register("team")}
                  disabled={!isAdmin}
                  className={`w-full px-4 py-2.5 ${!isAdmin ? 'bg-slate-100 cursor-not-allowed' : 'bg-slate-50/50'} border border-slate-100 rounded-lg outline-none focus:border-primary transition-all font-semibold text-[10px] appearance-none`}
                >
                  <option value="">Select Team...</option>
                  <option value="Lelang">Lelang</option>
                  <option value="User">User</option>
                  <option value="Offline">Offline</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-semibold uppercase tracking-wide text-slate-400 ml-1 opacity-70">User</label>
                <select
                  {...register("userId")}
                  disabled={!isAdmin}
                  className={`w-full px-4 py-2.5 ${!isAdmin ? 'bg-slate-100 cursor-not-allowed' : 'bg-slate-50/50'} border border-slate-100 rounded-lg outline-none focus:border-primary transition-all font-semibold text-[10px] appearance-none`}
                >
                  <option value="">Select User...</option>
                  {users.map(u => <option key={u.id} value={String(u.id)}>{u.name}</option>)}
                </select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[8px] font-semibold uppercase tracking-wide text-slate-400 ml-1 opacity-70">Customer Details</label>
                <textarea
                  {...register("customerName")}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-lg outline-none focus:border-primary transition-all font-semibold text-[10px] resize-none"
                  placeholder="Customer address and contact info..."
                />
              </div>
            </div>
          </div>

          {/* Line Items - Premium Smart Ledger */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center font-semibold text-[10px]">02</div>
                <h2 className="text-lg font-semibold text-slate-900 tracking-tight">Invoice Items</h2>
              </div>
              {!itemsLocked && (
                <button
                  type="button"
                  onClick={() => append({ id: Date.now().toString(), productName: "", quantity: 1, price: 0, normalPrice: 0, bottomPrice: 0 })}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all font-semibold uppercase tracking-wide text-[8px] flex items-center gap-2 active:scale-95"
                >
                  <Plus className="w-3 h-3" /> Add Item
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-y-1.5 px-3 pb-3">
                <thead>
                  <tr className="text-left text-[7px] text-slate-400 uppercase font-semibold tracking-wide opacity-70">
                    <th className="px-3 py-1.5">Product Name</th>
                    <th className="px-3 py-1.5 w-20 text-center">Qty</th>
                    <th className="px-3 py-1.5 w-32">Price</th>
                    <th className="px-3 py-1.5 w-32 text-right">Total</th>
                    <th className="px-3 py-1.5 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field, index) => (
                    <tr key={field.id} className="group bg-slate-50/50 hover:bg-white border-2 border-transparent transition-all rounded-lg overflow-hidden">
                      <td className="px-3 py-3 rounded-l-lg">
                        <div className="flex flex-col relative">
                           <input
                             {...register(`items.${index}.productName`)}
                             list="products-list"
                             onBlur={() => handleProductBlur(index)}
                             readOnly={itemsLocked}
                             className={`bg-transparent border-none focus:ring-0 w-full p-0 font-semibold text-slate-900 text-xs placeholder:text-slate-300 ${itemsLocked ? 'opacity-70 cursor-not-allowed' : ''}`}
                             placeholder="Product..."
                           />
                           <span className="text-[7px] font-semibold text-slate-400 mt-0.5 uppercase tracking-wide opacity-70">Product Name</span>
                        </div>
                      </td>
                        <td className="px-3 py-3 text-center">
                          <div className="flex items-center gap-1.5 relative">
                           <input
                             {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                             type="number"
                             readOnly={itemsLocked}
                             className={`w-full bg-white border border-slate-200 rounded px-1.5 py-1.5 text-center font-semibold text-slate-900 outline-none text-[10px] ${itemsLocked ? 'bg-slate-50 cursor-not-allowed' : ''}`}
                           />
                          </div>
                        </td>
                       <td className="px-3 py-3">
                         <div className="flex items-center gap-1.5 relative">
                           <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                           <input
                              {...register(`items.${index}.price`, { valueAsNumber: true })}
                              type="number"
                              readOnly={itemsLocked}
                              className={`w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded font-semibold text-slate-900 outline-none text-[10px] ${itemsLocked ? 'bg-slate-50 cursor-not-allowed' : ''}`}
                            />
                             {watchedItems[index]?.normalPrice > 0 && (
                               <div className="absolute -bottom-3 left-1 flex items-center gap-1">
                                 <span className="text-[6px] font-bold uppercase tracking-tight text-slate-400">
                                   {(() => {
                                    const normal = watchedItems[index]?.normalPrice || 0;
                                    const selling = (watchedItems[index] as any)?.price || 0;
                                    const drop = ((normal - selling) / normal) * 100;
                                    
                                    let colorClass = "bg-emerald-500";
                                    let label = "Safe";
                                    let textColor = "text-slate-400";

                                    if (drop > 8) { 
                                      colorClass = "bg-rose-600 animate-pulse"; 
                                      label = "REJECT"; 
                                      textColor = "text-rose-600";
                                    } else if (drop > 5) { 
                                      colorClass = "bg-rose-500"; 
                                      label = "Critical"; 
                                      textColor = "text-rose-500";
                                    } else if (drop > 2) { 
                                      colorClass = "bg-amber-500"; 
                                      label = "Warning"; 
                                      textColor = "text-amber-500";
                                    } else if (drop < 0) {
                                      label = "Promo";
                                      textColor = "text-emerald-500";
                                    }

                                    return (
                                      <>
                                        <div className={`w-1 h-1 rounded-full ${colorClass}`} />
                                        <span className={`text-[6px] font-bold uppercase tracking-tight ${textColor}`}>
                                          {label} ({drop > 0 ? drop.toFixed(1) : 0}%)
                                        </span>
                                      </>
                                    );
                                  })()}
                                 </span>
                               </div>
                             )}
                         </div>
                       </td>
                      <td className="px-3 py-3 text-right">
                        <p className="font-semibold text-[10px] text-primary">{formatRupiah((Number(watchedItems[index].quantity) || 0) * (Number(watchedItems[index].price) || 0))}</p>
                        <p className="text-[7px] font-semibold text-slate-400 uppercase tracking-wide mt-0.5 opacity-50">Subtotal</p>
                      </td>
                      <td className="px-3 py-3 rounded-r-lg">
                        {!itemsLocked && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="w-8 h-8 flex items-center justify-center bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 h-full">
          <div className="sticky top-6 space-y-4">
            <div className="bg-slate-900 rounded-xl p-6 text-white shadow-sm relative overflow-hidden group">
               <h3 className="text-[8px] font-semibold uppercase tracking-wide text-slate-500 mb-6 relative z-10 opacity-70">Summary</h3>
               
               <div className="space-y-3 relative z-10">
                  <div className="flex justify-between items-center text-slate-400">
                     <span className="text-[9px] font-semibold uppercase tracking-wide opacity-50">Total Quantity</span>
                     <span className="font-semibold text-[10px]">{watchedItems.reduce((s, i) => s + (Number(i.quantity) || 0), 0)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                     <span className="text-[9px] font-semibold uppercase tracking-wide opacity-50">Gross Amount</span>
                     <span className="font-semibold text-[10px]">{formatRupiah(watchedItems.reduce((s, i) => s + ((Number(i.quantity) || 0) * (Number(i.price) || 0)), 0))}</span>
                  </div>
                  
                  <div className="pt-6 border-t border-slate-800 mt-6">
                     <p className="text-[7px] font-semibold text-slate-500 uppercase tracking-wide mb-1 opacity-50">Total Amount</p>
                     <p className="text-2xl font-semibold text-white tracking-wide truncate">{formatRupiah(watchedItems.reduce((s, i) => s + ((Number(i.quantity) || 0) * (Number(i.price) || 0)), 0))}</p>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-white py-3 rounded-lg mt-6 font-semibold uppercase tracking-wide text-[9px] hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-30 flex items-center justify-center gap-2 active:scale-95"
                  >
                    {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <>Save Invoice <ChevronRight className="w-3 h-3" /></>}
                  </button>
               </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
               <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center flex-shrink-0">
                     <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                     <p className="text-[8px] font-semibold text-slate-900 uppercase tracking-wide mb-0.5 opacity-70">Security Status</p>
                     <p className="text-[10px] font-medium text-slate-500 leading-relaxed opacity-70">Data verification active.</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </form>

      {/* Single shared datalist for all product inputs â€” ~1199 nodes instead of NÃ—1199 */}
      <datalist id="products-list">
        {products.map(p => <option key={p.id} value={p.name}>{p.sku}</option>)}
      </datalist>
    </div>
  );
}
