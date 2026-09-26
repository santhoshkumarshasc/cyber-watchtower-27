import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Radar, ShieldCheck, Menu, Zap, Sun, Moon } from "lucide-react";
import { useState, useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { QuickAlertModal } from "../components/cyber/QuickAlertModal";
import { RealtimeClock } from "../components/cyber/RealtimeClock";
import { CommandDrawer } from "../components/cyber/CommandDrawer";
import { ScrollToTop } from "../components/cyber/ScrollToTop";
import { getStoredTheme, applyTheme, toggleLightDark, isCurrentThemeDark } from "../lib/theme";
import { getUnreadAlertCount } from "../lib/notification-manager";
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
          "Fast and streamlined real-time cybersecurity operations desk with verified threat feeds, chronological recent-to-past tracking, risk analytics, and instant operator alerts.",
      },
      { property: "og:title", content: "CyberGuard — Real-Time Cybersecurity Operations Desk" },
      {
        property: "og:description",
        content:
          "Fast and streamlined real-time cybersecurity operations desk with verified threat feeds, chronological recent-to-past tracking, risk analytics, and instant operator alerts.",
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
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const theme = getStoredTheme();
    return (
      theme === "modern-dark" ||
      theme === "cyber-crimson" ||
      theme === "matrix-emerald" ||
      theme === "midnight-cyan" ||
      theme === "amber-sentinel"
    );
  });

  useEffect(() => {
    const currentTheme = getStoredTheme();
    applyTheme(currentTheme);
    setIsDark(
      currentTheme === "modern-dark" ||
        currentTheme === "cyber-crimson" ||
        currentTheme === "matrix-emerald" ||
        currentTheme === "midnight-cyan" ||
        currentTheme === "amber-sentinel",
    );
    setUnreadCount(getUnreadAlertCount());

    const handleAlertsUpdated = () => {
      setUnreadCount(getUnreadAlertCount());
    };
    const handleThemeChanged = (e: CustomEvent) => {
      const themeId = e.detail;
      setIsDark(
        themeId === "modern-dark" ||
          themeId === "cyber-crimson" ||
          themeId === "matrix-emerald" ||
          themeId === "midnight-cyan" ||
          themeId === "amber-sentinel",
      );
    };

    window.addEventListener("cyberguard:alerts-updated", handleAlertsUpdated);
    window.addEventListener("cyberguard:theme-changed", handleThemeChanged as EventListener);
    return () => {
      window.removeEventListener("cyberguard:alerts-updated", handleAlertsUpdated);
      window.removeEventListener("cyberguard:theme-changed", handleThemeChanged as EventListener);
    };
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = toggleLightDark();
    setIsDark(nextTheme === "modern-dark");
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        {/* Clean, Modern Website Header */}
        <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3.5 py-2.5 sm:px-6 sm:py-3">
            {/* Brand Logo & Normal Website Navigation */}
            <div className="flex items-center gap-6 shrink-0">
              <Link
                to="/"
                className="flex items-center gap-2.5 focus:outline-none rounded shrink-0 group"
              >
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs group-hover:scale-105 transition-transform">
                  <ShieldCheck className="size-5" />
                </span>
                <div className="flex flex-col">
                  <span className="text-lg font-bold tracking-tight text-foreground leading-tight">
                    Cyber<span className="text-primary">Guard</span>
                  </span>
                  <span className="text-[0.68rem] font-medium text-muted-foreground tracking-normal">
                    Verified Threat Intelligence
                  </span>
                </div>
              </Link>
            </div>

            {/* Right Action Bar: On mobile view, ONLY the Menu button is shown. All other options are placed inside the Menu drawer */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Real-Time Today's Date & Clock Display (Hidden on mobile; full clock is inside Menu) */}
              <div className="hidden md:flex">
                <RealtimeClock variant="navbar" />
              </div>

              {/* 1-Click Light / Dark Mode Toggle (Hidden on mobile; instant toggle is inside Menu) */}
              <button
                type="button"
                onClick={handleToggleTheme}
                className="hidden sm:flex size-8 sm:size-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                title={isDark ? "Switch to Light (White) Mode" : "Switch to Dark (Black) Mode"}
                aria-label="Toggle Light and Dark Mode"
              >
                {isDark ? (
                  <Sun className="size-4 text-amber-500" />
                ) : (
                  <Moon className="size-4 text-foreground" />
                )}
              </button>

              {/* Quick Threat Alert Modal Button (Hidden on mobile; quick broadcast is inside Menu) */}
              <QuickAlertModal
                triggerButton={
                  <button
                    type="button"
                    className="hidden sm:inline-flex items-center gap-1.5 rounded-md bg-destructive text-destructive-foreground px-2.5 py-1.5 text-xs font-semibold hover:bg-destructive/90 transition-colors shadow-xs cursor-pointer shrink-0"
                    title="Dispatch Quick Operator Alert"
                  >
                    <Zap className="size-3.5" />
                    <span>Quick Alert</span>
                  </button>
                }
              />

              {/* Navigation Menu Button - ONLY element visible in header on mobile view */}
              <button
                type="button"
                onClick={() => setCommandDrawerOpen(true)}
                aria-label="Open Navigation Menu"
                title="Open Navigation Menu"
                className="relative flex items-center gap-2 h-9 px-3.5 rounded-md border border-border bg-card text-foreground hover:bg-secondary hover:border-primary/40 transition-all cursor-pointer shadow-xs shrink-0"
              >
                <Menu className="size-4 shrink-0 text-primary" />
                <span className="text-xs font-bold tracking-tight">Menu</span>
                {unreadCount > 0 ? (
                  <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[0.62rem] font-bold text-primary-foreground">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                ) : null}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="mx-auto w-full max-w-7xl flex-1 px-3.5 py-5 sm:px-6 md:py-8">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-6">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 sm:px-6 label-mono text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Radar className="size-3.5 text-primary" />
              <span>CyberGuard — Real-time cybersecurity intelligence desk.</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Link to="/opensource" className="hover:text-foreground underline">
                Open Source Solutions
              </Link>
              <span>&middot;</span>
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
