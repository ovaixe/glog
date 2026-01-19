"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { useConfirm } from "./Confirm";
import ActiveWorkoutModal from "./ActiveWorkoutModal";
import { FloatingResumeButton } from "./FloatingButton";

interface AppContentProps {
  children: React.ReactNode;
}

import LandingPage from "./LandingPage";

export default function AppContent({ children }: AppContentProps) {
  const { logout, isAuthenticated, user } = useAuth();
  const { confirm } = useConfirm();

  const handleLogout = async () => {
    const confirmed = await confirm({
      title: "Logout",
      message: "Are you sure you want to logout?",
      confirmText: "Logout",
      cancelText: "Cancel",
      type: "warning",
    });

    if (confirmed) {
      logout();
    }
  };

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen gradient-bg">
      <header className="border-b border-border glass sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
              💪 GLog
            </h1>
            <nav className="flex gap-4 items-center">
              <Link
                href="/"
                className="text-sm font-medium text-sky-500 hover:text-sky-600 transition-colors"
              >
                Workouts
              </Link>
              <Link
                href="/history"
                className="text-sm font-medium text-sky-500 hover:text-sky-600 transition-colors"
              >
                History
              </Link>
              <div className="flex items-center gap-2 border-l border-white/10 pl-2 sm:pl-4">
                <span className="text-xs text-muted-foreground mr-2 hidden sm:inline-block">
                  {user?.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-muted-foreground hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  🚪
                </button>
              </div>
            </nav>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 pt-8 pb-24">{children}</main>
      <ActiveWorkoutModal />
      <FloatingResumeButton />
    </div>
  );
}
