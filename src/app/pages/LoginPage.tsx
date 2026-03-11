import { useState } from "react";
import { useNavigate } from "react-router";
import { BarChart3, Loader2, AlertCircle } from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:3001/api/login", {
        email,
        password,
      });

      login(response.data.token, response.data.user);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to sign in. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <div className="hidden lg:flex lg:w-1/2 bg-primary p-12 flex-col justify-between text-primary-foreground">
        <div>
          <div className="flex items-center gap-2 mb-8">
            <BarChart3 className="w-8 h-8" />
            <span className="text-2xl">ECC System</span>
          </div>
          <h1 className="text-4xl mb-4 text-white">Employee Commission Calculator</h1>
          <p className="text-lg text-primary-foreground/90">
            Internal system for managing sales invoices and employee commission calculations.
          </p>
        </div>
        <div className="w-full max-w-md">
          <svg viewBox="0 0 400 300" className="w-full opacity-90 fill-white">
            <rect x="20" y="140" width="60" height="120" opacity="0.8" rx="4" />
            <rect x="100" y="100" width="60" height="160" opacity="0.6" rx="4" />
            <rect x="180" y="60" width="60" height="200" opacity="0.8" rx="4" />
            <rect x="260" y="80" width="60" height="180" opacity="0.6" rx="4" />
            <rect x="340" y="40" width="60" height="220" opacity="0.8" rx="4" />
          </svg>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-xl shadow-lg p-8 border border-border">
            <div className="mb-8">
              <h2 className="text-2xl mb-2 font-bold">Welcome Back</h2>
              <p className="text-muted-foreground">Sign in to your account</p>
            </div>
            
            {error && (
              <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block mb-2 text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@glory.com"
                  required
                  className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label htmlFor="password" className="block mb-2 text-sm font-medium">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center font-semibold disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
              </button>
              
              <div className="text-center py-4 border-t border-border mt-4">
                 <p className="text-xs text-muted-foreground mb-3">Try these dummy accounts:</p>
                 <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="bg-secondary p-1 rounded">admin@glory.com / admin123</div>
                    <div className="bg-secondary p-1 rounded">herman@glory.com / herman123</div>
                 </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
