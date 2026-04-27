import { useState, useEffect } from "react";
import { PageHeader } from "../components/PageHeader.jsx";
import { Link, useParams, useNavigate, useLocation } from "react-router";
import { ArrowLeft, Printer, AlertTriangle, CheckCircle2, Clock, XCircle, Loader2, FileText, BadgeCheck, Hash, Calendar, Users, Briefcase, Activity, ListFilter, ShieldCheck, Download, Trash2, Edit, ChevronRight, LayoutGrid, DollarSign, Fingerprint, Globe, Check, X } from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext.jsx";
import { toast } from "sonner";

import { API_URL } from '@/lib/api.js';



const statusConfig = {
  Approved: { icon: CheckCircle2, label: "Certified", classes: "text-emerald-600 border-emerald-100", dot: "bg-emerald-500", bg: "bg-emerald-50/50" },
  Pending: { icon: Clock, label: "Auditing", classes: "text-orange-600 border-orange-100", dot: "bg-orange-500", bg: "bg-orange-50/50" },
  Rejected: { icon: XCircle, label: "Rejected", classes: "text-rose-600 border-rose-100", dot: "bg-rose-500", bg: "bg-rose-50/50" },
};

const formatRupiah = (val) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);

export function InvoiceDetailPage() {
  const params = useParams();
  const id = params["*"] || "";
  const [invoice, setInvoice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';
  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin';
  const isAdminOrSuper = isAdmin;
  const location = useLocation();
  const backPath = location.state?.from || "/invoices";

  useEffect(() => {
    if (!id) return setIsLoading(false);
    
    const fetchDetail = async () => {
      try {
        const res = await axios.get(`${API_URL}/invoices/detail?id=${encodeURIComponent(id)}`);
        const data = res.data;
        if (data.error) throw new Error(data.error);

        setInvoice({
          id: data.id,
          number: data.invoice_number,
          userName: data.user_name || "Unknown User",
          team: data.team,
          customer: data.customer_name,
          date: data.date.substring(0, 10),
          status: data.status.charAt(0).toUpperCase() + data.status.slice(1),
          items: data.items.map((it) => ({
            id: it.id.toString(),
            product: it.product_name,
            quantity: it.quantity,
            price: it.price,
            normalPrice: it.normal_price,
            bottomPrice: it.bottom_price,
            flagColor: it.flag_color || 'none'
          }))
        });
      } catch (err) {
        toast.error("An error occurred");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handlePrint = () => window.print();

  const navigate = useNavigate();
  const updateStatus = async (newStatus) => {
    try {
      await axios.put(`${API_URL}/invoices/status?number=${encodeURIComponent(id)}`, { status: newStatus });
      toast.success(`Invoice ${newStatus === 'approved' ? 'disetujui' : 'ditolak'}`);
      
      if (newStatus === 'rejected') {
        navigate('/invoices');
      } else {
        setInvoice(prev => prev ? { ...prev, status: newStatus.charAt(0).toUpperCase() + newStatus.slice(1) } : prev);
      }
    } catch (err) {
      toast.error('Gagal mengubah status invoice');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-6">
        <div className="relative">
           <div className="w-16 h-16 border-4 border-primary/10 rounded-2xl rotate-45" />
           <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-2xl animate-spin absolute inset-0 rotate-45" />
           <div className="absolute inset-0 flex items-center justify-center">
              <Activity className="w-6 h-6 text-primary animate-pulse" />
           </div>
        </div>
        <div className="text-center">
           <p className="font-semibold text-xl tracking-tight text-slate-900">Loading Invoice Details...</p>
           <p className="text-[9px] font-semibold text-primary uppercase tracking-[0.4em] mt-2 animate-pulse opacity-70">Fetching record #{id}</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-12">
        <Link to={backPath} className="group inline-flex items-center gap-3 text-slate-400 hover:text-primary transition-all font-semibold uppercase tracking-[0.3em] text-[9px]">
           <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> BACK TO LIST
        </Link>
        <div className="bg-white rounded-2xl p-12 border border-slate-100 shadow-xl shadow-slate-200/50 text-center relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-[0.02]">
              <ShieldCheck className="w-48 h-48" />
           </div>
           <div className="w-16 h-16 bg-slate-50 rounded-xl mx-auto flex items-center justify-center mb-6 shadow-inner">
              <FileText className="w-8 h-8 text-slate-200" />
           </div>
           <h2 className="text-3xl font-semibold text-slate-900 tracking-tight mb-3">Invoice Not Found</h2>
           <p className="text-slate-400 font-medium text-base leading-relaxed max-w-md mx-auto">
             The requested invoice <strong className="text-slate-900 not-italic">#{id}</strong> could not be found or validated.
           </p>
           <div className="mt-8 flex justify-center">
              <button onClick={() => window.location.reload()} className="px-8 py-3.5 bg-slate-900 text-white rounded-xl font-semibold text-[9px] uppercase tracking-wide shadow-xl shadow-slate-200 hover:scale-105 active:scale-95 transition-all">
                 RETRY LOADING
              </button>
           </div>
        </div>
      </div>
    );
  }

  const status = statusConfig[invoice.status] || statusConfig.Pending;
  const totalSales = invoice.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const hasWarning = invoice.items.some(item => ['yellow', 'red'].includes(item.flagColor));

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto">
      {/* Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <Link to={backPath} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 rounded-lg hover:bg-slate-900 hover:text-white transition-all shadow-sm">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-semibold uppercase tracking-wide text-[8px] opacity-70">Back to List</span>
         </Link>
         
         <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="w-9 h-9 bg-white border border-slate-100 text-slate-400 rounded-lg flex items-center justify-center hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm">
               <Download className="w-4 h-4" />
            </button>
            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all font-semibold uppercase tracking-wide text-[8px] active:scale-95 shadow-md">
               <Printer className="w-3.5 h-3.5" />
               Print Invoice
            </button>
            {isSuperAdmin && invoice.status === 'Pending' && (
              <>
                <button onClick={() => updateStatus('approved')} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all font-semibold uppercase tracking-wide text-[8px] active:scale-95 shadow-md">
                  <Check className="w-3.5 h-3.5" /> Approve
                </button>
                <button onClick={() => updateStatus('rejected')} className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-all font-semibold uppercase tracking-wide text-[8px] active:scale-95 shadow-md">
                  <X className="w-3.5 h-3.5" /> Reject
                </button>
              </>
            )}
         </div>
      </div>

      {/* Hero Header Transcript */}
      <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
         <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start gap-5">
               <div className="relative">
                  <div className="w-16 h-16 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-md group-hover:bg-primary transition-colors">
                     <BadgeCheck className="w-8 h-8" />
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-lg ${status.dot} border-2 border-white shadow flex items-center justify-center`}>
                     <status.icon className="w-3 h-3 text-white" />
                  </div>
               </div>
               <div>
                  <p className="text-[8px] font-semibold text-slate-400 uppercase tracking-wide mb-1 opacity-70">Invoice Number</p>
                  <h1 className="text-3xl font-semibold text-slate-900 tracking-tight leading-none">{invoice.number}</h1>
                  <div className="flex items-center gap-2 mt-3">
                     <span className={`px-3 py-1 rounded-md border font-semibold uppercase tracking-wide text-[7px] ${status.classes} ${status.bg}`}>
                        {status.label}
                     </span>
                     <span className="text-[7px] font-semibold text-slate-400 uppercase tracking-wide border border-slate-100 px-3 py-1 rounded-md bg-slate-50/50 opacity-70">
                        {invoice.date}
                     </span>
                  </div>
               </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-6 border border-slate-100">
               <div className="text-center">
                  <p className="text-[7px] font-semibold text-slate-400 uppercase tracking-wide mb-1 opacity-70">Items</p>
                  <p className="text-lg font-semibold text-slate-900">{invoice.items.length}</p>
               </div>
               <div className="w-[1px] h-8 bg-slate-200" />
               <div className="text-right">
                  <p className="text-[7px] font-semibold text-slate-400 uppercase tracking-wide mb-1 opacity-70">Total Amount</p>
                  <p className="text-xl font-semibold text-primary tracking-tight">{formatRupiah(totalSales)}</p>
               </div>
            </div>
         </div>
      </div>

      {/* Intelligence Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         {[
           { icon: Users, label: "Customer", value: invoice.customer, color: "text-slate-900", bg: "bg-slate-50", border: "border-slate-100", desc: "Customer details." },
           { icon: Briefcase, label: "Assigned To", value: invoice.userName, sub: invoice.team, color: "text-slate-900", bg: "bg-slate-50", border: "border-slate-100", desc: "User and team assignment." },
           { icon: Activity, label: "Audit Status", value: hasWarning ? "Warning" : "Approved", color: hasWarning ? "text-orange-600" : "text-emerald-600", bg: hasWarning ? "bg-orange-50" : "bg-emerald-50", border: "border-transparent", desc: "Price verification result." },
         ].map((box, i) => (
           <div key={i} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg ${box.bg} ${box.color} flex items-center justify-center border ${box.border} shadow-sm flex-shrink-0`}>
                 <box.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                 <p className="text-[8px] font-semibold text-slate-400 uppercase tracking-wide mb-1">{box.label}</p>
                 <p className="text-sm font-semibold text-slate-900 truncate leading-tight">{box.value}</p>
                 {box.sub && <p className="text-[7px] font-semibold text-primary uppercase tracking-wide mt-1 opacity-70">{box.sub}</p>}
                 <p className="text-[9px] text-slate-400 font-medium mt-1.5">{box.desc}</p>
              </div>
           </div>
         ))}
      </div>

      {/* Invoice Details */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden mt-2">
        <div className="px-5 py-3 border-b border-slate-50 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center shadow-md">
                 <ListFilter className="w-4 h-4" />
              </div>
              <div>
                 <h3 className="text-base font-semibold text-slate-900 tracking-tight">Invoice Items</h3>
                 <p className="text-[8px] font-semibold text-slate-400 uppercase tracking-wide mt-0.5 opacity-70">Detailed list of products.</p>
              </div>
           </div>
           {isAdmin && hasWarning && (
              <div className="flex items-center gap-2 bg-rose-600 text-white px-3 py-1 rounded-md shadow-md animate-pulse">
                 <span className="text-[7px] font-semibold uppercase tracking-wide">Pricing Violation</span>
              </div>
           )}
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-5 py-3 text-left text-[8px] font-semibold uppercase tracking-wide text-slate-400">Item #</th>
                <th className="px-5 py-3 text-left text-[8px] font-semibold uppercase tracking-wide text-slate-400">Product Name</th>
                <th className="px-5 py-3 text-center text-[8px] font-semibold uppercase tracking-wide text-slate-400">Qty</th>
                <th className="px-5 py-3 text-right text-[8px] font-semibold uppercase tracking-wide text-slate-400">Price</th>
                {isAdmin && (
                  <th className="px-5 py-3 text-right text-[8px] font-semibold uppercase tracking-wide text-slate-400">Min Price</th>
                )}
                <th className="px-5 py-3 text-right text-[8px] font-semibold uppercase tracking-wide text-slate-400">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {invoice.items.map((item, idx) => {
                 const isIssue = ['yellow', 'red'].includes(item.flagColor);
                 return (
                    <tr key={item.id} className={`group ${isIssue ? 'bg-rose-50/10' : 'hover:bg-slate-50/30'} transition-all`}>
                      <td className="px-5 py-3">
                         <span className="text-[8px] text-slate-300 font-semibold">#{idx + 1}</span>
                      </td>
                      <td className="px-5 py-3">
                         <div className="flex items-center gap-3">
                            <div>
                               <p className={`text-[11px] font-semibold ${isIssue ? 'text-orange-600' : 'text-slate-800'}`}>{item.product}</p>
                               <p className="text-[7px] font-semibold text-slate-400 uppercase tracking-wide leading-none mt-1 opacity-70">Product Name</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-5 py-3 text-center">
                         <span className="text-[10px] font-semibold text-slate-900">{item.quantity}</span>
                      </td>
                      <td className="px-5 py-3 text-right">
                         <div className="flex flex-col items-end">
                            <p className={`text-[10px] font-semibold ${isIssue ? 'text-orange-600' : 'text-slate-900'} tracking-tight`}>{formatRupiah(item.price)}</p>
                            {item.flagColor !== 'none' && (
                              <div className="flex items-center gap-1 mt-0.5">
                                 <div className={`w-1 h-1 rounded-full ${item.flagColor === 'green' ? 'bg-emerald-500' : item.flagColor === 'yellow' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                                 <span className={`text-[6px] font-bold uppercase ${item.flagColor === 'green' ? 'text-emerald-600' : item.flagColor === 'yellow' ? 'text-amber-600' : 'text-rose-600'}`}>
                                   {item.flagColor === 'green' ? 'Safe' : item.flagColor === 'yellow' ? 'Warning' : 'Critical'}
                                 </span>
                              </div>
                            )}
                         </div>
                      </td>
                      {isAdmin && (
                        <td className="px-5 py-3 text-right">
                           <span className="text-[9px] font-semibold text-slate-400 opacity-70">{formatRupiah(item.normalPrice || 0)}</span>
                        </td>
                      )}
                      <td className="px-5 py-3 text-right">
                         <p className="text-[10px] font-semibold text-primary tracking-tight">{formatRupiah(item.price * item.quantity)}</p>
                      </td>
                   </tr>
                 );
               })}
            </tbody>
          </table>
        </div>
        
         <div className="p-8 bg-slate-900 text-white border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center border border-white/10">
                     <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                     <p className="text-[7px] font-semibold text-slate-500 uppercase tracking-wide mb-0.5 opacity-70">Security</p>
                     <p className="text-[9px] font-semibold uppercase tracking-wide text-white/50 leading-none">Verified</p>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center border border-white/10">
                     <Globe className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                     <p className="text-[7px] font-semibold text-slate-500 uppercase tracking-wide mb-0.5 opacity-70">System</p>
                     <p className="text-[9px] font-semibold uppercase tracking-wide text-white/50 leading-none">Automated</p>
                  </div>
               </div>
            </div>
            
            <div className="text-right">
               <p className="text-[8px] font-semibold text-slate-500 uppercase tracking-wide mb-1 leading-none opacity-70">Total Valuation</p>
               <h4 className="text-3xl font-semibold text-white tracking-wide leading-none mb-2">{formatRupiah(totalSales)}</h4>
               <p className="text-[7px] font-semibold text-primary uppercase tracking-wide bg-primary/10 px-3 py-1 rounded inline-block">STATUS: {invoice.status.toUpperCase()}</p>
            </div>
         </div>
      </div>
    </div>
  );
}

// Fixed missing icon from lucide
function ShieldAlert(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}
