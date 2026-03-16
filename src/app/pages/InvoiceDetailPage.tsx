import { useState, useEffect } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft, Printer, AlertTriangle, CheckCircle2, Clock, XCircle, Loader2, FileText, BadgeCheck, Hash, Calendar, Users, Briefcase, Activity, ListFilter, ShieldCheck, Download, Trash2, Edit, ChevronRight, LayoutGrid, DollarSign, Fingerprint, Globe } from "lucide-react";
import axios from "axios";

const API_URL = "http://localhost:3001/api";

interface InvoiceItem {
  id: string;
  product: string;
  quantity: number;
  price: number;
  bottomPrice: number;
}

interface InvoiceDetailType {
  id: number;
  number: string;
  userName: string;
  team: string;
  customer: string;
  date: string;
  status: string;
  items: InvoiceItem[];
}

const statusConfig: Record<string, { icon: React.ElementType; label: string; classes: string; dot: string; bg: string }> = {
  Approved: { icon: CheckCircle2, label: "Certified", classes: "text-emerald-600 border-emerald-100", dot: "bg-emerald-500", bg: "bg-emerald-50/50" },
  Pending: { icon: Clock, label: "Auditing", classes: "text-orange-600 border-orange-100", dot: "bg-orange-500", bg: "bg-orange-50/50" },
  Rejected: { icon: XCircle, label: "Rejected", classes: "text-rose-600 border-rose-100", dot: "bg-rose-500", bg: "bg-rose-50/50" },
};

const formatRupiah = (val: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);

