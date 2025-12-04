"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (key: string) => Promise<boolean>;
  logout: () => void;
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated (from sessionStorage)
    const authToken = sessionStorage.getItem("glog_auth");
    if (authToken) {
      // Verify the token is still valid
      verifyAuth(authToken).then((valid) => {
        setIsAuthenticated(valid);
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyAuth = async (token: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  const login = async (key: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });

      if (response.ok) {
        const { token } = await response.json();
        sessionStorage.setItem("glog_auth", token);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = () => {
    sessionStorage.removeItem("glog_auth");
    setIsAuthenticated(false);
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

  if (!isAuthenticated) {
    return <AuthModal onLogin={login} />;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

interface AuthModalProps {
  onLogin: (key: string) => Promise<boolean>;
}

function AuthModal({ onLogin }: AuthModalProps) {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const success = await onLogin(key);

    if (!success) {
      setError("Invalid access key. Please try again.");
      setKey("");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="glass max-w-md w-full rounded-2xl p-8 animate-scale-in">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🔐</div>
          <h1 className="text-3xl font-bold gradient-primary mb-2">💪 GLog</h1>
          <p className="text-muted-foreground">
            Enter your access key to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Enter access key"
              className="input w-full text-center text-lg"
              autoFocus
              disabled={isLoading}
            />
            {error && (
              <p className="text-red-500 text-sm mt-2 text-center animate-slide-up">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!key || isLoading}
            className="btn btn-primary w-full py-3 text-lg"
          >
            {isLoading ? "Verifying..." : "Unlock"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>🔒 Your data is secure and private</p>
        </div>
      </div>
    </div>
  );
}
