import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: number;
  name: string;
  email: string;
  team: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Waktu maksimal user dibiarkan AFK / Diam (Saat ini 1 Jam)
  const IDLE_TIMEOUT = 60 * 60 * 1000;

  useEffect(() => {
    // Migration: Hapus sisa localStorage yang lama secara paksa
    if (localStorage.getItem('user')) {
       localStorage.removeItem('user');
       localStorage.removeItem('token');
    }

    // Menggunakan sessionStorage agar otomatis hilang saat browser/tab ditutup
    const savedUser = sessionStorage.getItem('user');
    const savedToken = sessionStorage.getItem('token');
    
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
    }
    setLoading(false);
  }, []);

  const login = (token: string, userData: User) => {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          const errorMsg = error.response.data?.error || "";
          if (errorMsg.toLowerCase().includes("token") || errorMsg.toLowerCase().includes("expired")) {
            logout();
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  // Idle Timer (Pendeteksi user yang AFK)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      if (user) {
        timeoutId = setTimeout(() => {
          logout();
          // Gunakan setTimeout kecil untuk memastikan logout state merender dahulu
          setTimeout(() => alert("Sesi kerja Anda telah otomatis diakhiri karena tidak ada aktivitas selama lebih dari 1 Jam. Silakan Login kembali untuk alasan keamanan."), 100);
        }, IDLE_TIMEOUT);
      }
    };

    if (user) {
       resetTimer();
       window.addEventListener('mousemove', resetTimer);
       window.addEventListener('mousedown', resetTimer);
       window.addEventListener('keypress', resetTimer);
       window.addEventListener('scroll', resetTimer, true);
    }

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('mousedown', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      window.removeEventListener('scroll', resetTimer, true);
    };
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
