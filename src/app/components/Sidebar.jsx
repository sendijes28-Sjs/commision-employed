import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import {
  LayoutDashboard, FileText, CheckSquare, DollarSign, History,
  Tag, Users, Settings, ShieldCheck, ChevronLeft, LogOut,
  Activity, X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import axios from "axios";
import { API_URL } from '@/lib/api';

const menuSections = [
  {
    title: "Work",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/", roles: ["super_admin", "admin", "user"] },
      { icon: FileText, label: "Invoices", path: "/invoices", roles: ["super_admin", "admin", "user"], badgeKey: "invoices" },
      { icon: CheckSquare, label: "Review Queue", path: "/invoice-validation", roles: ["super_admin", "admin"], badgeKey: "pending" },
    ],
  },
  {
    title: "Finance",
    items: [
      { icon: DollarSign, label: "Commission", path: "/commission-reports", roles: ["super_admin", "admin", "user"] },
      { icon: History, label: "Payout History", path: "/payout-history", roles: ["super_admin", "admin", "user"] },
    ],
  },
  {
    title: "Admin",
    items: [
      { icon: Tag, label: "Product Prices", path: "/price-list", roles: ["super_admin", "admin"] },
      { icon: Users, label: "Users", path: "/users", roles: ["super_admin", "admin"] },
      { icon: Activity, label: "Audit Logs", path: "/audit-logs", roles: ["super_admin"] },
    ],
  },
];

export function Sidebar({ isMobileOpen, onCloseMobile }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [badges, setBadges] = useState({});

  const userRole = user?.role || "user";

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const res = await axios.get(`${API_URL}/stats/counts`);
        setBadges({
          pending: res.data.pendingInvoices || 0,
          invoices: res.data.totalInvoices || 0,
        });
      } catch { /* silently fail */ }
    };
    fetchBadges();
    const interval = setInterval(fetchBadges, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredSections = menuSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => item.roles.includes(userRole)),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          ${collapsed ? "md:w-[68px]" : "md:w-[220px]"}
          w-[260px] fixed md:sticky top-0 left-0 z-50
          bg-slate-900 flex flex-col h-screen
          transition-all duration-300 ease-in-out
          border-r border-white/[0.06]
        `}
      >
        {/* Logo */}
        <div className={`flex items-center ${collapsed ? "md:justify-center justify-between" : "justify-between"} px-4 h-14 border-b border-white/[0.06]`}>
          <Link to="/" onClick={onCloseMobile} className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            {(!collapsed || isMobileOpen) && (
              <div className="min-w-0">
                <h1 className="text-sm font-semibold text-white tracking-tight leading-snug truncate">
                  Glory<span className="text-primary/80"> Commission</span>
                  <br />
                  <span className="text-primary/80">System</span>
                </h1>
              </div>
            )}
          </Link>
          <div className="flex items-center gap-2">
            {!collapsed && (
              <button
                onClick={() => setCollapsed(true)}
                className="hidden md:flex w-6 h-6 rounded-md items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            )}
            {isMobileOpen && (
              <button
                onClick={onCloseMobile}
                className="md:hidden w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Collapsed expand button */}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="hidden md:flex mx-auto mt-3 w-8 h-8 rounded-lg items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all"
          >
            <ChevronLeft className="w-3.5 h-3.5 rotate-180" />
          </button>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {filteredSections.map((section) => (
            <div key={section.title}>
              {(!collapsed || isMobileOpen) && (
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
                  {section.title}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  const badgeCount = item.badgeKey === "pending" ? badges.pending : undefined;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={onCloseMobile}
                      title={collapsed && !isMobileOpen ? item.label : undefined}
                      className={`flex items-center ${collapsed && !isMobileOpen ? "justify-center px-0 py-2.5" : "justify-between px-3 py-2"} rounded-lg transition-all duration-200 group ${
                        isActive
                          ? "bg-primary text-white shadow-md shadow-primary/20"
                          : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
                      }`}
                    >
                      <div className={`flex items-center ${collapsed && !isMobileOpen ? "" : "gap-2.5"}`}>
                        <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"}`} />
                        {(!collapsed || isMobileOpen) && (
                          <span className="text-[13px] font-medium tracking-[-0.01em]">{item.label}</span>
                        )}
                      </div>
                      {(!collapsed || isMobileOpen) && badgeCount !== undefined && badgeCount > 0 && (
                        <span className={`text-[10px] font-semibold min-w-[20px] h-5 flex items-center justify-center rounded-full px-1.5 ${
                          isActive ? "bg-white/20 text-white" : "bg-orange-500/15 text-orange-400"
                        }`}>
                          {badgeCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-white/[0.06] p-3 space-y-1">
          <Link
            to="/settings"
            onClick={onCloseMobile}
            className={`flex items-center ${collapsed && !isMobileOpen ? "justify-center px-0" : "px-3"} py-2 rounded-lg text-slate-400 hover:bg-white/[0.06] hover:text-white transition-all group ${
              location.pathname === "/settings" ? "bg-white/[0.06] text-white" : ""
            }`}
          >
            <Settings className={`w-[18px] h-[18px] flex-shrink-0 ${location.pathname === "/settings" ? "text-white" : "text-slate-500 group-hover:text-slate-300"}`} />
            {(!collapsed || isMobileOpen) && <span className="text-[13px] font-medium ml-2.5">Settings</span>}
          </Link>

          {(!collapsed || isMobileOpen) ? (
            <div className="flex items-center justify-between px-3 py-2 mt-1">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 bg-slate-700 rounded-lg flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0">
                  {user?.name?.substring(0, 2).toUpperCase() ?? "??"}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-white leading-none truncate">{user?.name}</p>
                  <p className="text-[10px] text-slate-500 leading-none mt-0.5 capitalize">{user?.role?.replace("_", " ")}</p>
                </div>
              </div>
              <button
                onClick={() => logout()}
                className="w-6 h-6 rounded-md flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => logout()}
              className="w-full flex items-center justify-center py-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
              title="Sign out"
            >
              <LogOut className="w-[18px] h-[18px]" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
