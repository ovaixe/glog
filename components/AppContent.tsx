"use client";

import { useAuth } from "./AuthProvider";
import { useConfirm } from "./Confirm";

interface AppContentProps {
  children: React.ReactNode;
}

export default function AppContent({ children }: AppContentProps) {
  const { logout } = useAuth();
  const { confirm } = useConfirm();

  const handleLogout = async () => {
    const confirmed = await confirm({
      title: "Logout",
      message:
        "Are you sure you want to logout? You'll need to re-enter your access key to continue.",
      confirmText: "Logout",
      cancelText: "Cancel",
      type: "warning",
    });

    if (confirmed) {
      logout();
    }
  };

  return (
    <div className="min-h-screen gradient-bg">
      <header className="border-b border-border glass sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
              💪 GLog
            </h1>
            <nav className="flex gap-4 items-center">
              <a
                href="/"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Workouts
              </a>
              <a
                href="/history"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                History
              </a>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-muted-foreground hover:text-red-500 transition-colors"
                title="Logout"
              >
                🚪
              </button>
            </nav>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