export function InvoiceDetailPage() {
  const params = useParams();
  const id = params["*"] || "";
  const [invoice, setInvoice] = useState<InvoiceDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return setIsLoading(false);
    
    const fetchDetail = async () => {
      try {
        const res = await axios.get(`${API_URL}/invoice-detail?id=${encodeURIComponent(id)}`);
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
          items: data.items.map((it: any) => ({
            id: it.id.toString(),
            product: it.product_name,
            quantity: it.quantity,
            price: it.price,
            bottomPrice: it.bottom_price
          }))
        });
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-40 space-y-8">
        <div className="relative">
           <div className="w-20 h-20 border-8 border-primary/10 rounded-[2.5rem] rotate-45" />
           <div className="w-20 h-20 border-8 border-primary border-t-transparent rounded-[2.5rem] animate-spin absolute inset-0 rotate-45" />
           <div className="absolute inset-0 flex items-center justify-center">
              <Activity className="w-8 h-8 text-primary animate-pulse" />
           </div>
        </div>
        <div className="text-center">
           <p className="font-black text-2xl tracking-tighter text-slate-900">Decoding Registry Payload...</p>
           <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mt-3 animate-pulse">Accessing Ledger Serial {id}</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="space-y-10 max-w-5xl mx-auto py-20">
        <Link to="/invoices" className="group inline-flex items-center gap-4 text-slate-400 hover:text-primary transition-all font-black uppercase tracking-[0.3em] text-[10px]">
           <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> TERMINATE SEARCH & RETURN
        </Link>
        <div className="bg-white rounded-[4rem] p-24 border border-slate-100 shadow-2xl shadow-slate-200/50 text-center relative overflow-hidden">
           <div className="absolute top-0 right-0 p-12 opacity-[0.03]">
              <ShieldCheck className="w-64 h-64" />
           </div>
           <div className="w-24 h-24 bg-slate-50 rounded-[2rem] mx-auto flex items-center justify-center mb-10 shadow-inner">
              <FileText className="w-12 h-12 text-slate-200" />
           </div>
           <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Transcript Integrity Failed</h2>
           <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-md mx-auto italic">
             The requested serial <strong className="text-slate-900 not-italic">#{id}</strong> could not be validated against the current block registry.
           </p>
           <div className="mt-12 flex justify-center">
              <button onClick={() => window.location.reload()} className="px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-slate-200 hover:scale-105 active:scale-95 transition-all">
                 RE-INITIALIZE QUERY
              </button>
           </div>
        </div>
      </div>
    );
  }

  const status = statusConfig[invoice.status] || statusConfig.Pending;
  const totalSales = invoice.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const belowBottom = (item: InvoiceItem) => item.bottomPrice > 0 && item.price < item.bottomPrice;
  const hasWarning = invoice.items.some(belowBottom);

  return (
    <div className="space-y-12 pb-20 max-w-7xl mx-auto">
      {/* Cinematic Navigation Architecture */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
         <Link to="/invoices" className="group flex items-center gap-6 px-10 py-5 bg-white border border-slate-100 rounded-[2.5rem] hover:bg-slate-900 hover:text-white transition-all duration-500 shadow-xl shadow-slate-200/50">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform" />
            <span className="font-black uppercase tracking-[0.3em] text-[10px]">Return to Master Registry</span>
         </Link>
         
         <div className="flex items-center gap-4">
            <button className="w-16 h-16 bg-white border border-slate-100 text-slate-400 rounded-3xl flex items-center justify-center hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm">
               <Download className="w-6 h-6" />
            </button>
            <button className="flex items-center gap-5 px-10 py-5 bg-slate-900 border border-slate-800 text-white rounded-[2.5rem] hover:bg-slate-800 transition-all shadow-2xl shadow-slate-400/20 active:scale-95 font-black uppercase tracking-[0.2em] text-[10px]">
               <Printer className="w-5 h-5 text-primary" />
               Generate Physical Artifact
            </button>
         </div>
      </div>

      {/* Hero Header Transcript */}
      <div className="bg-white rounded-[4rem] p-12 border border-slate-100 shadow-2xl shadow-slate-200/40 relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000 grayscale group-hover:grayscale-0">
            <Fingerprint className="w-80 h-80 text-primary" />
         </div>
         
         <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 relative z-10">
            <div className="flex items-start gap-10">
               <div className="relative">
                  <div className="w-28 h-28 bg-slate-900 text-white rounded-[3rem] flex items-center justify-center shadow-2xl shadow-slate-300 group-hover:bg-primary transition-colors duration-500">
                     <BadgeCheck className="w-14 h-14" />
                  </div>
                  <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl ${status.dot} border-4 border-white shadow-lg flex items-center justify-center`}>
                     <status.icon className="w-5 h-5 text-white" />
                  </div>
               </div>
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mb-4">Transcript Identification</p>
                  <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-none group-hover:text-primary transition-colors">{invoice.number}</h1>
                  <div className="flex flex-wrap items-center gap-4 mt-6">
                     <span className={`flex items-center gap-3 px-6 py-2.5 rounded-[1.5rem] border font-black uppercase tracking-[0.3em] text-[10px] ${status.classes} ${status.bg}`}>
                        <div className={`w-2 h-2 rounded-full ${status.dot} animate-pulse`} />
                        {status.label} Status
                     </span>
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border border-slate-100 px-6 py-2.5 rounded-[1.5rem] bg-slate-50/50 flex items-center gap-3">
                        <Calendar className="w-4 h-4" /> Logged: {invoice.date}
                     </span>
                  </div>
               </div>
            </div>

            <div className="bg-slate-900 rounded-[3.5rem] p-10 text-white shadow-2xl shadow-slate-800 flex items-center gap-12 border border-white/5 relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-tr from-primary to-transparent opacity-10" />
               <div className="relative z-10 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-3 opacity-60">Node Integrity</p>
                  <p className="text-3xl font-black">{invoice.items.length}</p>
                  <p className="text-[9px] font-bold text-primary uppercase tracking-widest mt-1">Verified Clusters</p>
               </div>
               <div className="w-[1px] h-16 bg-white/10 relative z-10" />
               <div className="relative z-10 text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-3 opacity-60">Net Valuation</p>
                  <p className="text-4xl font-black text-white px-2 tracking-tighter">{formatRupiah(totalSales)}</p>
                  <p className="text-[9px] font-bold text-primary uppercase tracking-widest mt-2">{hasWarning ? "⚠️ ACC-PRIORITY VIOLATION" : "CERTIFIED BOTTOM-PRICE"}</p>
               </div>
            </div>
         </div>
      </div>

      {/* Intelligence Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
         {[
           { icon: Users, label: "Client / Entity Identity", value: invoice.customer, color: "text-blue-500", bg: "bg-blue-50/50", border: "border-blue-100", desc: "Primary counterparty node" },
           { icon: Briefcase, label: "Assigned Representative", value: invoice.userName, sub: `${invoice.team} Division`, color: "text-orange-500", bg: "bg-orange-50/50", border: "border-orange-100", desc: "Operational personnel lead" },
           { icon: Activity, label: "Global Compliance Logic", value: hasWarning ? "Critical Conflict" : "High Confidence", color: hasWarning ? "text-rose-500" : "text-emerald-500", bg: hasWarning ? "bg-rose-50/50" : "bg-emerald-50/50", border: hasWarning ? "border-rose-100" : "border-emerald-100", desc: "Real-time audit heuristic" },
         ].map((box, i) => (
           <div key={i} className="bg-white rounded-[3.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/30 flex items-start gap-8 group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
              <div className={`w-16 h-16 rounded-[1.75rem] ${box.bg} ${box.color} flex items-center justify-center border ${box.border} shadow-sm group-hover:rotate-12 transition-transform`}>
                 <box.icon className="w-8 h-8" />
              </div>
              <div className="flex-1">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3">{box.label}</p>
                 <p className="text-xl font-black text-slate-900 group-hover:text-primary transition-colors leading-tight">{box.value}</p>
                 {box.sub && <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-2 bg-slate-50 px-3 py-1 rounded-lg inline-block">{box.sub}</p>}
                 <p className="text-[10px] text-slate-400 font-bold mt-4 uppercase tracking-widest opacity-60 leading-relaxed italic">{box.desc}</p>
              </div>
           </div>
         ))}
      </div>

      {/* Main Forensic Ledger */}
      <div className="bg-white rounded-[4.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden mt-8">
        <div className="px-12 py-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
           <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-slate-200">
                 <ListFilter className="w-7 h-7" />
              </div>
              <div>
                 <h3 className="text-2xl font-black text-slate-900 tracking-tight">Transactional Transcript Nodes</h3>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Granular breakdown of market extension value</p>
              </div>
           </div>
           {hasWarning && (
             <div className="flex items-center gap-4 bg-rose-600 text-white px-8 py-4 rounded-[2rem] shadow-2xl shadow-rose-200 animate-pulse">
                <ShieldAlert className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Margin Dilution Warning</span>
             </div>
           )}
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-12 py-8 text-left text-[10px] text-slate-400 font-black uppercase tracking-[0.4em]">Index ID</th>
                <th className="px-12 py-8 text-left text-[10px] text-slate-400 font-black uppercase tracking-[0.4em]">Specification Node</th>
                <th className="px-12 py-8 text-center text-[10px] text-slate-400 font-black uppercase tracking-[0.4em]">Capacity</th>
                <th className="px-12 py-8 text-right text-[10px] text-slate-400 font-black uppercase tracking-[0.4em]">Execution Price</th>
                <th className="px-12 py-8 text-right text-[10px] text-slate-400 font-black uppercase tracking-[0.4em]">Certified Floor</th>
                <th className="px-12 py-8 text-right text-[10px] text-slate-400 font-black uppercase tracking-[0.4em]">Registry Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {invoice.items.map((item, idx) => {
                 const isIssue = belowBottom(item);
                 return (
                   <tr key={item.id} className={`group ${isIssue ? 'bg-rose-50/10' : 'hover:bg-slate-50/30'} transition-all duration-300`}>
                      <td className="px-12 py-8">
                         <span className="text-[10px] text-slate-300 font-black uppercase tracking-widest bg-slate-100 p-2.5 rounded-xl">ID-{idx + 1}</span>
                      </td>
                      <td className="px-12 py-8">
                         <div className="flex items-center gap-6">
                            {isIssue ? (
                               <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center shadow-sm">
                                  <AlertTriangle className="w-5 h-5" />
                               </div>
                            ) : (
                               <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center border border-slate-100">
                                  <LayoutGrid className="w-5 h-5 opacity-40" />
                               </div>
                            )}
                            <div>
                               <p className={`text-base font-black ${isIssue ? 'text-rose-600' : 'text-slate-800'}`}>{item.product}</p>
                               <div className="flex items-center gap-2 mt-1">
                                  <div className={`w-1.5 h-1.5 rounded-full ${isIssue ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Verified SKU Catalog Entry</span>
                               </div>
                            </div>
                         </div>
                      </td>
                      <td className="px-12 py-8 text-center">
                         <span className="text-sm font-black text-slate-900 bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-100 shadow-sm">{item.quantity}</span>
                      </td>
                      <td className="px-12 py-8 text-right">
                         <p className={`text-base font-black ${isIssue ? 'text-rose-600' : 'text-slate-900'} tracking-tighter`}>{formatRupiah(item.price)}</p>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Market Extension</p>
                      </td>
                      <td className="px-12 py-8 text-right">
                         <span className="text-xs font-black text-slate-400 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">{formatRupiah(item.bottomPrice)}</span>
                      </td>
                      <td className="px-12 py-8 text-right">
                         <p className="text-lg font-black text-primary tracking-tighter">{formatRupiah(item.price * item.quantity)}</p>
                         <p className="text-[9px] font-black text-primary/40 uppercase tracking-widest mt-1">Certified Extension</p>
                      </td>
                   </tr>
                 );
               })}
            </tbody>
          </table>
        </div>
        
        <div className="p-16 bg-slate-900 text-white border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-transparent opacity-30" />
           <div className="flex items-center gap-12 relative z-10">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-3xl border border-white/10">
                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Audit Signature</p>
                    <p className="text-xs font-black uppercase tracking-widest text-white/70 italic">Genesis Hub Secure Log 2.0</p>
                 </div>
              </div>
              <div className="w-[1px] h-12 bg-white/10 hidden md:block" />
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-3xl border border-white/10">
                    <Globe className="w-6 h-6 text-primary" />
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Global Registry</p>
                    <p className="text-xs font-black uppercase tracking-widest text-white/70 italic">End-to-End Encryption Applied</p>
                 </div>
              </div>
           </div>
           
           <div className="text-right flex flex-col items-end relative z-10">
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Consolidated Valuation total</p>
              </div>
              <h4 className="text-7xl font-black text-white tracking-widest leading-none drop-shadow-2xl">{formatRupiah(totalSales)}</h4>
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mt-6 border border-primary/30 px-6 py-2 rounded-full bg-primary/5">Certified Ledger State: {invoice.status.toUpperCase()}</p>
           </div>
        </div>
      </div>
    </div>
  );
}

// Fixed missing icon from lucide
function ShieldAlert(props: any) {
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
