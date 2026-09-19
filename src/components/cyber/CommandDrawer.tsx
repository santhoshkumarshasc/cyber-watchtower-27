import { useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  ShieldAlert,
  X,
  Radio,
  Clock,
  Zap,
  Activity,
  Compass,
  Crosshair,
  BookOpen,
  FileText,
  Info,
  Layers,
  ChevronRight,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { RealtimeClock } from "./RealtimeClock";
import { ThemeSelector } from "./ThemeSelector";
import { QuickAlertModal } from "./QuickAlertModal";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CommandDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandDrawer({ isOpen, onClose }: CommandDrawerProps) {
  const router = useRouterState();
  const queryClient = useQueryClient();
  const currentPath = router.location.pathname;

  // Dismiss on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const navLinks = [
    {
      to: "/",
      label: "Live Threat Desk",
      desc: "Real-time active incident stream & zero-day feed",
      icon: Activity,
      badge: "LIVE 1M",
    },
    {
      to: "/timeline",
      label: "Incident Timeline",
      desc: "Chronological sequence from newest to historical past",
      icon: Clock,
      badge: "CHRONO",
    },
    {
      to: "/hunting",
      label: "Threat Hunting & IOCs",
      desc: "Investigate indicators, CVEs, and enterprise tech exposure",
      icon: Crosshair,
      badge: "TACTICAL",
    },
    {
      to: "/dashboard",
      label: "Risk Analytics Dashboard",
      desc: "Global risk gauge, sector breakdown, and threat metrics",
      icon: Compass,
      badge: "ANALYTICS",
    },
    {
      to: "/awareness",
      label: "Threat Awareness Playbooks",
      desc: "Defense checklists for employees, developers, and SMBs",
      icon: BookOpen,
      badge: "DEFENSE",
    },
    {
      to: "/reports",
      label: "Advisories & Directives",
      desc: "Official CISA, NIST NVD, and vendor security disclosures",
      icon: FileText,
      badge: "OFFICIAL",
    },
    {
      to: "/about",
      label: "SOC Platform & SLAs",
      desc: "Architecture, telemetry sources, and 60s update cadence",
      icon: Info,
      badge: "SYSTEM",
    },
  ];

  const threatCategories = [
    { name: "Zero-Day Exploits", filter: "Zero-day", count: "34%" },
    { name: "Ransomware Extortion", filter: "Ransomware", count: "26%" },
    { name: "Supply Chain Attacks", filter: "Supply chain", count: "18%" },
    { name: "Critical Infrastructure", filter: "Critical infrastructure", count: "14%" },
    { name: "Phishing & Voice Clones", filter: "Phishing", count: "8%" },
  ];

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["cyberguard", "briefing"] });
    toast.success("Intelligence desk refreshed with latest data");
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Drawer */}
      <div className="relative z-50 flex h-full w-full max-w-md flex-col border-l border-border bg-card/98 shadow-2xl backdrop-blur-md transition-transform duration-300 animate-in slide-in-from-right">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-border p-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-md bg-primary/15 text-primary border border-primary/30">
              <ShieldAlert className="size-4.5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-sm font-bold tracking-wide">
                  OPERATIONS MENU
                </span>
                <span className="flex items-center gap-1 rounded bg-primary/20 px-1.5 py-0.2 font-mono text-[0.62rem] text-primary">
                  <span className="inline-block size-1.5 rounded-full bg-primary animate-pulse" />
                  ONLINE
                </span>
              </div>
              <p className="text-[0.68rem] text-muted-foreground font-mono">
                Full-View Operations &amp; Fast Dispatch
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="hidden sm:inline font-mono text-[0.65rem] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded border border-border">
              ESC
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Operations Menu"
              className="flex size-8 items-center justify-center rounded-md border border-border bg-secondary text-foreground hover:bg-secondary/80 hover:text-primary transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Live Clock Telemetry Banner */}
        <div className="border-b border-border/80 bg-secondary/30 px-4 py-2.5 sm:px-6">
          <div className="flex items-center justify-between">
            <span className="label-mono text-[0.68rem] flex items-center gap-1.5 text-primary">
              <Clock className="size-3" />
              SOC PRECISION TIME
            </span>
            <span className="label-mono text-[0.65rem] text-muted-foreground">Cadence: 60s</span>
          </div>
          <div className="mt-1.5">
            <RealtimeClock variant="full" />
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Quick Operator Actions */}
          <div className="grid grid-cols-2 gap-2">
            <QuickAlertModal
              triggerButton={
                <button
                  type="button"
                  className="flex items-center justify-center gap-1.5 rounded-md bg-destructive/90 px-3 py-2 text-xs font-semibold text-destructive-foreground hover:bg-destructive shadow-xs transition-colors cursor-pointer w-full"
                >
                  <Zap className="size-3.5" />
                  <span>Broadcast Alert</span>
                </button>
              }
            />

            <button
              type="button"
              onClick={handleRefresh}
              className="flex items-center justify-center gap-1.5 rounded-md border border-border bg-secondary px-3 py-2 text-xs font-medium text-foreground hover:bg-secondary/80 hover:text-primary transition-colors cursor-pointer"
            >
              <RefreshCw className="size-3.5" />
              <span>Sync Telemetry</span>
            </button>
          </div>

          {/* Primary Operational Hub Navigation */}
          <div>
            <span className="label-mono text-xs text-muted-foreground block mb-2.5">
              OPERATIONAL CENTERS
            </span>
            <div className="space-y-1.5">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.to === "/" ? currentPath === "/" : currentPath.startsWith(item.to);

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className={`group flex items-start gap-3 rounded-lg border p-3 transition-all cursor-pointer ${
                      isActive
                        ? "border-primary/50 bg-primary/10 text-foreground shadow-xs"
                        : "border-border/60 bg-secondary/20 hover:border-border hover:bg-secondary/50 text-foreground"
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex size-7 items-center justify-center rounded-md shrink-0 transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground group-hover:text-primary"
                      }`}
                    >
                      <Icon className="size-4" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold tracking-tight truncate">
                          {item.label}
                        </span>
                        <span className="font-mono text-[0.62rem] uppercase tracking-wider text-primary">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-[0.72rem] text-muted-foreground line-clamp-1 mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground/60 group-hover:text-primary group-hover:translate-x-0.5 transition-all mt-1" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Threat Category Fast Jumps */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="label-mono text-xs text-muted-foreground">
                INCIDENT CLASSIFICATIONS
              </span>
              <span className="label-mono text-[0.65rem] text-muted-foreground">Distribution</span>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {threatCategories.map((cat) => (
                <Link
                  key={cat.filter}
                  to="/"
                  search={{ category: cat.filter }}
                  onClick={onClose}
                  className="flex items-center justify-between rounded-md border border-border/40 bg-secondary/15 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 hover:border-primary/40 transition-colors cursor-pointer"
                >
                  <span className="font-medium">{cat.name}</span>
                  <span className="font-mono text-[0.68rem] text-primary">{cat.count}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Visual Theme Selector Section */}
          <div className="rounded-lg border border-border/70 bg-secondary/20 p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="label-mono text-xs text-foreground font-semibold flex items-center gap-1.5">
                <Layers className="size-3.5 text-primary" />
                DISPLAY PALETTE
              </span>
            </div>
            <p className="text-[0.7rem] text-muted-foreground mb-3">
              Switch visual ambiance across Crimson SOC, Matrix Terminal, Deep Radar, Amber Alert,
              or White Hat.
            </p>
            <ThemeSelector />
          </div>

          {/* Telemetry Health Matrix */}
          <div className="rounded-md border border-border/50 bg-secondary/10 p-3 text-[0.7rem] font-mono space-y-1.5 text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>CISA Known Exploited:</span>
              <span className="text-primary font-bold">CONNECTED</span>
            </div>
            <div className="flex items-center justify-between">
              <span>NVD CVSS v3.1 / v4.0:</span>
              <span className="text-primary font-bold">SYNCHRONIZED</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Refresh Interval:</span>
              <span className="text-foreground">60 Seconds Live</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 text-center text-[0.68rem] text-muted-foreground font-mono bg-secondary/20">
          CyberGuard Operations Desk · Global Telemetry active
        </div>
      </div>
    </div>
  );
}
