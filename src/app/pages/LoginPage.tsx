import { useState } from "react";
import { useNavigate } from "react-router";
import { ShieldCheck, Mail, Lock, Loader2, TrendingUp, Users, ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      login(email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid authentication credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 overflow-hidden relative z-10 border border-white">
        
        {/* Left Side: Illustration & Value Proposition */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-slate-900 text-white relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-50" />
          
          <div className="relative z-10 flex items-center gap-2 mb-12">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter">PT. Aneka Delapan Dekorasi.</span>
          </div>

          <div className="relative z-10 space-y-8">
            <h1 className="text-5xl font-black leading-[1.1] tracking-tight">
              Aplikasi  <br />
              <span className="text-primary">Penghitung Komisi</span>.
            </h1>
            <p className="text-lg text-slate-400 font-medium max-w-md">
              Aplikasi ini digunakan untuk menghitung komisi karyawan PT. Aneka Delapan Dekorasi.
            </p>

            <div className="grid grid-cols-2 gap-6 pt-6">
              <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
                <TrendingUp className="w-6 h-6 text-primary mb-3" />
                <p className="text-2xl font-black">98.4%</p>
                <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mt-1">Accuracy Rate</p>
              </div>
              <div className="bg-slate-800/50 p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
                <Users className="w-6 h-6 text-blue-400 mb-3" />
                <p className="text-2xl font-black">20+</p>
                <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mt-1">Active Staff</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-4 pt-12">

          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-8 lg:p-16 flex flex-col justify-center">
          <div className="lg:hidden flex items-center gap-2 mb-12">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-black tracking-tighter">CommisionHub</span>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
            <p className="text-slate-500 font-medium mt-2">Access your performance dashboard below</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-bold">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                 <ShieldCheck className="w-4 h-4" />
              </div>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Work Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all font-bold placeholder:font-medium"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Password</label>
                <a href="#" className="text-xs font-black text-primary uppercase tracking-widest hover:underline">Forgot?</a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all font-bold placeholder:font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Sign In to Account
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-12 text-center">
            <p className="text-slate-400 text-sm font-medium">
              Don't have an account? <br className="lg:hidden" />
              <a href="#" className="text-slate-900 font-black hover:text-primary transition-colors">Request Access from Admin</a>
            </p>
          </div>
        </div>
      </div>
      
      {/* Visual Accents */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 opacity-30 select-none pointer-events-none grayscale contrast-150">
        <span className="text-[10px] font-black tracking-[0.5em] text-slate-400">GLORY INTERIOR</span>
        <div className="w-1 h-1 bg-slate-300 rounded-full" />
        <span className="text-[10px] font-black tracking-[0.5em] text-slate-400">VALUATION SYSTEM</span>
      </div>
    </div>
  );
}
