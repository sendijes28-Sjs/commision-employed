import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  DollarSign,
  Tag,
  Users,
  Settings,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const allMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/", roles: ["super_admin", "admin", "user"] },
  { icon: FileText, label: "Invoices", path: "/invoices", roles: ["super_admin", "admin", "user"] },
  { icon: CheckSquare, label: "Valuation Queue", path: "/invoice-validation", roles: ["super_admin", "admin", "user"] },
  { icon: DollarSign, label: "Commission Hub", path: "/commission-reports", roles: ["super_admin", "admin", "user"] },
  { icon: Tag, label: "Premium Catalog", path: "/price-list", roles: ["super_admin", "admin"] },
  { icon: Users, label: "Staff Directory", path: "/users", roles: ["super_admin", "admin"] },
  { icon: Settings, label: "System Config", path: "/settings", roles: ["super_admin", "admin", "user"] },
];

export function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  const userRole = user?.role || "user";
  const menuItems = allMenuItems.filter((item) => item.roles.includes(userRole));

  return (
    <aside className="w-72 bg-slate-900 border-r border-white/5 flex flex-col h-screen sticky top-0">
      {/* Brand Section */}
      <div className="p-8">
        <div className="flex items-center gap-3 group px-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
             <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-black text-white tracking-tighter text-xl">
              Glory<span className="text-primary">Commission</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">PT. Aneka Delapan Dekorasi</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 mt-4">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-4 mb-4">Core Navigation</p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between group px-4 py-3.5 rounded-xl transition-all duration-300 ${isActive
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? "text-white" : "text-slate-500 group-hover:text-primary"}`} />
                <span className="font-bold text-sm tracking-tight">{item.label}</span>
              </div>
              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white opacity-50" />}
              {!isActive && <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-slate-600" />}
            </Link>
          );
        })}
      </nav>

      {/* Contextual Card Footer */}
      <div className="p-6">
        <div className="bg-slate-800/50 rounded-2xl p-5 border border-white/5 backdrop-blur-sm">
           <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Network Secure</span>
           </div>
           <p className="text-xs text-slate-300 font-medium leading-relaxed">
             Internal auditing in progress. All transactions logged.
           </p>
        </div>
      </div>
    </aside>
  );
}
