"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { AuthModal } from "./AuthModal";

interface User {
  id: number;
  username: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  openAuthModal: (mode: "login" | "signup") => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "signup">(
    "login"
  );

  const pathname = usePathname();

  useEffect(() => {
    // Check if user is already authenticated (from localStorage)
    const authToken = localStorage.getItem("glog_auth");
    if (authToken) {
      // Verify the token is still valid
      verifyAuth(authToken).then((userData) => {
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        }
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyAuth = async (token: string): Promise<User | null> => {
    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await response.json();
      if (data.valid && data.user) {
        return data.user;
      }
      return null;
    } catch {
      return null;
    }
  };

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("glog_auth", data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        setShowAuthModal(false);
        return true;
      }
      throw new Error((await response.json()).error);
    } catch (e: any) {
      throw e;
    }
  };

  const signup = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("glog_auth", data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        setShowAuthModal(false);
        return true;
      }
      throw new Error((await response.json()).error);
    } catch (e: any) {
      throw e;
    }
  };

  const logout = async () => {
    const token = localStorage.getItem("glog_auth");
    if (token) {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
    localStorage.removeItem("glog_auth");
    setUser(null);
    setIsAuthenticated(false);
  };

  const openAuthModal = (mode: "login" | "signup") => {
    setAuthModalMode(mode);
    setShowAuthModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">💪</div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated and not on landing page, show login
  // Actually, we want to allow rendering Landing Page (/) even if not auth
  // But other pages should be protected.

  const isPublicRoute = pathname === "/";

  if (!isAuthenticated && !isPublicRoute) {
    // Force login for protected routes
    // We can just show the modal and a background, or redirect.
    // Let's show the modal.
    return (
      <AuthContext.Provider
        value={{ user, isAuthenticated, login, signup, logout, openAuthModal }}
      >
        <div className="min-h-screen gradient-bg">
          <AuthModal initialMode="login" />
        </div>
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, login, signup, logout, openAuthModal }}
    >
      {children}
      {showAuthModal && (
        <AuthModal
          initialMode={authModalMode}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </AuthContext.Provider>
  );
}
