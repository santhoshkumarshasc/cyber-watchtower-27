import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useLocation,
} from "@tanstack/react-router";
import {
  Radar,
  ShieldCheck,
  Menu,
  X,
  ShieldAlert,
  BarChart3,
  BookOpen,
  FileText,
  Bell,
  Activity,
  Clock,
  Crosshair,
  Zap,
  Info,
} from "lucide-react";
import { useState, useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { NotificationCenter } from "../components/cyber/NotificationCenter";
import { QuickAlertModal } from "../components/cyber/QuickAlertModal";
import { ThemeSelector } from "../components/cyber/ThemeSelector";
import { CyberPreloader } from "../components/cyber/CyberPreloader";
import { CyberChatbot } from "../components/cyber/CyberChatbot";
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
      { title: "CyberGuard — Live Cyber Threat Awareness" },
      {
        name: "description",
        content:
          "CyberGuard tracks live cyber threats, risk levels, affected populations and protection guidance.",
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
        href: "https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600;700&family=Barlow:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap",
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

const navItems = [
  { to: "/", label: "Live Threat Desk", shortLabel: "Home", icon: ShieldAlert },
  { to: "/timeline", label: "Incident Timeline", shortLabel: "Timeline", icon: Clock },
  { to: "/hunting", label: "Threat Hunting", shortLabel: "Hunting", icon: Crosshair },
  { to: "/dashboard", label: "Risk Analytics", shortLabel: "Analytics", icon: BarChart3 },
  { to: "/awareness", label: "Security Awareness", shortLabel: "Awareness", icon: BookOpen },
  { to: "/reports", label: "Advisories & Docs", shortLabel: "Docs", icon: FileText },
  { to: "/about", label: "About CyberGuard", shortLabel: "About", icon: Info },
] as const;

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    applyTheme(getStoredTheme());
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col bg-background text-foreground pb-20 sm:pb-24 md:pb-0">
        {/* Telemetry Boot Preloader */}
        <CyberPreloader />

        {/* Top Navbar */}
        <header className="sticky top-0 z-40 border-b border-border bg-background/92 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 sm:gap-3 px-3.5 py-2.5 sm:px-6 sm:py-3">
            {/* Brand */}
            <Link
              to="/"
              className="flex items-center gap-2 focus:outline-none focus:ring-1 focus:ring-primary rounded shrink-0"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="flex size-8 sm:size-9 items-center justify-center rounded-md border border-primary/40 bg-primary/15 text-primary shadow-xs">
                <ShieldCheck className="size-4.5 sm:size-5" />
              </span>
              <div className="flex flex-col">
                <span className="font-display text-base sm:text-lg font-bold tracking-tight leading-none">
                  Cyber<span className="text-primary">Guard</span>
                </span>
                <span className="hidden sm:inline font-mono text-[0.62rem] text-muted-foreground tracking-wider">
                  DEFENSE DESK
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center gap-1 text-xs lg:text-sm">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  activeOptions={{ exact: item.to === "/" }}
                  className="rounded-md px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  activeProps={{ className: "bg-secondary text-foreground font-medium" }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Compact desktop navigation for medium screens */}
            <nav className="hidden md:flex xl:hidden items-center gap-0.5 text-xs">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  activeOptions={{ exact: item.to === "/" }}
                  className="rounded-md px-2 py-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  activeProps={{ className: "bg-secondary text-foreground font-medium" }}
                >
                  {item.shortLabel}
                </Link>
              ))}
            </nav>

            {/* Action Area: Theme Selector, Quick Alert, Notifications, Mobile Toggle */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {/* Theme Selector */}
              <ThemeSelector />

              {/* Quick Alert Trigger Button */}
              <QuickAlertModal
                triggerButton={
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 sm:gap-1.5 rounded-md bg-destructive/90 px-2 sm:px-2.5 py-1.5 text-xs font-semibold text-destructive-foreground hover:bg-destructive shadow-xs transition-colors cursor-pointer shrink-0"
                    title="Dispatch Quick Threat Alert"
                  >
                    <Zap className="size-3.5 shrink-0" />
                    <span className="hidden sm:inline">Quick Alert</span>
                  </button>
                }
              />

              <span className="hidden 2xl:flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs label-mono">
                <span className="pulse-dot inline-block size-2 rounded-full bg-primary text-primary" />
                <span>Live stream</span>
              </span>

              {/* Notification Center Popover */}
              <NotificationCenter />

              {/* Mobile Hamburger Toggle */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle Navigation Menu"
                className="flex size-8 sm:size-9 items-center justify-center rounded-md border border-border bg-card text-foreground md:hidden hover:bg-secondary focus:outline-none cursor-pointer"
              >
                {mobileMenuOpen ? <X className="size-4.5" /> : <Menu className="size-4.5" />}
              </button>
            </div>
          </div>

          {/* Mobile Slide-down Menu */}
          {mobileMenuOpen && (
            <div className="border-t border-border bg-card/98 backdrop-blur-md px-4 py-4 md:hidden animate-in fade-in slide-in-from-top-2 duration-200 shadow-xl max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-border/60 mb-2">
                <span className="label-mono text-xs text-primary font-bold">
                  CYBERGUARD PLATFORM
                </span>
                <span className="flex items-center gap-1.5 text-[0.68rem] text-muted-foreground label-mono">
                  <span className="size-2 rounded-full bg-primary animate-pulse" />
                  Telemetry Active
                </span>
              </div>
              <nav className="flex flex-col gap-1 text-sm">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.to === "/"
                      ? location.pathname === "/"
                      : location.pathname.startsWith(item.to);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors cursor-pointer ${
                        isActive
                          ? "bg-primary/15 text-primary font-semibold border border-primary/30"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                    >
                      <Icon className="size-4 text-primary shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-4 pt-3 border-t border-border/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-mono">SOC Display Theme</span>
                  <ThemeSelector />
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Main Content Area */}
        <main className="mx-auto w-full max-w-7xl flex-1 px-3.5 py-5 sm:px-6 md:py-8">
          <Outlet />
        </main>

        {/* Interactive SOC Chatbot */}
        <CyberChatbot />

        {/* Footer */}
        <footer className="border-t border-border py-6 mb-16 md:mb-0">
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
              <span>NVD &middot; CISA &middot; CERT verified</span>
            </div>
          </div>
        </footer>

        {/* Mobile Fixed Bottom Navigation Bar (5 clean thumb targets) */}
        <nav className="fixed bottom-0 inset-x-0 z-40 flex items-center justify-around border-t border-border bg-background/95 backdrop-blur-md py-1.5 px-2 md:hidden">
          <Link
            to="/"
            className={`flex flex-col items-center gap-0.5 px-2.5 py-1 text-[0.68rem] transition-colors ${
              location.pathname === "/"
                ? "text-primary font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ShieldAlert className="size-4" />
            <span>Home</span>
          </Link>

          <Link
            to="/timeline"
            className={`flex flex-col items-center gap-0.5 px-2.5 py-1 text-[0.68rem] transition-colors ${
              location.pathname.startsWith("/timeline")
                ? "text-primary font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Clock className="size-4" />
            <span>Timeline</span>
          </Link>

          <Link
            to="/hunting"
            className={`flex flex-col items-center gap-0.5 px-2.5 py-1 text-[0.68rem] transition-colors ${
              location.pathname.startsWith("/hunting")
                ? "text-primary font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Crosshair className="size-4" />
            <span>Hunting</span>
          </Link>

          <Link
            to="/about"
            className={`flex flex-col items-center gap-0.5 px-2.5 py-1 text-[0.68rem] transition-colors ${
              location.pathname.startsWith("/about")
                ? "text-primary font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Info className="size-4" />
            <span>About</span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex flex-col items-center gap-0.5 px-2.5 py-1 text-[0.68rem] text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <Menu className="size-4" />
            <span>Menu</span>
          </button>
        </nav>

        {/* Global Toast Notifications (Sonner) */}
        <Toaster position="bottom-right" richColors />
      </div>
    </QueryClientProvider>
  );
}
