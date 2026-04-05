import { createContext, type ReactNode, useEffect, useState } from "react";
import { getCurrentUserProfile } from "../api/authApi";
import type { AuthUser } from "../types/auth";
import { clearStoredAuth, getStoredAuth, saveAuth } from "../utils/authStorage";

interface AuthContextType {
  auth: AuthUser | null;
  isLoading: boolean;
  login: (userData: AuthUser, persist?: boolean) => void;
  loginWithToken: (token: string, persist?: boolean) => Promise<AuthUser>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [auth, setAuth] = useState<AuthUser | null>(() => getStoredAuth());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const syncAuth = async () => {
      const storedAuth = getStoredAuth();

      if (!storedAuth?.token) {
        setIsLoading(false);
        return;
      }

      if (storedAuth.expiresAt && storedAuth.expiresAt <= Math.floor(Date.now() / 1000)) {
        clearStoredAuth();
        setAuth(null);
        setIsLoading(false);
        return;
      }

      try {
        const profile = await getCurrentUserProfile();
        const nextAuth: AuthUser = {
          ...storedAuth,
          username: profile.loginName,
          email: profile.email,
          fullName: profile.fullName,
          avatarUrl: profile.avatarUrl,
          accountId: profile.id,
          role: profile.role || storedAuth.role,
          authProvider: profile.authProvider || storedAuth.authProvider,
        };
        setAuth(nextAuth);
        saveAuth(nextAuth, localStorage.getItem("auth") !== null);
      } catch {
        clearStoredAuth();
        setAuth(null);
      } finally {
        setIsLoading(false);
      }
    };

    void syncAuth();
  }, []);

  const login = (userData: AuthUser, persist = true) => {
    setAuth(userData);
    saveAuth(userData, persist);
  };

  const loginWithToken = async (token: string, persist = true) => {
    const provisionalAuth: AuthUser = {
      username: "",
      token,
      tokenType: "Bearer",
    };

    saveAuth(provisionalAuth, persist);

    try {
      const profile = await getCurrentUserProfile();
      const nextAuth: AuthUser = {
        username: profile.loginName,
        email: profile.email,
        fullName: profile.fullName,
        avatarUrl: profile.avatarUrl,
        accountId: profile.id,
        role: profile.role || "USER",
        authProvider: profile.authProvider || "LOCAL",
        token,
        tokenType: "Bearer",
      };

      setAuth(nextAuth);
      saveAuth(nextAuth, persist);
      return nextAuth;
    } catch (error) {
      clearStoredAuth();
      setAuth(null);
      throw error;
    }
  };

  const logout = () => {
    setAuth(null);
    clearStoredAuth();
  };

  return (
    <AuthContext.Provider value={{ auth, isLoading, login, loginWithToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
