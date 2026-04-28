import { useState } from "react";
import { useNavigate } from "react-router";
import { Mail, Lock, Loader2, TrendingUp, Users, ChevronRight, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import axios from "axios";
import { API_URL } from '@/lib/api.js';

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token, user: userData } = response.data;
      login(token, userData);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Invalid authentication credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "var(--background)" }}>

      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-15%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[100px]"
          style={{ background: "var(--primary)", opacity: 0.07 }} />
        <div className="absolute bottom-[-10%] left-[-10%] w-[35%] h-[35%] rounded-full blur-[100px]"
          style={{ background: "var(--primary)", opacity: 0.05 }} />
      </div>

      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-2xl overflow-hidden relative z-10"
        style={{ boxShadow: "0 20px 60px rgba(22,163,74,0.12)", border: "1px solid var(--border)" }}>

        {/* Left Side */}
        <div className="hidden lg:flex flex-col justify-between p-10 text-white relative overflow-hidden"
          style={{ background: "var(--sidebar)" }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px]"
            style={{ background: "var(--primary)", opacity: 0.15, transform: "translate(30%, -30%)" }} />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-[60px]"
            style={{ background: "var(--sidebar-primary)", opacity: 0.1, transform: "translate(-30%, 30%)" }} />

          <div className="relative z-10">
            <img src="/logo-utama.png" alt="Glory Logo" className="h-10 object-contain object-left" />
          </div>

          <div className="relative z-10 space-y-5">
            <div>
              <h1 className="text-3xl font-bold leading-tight tracking-tight"
                style={{ color: "var(--sidebar-foreground)" }}>
                Glory8 Commission<br />
                <span style={{ color: "var(--sidebar-primary)" }}>System</span>
              </h1>
              <p className="text-sm mt-3 max-w-[240px]"
                style={{ color: "var(--sidebar-foreground)", opacity: 0.55 }}>
                Aplikasi pendukung perhitungan komisi internal Glory8.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <TrendingUp className="w-4 h-4 mb-2" style={{ color: "var(--sidebar-primary)" }} />
                <p className="text-2xl font-bold" style={{ color: "var(--sidebar-foreground)" }}>98.4%</p>
                <p className="text-[10px] uppercase tracking-widest mt-1 font-semibold"
                  style={{ color: "var(--sidebar-foreground)", opacity: 0.45 }}>Accuracy Rate</p>
              </div>
              <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <Users className="w-4 h-4 mb-2" style={{ color: "var(--sidebar-primary)" }} />
                <p className="text-2xl font-bold" style={{ color: "var(--sidebar-foreground)" }}>20+</p>
                <p className="text-[10px] uppercase tracking-widest mt-1 font-semibold"
                  style={{ color: "var(--sidebar-foreground)", opacity: 0.45 }}>Active Staff</p>
              </div>
            </div>
          </div>

          <div className="relative z-10">
            <p className="text-[10px] tracking-widest uppercase font-semibold"
              style={{ color: "var(--sidebar-foreground)", opacity: 0.3 }}>
              Internal Management System V1.0.0
            </p>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-8 lg:p-10 flex flex-col justify-center bg-white">
          <div className="lg:hidden mb-8">
            <img src="/logo-utama.png" alt="Glory Logo" className="h-9 object-contain object-left" />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight" style={{ color: "var(--foreground)" }}>Welcome Back</h2>
            <p className="text-sm mt-1.5" style={{ color: "var(--muted-foreground)" }}>Enter your credentials to continue</p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-xl flex items-center gap-3 text-sm font-medium"
              style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626" }}>
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors"
                  style={{ color: "var(--muted-foreground)" }}>
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl outline-none text-sm transition-all font-medium"
                  style={{
                    background: "var(--secondary)",
                    border: "1.5px solid var(--border)",
                    color: "var(--foreground)",
                  }}
                  placeholder="name@glory.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>Password</label>
                <a href="#" className="text-xs font-semibold transition-colors" style={{ color: "var(--primary)" }}>Forgot?</a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
                  style={{ color: "var(--muted-foreground)" }}>
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl outline-none text-sm transition-all font-medium"
                  style={{
                    background: "var(--secondary)",
                    border: "1.5px solid var(--border)",
                    color: "var(--foreground)",
                  }}
                  placeholder="Password"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}