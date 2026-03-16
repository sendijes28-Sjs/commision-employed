import { useState, useEffect } from "react";
import { Search, Bell, ChevronDown, LogOut, Command, Zap } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function TopBar() {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-8 z-40 sticky top-0">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Search commands, invoices, or staff... (Cmd + K)"
            className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:bg-white transition-all font-medium text-sm"
          />
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[10px] font-black text-slate-400">
               <Command className="w-2.5 h-2.5" /> K
            </kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100/50">
           <Zap className="w-3.5 h-3.5 fill-current" />
           <span className="text-[10px] font-black uppercase tracking-widest leading-none">System Online</span>
        </div>

        <button className="relative p-2.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all group">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white group-hover:scale-125 transition-transform" />
        </button>

        <div className="relative flex items-center gap-4 pl-6 border-l border-slate-100">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 hover:bg-slate-50 p-1.5 rounded-2xl transition-all"
          >
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-tr from-primary to-blue-400 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-lg shadow-primary/20">
                {user?.name?.substring(0, 2).toUpperCase() ?? "??"}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
            
            <div className="text-left hidden sm:block">
              <p className="text-sm font-black text-slate-900 leading-none mb-1.5">{user?.name}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">
                {user?.role?.replace('_', ' ')}
              </p>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showDropdown && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute top-[calc(100%+12px)] right-0 w-64 bg-white border border-slate-100 rounded-3xl shadow-2xl shadow-slate-200/50 py-3 z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="px-5 py-4 border-b border-slate-50 mb-2">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Authenticated Account</p>
                   <p className="text-sm font-black text-slate-800 truncate">{user?.email}</p>
                </div>
                
                <div className="px-2 space-y-1">
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                    View Public Profile
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                    Account Security
                  </button>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-50 px-2 text-rose-500">
                  <button 
                    onClick={() => logout()}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-black uppercase tracking-widest hover:bg-rose-50 rounded-xl transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Terminate Session</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
