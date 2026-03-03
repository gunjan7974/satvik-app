import React, { createContext, useContext, useState } from "react";

type AuthUser = {
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  walletBalance?: number;
};

type AuthContextType = {
  user: AuthUser | null;
  isLoggedIn: boolean;
  login: (u: AuthUser) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = (u: AuthUser) => setUser(u);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);