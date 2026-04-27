import { useLocation, Link } from "react-router";
import { ChevronRight, Menu } from "lucide-react";

const pageTitles = {
  "/": "Dashboard",
  "/invoices": "Invoices",
  "/invoices/create": "New Invoice",
  "/invoice-validation": "Review Queue",
  "/commission-reports": "Commission Report",
  "/payout-history": "Payout History",
  "/price-list": "Product Prices",
  "/users": "User Management",
  "/settings": "Settings",
  "/audit-logs": "Audit Logs",
};

function buildBreadcrumbs(pathname) {
  if (pathname.startsWith("/invoices/create")) {
    return [
      { label: "Invoices", path: "/invoices" },
      { label: "New Invoice", path: "" },
    ];
  }
  if (pathname.startsWith("/invoices/") && pathname !== "/invoices") {
    const invoiceId = pathname.split("/invoices/")[1];
    return [
      { label: "Invoices", path: "/invoices" },
      { label: `#${decodeURIComponent(invoiceId)}`, path: "" },
    ];
  }
  const title = pageTitles[pathname];
  if (title && pathname !== "/") {
    return [{ label: title, path: "" }];
  }
  return [];
}

export function TopBar({ onMenuClick }) {
  const location = useLocation();
  const breadcrumbs = buildBreadcrumbs(location.pathname);
  const isHome = location.pathname === "/";

  return (
    <header className="h-14 bg-white/90 backdrop-blur-xl border-b border-slate-100 flex items-center px-4 md:px-5 z-40 sticky top-0 gap-3">
      <button
        onClick={onMenuClick}
        className="md:hidden p-1.5 -ml-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      <nav className="flex items-center gap-1.5 min-w-0 overflow-hidden">
        <Link
          to="/"
          className={`text-sm font-medium transition-colors shrink-0 ${
            isHome ? "text-slate-900 font-semibold" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          Dashboard
        </Link>

        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5 min-w-0">
            <ChevronRight className="w-3 h-3 text-slate-300 flex-shrink-0" />
            {crumb.path ? (
              <Link
                to={crumb.path}
                className="text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors truncate"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="text-sm font-semibold text-slate-900 truncate">
                {crumb.label}
              </span>
            )}
          </span>
        ))}
      </nav>
    </header>
  );
}
