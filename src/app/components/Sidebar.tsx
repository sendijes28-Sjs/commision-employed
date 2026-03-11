import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  DollarSign,
  Tag,
  Users,
  Settings,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const allMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/", roles: ["super_admin", "admin", "user"] },
  { icon: FileText, label: "Invoices", path: "/invoices", roles: ["super_admin", "admin", "user"] },
  { icon: CheckSquare, label: "Invoice Validation", path: "/invoice-validation", roles: ["super_admin", "admin", "user"] },
  { icon: DollarSign, label: "Commission Reports", path: "/commission-reports", roles: ["super_admin", "admin", "user"] },
  { icon: Tag, label: "Product Price List", path: "/price-list", roles: ["super_admin", "admin"] },
  { icon: Users, label: "Users Management", path: "/users", roles: ["super_admin", "admin"] },
  { icon: Settings, label: "Settings", path: "/settings", roles: ["super_admin", "admin", "user"] },
];

export function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  const userRole = user?.role || "user";
  const menuItems = allMenuItems.filter((item) => item.roles.includes(userRole));

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="font-semibold text-sidebar-foreground">
          Employee Commission
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Calculator System</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
