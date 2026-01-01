"use client";

import { useAuth } from "./AuthProvider";

export default function LandingPage() {
  const { openAuthModal } = useAuth();

  return (
    <div className="min-h-screen gradient-bg text-white overflow-hidden">
      {/* Navigation */}
      <nav className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="text-2xl sm:text-4xl">💪</span>
          <span className="text-xl sm:text-2xl font-bold gradient-text">
            GLog
          </span>
        </div>
        <div className="flex gap-2 sm:gap-4">
          <button
            onClick={() => openAuthModal("login")}
            className="px-3 py-1.5 sm:px-6 sm:py-2 text-sm sm:text-base rounded-full hover:bg-white/10 transition-colors font-medium"
          >
            Login
          </button>
          <button
            onClick={() => openAuthModal("signup")}
            className="px-4 py-1.5 sm:px-6 sm:py-2 text-sm sm:text-base rounded-full bg-primary hover:bg-primary/90 transition-colors font-medium shadow-lg shadow-primary/25 whitespace-nowrap"
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-4 sm:px-6 pt-10 sm:pt-20 pb-12 text-center relative z-10">
        <div className="animate-slide-up">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
            Track your progress,
            <br />
            <span className="gradient-primary bg-clip-text text-transparent">
              Dominate your goals.
            </span>
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto">
            The ultimate workout companion for serious lifters. Track sets,
            reps, and progress with zero friction.
          </p>

          <button
            onClick={() => openAuthModal("signup")}
            className="px-6 py-3 sm:px-8 sm:py-4 rounded-full bg-white text-black font-bold text-base sm:text-lg hover:scale-105 transition-transform shadow-xl mb-12 sm:mb-20"
          >
            Start Tracking Free
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 text-left max-w-6xl mx-auto">
          <FeatureCard
            icon="📊"
            title="Visual Progress"
            description="See your strength gains over time with beautiful interactive charts."
          />
          <FeatureCard
            icon="📝"
            title="Smart Logging"
            description="Effortlessly log workouts. We remember your last weights so you focus on lifting."
          />
          <FeatureCard
            icon="🔒"
            title="Private & Secure"
            description="Your data belongs to you. Securely stored and accessible from any device."
          />
        </div>
      </main>

      {/* Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/20 rounded-full blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/20 rounded-full blur-[100px] animate-pulse-slow delay-1000"></div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="glass p-8 rounded-3xl hover:bg-white/5 transition-colors border border-white/10">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
