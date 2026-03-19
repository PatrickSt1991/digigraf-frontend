import { createContext, useEffect, useMemo, useState, ReactNode } from "react";

type User = {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isMedewerker: boolean;
  isUitvaartleider: boolean;
  isFinancieel: boolean;
  canAccessAdmin: boolean;
  hasRole: (role: string) => boolean;
  loading: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

const normalizeRole = (role: string) => role.trim().toLowerCase();

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        setUser(null);
        return;
      }

      const data = await response.json();
      setUser(data);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        await refreshUser();
      } finally {
        setLoading(false);
      }
    };

    void initAuth();
  }, []);

  const login = (user: User) => {
    setUser(user);
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // ignore network errors here and still clear local auth state
    } finally {
      setUser(null);
    }
  };

  const roleSet = useMemo(
    () => new Set((user?.roles ?? []).map(normalizeRole)),
    [user]
  );

  const hasRole = (role: string) => roleSet.has(normalizeRole(role));

  const isAdmin = hasRole("Admin");
  const isMedewerker = hasRole("Medewerker");
  const isUitvaartleider = hasRole("Uitvaartleider");
  const isFinancieel = hasRole("Financieel");

  // Only hidden for medewerkers
  const canAccessAdmin = !isMedewerker && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin,
        isMedewerker,
        isUitvaartleider,
        isFinancieel,
        canAccessAdmin,
        hasRole,
        loading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};