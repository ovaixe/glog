"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";

interface AuthModalProps {
  initialMode?: "login" | "signup";
  onClose?: () => void;
}

export function AuthModal({ initialMode = "login", onClose }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup } = useAuth();

  // Prevent body scroll when modal is open
  useEffect(() => {
    // Lock both body and html to prevent scroll on all devices
    const originalBodyOverflow = window.getComputedStyle(
      document.body
    ).overflow;
    const originalHtmlOverflow = window.getComputedStyle(
      document.documentElement
    ).overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      let success: boolean;
      if (mode === "login") {
        success = await login(username, password);
      } else {
        success = await signup(username, password);
      }

      if (success) {
        onClose?.();
      } else {
        setError(
          mode === "login" ? "Invalid credentials" : "Could not create account"
        );
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="glass max-w-md w-full rounded-2xl p-8 animate-scale-in relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-white"
        >
          ✕
        </button>

        <div className="text-center mb-8">
          <div className="text-6xl mb-4">💪</div>
          <h1 className="text-3xl font-bold gradient-primary mb-2">GLog</h1>
          <p className="text-muted-foreground">
            {mode === "login" ? "Welcome back!" : "Join the community"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block text-left">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="input w-full"
              autoFocus
              disabled={isLoading}
              minLength={3}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block text-left">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="input w-full"
              disabled={isLoading}
              minLength={6}
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm mt-2 text-center animate-slide-up">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!username || !password || isLoading}
            className="btn btn-primary w-full py-3 text-lg"
          >
            {isLoading
              ? "Please wait..."
              : mode === "login"
              ? "Login"
              : "Sign Up"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            {mode === "login"
              ? "Don't have an account? "
              : "Already have an account? "}
            <button
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError("");
              }}
              className="text-primary hover:underline font-medium"
            >
              {mode === "login" ? "Sign Up" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
