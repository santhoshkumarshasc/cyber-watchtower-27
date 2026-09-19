import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Radar, ShieldCheck, Menu, Zap } from "lucide-react";
import { useState, useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { NotificationCenter } from "../components/cyber/NotificationCenter";
import { QuickAlertModal } from "../components/cyber/QuickAlertModal";
import { ThemeSelector } from "../components/cyber/ThemeSelector";
import { CyberPreloader } from "../components/cyber/CyberPreloader";
import { CyberChatbot } from "../components/cyber/CyberChatbot";
import { RealtimeClock } from "../components/cyber/RealtimeClock";
import { CommandDrawer } from "../components/cyber/CommandDrawer";
import { ScrollToTop } from "../components/cyber/ScrollToTop";
import { getStoredTheme, applyTheme } from "../lib/theme";
import { Toaster } from "../components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground font-display">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The threat intelligence view you're looking for doesn't exist or has moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Return to Threat Feed
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error("Route error boundary:", error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Threat Intelligence Feed Temporarily Unavailable
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error.message || "An unexpected error occurred while processing intelligence streams."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Retry Connection
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Live Feed Home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "CyberGuard — Real-Time Cybersecurity Operations Desk" },
      {
        name: "description",
        content:
          "CyberGuard tracks live cyber threats, real-time clock telemetry, risk analytics, zero-day CVE disclosures, and defensive containment guidance.",
      },
      { property: "og:title", content: "CyberGuard — Real-Time Cybersecurity Operations Desk" },
      {
        property: "og:description",
        content:
          "CyberGuard tracks live cyber threats, real-time clock telemetry, risk analytics, zero-day CVE disclosures, and defensive containment guidance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Orbitron:wght@500;600;700;800;900&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Rajdhani:wght@500;600;700&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [commandDrawerOpen, setCommandDrawerOpen] = useState(false);

  useEffect(() => {
    applyTheme(getStoredTheme());
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        {/* Telemetry Boot Preloader */}
        <CyberPreloader />

        {/* Clean, Unified Top Navbar with Verified Indicator and Universal Menu Button */}
        <header className="sticky top-0 z-40 border-b border-border bg-background/92 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 sm:gap-3 px-3.5 py-2.5 sm:px-6 sm:py-3">
            {/* Brand & Verified Desk Status */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <Link
                to="/"
                className="flex items-center gap-2 focus:outline-none focus:ring-1 focus:ring-primary rounded shrink-0"
              >
                <span className="flex size-8 sm:size-9 items-center justify-center rounded-md border border-primary/40 bg-primary/15 text-primary shadow-xs">
                  <ShieldCheck className="size-4.5 sm:size-5" />
                </span>
                <div className="flex flex-col">
                  <span className="font-display text-base sm:text-lg font-bold tracking-tight leading-none">
                    Cyber<span className="text-primary">Guard</span>
                  </span>
                  <span className="font-mono text-[0.62rem] text-muted-foreground tracking-wider">
                    DEFENSE DESK
                  </span>
                </div>
              </Link>

              {/* Verified Intelligence Only Badge */}
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 sm:px-2.5 py-0.5 text-[0.68rem] font-mono text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>VERIFIED INTEL ONLY</span>
              </span>
            </div>

            {/* Action Area: Realtime Clock, Theme Selector, Notifications, and the dedicated Operations Menu Button */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {/* Live Ticking Real-Time SOC Clock */}
              <RealtimeClock variant="navbar" />

              {/* Theme Selector */}
              <ThemeSelector />

              {/* Quick Alert Trigger Button */}
              <QuickAlertModal
                triggerButton={
                  <button
                    type="button"
                    className="hidden sm:inline-flex items-center gap-1 sm:gap-1.5 rounded-md bg-destructive/90 px-2 sm:px-2.5 py-1.5 text-xs font-semibold text-destructive-foreground hover:bg-destructive shadow-xs transition-colors cursor-pointer shrink-0"
                    title="Dispatch Quick Threat Alert"
                  >
                    <Zap className="size-3.5 shrink-0" />
                    <span>Quick Alert</span>
                  </button>
                }
              />

              {/* Notification Center Popover */}
              <NotificationCenter />

              {/* Universal Operations Hamburger Menu Button (The single primary navigation control on navbar) */}
              <button
                type="button"
                onClick={() => setCommandDrawerOpen(true)}
                aria-label="Open Operations Menu"
                title="Open Operations Command Menu"
                className="flex items-center gap-1.5 h-8 sm:h-9 px-2.5 sm:px-3 rounded-md border border-primary/40 bg-primary/10 text-foreground hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary shadow-xs shrink-0 group"
              >
                <Menu className="size-4 shrink-0 text-primary group-hover:text-primary-foreground" />
                <span className="font-mono text-xs font-semibold">Menu</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="mx-auto w-full max-w-7xl flex-1 px-3.5 py-5 sm:px-6 md:py-8">
          <Outlet />
        </main>

        {/* Interactive SOC Chatbot */}
        <CyberChatbot />

        {/* Footer */}
        <footer className="border-t border-border py-6">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 sm:px-6 label-mono text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Radar className="size-3.5 text-primary" />
              <span>CyberGuard — Real-time cybersecurity intelligence desk.</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Link to="/about" className="hover:text-foreground underline">
                Methodology & About
              </Link>
              <span>&middot;</span>
              <span>100% CISA &middot; NVD &middot; CERT Verified Feeds</span>
            </div>
          </div>
        </footer>

        {/* Universal Operations Command Drawer (All Screen Sizes) */}
        <CommandDrawer isOpen={commandDrawerOpen} onClose={() => setCommandDrawerOpen(false)} />

        {/* Smooth Scroll to Top Action Button */}
        <ScrollToTop />

        {/* Global Toast Notifications (Sonner) */}
        <Toaster position="bottom-right" richColors />
      </div>
    </QueryClientProvider>
  );
}
