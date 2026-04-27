import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const IDLE_TIMEOUT = 60 * 60 * 1000;

  useEffect(() => {
    if (localStorage.getItem('user')) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }

    const savedUser = sessionStorage.getItem('user');
    const savedToken = sessionStorage.getItem('token');

    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
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
    return () => { axios.interceptors.response.eject(interceptor); };
  }, []);

  // Idle Timer
  useEffect(() => {
    let timeoutId;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      if (user) {
        timeoutId = setTimeout(() => {
          logout();
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
