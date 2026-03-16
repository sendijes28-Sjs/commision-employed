import { useState, useEffect } from "react";
import { Save, User, ShieldCheck, Loader2, Settings2, Percent, Globe, Bell, Lock, LogOut, Clock, KeyRound, Activity, Sparkles, BadgeCheck, ShieldAlert, LayoutGrid, AlertTriangle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { toast } from "sonner";

const API_URL = "http://localhost:3001/api";

export function SettingsPage() {
  const { user, logout } = useAuth();
  const isUserRole = user?.role === "user";
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [settings, setSettings] = useState({
    lelang_commission: "5.0",
    user_commission: "4.5",
    offline_commission: "4.0",
    default_commission: "3.0"
  });

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

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center p-40 space-y-4">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
      <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Accessing System Core...</p>
    </div>
  );

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
             <span className="bg-primary/10 text-primary p-2.5 rounded-[1.25rem]">
                <Settings2 className="w-9 h-9" />
             </span>
             {isUserRole ? "Personal Registry" : "Enterprise control"}
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">
            {isUserRole ? "Oversee your profile credentials and security tiers" : "System-wide governance and commission distribution architecture"}
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Navigation Sidebar */}
        <div className="lg:w-64 space-y-2">
           {[
             { id: "profile", label: "Identity Profile", icon: User },
             { id: "engine", label: "Commission Engine", icon: Percent, hidden: isUserRole },
             { id: "global", label: "Global Rules", icon: Globe, hidden: isUserRole },
             { id: "security", label: "Security & Auth", icon: Lock },
             { id: "notifications", label: "Alert Configs", icon: Bell },
           ].map((tab) => !tab.hidden && (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest ${
                 activeTab === tab.id 
                 ? "bg-slate-900 text-white shadow-xl shadow-slate-200 translate-x-1" 
                 : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
               }`}
             >
                <tab.icon className="w-4 h-4" />
                {tab.label}
             </button>
           ))}
           <div className="pt-8 mt-8 border-t border-slate-100">
              <button 
                onClick={logout}
                className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all font-black text-xs uppercase tracking-widest"
              >
                 <LogOut className="w-4 h-4" />
                 Terminate Session
              </button>
           </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-1 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
           {activeTab === 'profile' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-card rounded-[2.5rem] p-10 border border-border shadow-sm group">
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" /> PERSONNEL IDENTITY CARD
                   </h3>
                   <div className="space-y-8">
                      <div className="flex items-center gap-6">
                         <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-tr from-primary to-blue-400 text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-primary/20">
                            {user?.name?.split(" ").map(n => n[0]).join("").toUpperCase()}
                         </div>
                         <div>
                            <p className="text-2xl font-black text-slate-900 leading-tight">{user?.name}</p>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Registry Email: {user?.email}</p>
                         </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-4">
                         <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Authorization</p>
                            <p className="text-sm font-black text-primary uppercase tracking-widest">{user?.role?.replace('_', ' ')}</p>
                         </div>
                         <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Division</p>
                            <p className="text-sm font-black text-slate-900 uppercase tracking-widest">{user?.team}</p>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="bg-card rounded-[2.5rem] p-10 border border-border shadow-sm flex flex-col justify-center text-center">
                   <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <ShieldCheck className="w-8 h-8" />
                   </div>
                   <h3 className="text-xl font-black text-slate-900 mb-2">Security Clearance: ACTIVE</h3>
                   <p className="text-sm font-medium text-slate-500 px-10">Your account is fortified with enterprise-grade encryption. No compliance issues detected.</p>
                   <button className="mt-8 text-[10px] font-black uppercase tracking-widest text-primary hover:underline transition-all">Audit Security Log</button>
                </div>
             </div>
           )}

           {activeTab === 'engine' && (
             <div className="bg-card rounded-[3rem] p-10 border border-border shadow-sm overflow-hidden relative">
                <div className="absolute top-0 right-0 p-10 opacity-5">
                   <Percent className="w-40 h-40" />
                </div>
                <div className="relative z-10">
                   <div className="flex items-center justify-between mb-10">
                      <div>
                         <h3 className="text-2xl font-black text-slate-900">Commission Algorithm</h3>
                         <p className="text-sm font-medium text-slate-400 mt-1">Fine-tune the payout distribution percentages</p>
                      </div>
                      <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-primary text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                      >
                         {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                         Finalize Logic
                      </button>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {[
                        { id: "lelang_commission", label: "Team Lelang Rate", desc: "Special project performance benchmark" },
                        { id: "user_commission", label: "Team Staff Rate", desc: "Internal personnel performance quota" },
                        { id: "offline_commission", label: "Offline/Store Rate", desc: "Retail walk-in transaction incentive" },
                        { id: "default_commission", label: "Global Fallback", desc: "Catch-all logic for undefined teams" },
                      ].map((rule) => (
                        <div key={rule.id} className="group p-6 bg-slate-50/50 rounded-3xl border border-transparent hover:border-primary/20 hover:bg-white transition-all">
                           <div className="flex items-start justify-between mb-4">
                              <div>
                                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">{rule.label}</label>
                                 <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-1">{rule.desc}</p>
                              </div>
                              <Percent className="w-5 h-5 text-primary opacity-20" />
                           </div>
                           <div className="relative">
                              <input
                                type="number"
                                step="0.1"
                                value={(settings as any)[rule.id]}
                                onChange={(e) => setSettings({ ...settings, [rule.id]: e.target.value })}
                                className="w-full px-0 py-2 bg-transparent text-3xl font-black text-slate-900 outline-none border-b-2 border-slate-100 focus:border-primary transition-all pr-10"
                              />
                              <span className="absolute right-0 bottom-3 text-xl font-black text-slate-300">%</span>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
           )}

            {activeTab === 'notifications' && (
              <div className="bg-card rounded-[3rem] p-10 border border-border shadow-sm overflow-hidden relative group">
                 <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                    <Bell className="w-40 h-40" />
                 </div>
                 <div className="relative z-10">
                    <div className="flex items-center justify-between mb-10">
                       <div>
                          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Intelligence Alerts</h3>
                          <p className="text-sm font-medium text-slate-400 mt-1 uppercase tracking-widest text-[9px] font-black">Configure automated reporting streams</p>
                       </div>
                       <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Active Channels: 4</span>
                       </div>
                    </div>

                    <div className="space-y-6">
                       {[
                         { label: "Critical Commission Discrepancy", desc: "Immediate notification if AI detects margin dilution below 0.5%", active: true },
                         { label: "New Bulk Import Analytics", desc: "Quarterly performance reports generated after CSV integration", active: true },
                         { label: "Personnel Enrollment Logs", desc: "Audit trail for new staff onboarding and access grant", active: false },
                         { label: "Security Breach Simulation", desc: "Monthly automated penetration testing and threat assessment", active: true },
                       ].map((item, i) => (
                         <div key={i} className="flex items-center justify-between p-6 bg-slate-50/30 rounded-[2rem] border border-slate-100 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="flex items-center gap-6">
                               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.active ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-300'}`}>
                                  <Bell className="w-6 h-6" />
                               </div>
                               <div>
                                  <p className="text-sm font-black text-slate-800">{item.label}</p>
                                  <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-widest leading-relaxed">{item.desc}</p>
                               </div>
                            </div>
                            <div className={`w-14 h-8 rounded-full p-1 transition-all duration-500 cursor-pointer ${item.active ? 'bg-primary' : 'bg-slate-200'}`}>
                               <div className={`w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-500 ${item.active ? 'translate-x-6' : 'translate-x-0'}`} />
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-10">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl shadow-slate-300 relative overflow-hidden group">
                       <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-125 transition-transform duration-1000">
                          <Lock className="w-40 h-40" />
                       </div>
                       <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-8 flex items-center gap-3">
                          <ShieldCheck className="w-4 h-4 text-primary" /> Multi-Factor Protocol
                       </h3>
                       <p className="text-2xl font-black tracking-tight leading-tight">Enhanced Node Encryption is ACTIVE</p>
                       <p className="text-xs text-slate-400 mt-4 leading-relaxed font-medium">Your biometric and digital signatures are synced with the global security layer.</p>
                       <button className="mt-10 w-full py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95">
                          Rotate Authentication Keys
                       </button>
                    </div>

                    <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/40 relative group overflow-hidden">
                       <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform">
                          <Clock className="w-40 h-40" />
                       </div>
                       <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-8">Active Session Clusters</h3>
                       <div className="space-y-6">
                          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                                   <Globe className="w-5 h-5" />
                                </div>
                                <div>
                                   <p className="text-xs font-black text-slate-800 uppercase tracking-widest">Chrome Server Node</p>
                                   <p className="text-[9px] text-slate-400 font-bold">192.168.1.45 • Local Context</p>
                                </div>
                             </div>
                             <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-lg">Current</span>
                          </div>
                       </div>
                       <button className="mt-8 text-[10px] font-black text-rose-500 uppercase tracking-[0.3em] hover:text-rose-600 transition-colors">Terminate All Foreign Sessions</button>
                    </div>
                 </div>
                 
                 <div className="bg-card rounded-[3rem] p-12 border border-border shadow-sm group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-5">
                       <KeyRound className="w-40 h-40" />
                    </div>
                    <div className="relative z-10 max-w-xl">
                       <h3 className="text-2xl font-black text-slate-900 mb-2">Registry Access Cipher</h3>
                       <p className="text-sm font-medium text-slate-400 mb-10 leading-relaxed uppercase tracking-widest text-[9px] font-black">Periodically rotate your access credentials for maximum security</p>
                       
                       <div className="space-y-6">
                          <div className="space-y-3">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Current Secure Key</label>
                             <input type="password" placeholder="••••••••••••" className="w-full px-8 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-black text-sm" />
                          </div>
                          <div className="grid grid-cols-2 gap-6">
                             <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Genesis New Key</label>
                                <input type="password" placeholder="••••••••••••" className="w-full px-8 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-black text-sm" />
                             </div>
                             <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Validate Genesis Key</label>
                                <input type="password" placeholder="••••••••••••" className="w-full px-8 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-black text-sm" />
                             </div>
                          </div>
                       </div>
                       <button className="mt-10 bg-slate-900 text-white px-10 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-slate-200">
                          Enforce Cipher Rotation
                       </button>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'global' && (
              <div className="bg-card rounded-[3rem] p-10 border border-border shadow-sm overflow-hidden relative group">
                 <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-1000 grayscale group-hover:grayscale-0">
                    <Globe className="w-40 h-40 text-primary" />
                 </div>
                 <div className="relative z-10">
                    <div className="flex items-center justify-between mb-12">
                       <div>
                          <h3 className="text-3xl font-black text-slate-900 tracking-tight">System Sovereignty</h3>
                          <p className="text-sm font-medium text-slate-400 mt-2 uppercase tracking-widest text-[9px] font-black italic">Coordinate global operational parameters and AI logic tiers</p>
                       </div>
                       <div className="w-16 h-16 bg-primary/10 text-primary rounded-3xl flex items-center justify-center">
                          <Activity className="w-8 h-8" />
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       {[
                         { label: "DeepScan OCR Layer", desc: "Enable ultra-high fidelity text extraction (Consumes 20% more API quota)", active: true, icon: Sparkles },
                         { label: "Automatic Ledger Payout", desc: "Instantly certify commissions for compliant invoices without audit", active: false, icon: BadgeCheck },
                         { label: "Marginal Safety Isolation", desc: "Auto-flag transactions with less than 2% margin for HR forensic review", active: true, icon: ShieldAlert },
                         { label: "Enterprise Bulk Sync", desc: "Allow cross-division data visibility for high-level coordinators", active: false, icon: LayoutGrid },
                         { label: "Real-time FX Oracle", desc: "Synchronize IDR/USD exchange rates for international procurement", active: true, icon: Globe },
                         { label: "Auditor Maintenance Lock", desc: "Temporarily suspend all invoice submissions for system maintenance", active: false, icon: Lock },
                       ].map((item, i) => (
                         <div key={i} className="flex flex-col p-8 bg-white border border-slate-100 rounded-[2.5rem] hover:shadow-2xl hover:border-primary/20 hover:-translate-y-2 transition-all duration-500">
                            <div className="flex items-center justify-between mb-6">
                               <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center group-hover:text-primary transition-colors">
                                  <item.icon className="w-6 h-6" />
                               </div>
                               <div className={`w-12 h-7 rounded-full p-0.5 transition-all duration-500 cursor-pointer ${item.active ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                                  <div className={`w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-500 ${item.active ? 'translate-x-5' : 'translate-x-0'}`} />
                               </div>
                            </div>
                            <h4 className="text-base font-black text-slate-900 mb-2">{item.label}</h4>
                            <p className="text-xs text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                         </div>
                       ))}
                    </div>

                    <div className="mt-12 p-10 bg-slate-900 rounded-[2.5rem] flex items-center justify-between gap-10">
                       <div className="flex items-center gap-6">
                          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-3xl border border-white/10">
                             <AlertTriangle className="w-7 h-7 text-orange-400" />
                          </div>
                          <div>
                             <p className="text-white font-black text-lg tracking-tight">Flush System State Registry</p>
                             <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Permanently reset all volatile operational buffers</p>
                          </div>
                       </div>
                       <button className="bg-rose-600 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-all active:scale-95 shadow-2xl shadow-rose-900/40">
                          Execute Protocol Zero
                       </button>
                    </div>
                 </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
