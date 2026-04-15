import { useState, useEffect } from "react";
import { History, Search, Download, ExternalLink, Calendar, Users, DollarSign, Loader2, FileText, Image as ImageIcon, X, ChevronRight } from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { PageHeader } from "../components/PageHeader";

import { API_URL, UPLOADS_URL } from '@/lib/api';

interface Payout {
  id: number;
  user_id: number;
  user_name: string;
  total_amount: number;
  payment_date: string;
  receipt_path: string | null;
  notes: string;
}

interface PayoutDetail extends Payout {
  items: {
    invoice_number: string;
    total_amount: number;
    date: string;
  }[];
}

export function PayoutHistoryPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPayout, setSelectedPayout] = useState<PayoutDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const fetchPayouts = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/payouts`);
      setPayouts(res.data);
    } catch (err) {
      toast.error("Failed to fetch payout history");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  const fetchDetail = async (id: number) => {
    setIsDetailLoading(true);
    try {
      const res = await axios.get(`${API_URL}/payouts/${id}`);
      setSelectedPayout(res.data);
    } catch (err) {
      toast.error("Failed to fetch payout details");
    } finally {
      setIsDetailLoading(false);
    }
  };

  const filtered = payouts.filter(p => 
    p.user_name.toLowerCase().includes(search.toLowerCase()) || 
    (p.notes && p.notes.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto">
      <PageHeader
        title="Payout History"
        subtitle="Track historical commission payments"
      />

      <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or notes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-primary outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">ID</th>
                <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">User</th>
                <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">Amount</th>
                <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide text-center">Receipt</th>
                <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={6} className="py-8 text-center text-slate-500"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-slate-500 font-medium text-sm">No payouts found</td></tr>
              ) : (
                filtered.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                     <td className="px-5 py-4 text-sm font-medium text-slate-600">#{p.id}</td>
                     <td className="px-5 py-4 text-sm font-semibold text-slate-900">{p.user_name}</td>
                     <td className="px-5 py-4 text-sm text-slate-500">{new Date(p.payment_date).toLocaleDateString('id-ID')}</td>
                     <td className="px-5 py-4 text-sm font-semibold text-emerald-600 text-right">Rp {p.total_amount.toLocaleString('id-ID')}</td>
                     <td className="px-5 py-4 text-center">
                        {p.receipt_path ? (
                           <ImageIcon className="w-4 h-4 text-slate-400 mx-auto" />
                        ) : (
                           <span className="text-xs text-slate-400 font-medium">-</span>
                        )}
                     </td>
                     <td className="px-5 py-4 text-center">
                        <button onClick={() => fetchDetail(p.id)} className="px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg text-xs font-semibold transition-colors">
                           View
                        </button>
                     </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                 <h3 className="text-lg font-semibold text-slate-900">Payout Details</h3>
                 <p className="text-xs text-slate-500 mt-0.5">Payment ID: #{selectedPayout.id}</p>
              </div>
              <button onClick={() => setSelectedPayout(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500">
                 <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                 <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">User</span>
                    <p className="text-sm font-medium text-slate-900 mt-1">{selectedPayout.user_name}</p>
                 </div>
                 <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Date</span>
                    <p className="text-sm font-medium text-slate-900 mt-1">{new Date(selectedPayout.payment_date).toLocaleDateString('id-ID')}</p>
                 </div>
                 <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total Amount</span>
                    <p className="text-sm font-bold text-emerald-600 mt-1">Rp {selectedPayout.total_amount.toLocaleString('id-ID')}</p>
                 </div>
                 <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Notes</span>
                    <p className="text-sm font-medium text-slate-600 mt-1 truncate">{selectedPayout.notes || '-'}</p>
                 </div>
              </div>

              {selectedPayout.receipt_path && (
                 <div className="mt-4 pt-4 border-t border-slate-100">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-3">Electronic Receipt Proof</span>
                    <img 
                      src={`${UPLOADS_URL}/${selectedPayout.receipt_path}`} 
                      alt="Receipt" 
                      className="w-full h-48 object-cover rounded-xl border border-slate-200 shadow-sm"
                    />
                 </div>
              )}
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-right">
               <button onClick={() => setSelectedPayout(null)} className="px-5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-medium shadow-sm transition-colors">
                  Close
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
