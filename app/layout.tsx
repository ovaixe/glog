import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import { ConfirmProvider } from "@/components/Confirm";

export const metadata: Metadata = {
  title: "GLog - Gym Workout Tracker",
  description: "Track your weekly gym workouts and progress",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GLog",
  },
  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon-192x192.png", sizes: "192x192", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#4a9eff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ToastProvider>
          <ConfirmProvider>
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
          </ConfirmProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
