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
  isGuest: boolean;
  login: (u: AuthUser) => void;
  loginGuest: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  isGuest: false,
  login: () => {},
  loginGuest: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  const login = (u: AuthUser) => {
    setUser(u);
    setIsGuest(false);
  };

  const loginGuest = () => {
    setUser(null);
    setIsGuest(true);
  };

  const logout = () => {
    setUser(null);
    setIsGuest(false);
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, isGuest, login, loginGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);