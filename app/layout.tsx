import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GLog - Gym Workout Tracker",
  description: "Track your weekly gym workouts and progress",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="min-h-screen gradient-bg">
          <header className="border-b border-border glass sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
                  💪 GLog
                </h1>
                <nav className="flex gap-4">
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
                </nav>
              </div>
            </div>
          </header>
          <main className="container mx-auto px-4 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
