import { Link } from "react-router";
import { BarChart3 } from "lucide-react";

export function LoginPage() {
  return (
    <div className="flex h-screen bg-background">
      <div className="hidden lg:flex lg:w-1/2 bg-primary p-12 flex-col justify-between text-primary-foreground">
        <div>
          <div className="flex items-center gap-2 mb-8">
            <BarChart3 className="w-8 h-8" />
            <span className="text-2xl">ECC System</span>
          </div>
          <h1 className="text-4xl mb-4">Employee Commission Calculator</h1>
          <p className="text-lg text-primary-foreground/90">
            Internal system for managing sales invoices and employee commission calculations.
          </p>
        </div>
        <div className="w-full max-w-md">
          <svg viewBox="0 0 400 300" className="w-full opacity-90">
            <rect x="20" y="140" width="60" height="120" fill="currentColor" opacity="0.8" rx="4" />
            <rect x="100" y="100" width="60" height="160" fill="currentColor" opacity="0.6" rx="4" />
            <rect x="180" y="60" width="60" height="200" fill="currentColor" opacity="0.8" rx="4" />
            <rect x="260" y="80" width="60" height="180" fill="currentColor" opacity="0.6" rx="4" />
            <rect x="340" y="40" width="60" height="220" fill="currentColor" opacity="0.8" rx="4" />
          </svg>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-xl shadow-lg p-8 border border-border">
            <div className="mb-8">
              <h2 className="text-2xl mb-2">Welcome Back</h2>
              <p className="text-muted-foreground">Sign in to your account</p>
            </div>
            <form className="space-y-6">
              <div>
                <label htmlFor="email" className="block mb-2 text-sm">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="admin@company.com"
                  className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label htmlFor="password" className="block mb-2 text-sm">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4 rounded border-input" />
                  <span className="text-sm">Remember me</span>
                </label>
                <a href="#" className="text-sm text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
              <Link
                to="/"
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center"
              >
                Sign In
              </Link>
              <p className="text-center text-xs text-muted-foreground mt-4">
                Authorized personnel only
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
