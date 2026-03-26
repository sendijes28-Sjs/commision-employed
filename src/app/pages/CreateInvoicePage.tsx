import { useState, useEffect, useCallback } from "react";
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
  bottom_price: number;
}

const API_URL = "http://localhost:3001/api";
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

  const { register, control, handleSubmit, setValue, watch, reset: resetForm, formState: { errors } } = useForm<InvoiceFormData>({
    resolver: zodResolver(InvoiceSchema) as any,
    defaultValues: {
      invoiceNumber: "",
      date: new Date().toISOString().split("T")[0],
      team: "",
      userId: "",
      customerName: "",
      items: [{ id: Date.now().toString(), productName: "", quantity: 1, price: 0, bottomPrice: 0 }],
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
    // Only exact matches for auto-fill bottom price to avoid wrong product matching
    const exactMatch = productList.find(p => normalizeString(p.name) === normInput || normalizeString(p.sku || "") === normInput);
    return exactMatch || null;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, productsRes] = await Promise.all([
          axios.get(`${API_URL}/users`),
          axios.get(`${API_URL}/products`)
        ]);
        setUsers(usersRes.data);
        setProducts(productsRes.data);
      } catch (error) { console.error(error); }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (products.length > 0 && watchedItems.length > 0) {
      watchedItems.forEach((item, index) => {
        if (!item.bottomPrice || item.bottomPrice === 0) {
          const matched = findProductMatch(item.productName, products);
          if (matched) setValue(`items.${index}.bottomPrice`, matched.bottom_price);
        }
      });
    }
  }, [products, watchedItems.length]);

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
      setValue("team", "Lelang");
      if (result.items && result.items.length > 0) {
        remove();
        result.items.forEach((item: any) => {
          append({ id: Date.now().toString() + Math.random(), productName: item.productName || "", quantity: Number(item.quantity) || 1, price: Math.floor(Number(item.price)) || 0, bottomPrice: 0 });
        });
      }
      setVerification(result.verification);
      setUploadSuccess(true);
    } catch (e) {
      console.error('OCR upload failed:', e);
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
        team: data.team,
        user_id: parseInt(data.userId),
        total_amount: data.items.reduce((sum, item) => sum + (item.quantity * Math.floor(item.price)), 0),
        items: data.items.map((item) => ({ 
          productName: item.productName, 
          quantity: item.quantity, 
          price: Math.floor(item.price), 
          bottomPrice: Math.floor(item.bottomPrice || 0) 
        }))
      };
      await axios.post(`${API_URL}/invoices`, payload);
      navigate("/invoices");
    } catch (err) { alert("Failed to save invoice."); }
    finally { setIsSubmitting(false); }
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
            <h1 className="text-2xl font-semibold tracking-tighter text-slate-900 leading-none">New Invoice</h1>
            <p className="text-muted-foreground mt-1.5 font-medium text-xs italic opacity-70">Create a new invoice manually or by uploading a document for OCR.</p>
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
              <p className="font-semibold text-base tracking-tighter text-slate-900">Processing Document...</p>
              <p className="text-[8px] font-semibold text-primary uppercase tracking-widest mt-1 italic opacity-70">Extracting information</p>
            </div>
          </div>
        ) : uploadSuccess ? (
          <div className="flex flex-col items-center gap-2 py-1">
            <div className="w-10 h-10 bg-emerald-500 text-white rounded-lg flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-lg tracking-tighter text-slate-900">Upload Complete</p>
              <p className="text-[8px] font-semibold text-emerald-600 uppercase tracking-widest italic opacity-70">Information extracted successfully</p>
            </div>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 bg-slate-900 text-white rounded-lg flex items-center justify-center shadow-md">
              <Upload className="w-5 h-5" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-xl tracking-tighter text-slate-900">Upload Invoice</p>
              <p className="text-[10px] font-medium text-slate-400 mt-1 italic opacity-70">PDF or Image for automated data entry.</p>
            </div>
          </>
        )}
      </div>

      {verification && isAdmin && (
        <div className={`p-5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-300 ${
           verification.found ? (Math.floor((
            (verification.dateMatched ? 1:0) + 
            (verification.items?.filter((i:any) => i.isMasterMatch).length / (verification.items?.length || 1)) +
            (verification.items?.filter((i:any) => i.qtyMatched).length / (verification.items?.length || 1)) +
            (verification.items?.filter((i:any) => i.priceMatched).length / (verification.items?.length || 1)) +
            1
          ) / 5 * 100) >= 100 ? 'bg-emerald-50 border-emerald-100' : 'bg-orange-50 border-orange-100') : 'bg-rose-50 border-rose-100'
        }`}>
           <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${verification.found ? (
                Math.floor((
                  (verification.dateMatched ? 1:0) + 
                  (verification.items?.filter((i:any) => i.isMasterMatch).length / (verification.items?.length || 1)) +
                  (verification.items?.filter((i:any) => i.qtyMatched).length / (verification.items?.length || 1)) +
                  (verification.items?.filter((i:any) => i.priceMatched).length / (verification.items?.length || 1)) +
                  1
                ) / 5 * 100) >= 100 ? 'bg-emerald-500' : 'bg-orange-500'
              ) : 'bg-rose-500'} text-white shadow-md`}>
                 {verification.found ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
              </div>
              <div>
                 <p className={`text-sm font-bold tracking-tight leading-none ${verification.found ? (
                   Math.floor((
                    (verification.dateMatched ? 1:0) + 
                    (verification.items?.filter((i:any) => i.isMasterMatch).length / (verification.items?.length || 1)) +
                    (verification.items?.filter((i:any) => i.qtyMatched).length / (verification.items?.length || 1)) +
                    (verification.items?.filter((i:any) => i.isPriceMatch).length / (verification.items?.length || 1)) +
                    1
                  ) / 5 * 100) >= 100 ? 'text-emerald-900' : 'text-orange-900'
                 ) : 'text-rose-900'}`}>
                    {verification.found ? 'Internal Record Found' : 'Internal Record Missing'}
                 </p>
                 <p className="text-[9px] font-semibold uppercase tracking-widest mt-1.5 italic opacity-60">
                    {verification.found ? 'Matched against Ground Truth (Official Ledger)' : 'This invoice is NOT registered in company records'}
                 </p>
                 
                 {verification.found && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {!verification.dateMatched && <span className="bg-orange-200/50 text-orange-700 px-2 py-0.5 rounded text-[7px] font-bold uppercase tracking-wider">Date Mismatch</span>}
                      {verification.items?.some((i:any) => !i.isMasterMatch) && <span className="bg-orange-200/50 text-orange-700 px-2 py-0.5 rounded text-[7px] font-bold uppercase tracking-wider">Not in Ledger</span>}
                      {verification.items?.some((i:any) => !i.isPriceMatch) && <span className="bg-rose-200/50 text-rose-700 px-2 py-0.5 rounded text-[7px] font-bold uppercase tracking-wider shadow-sm">Not in Price List</span>}
                      {verification.items?.some((i:any) => !i.qtyMatched) && <span className="bg-orange-200/50 text-orange-700 px-2 py-0.5 rounded text-[7px] font-bold uppercase tracking-wider">Qty Error</span>}
                    </div>
                 )}

                 {verification.found && Math.floor((
                    (verification.dateMatched ? 1:0) + 
                    (verification.items?.filter((i:any) => i.isMasterMatch).length / (verification.items?.length || 1)) +
                    (verification.items?.filter((i:any) => i.qtyMatched).length / (verification.items?.length || 1)) +
                    (verification.items?.filter((i:any) => i.isPriceMatch).length / (verification.items?.length || 1)) +
                    1
                  ) / 5 * 100) < 100 && (
                   <div className="mt-4 pt-4 border-t border-orange-100">
                     <p className="text-[8px] font-semibold uppercase tracking-widest text-orange-900 mb-2">Discrepancy Details</p>
                      <ul className="space-y-1 text-[9px] text-orange-800 font-medium italic">
                        {!verification.dateMatched && <li>- Date does not match master records.</li>}
                        {verification.items?.some((i:any) => !i.isMasterMatch) && <li>- Some items are not recognized in the master ledger.</li>}
                        {verification.items?.some((i:any) => !i.isPriceMatch) && <li className="text-rose-700 font-bold opacity-100">- Some items are missing from the official Price List.</li>}
                        {verification.items?.some((i:any) => !i.qtyMatched) && <li>- Quantity discrepancies found for some items.</li>}
                      </ul>
                   </div>
                 )}
              </div>
           </div>
           {verification.found && (
             <div className={`flex items-center gap-5 px-5 md:border-l ${Math.floor((
              (verification.dateMatched ? 1:0) + 
              (verification.items?.filter((i:any) => i.isMasterMatch).length / (verification.items?.length || 1)) +
              (verification.items?.filter((i:any) => i.qtyMatched).length / (verification.items?.length || 1)) +
              (verification.items?.filter((i:any) => i.isPriceMatch).length / (verification.items?.length || 1)) +
              1
            ) / 5 * 100) >= 100 ? 'border-emerald-200' : 'border-orange-200'}`}>
                <div className="text-right">
                 <div className="flex flex-col items-end">
                    <p className="text-[7px] font-bold uppercase tracking-widest opacity-50 italic">Ground Truth Score</p>
                    <p className={`text-xl font-black tracking-tighter ${Math.floor((
                      (verification.dateMatched ? 1:0) + 
                      (verification.items?.filter((i:any) => i.isMasterMatch).length / (verification.items?.length || 1)) +
                      (verification.items?.filter((i:any) => i.qtyMatched).length / (verification.items?.length || 1)) +
                      (verification.items?.filter((i:any) => i.isPriceMatch).length / (verification.items?.length || 1)) +
                      (verification.found ? 1 : 0)
                    ) / 5 * 100) >= 100 ? 'text-emerald-600' : 'text-rose-600'}`}>
                       {Math.floor((
                         (verification.dateMatched ? 1:0) + 
                         (verification.items?.filter((i:any) => i.isMasterMatch).length / (verification.items?.length || 1)) +
                         (verification.items?.filter((i:any) => i.qtyMatched).length / (verification.items?.length || 1)) +
                         (verification.items?.filter((i:any) => i.isPriceMatch).length / (verification.items?.length || 1)) +
                         (verification.found ? 1 : 0)
                       ) / 5 * 100)}%
                    </p>
                    {isAdmin && (
                      <div className="flex gap-1 mt-1">
                        {verification.items?.some((i:any) => i.isBelowBottom) && (
                          <span className="bg-rose-100 text-rose-600 text-[6px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter shadow-sm flex items-center gap-0.5">
                            <AlertTriangle className="w-2 h-2" /> Low Margin
                          </span>
                        )}
                      </div>
                    )}
                 </div>
                </div>
             </div>
           )}
        </div>
      )}

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
                 <label className="text-[8px] font-semibold uppercase tracking-widest text-slate-400 ml-1 opacity-70 flex items-center justify-between">
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
                    <span className="absolute -bottom-3 right-1 text-[6px] font-semibold text-rose-500 uppercase tracking-widest italic animate-pulse">Not Found in System</span>
                 )}
               </div>
               <div className="space-y-2 relative">
                 <label className="text-[8px] font-semibold uppercase tracking-widest text-slate-400 ml-1 opacity-70 flex items-center justify-between">
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
                <label className="text-[8px] font-semibold uppercase tracking-widest text-slate-400 ml-1 opacity-70">Team</label>
                <select
                  {...register("team")}
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-lg outline-none focus:border-primary transition-all font-semibold text-[10px] appearance-none"
                >
                  <option value="">Select Team...</option>
                  <option value="Lelang">Lelang (5%)</option>
                  <option value="User">User (4.5%)</option>
                  <option value="Offline">Offline (4%)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-semibold uppercase tracking-widest text-slate-400 ml-1 opacity-70">User</label>
                <select
                  {...register("userId")}
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-lg outline-none focus:border-primary transition-all font-semibold text-[10px] appearance-none"
                >
                  <option value="">Select User...</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[8px] font-semibold uppercase tracking-widest text-slate-400 ml-1 opacity-70">Customer Details</label>
                <textarea
                  {...register("customerName")}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-lg outline-none focus:border-primary transition-all font-semibold text-[10px] resize-none italic"
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
              <button
                type="button"
                onClick={() => append({ id: Date.now().toString(), productName: "", quantity: 1, price: 0, bottomPrice: 0 })}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all font-semibold uppercase tracking-widest text-[8px] flex items-center gap-2 active:scale-95 italic"
              >
                <Plus className="w-3 h-3" /> Add Item
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-y-1.5 px-3 pb-3">
                <thead>
                  <tr className="text-left text-[7px] text-slate-400 uppercase font-semibold tracking-widest opacity-70">
                    <th className="px-3 py-1.5 italic">Product Name</th>
                    <th className="px-3 py-1.5 w-20 text-center italic">Qty</th>
                    <th className="px-3 py-1.5 w-32 italic">Price</th>
                    <th className="px-3 py-1.5 w-32 text-right italic">Total</th>
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
                             list={`products-${index}`}
                             className="bg-transparent border-none focus:ring-0 w-full p-0 font-semibold text-slate-900 text-xs placeholder:text-slate-300 italic"
                             placeholder="Product..."
                           />
                           <datalist id={`products-${index}`}>
                             {products.map(p => <option key={p.id} value={p.name}>{p.sku}</option>)}
                           </datalist>
                           <span className="text-[7px] font-semibold text-slate-400 mt-0.5 uppercase tracking-widest italic opacity-70">Product Match</span>
                           {verification && isAdmin && (
                             <div className="absolute -top-3 right-0 flex items-center gap-1 bg-white/80 backdrop-blur-sm p-0.5 rounded-md shadow-sm border border-slate-50">
                               <div title={verification?.items?.[index]?.isMasterMatch ? "Master Ledger Match" : "Not in Ledger"}>
                                 {verification?.items?.[index]?.isMasterMatch ? 
                                   <ShieldCheck className="w-2.5 h-2.5 text-emerald-500" /> : 
                                   <ShieldAlert className="w-2.5 h-2.5 text-rose-500" />
                                 }
                               </div>
                               <div title={verification?.items?.[index]?.isPriceMatch ? "Price List Match" : "Not in Price List"}>
                                 {verification?.items?.[index]?.isPriceMatch ? 
                                   <Tag className="w-2.5 h-2.5 text-emerald-500" /> : 
                                   <Tag className="w-2.5 h-2.5 text-rose-500" />
                                 }
                               </div>
                             </div>
                           )}
                        </div>
                      </td>
                        <td className="px-3 py-3 text-center">
                          <div className="flex items-center gap-1.5 relative">
                           <input
                             {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                             type="number"
                             className={`w-full bg-white border rounded px-1.5 py-1.5 text-center font-semibold text-slate-900 outline-none text-[10px] ${
                                verification?.items?.[index]?.qtyMatched ? 'border-emerald-200 bg-emerald-50/20' : 
                                (verification?.items?.[index]?.isMasterMatch ? 'border-orange-200 bg-orange-50/20' : 'border-slate-200')
                             }`}
                           />
                           {verification && isAdmin && (
                                      <div className="absolute -top-1 -right-1">
                                        {verification?.items?.[index]?.qtyMatched ? 
                                          <ShieldCheck className="w-3 h-3 text-emerald-500" /> : 
                                          <AlertTriangle className="w-3 h-3 text-orange-500" />
                                        }
                                      </div>
                                    )}
                          </div>
                        </td>
                       <td className="px-3 py-3">
                         <div className="flex items-center gap-1.5 relative">
                           <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                           <input
                              {...register(`items.${index}.price`, { valueAsNumber: true })}
                              type="number"
                              className={`w-full pl-8 pr-3 py-1.5 bg-white border rounded font-semibold text-slate-900 outline-none text-[10px] ${
                                 verification?.items?.[index]?.isBelowBottom ? 'border-rose-400 bg-rose-50 text-rose-600' :
                                 (verification?.items?.[index]?.isPriceMatch ? 'border-emerald-200 bg-emerald-50/20' : 
                                 (verification?.items?.[index]?.isMasterMatch ? 'border-orange-200 bg-orange-50/20' : 'border-slate-200'))
                              }`}
                            />
                             {isAdmin && verification?.items?.[index]?.bottomPrice > 0 && (
                               <div className="absolute -bottom-3 left-1 flex items-center gap-1">
                                 <span className={`text-[6px] font-bold uppercase tracking-tighter ${verification?.items?.[index]?.isBelowBottom ? 'text-rose-600' : 'text-slate-400'}`}>
                                   Min: {formatRupiah(verification?.items?.[index]?.bottomPrice || 0)}
                                 </span>
                                 {verification?.items?.[index]?.isBelowBottom && <AlertTriangle className="w-2 h-2 text-rose-500" />}
                               </div>
                             )}
                             {isAdmin && verification?.items?.[index]?.isPriceMatch && !verification?.items?.[index]?.isBelowBottom && (
                                 <ShieldCheck className="w-2.5 h-2.5 text-emerald-500 ml-1" />
                             )}
                         </div>
                       </td>
                      <td className="px-3 py-3 text-right">
                        <p className="font-semibold text-[10px] text-primary">{formatRupiah((Number(watchedItems[index].quantity) || 0) * (Number(watchedItems[index].price) || 0))}</p>
                        <p className="text-[7px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5 italic opacity-50">Subtotal</p>
                      </td>
                      <td className="px-3 py-3 rounded-r-lg">
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="w-8 h-8 flex items-center justify-center bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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
               <h3 className="text-[8px] font-semibold uppercase tracking-widest text-slate-500 mb-6 relative z-10 opacity-70">Summary</h3>
               
               <div className="space-y-3 relative z-10">
                  <div className="flex justify-between items-center text-slate-400">
                     <span className="text-[9px] font-semibold uppercase tracking-widest opacity-50">Total Quantity</span>
                     <span className="font-semibold text-[10px]">{watchedItems.reduce((s, i) => s + (Number(i.quantity) || 0), 0)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                     <span className="text-[9px] font-semibold uppercase tracking-widest opacity-50">Gross Amount</span>
                     <span className="font-semibold text-[10px]">{formatRupiah(watchedItems.reduce((s, i) => s + ((Number(i.quantity) || 0) * (Number(i.price) || 0)), 0))}</span>
                  </div>
                  
                  <div className="pt-6 border-t border-slate-800 mt-6">
                     <p className="text-[7px] font-semibold text-slate-500 uppercase tracking-widest mb-1 opacity-50">Total Amount</p>
                     <p className="text-2xl font-semibold text-white tracking-widest truncate">{formatRupiah(watchedItems.reduce((s, i) => s + ((Number(i.quantity) || 0) * (Number(i.price) || 0)), 0))}</p>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-white py-3 rounded-lg mt-6 font-semibold uppercase tracking-widest text-[9px] hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-30 flex items-center justify-center gap-2 active:scale-95 italic"
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
                     <p className="text-[8px] font-semibold text-slate-900 uppercase tracking-widest mb-0.5 italic opacity-70">Security Status</p>
                     <p className="text-[10px] font-medium text-slate-500 leading-relaxed italic opacity-70">Data verification active.</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
