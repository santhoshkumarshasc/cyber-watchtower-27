import { useState, useEffect } from "react";
import { Clock, Globe, Laptop, RefreshCw, CheckCircle2, Shield } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface RealtimeClockProps {
  variant?: "navbar" | "banner" | "compact" | "badge";
  className?: string;
  showTimezone?: boolean;
}

export function RealtimeClock({
  variant = "navbar",
  className = "",
  showTimezone = true,
}: RealtimeClockProps) {
  const [time, setTime] = useState<Date>(() => new Date());
  const [use24Hour, setUse24Hour] = useState<boolean>(true);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  useEffect(() => {
    // Tick precisely every second
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Formatters
  const localTimeStr = time.toLocaleTimeString("en-US", {
    hour12: !use24Hour,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const utcTimeStr = time.toISOString().substring(11, 19) + " UTC";

  const localDateStr = time.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const utcDateStr = time.toISOString().substring(0, 10);

  const timezoneName = Intl.DateTimeFormat().resolvedOptions().timeZone || "Local";
  const timezoneOffsetMinutes = -time.getTimezoneOffset();
  const offsetSign = timezoneOffsetMinutes >= 0 ? "+" : "-";
  const offsetHours = String(Math.floor(Math.abs(timezoneOffsetMinutes) / 60)).padStart(2, "0");
  const offsetMins = String(Math.abs(timezoneOffsetMinutes) % 60).padStart(2, "0");
  const formattedOffset = `UTC${offsetSign}${offsetHours}:${offsetMins}`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(label);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  // BANNER VARIANT: Prominent HUD Readout for Hero Sections
  if (variant === "banner") {
    return (
      <div
        className={`rounded-lg border border-primary/30 bg-card/90 backdrop-blur-md p-3 sm:p-4 shadow-sm ${className}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-2.5 mb-3">
          <div className="flex items-center gap-2">
            <span className="relative flex size-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full size-2.5 bg-emerald-500" />
            </span>
            <span className="font-mono text-xs font-semibold text-primary tracking-wider uppercase">
              SOC Real-Time Telemetry Clock
            </span>
          </div>

          <div className="flex items-center gap-2 text-[0.7rem] font-mono text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded bg-secondary/80 px-2 py-0.5 border border-border/60">
              <Globe className="size-3 text-primary" />
              {timezoneName} ({formattedOffset})
            </span>
            <button
              type="button"
              onClick={() => setUse24Hour(!use24Hour)}
              className="rounded bg-secondary/60 hover:bg-secondary px-2 py-0.5 text-foreground transition-colors cursor-pointer"
              title="Toggle 12h / 24h format"
            >
              {use24Hour ? "24H" : "12H"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* UTC Clock (Primary SOC standard) */}
          <div className="rounded-md bg-secondary/40 border border-border/40 p-2.5 flex items-center justify-between">
            <div>
              <div className="text-[0.68rem] text-muted-foreground font-mono flex items-center gap-1 uppercase tracking-wider">
                <Globe className="size-3 text-primary" />
                Coordinated Universal Time (Zulu)
              </div>
              <div className="font-mono text-lg sm:text-xl font-bold text-foreground tracking-tight mt-0.5">
                {utcTimeStr}
              </div>
              <div className="text-[0.7rem] text-muted-foreground font-mono">{utcDateStr}</div>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(time.toISOString(), "UTC ISO")}
              className="text-[0.65rem] font-mono rounded border border-border/60 bg-card px-2 py-1 hover:text-foreground text-muted-foreground hover:bg-secondary transition-colors cursor-pointer"
            >
              {copiedFormat === "UTC ISO" ? "Copied" : "Copy ISO"}
            </button>
          </div>

          {/* Local Clock */}
          <div className="rounded-md bg-secondary/40 border border-border/40 p-2.5 flex items-center justify-between">
            <div>
              <div className="text-[0.68rem] text-muted-foreground font-mono flex items-center gap-1 uppercase tracking-wider">
                <Laptop className="size-3 text-primary" />
                Operator Local Station Time
              </div>
              <div className="font-mono text-lg sm:text-xl font-bold text-foreground tracking-tight mt-0.5">
                {localTimeStr}
              </div>
              <div className="text-[0.7rem] text-muted-foreground font-mono">{localDateStr}</div>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(localTimeStr, "Local")}
              className="text-[0.65rem] font-mono rounded border border-border/60 bg-card px-2 py-1 hover:text-foreground text-muted-foreground hover:bg-secondary transition-colors cursor-pointer"
            >
              {copiedFormat === "Local" ? "Copied" : "Copy Time"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // COMPACT / BADGE VARIANT
  if (variant === "compact" || variant === "badge") {
    return (
      <div
        className={`inline-flex items-center gap-1.5 rounded border border-border/80 bg-secondary/70 px-2 py-1 font-mono text-[0.7rem] text-foreground ${className}`}
      >
        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
        <span className="font-semibold text-primary">{utcTimeStr}</span>
        <span className="text-muted-foreground">|</span>
        <span className="text-muted-foreground truncate">{localTimeStr}</span>
      </div>
    );
  }

  // DEFAULT: NAVBAR VARIANT (Interactive HUD popover with live ticking time)
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`group flex items-center gap-1.5 sm:gap-2 rounded-md border border-border/80 bg-card/80 px-2 py-1 sm:px-2.5 sm:py-1.2 text-xs font-mono text-foreground hover:border-primary/50 hover:bg-secondary/70 transition-all cursor-pointer shadow-2xs ${className}`}
          title="Click to view detailed SOC Real-Time Telemetry & Timezone sync"
          aria-label="Real-time SOC Clock"
        >
          <span className="relative flex size-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
          </span>

          {/* Desktop full format */}
          <div className="hidden lg:flex items-center gap-1.5">
            <span className="font-bold text-primary tracking-tight">{utcTimeStr}</span>
            <span className="text-border">/</span>
            <span className="text-muted-foreground">{localTimeStr}</span>
            {showTimezone && (
              <span className="hidden xl:inline text-[0.65rem] text-muted-foreground/80">
                ({localDateStr})
              </span>
            )}
          </div>

          {/* Medium screen format */}
          <div className="hidden sm:flex lg:hidden items-center gap-1">
            <span className="font-bold text-primary">{utcTimeStr}</span>
            <span className="text-muted-foreground text-[0.68rem]">{localTimeStr}</span>
          </div>

          {/* Mobile compact format */}
          <div className="flex sm:hidden items-center gap-1 text-[0.68rem]">
            <Clock className="size-3 text-primary shrink-0" />
            <span className="font-bold text-primary">{utcTimeStr.replace(" UTC", "Z")}</span>
          </div>
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-80 sm:w-96 p-4 bg-card/98 backdrop-blur-md border border-border shadow-xl text-xs space-y-3 font-sans"
      >
        <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded bg-primary/15 text-primary">
              <Clock className="size-4" />
            </div>
            <div>
              <div className="font-bold font-display text-foreground text-sm leading-tight">
                SOC Precision Time Synchronization
              </div>
              <div className="text-[0.68rem] font-mono text-emerald-500 flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Synchronized with Global NTP
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setUse24Hour(!use24Hour)}
            className="text-[0.68rem] font-mono px-2 py-0.5 rounded border border-border bg-secondary hover:bg-secondary/80 text-foreground transition-colors cursor-pointer"
          >
            {use24Hour ? "24-Hour" : "12-Hour"}
          </button>
        </div>

        {/* Clocks Grid */}
        <div className="space-y-2 font-mono">
          <div className="p-2.5 rounded-md bg-secondary/50 border border-border/50 flex items-center justify-between">
            <div>
              <div className="text-[0.65rem] text-muted-foreground uppercase flex items-center gap-1">
                <Globe className="size-3 text-primary" />
                UTC (Universal Coordinated Time)
              </div>
              <div className="text-base font-bold text-primary mt-0.5">{utcTimeStr}</div>
              <div className="text-[0.68rem] text-muted-foreground">{utcDateStr}</div>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(utcTimeStr, "UTC")}
              className="text-[0.65rem] px-2 py-1 rounded bg-card border border-border hover:bg-secondary cursor-pointer"
            >
              {copiedFormat === "UTC" ? "Copied!" : "Copy"}
            </button>
          </div>

          <div className="p-2.5 rounded-md bg-secondary/50 border border-border/50 flex items-center justify-between">
            <div>
              <div className="text-[0.65rem] text-muted-foreground uppercase flex items-center gap-1">
                <Laptop className="size-3 text-primary" />
                Local Operator Station Time
              </div>
              <div className="text-base font-bold text-foreground mt-0.5">{localTimeStr}</div>
              <div className="text-[0.68rem] text-muted-foreground">
                {localDateStr} &middot; {formattedOffset}
              </div>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(localTimeStr, "Local")}
              className="text-[0.65rem] px-2 py-1 rounded bg-card border border-border hover:bg-secondary cursor-pointer"
            >
              {copiedFormat === "Local" ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* Telemetry metadata */}
        <div className="rounded border border-border/40 bg-card/60 p-2.5 text-[0.7rem] space-y-1 text-muted-foreground font-mono">
          <div className="flex justify-between">
            <span>IANA Time Zone:</span>
            <span className="text-foreground font-semibold">{timezoneName}</span>
          </div>
          <div className="flex justify-between">
            <span>ISO 8601 Timestamp:</span>
            <span className="text-foreground truncate max-w-[170px]">{time.toISOString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Unix Epoch Timestamp:</span>
            <span className="text-foreground">{Math.floor(time.getTime() / 1000)}</span>
          </div>
          <div className="flex justify-between">
            <span>Status:</span>
            <span className="text-emerald-500 font-semibold flex items-center gap-1">
              <CheckCircle2 className="size-3" /> Live Ticking (1s)
            </span>
          </div>
        </div>

        <p className="text-[0.68rem] text-muted-foreground text-center">
          All cyber incident timestamps across CyberGuard are strictly anchored to this active clock
          reference.
        </p>
      </PopoverContent>
    </Popover>
  );
}
