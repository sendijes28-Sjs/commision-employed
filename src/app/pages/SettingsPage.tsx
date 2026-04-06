import { useState, useEffect } from "react";
import { Save, User, ShieldCheck, Loader2, Settings2, Percent, Globe, Bell, Lock, LogOut, Clock, KeyRound, Activity, Sparkles, BadgeCheck, ShieldAlert, LayoutGrid, AlertTriangle, Database, Upload, FileSpreadsheet, Trash2, Package, HelpCircle, TrendingUp } from "lucide-react";
import * as XLSX from "xlsx";
import { useAuth } from "../context/AuthContext";
import { PageHeader } from "../components/PageHeader";
import axios from "axios";
import { toast } from "sonner";

const API_URL = `http://${window.location.hostname}:4000/api`;

export function SettingsPage() {
  const { user, logout } = useAuth();
  const isUserRole = user?.role === "user";
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [settings, setSettings] = useState({
    lelang_commission: "3.0",
    user_commission: "3.0",
    default_commission: "3.0",
    target_lelang: "0",
    target_user: "0"
  });

  // Change password state
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${API_URL}/settings`);
        setSettings({ ...settings, ...res.data });
      } catch (error) {
        console.error("Failed to load settings", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axios.post(`${API_URL}/settings`, settings);
      toast.success("System configurations updated successfully");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!pwForm.currentPassword || !pwForm.newPassword) return toast.error("Semua field wajib diisi");
    if (pwForm.newPassword.length < 6) return toast.error("Password baru minimal 6 karakter");
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error("Konfirmasi password tidak cocok");
    setPwSaving(true);
    try {
      await axios.post(`${API_URL}/auth/change-password`, {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success("Password berhasil diubah");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Gagal mengubah password");
    } finally {
      setPwSaving(false);
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center p-40 space-y-4">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
      <p className="font-semibold text-slate-400 uppercase tracking-wide text-[10px] opacity-70">Loading settings...</p>
    </div>
  );

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto">
      <PageHeader
        title="Settings & Preferences"
        subtitle="Manage system configurations and ledger synchronization"
      />

      

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-56 space-y-1">
           {[
             { id: "profile", label: "Profile", icon: User },
             { id: "commission", label: "Commission", icon: Percent, hidden: isUserRole },
             { id: "global", label: "Global Rules", icon: Globe, hidden: isUserRole },
             { id: "audit", label: "Master Ledger", icon: Database, hidden: isUserRole },
             { id: "security", label: "Security", icon: Lock },
             { id: "notifications", label: "Alerts", icon: Bell },
           ].map((tab) => !tab.hidden && (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all font-semibold text-[11px] tracking-tight ${
                 activeTab === tab.id 
                 ? "bg-primary text-white shadow-sm" 
                 : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
               }`}
             >
                <div className="flex items-center gap-2.5">
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </div>
                {activeTab === tab.id && <div className="w-1 h-1 rounded-full bg-white/40" />}
             </button>
           ))}
           <div className="pt-4 mt-4 border-t border-slate-100">
               <button 
                 onClick={logout}
                 className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-all font-semibold text-[11px] tracking-tight"
               >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
               </button>
           </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-1 space-y-6">
           {activeTab === 'profile' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
                    <h3 className="text-[8px] font-semibold text-slate-400 uppercase tracking-wide mb-4 flex items-center gap-2 opacity-70">
                       <User className="w-3 h-3 text-primary" /> Profile Information
                    </h3>
                    <div className="space-y-5">
                       <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-slate-900 text-white flex items-center justify-center font-semibold text-lg shadow-sm">
                             {user?.name?.split(" ").map(n => n[0]).join("").toUpperCase()}
                          </div>
                          <div>
                             <p className="text-lg font-semibold text-slate-900 leading-none">{user?.name}</p>
                             <p className="text-[8px] font-semibold text-slate-400 uppercase tracking-wide mt-1 opacity-70">{user?.email}</p>
                          </div>
                       </div>
                      <div className="grid grid-cols-2 gap-2">
                          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                             <p className="text-[7px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5 opacity-50">App Role</p>
                             <p className="text-[10px] font-semibold text-primary uppercase tracking-wide leading-none">{user?.role?.replace('_', ' ')}</p>
                          </div>
                          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                             <p className="text-[7px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5 opacity-50">Assigned Team</p>
                             <p className="text-[10px] font-semibold text-slate-900 uppercase tracking-wide leading-none">{user?.team}</p>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm flex flex-col justify-center text-center">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                       <ShieldCheck className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 mb-1 leading-none">Account Protected</h3>
                    <p className="text-[10px] font-medium text-slate-400 opacity-70">Your account is secured with standard encryption.</p>
                    <button className="mt-5 text-[8px] font-semibold uppercase tracking-wide text-primary hover:underline transition-all">View Activity</button>
                 </div>
             </div>
           )}

           {activeTab === 'commission' && (
             <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
                 <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                       <div>
                          <h3 className="text-lg font-semibold text-slate-900 leading-none">Commission Rates</h3>
                          <p className="text-[10px] font-medium text-slate-400 mt-1.5 opacity-70">Adjust payout percentages for different divisions.</p>
                       </div>
                       <button 
                         onClick={handleSave}
                         disabled={isSaving}
                         className="bg-primary text-white px-4 py-2 rounded-lg font-semibold uppercase tracking-wide text-[8px] flex items-center gap-2 shadow-sm hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
                       >
                          {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                          Save Configuration
                       </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {[
                         { id: "lelang_commission", label: "Lelang Rate", desc: "Default rate for lelang division" },
                         { id: "user_commission", label: "User Rate", desc: "Default rate for user division" },
                         { id: "offline_commission", label: "Offline Rate", desc: "For walk-in customers" },
                         { id: "default_commission", label: "General Rate", desc: "Standard fallback rate" },
                       ].map((rule) => (
                         <div key={rule.id} className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 hover:bg-white transition-all">
                            <div className="flex items-start justify-between mb-2">
                               <div>
                                  <label className="text-[8px] font-semibold uppercase tracking-wide text-slate-400 opacity-70">{rule.label}</label>
                                  <p className="text-[8px] text-slate-400 font-medium leading-relaxed mt-0.5 opacity-50">{rule.desc}</p>
                               </div>
                            </div>
                            <div className="relative">
                               <input
                                 type="number"
                                 step="0.1"
                                 value={(settings as any)[rule.id]}
                                 onChange={(e) => setSettings({ ...settings, [rule.id]: e.target.value })}
                                 className="w-full px-0 py-1 bg-transparent text-xl font-semibold text-slate-900 outline-none border-b border-slate-200 focus:border-primary transition-all pr-6"
                               />
                               <span className="absolute right-0 bottom-1.5 text-base font-semibold text-slate-300 opacity-50">%</span>
                            </div>
                         </div>
                       ))}
                    </div>
                </div>
             </div>
           )}

            {activeTab === 'notifications' && (
              <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
                 <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                       <div>
                          <h3 className="text-lg font-semibold text-slate-900 leading-none">Notifications</h3>
                          <p className="text-[8px] font-semibold text-slate-400 uppercase tracking-wide mt-1.5 opacity-70">Manage your system notification preferences.</p>
                       </div>
                       <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 rounded border border-slate-200">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[8px] font-semibold uppercase tracking-wide text-slate-500 opacity-70">Active Feed</span>
                       </div>
                    </div>

                    <div className="space-y-2">
                       {[
                         { label: "Commission Alerts", desc: "Notifications for pricing issues", active: true },
                         { label: "Data Analytics", desc: "Reports generated after imports", active: true },
                         { label: "Audit Logs", desc: "History of system changes", active: false },
                         { label: "Security Scan", desc: "Periodic security assessments", active: true },
                       ].map((item, i) => (
                         <div key={i} className="flex items-center justify-between p-4 bg-slate-50/30 rounded-xl border border-slate-100 hover:bg-white transition-all">
                             <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.active ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-300'}`}>
                                   <Bell className="w-4 h-4" />
                                </div>
                                <div>
                                   <p className="text-[11px] font-semibold text-slate-800 leading-none">{item.label}</p>
                                   <p className="text-[8px] text-slate-400 font-medium mt-1 uppercase tracking-wide opacity-50">{item.desc}</p>
                                </div>
                             </div>
                            <div className={`w-8 h-4.5 rounded-full p-0.5 transition-all cursor-pointer ${item.active ? 'bg-primary' : 'bg-slate-200'}`}>
                               <div className={`w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-all ${item.active ? 'translate-x-3.5' : 'translate-x-0'}`} />
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="bg-slate-900 rounded-xl p-6 text-white shadow-sm relative overflow-hidden group">
                        <h3 className="text-[8px] font-semibold uppercase tracking-wide text-slate-500 mb-4 flex items-center gap-2 opacity-70">
                           <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Security Status
                        </h3>
                        <p className="text-lg font-semibold tracking-tight leading-none">Protection Active</p>
                        <p className="text-[9px] text-slate-400 mt-2 font-medium opacity-70">All security protocols are currently operational.</p>
                        <button className="mt-6 w-full py-2.5 bg-white/5 border border-white/10 rounded-lg text-[8px] font-semibold uppercase tracking-wide hover:bg-white/10 transition-all active:scale-95">
                           Re-scan System
                        </button>
                     </div>

                     <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm relative">
                        <h3 className="text-[8px] font-semibold uppercase tracking-wide text-slate-400 mb-4 opacity-70">Active Sessions</h3>
                        <div className="space-y-3">
                           <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                              <div className="flex items-center gap-2.5">
                                 <div className="w-7 h-7 bg-primary/10 text-primary rounded flex items-center justify-center">
                                    <Globe className="w-3.5 h-3.5" />
                                 </div>
                                 <div>
                                    <p className="text-[9px] font-semibold text-slate-800 uppercase tracking-wide leading-none">Standard Browser</p>
                                    <p className="text-[7px] text-slate-400 font-medium mt-0.5 opacity-70">Current Device</p>
                                 </div>
                              </div>
                              <span className="text-[7px] font-semibold text-emerald-500 uppercase tracking-wide bg-emerald-50 px-1.5 py-0.5 rounded">Active Now</span>
                           </div>
                        </div>
                        <button className="mt-4 text-[8px] font-semibold text-rose-500 uppercase tracking-wide hover:text-rose-600 transition-colors opacity-70">Log out other sessions</button>
                     </div>
                 </div>
                 
                 <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm relative">
                      <div className="relative z-10 max-w-sm">
                         <h3 className="text-lg font-semibold text-slate-900 leading-none">Change Password</h3>
                         <p className="text-[8px] font-semibold text-slate-400 mt-2 uppercase tracking-wide opacity-70">Ensure your account remains secure.</p>
                         
                         <div className="space-y-3 mt-5">
                            <div className="space-y-1">
                               <label className="text-[8px] font-semibold text-slate-400 uppercase tracking-wide ml-1 opacity-70">Current Password</label>
                               <input type="password" value={pwForm.currentPassword} onChange={(e) => setPwForm({...pwForm, currentPassword: e.target.value})} placeholder="••••••••••••" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary transition-all font-semibold text-[10px]" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                               <div className="space-y-1">
                                  <label className="text-[8px] font-semibold text-slate-400 uppercase tracking-wide ml-1 opacity-70">New Password</label>
                                  <input type="password" value={pwForm.newPassword} onChange={(e) => setPwForm({...pwForm, newPassword: e.target.value})} placeholder="••••••••••••" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary transition-all font-semibold text-[10px]" />
                               </div>
                               <div className="space-y-1">
                                  <label className="text-[8px] font-semibold text-slate-400 uppercase tracking-wide ml-1 opacity-70">Confirm New</label>
                                  <input type="password" value={pwForm.confirmPassword} onChange={(e) => setPwForm({...pwForm, confirmPassword: e.target.value})} placeholder="••••••••••••" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary transition-all font-semibold text-[10px]" />
                               </div>
                            </div>
                          <button onClick={handleChangePassword} disabled={pwSaving} className="mt-6 bg-slate-900 text-white px-5 py-2.5 rounded-lg font-semibold text-[8px] uppercase tracking-wide hover:bg-slate-800 transition-all active:scale-95 shadow-sm disabled:opacity-50">
                             {pwSaving ? 'Updating...' : 'Update Password'}
                          </button>
                       </div>
                    </div>
                  </div>
                </div>
             )}

            {activeTab === 'global' && (
              <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm relative group">
                 <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                       <div>
                          <h3 className="text-xl font-semibold text-slate-900 leading-none">Global Rules</h3>
                          <p className="text-[8px] font-semibold text-slate-400 mt-2 uppercase tracking-wide opacity-70">Operational parameters and internal system logic.</p>
                       </div>
                       <div className="flex items-center gap-3">
                          <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-primary text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50"
                          >
                             {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                             Save Changes
                          </button>
                          <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                             <Activity className="w-5 h-5" />
                          </div>
                       </div>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="p-5 bg-slate-900 rounded-xl text-white relative overflow-hidden group">
                              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                 <TrendingUp className="w-16 h-16" />
                              </div>
                              <div className="relative z-10">
                                <h4 className="text-[10px] font-semibold uppercase tracking-wide text-primary mb-1">Target Lelang</h4>
                                <p className="text-[8px] text-white/50 font-medium mb-4 opacity-70 text-balance">The daily revenue goal for the Lelang division.</p>
                                 <div className="flex items-end gap-3 max-w-[200px]">
                                    <div className="text-xl font-bold text-white tracking-tight self-center mb-1">Rp</div>
                                    <input
                                       type="number"
                                       step="1000"
                                       value={settings.target_lelang}
                                       onChange={(e) => setSettings({ ...settings, target_lelang: e.target.value })}
                                       className="flex-1 w-full bg-transparent border-b border-white/20 focus:border-primary outline-none py-1 text-xl font-bold text-white placeholder:text-white/10 transition-all font-mono"
                                       placeholder="0"
                                    />
                                 </div>
                              </div>
                           </div>

                           <div className="p-5 bg-slate-900 rounded-xl text-white relative overflow-hidden group">
                              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                 <TrendingUp className="w-16 h-16" />
                              </div>
                              <div className="relative z-10">
                                <h4 className="text-[10px] font-semibold uppercase tracking-wide text-primary mb-1">Target User</h4>
                                <p className="text-[8px] text-white/50 font-medium mb-4 opacity-70 text-balance">The daily revenue goal for the User division.</p>
                                 <div className="flex items-end gap-3 max-w-[200px]">
                                    <div className="text-xl font-bold text-white tracking-tight self-center mb-1">Rp</div>
                                    <input
                                       type="number"
                                       step="1000"
                                       value={settings.target_user}
                                       onChange={(e) => setSettings({ ...settings, target_user: e.target.value })}
                                       className="flex-1 w-full bg-transparent border-b border-white/20 focus:border-primary outline-none py-1 text-xl font-bold text-white placeholder:text-white/10 transition-all font-mono"
                                       placeholder="0"
                                    />
                                 </div>
                              </div>
                           </div>
                        </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-xl z-20 flex items-center justify-center">
                             <span className="bg-slate-900 text-white px-4 py-2 rounded-lg font-semibold text-[9px] uppercase tracking-wide shadow-lg">Advanced Logic - Locked</span>
                          </div>
                          {[
                            { label: "System Analytics", desc: "Advanced data processing", active: true, icon: Sparkles },
                            { label: "Auto Validation", desc: "Automate invoice verification", active: false, icon: BadgeCheck },
                            { label: "Safety Monitor", desc: "Flag unusual transactions", active: true, icon: ShieldAlert },
                            { label: "Data Sync", desc: "Sync data across divisions", active: false, icon: LayoutGrid },
                          ].map((item, i) => (
                            <div key={i} className="flex flex-col p-4 bg-white border border-slate-100 rounded-xl opacity-40">
                               <div className="flex items-center justify-between mb-3">
                                  <div className="w-8 h-8 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center">
                                     <item.icon className="w-4 h-4" />
                                   </div>
                                  <div className={`w-8 h-4.5 rounded-full p-0.5 transition-all ${item.active ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                                     <div className={`w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-all ${item.active ? 'translate-x-3.5' : 'translate-x-0'}`} />
                                  </div>
                               </div>
                               <h4 className="text-[11px] font-semibold text-slate-900 mb-1 leading-none">{item.label}</h4>
                               <p className="text-[8px] text-slate-400 font-medium mt-1 leading-relaxed opacity-70">{item.desc}</p>
                            </div>
                          ))}
                       </div>
                    </div>
                  </div>
               </div>
            )}

            {activeTab === 'audit' && (
                 <div className="space-y-6">
                   <div className="bg-white rounded-xl p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                     <div className="relative z-10">
                       <div className="flex items-center gap-3 mb-6">
                         <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-md">
                           <Database className="w-6 h-6" />
                         </div>
                         <div>
                           <h3 className="text-2xl font-semibold text-slate-900 tracking-tight">Master Data Sync</h3>
                           <p className="text-[10px] font-medium text-slate-400">Sinkronisasi data acuan dari Accurate & Sistem Harga</p>
                         </div>
                       </div>

                        <div className="grid grid-cols-1 gap-6">
                          {/* --- LAPORAN PENJUALAN --- */}
                          <div className="bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-xl p-8 hover:border-primary/50 transition-all flex flex-col gap-5">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                                  <FileSpreadsheet className="w-5 h-5" />
                               </div>
                               <div>
                                  <span className="text-sm font-bold uppercase tracking-wider block">Laporan Penjualan (CSV)</span>
                                  <p className="text-[10px] text-slate-500 mt-0.5">Upload Laporan Penjualan untuk validasi keaslian invoice (Ground Truth).</p>
                               </div>
                            </div>
                            <label className="bg-white border border-slate-200 rounded-lg p-3 cursor-pointer hover:bg-slate-50 transition-all text-center">
                              <span className="text-[10px] font-semibold text-slate-600 uppercase">Pilih File CSV</span>
                              <input
                                type="file"
                                accept=".csv"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;

                                  const reader = new FileReader();
                                  reader.onload = async (event) => {
                                    const data = new Uint8Array(event.target?.result as ArrayBuffer);
                                    const workbook = XLSX.read(data, { type: 'array' });
                                    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                                    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
                                    
                                    const grouped: Record<string, any> = {};

                                    const parseIDDate = (dateVal: any) => {
                                      if (!dateVal) return "";
                                      
                                      // Handle Excel serial date (number)
                                      if (typeof dateVal === 'number') {
                                        const jsDate = new Date(Math.round((dateVal - 25569) * 86400 * 1000));
                                        return jsDate.toISOString().split('T')[0];
                                      }

                                      const dateStr = dateVal.toString().trim();
                                        const months: any = { 
                                          "jan": "01", "feb": "02", "mar": "03", "apr": "04", "mei": "05", "jun": "06", 
                                          "jul": "07", "agu": "08", "sep": "09", "okt": "10", "nov": "11", "des": "12",
                                          "may": "05", "oct": "10", "dec": "12"
                                        };
                                        const parts = dateStr.split(/\s+/);
                                        if (parts.length === 3) {
                                          const day = parts[0].padStart(2, '0');
                                          const monthKey = parts[1].toLowerCase().substring(0, 3);
                                          const month = months[monthKey] || "01";
                                          const year = parts[2];
                                          return `${year}-${month}-${day}`;
                                        }
                                        return dateStr;
                                    };

                                    const cleanNum = (val: any) => {
                                      if (typeof val === 'number') return val;
                                      if (!val) return 0;
                                      const cleaned = val.toString().replace(/[^0-9.]/g, '');
                                      return parseFloat(cleaned) || 0;
                                    };

                                    // DEBUG: buka F12 > Console untuk lihat struktur kolom file CSV Anda
                                     console.log("=== CSV ROWS TOTAL:", rows.length);
                                     console.log("=== ROW[0]:", rows[0]);
                                     console.log("=== ROW[1]:", rows[1]);
                                     console.log("=== ROW[2]:", rows[2]);

                                     const isInvNum = (val: { toString: () => string; }) => {
                                       if (!val) return false;
                                       const s = val.toString().trim();
                                       if (s.length < 5) return false;
                                       if (/^\d+$/.test(s)) return false;
                                       return s.includes("/") || s.includes("-");
                                     };

                                     let invoiceCol = 2;
                                     for (let ri = 0; ri < Math.min(rows.length, 10); ri++) {
                                       const r2 = rows[ri];
                                       for (let ci = 0; ci < r2.length; ci++) {
                                         const cell = r2[ci]?.toString().trim() || "";
                                         if (isInvNum(cell) && !/faktur|invoice|nomor/i.test(cell)) {
                                           invoiceCol = ci;
                                           console.log("=== AUTO-DETECT: invoice col", ci, "example:", cell);
                                           break;
                                         }
                                       }
                                       if (invoiceCol !== 2) break;
                                     }
                                     console.log("=== Using invoice column:", invoiceCol);

                                     rows.forEach((row) => {
                                       if (row.length < 5) return;
                                       const inv = row[invoiceCol]?.toString().trim();
                                       if (!inv || !isInvNum(inv)) return;
                                       if (/faktur|invoice|no\.|nomor/i.test(inv)) return;

                                       if (!grouped[inv]) {
                                         grouped[inv] = {
                                           invoice_number: inv,
                                           date: parseIDDate(row[0]),
                                           customer_name: row[7]?.toString() || "",
                                           items: []
                                         };
                                       }

                                       const product = row[9]?.toString().trim();
                                       const skipLabels = ["Nama Barang", "Product", "Item", "Description"];
                                       if (product && !skipLabels.includes(product)) {
                                         grouped[inv].items.push({
                                           product_name: product,
                                           quantity: cleanNum(row[12]),
                                           price: cleanNum(row[14])
                                         });
                                       }
                                     });

                                     const finalData = Object.values(grouped);
                                     console.log("=== INVOICES PARSED:", finalData.length);
                                     if (finalData.length === 0) {
                                       toast.error("Tidak ada data invoice valid. Buka F12 > Console untuk lihat detail kolom CSV Anda.");
                                       return;
                                     }

                                     const loadingToast = toast.loading("Sedang mensinkronisasi data ke server...");

                                     try {
                                       await axios.post(`${API_URL}/master-ledger/import`, { data: finalData });
                                       toast.success(`Sinkronisasi Berhasil! ${finalData.length} invoice master telah masuk.`, { id: loadingToast });
                                       e.target.value = '';
                                     } catch (err: any) {
                                       const msg = err.response?.data?.error || "Gagal sinkronisasi ledger.";
                                       toast.error(msg, { id: loadingToast });
                                     }
                                  };
                                  reader.readAsArrayBuffer(file);
                                }}
                              />
                            </label>
                          </div>
                        </div>
                     </div>
                   </div>

                   <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 flex items-start gap-4">
                     <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                       <HelpCircle className="w-5 h-5 text-primary" />
                     </div>
                     <div className="space-y-1">
                       <p className="text-xs font-semibold text-slate-900">Petunjuk Sinkronisasi:</p>
                       <p className="text-[9px] font-medium text-slate-500 leading-relaxed">
                         1. Update <span className="text-slate-900">Master Produk</span> melalui menu **Product Prices** di sidebar.<br/>
                         2. Upload <span className="text-slate-900">Laporan Penjualan</span> di atas secara berkala untuk memverifikasi keaslian transaksi yang diinput salesman.<br/>
                         3. Sistem otomatis melakukan background-check pada setiap invoice yang di-scan atau diinput manual.
                       </p>
                     </div>
                   </div>
                 </div>
               )}
          </div>
        </div>
     </div>
  );
}
