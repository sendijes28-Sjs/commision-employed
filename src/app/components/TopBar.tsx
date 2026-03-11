import { Search, Bell, ChevronDown, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export function TopBar() {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 z-10">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 bg-secondary border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 hover:bg-secondary rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full"></span>
        </button>
        <div className="relative flex items-center gap-3 pl-4 border-l border-border">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 hover:bg-secondary/50 p-1 rounded-lg transition-all"
          >
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xs">
              {user?.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex items-center gap-2 text-left hidden sm:block">
              <div>
                <p className="text-sm font-semibold text-foreground leading-none mb-1">{user?.name}</p>
                <p className="text-[10px] text-muted-foreground leading-none">{user?.role?.toUpperCase()}</p>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showDropdown && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 border-b border-border mb-2">
                 <p className="text-xs text-muted-foreground">Signed in as</p>
                 <p className="text-sm font-medium truncate">{user?.email}</p>
              </div>
              <button 
                onClick={() => logout()}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
