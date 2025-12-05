"use client";

import { useAuth } from "./AuthProvider";
import { useConfirm } from "./Confirm";
import ActiveWorkoutModal from "./ActiveWorkoutModal";
import { useActiveWorkout } from "./ActiveWorkoutContext";
import { formatDuration } from "@/lib/utils";

function FloatingResumeButton() {
  const { activeWorkout, isModalOpen, toggleModal, elapsedSeconds } =
    useActiveWorkout();

  if (!activeWorkout || isModalOpen) return null;

  return (
    <button
      onClick={() => toggleModal(true)}
      className="fixed bottom-6 right-6 bg-slate-800 text-slate-300 font-bold py-3 px-5 rounded-full shadow-[0_0_20px_rgba(74,158,255,0.4)] hover:scale-105 hover:shadow-[0_0_30px_rgba(74,158,255,0.6)] transition-all animate-bounce-slow flex items-center gap-3"
    >
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-500 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-500"></span>
      </span>
      <span>Resume Workout</span>
      <span className="font-mono bg-black/20 px-2 py-0.5 rounded text-sm">
        {formatDuration(elapsedSeconds)}
      </span>
    </button>
  );
}

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
      <main className="container mx-auto px-4 pt-8 pb-24">{children}</main>
      <ActiveWorkoutModal />
      <FloatingResumeButton />
    </div>
  );
}
