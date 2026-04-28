import { useState } from "react";
import { useNavigate } from "react-router";
import { ShieldCheck, Mail, Lock, Loader2, TrendingUp, Users, ChevronRight } from "lucide-react";
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-[80px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-400/5 rounded-full blur-[80px]" />
      </div>

      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-xl shadow-xl shadow-slate-200/50 overflow-hidden relative z-10 border border-slate-100">
        <div className="hidden lg:flex flex-col justify-between p-8 bg-slate-900 text-white relative">
          <div className="relative z-10 flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-semibold tracking-tighter italic">Glory8 | Home Living</span>
          </div>

          <div className="relative z-10 space-y-4">
            <h1 className="text-3xl font-semibold leading-none tracking-tight">
              Glory8 Commission <br />
              <span className="text-primary italic">System</span>
            </h1>
            <p className="text-xs text-slate-400 font-semibold max-w-[240px] italic">
              Aplikasi pendukung perhitungan komisi internal Glory8.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-4">
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <TrendingUp className="w-4 h-4 text-primary mb-2" />
                <p className="text-xl font-semibold">98.4%</p>
                <p className="text-[7px] text-slate-400 uppercase font-semibold tracking-widest mt-1 italic">Accuracy Rate</p>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <Users className="w-4 h-4 text-blue-400 mb-2" />
                <p className="text-xl font-semibold">20+</p>
                <p className="text-[7px] text-slate-400 uppercase font-semibold tracking-widest mt-1 italic">Active Staff</p>
              </div>
            </div>
          </div>
          <div className="relative z-10 pt-8" />
        </div>

        {/* Right Side: Login Form */}
        <div className="p-8 lg:p-10 flex flex-col justify-center">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-semibold tracking-tighter italic">Commission System</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 tracking-tight leading-none">Welcome Back</h2>
            <p className="text-slate-500 font-semibold mt-2 text-xs italic opacity-70">Enter your credentials to continue</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-600 text-[10px] font-semibold italic">
              <ShieldCheck className="w-3.5 h-3.5" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[8px] font-semibold uppercase tracking-widest text-slate-400 ml-1 italic">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-primary transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary focus:bg-white transition-all font-semibold text-xs"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[8px] font-semibold uppercase tracking-widest text-slate-400 italic">Password</label>
                <a href="#" className="text-[8px] font-semibold text-primary uppercase tracking-widest hover:underline italic opacity-70">Forgot?</a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-primary transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary focus:bg-white transition-all font-medium text-xs"
                  placeholder="Password"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-white py-3 rounded-xl font-semibold uppercase tracking-widest text-[9px] hover:bg-primary/95 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 italic"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
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

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 opacity-10 select-none pointer-events-none grayscale">
        <span className="text-[7px] font-semibold tracking-[0.3em] text-slate-400 italic">INTERNAL MANAGEMENT SYSTEM V1.0.0</span>
      </div>
    </div>
  );
}
