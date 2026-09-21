import { useState, useEffect } from "react";
import { Clock, Globe, Laptop, Calendar, CheckCircle2, Shield } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface RealtimeClockProps {
  variant?: "navbar" | "banner" | "compact" | "badge" | "hero-bar" | "drawer";
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

  const todayFullDate = time.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const todayShortDate = time.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
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

  // DRAWER VARIANT: Compact layout for slide-over menu
  if (variant === "drawer") {
    return (
      <div
        className={`rounded-lg border border-border/70 bg-card p-3 shadow-2xs space-y-2.5 ${className}`}
      >
        <div className="flex items-center justify-between text-xs border-b border-border/50 pb-2">
          <div className="flex items-center gap-1.5 font-semibold text-foreground">
            <Calendar className="size-3.5 text-primary" />
            <span>{todayShortDate}</span>
          </div>
          <button
            type="button"
            onClick={() => setUse24Hour(!use24Hour)}
            className="rounded bg-secondary px-1.5 py-0.5 text-[0.68rem] font-medium text-foreground hover:bg-secondary/80 transition-colors cursor-pointer"
          >
            {use24Hour ? "24H" : "12H"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded bg-secondary/40 border border-border/50 p-2">
            <div className="text-[0.68rem] text-muted-foreground flex items-center gap-1">
              <Globe className="size-3 text-primary" />
              UTC
            </div>
            <div className="font-bold text-foreground mt-0.5">{utcTimeStr}</div>
          </div>
          <div className="rounded bg-secondary/40 border border-border/50 p-2">
            <div className="text-[0.68rem] text-muted-foreground flex items-center gap-1">
              <Laptop className="size-3 text-muted-foreground" />
              Local ({timezoneName})
            </div>
            <div className="font-bold text-foreground mt-0.5">{localTimeStr}</div>
          </div>
        </div>
      </div>
    );
  }

  // HERO-BAR VARIANT: Clean, prominent today's date & live cyber status
  if (variant === "hero-bar") {
    return (
      <div
        className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-3.5 sm:p-4 text-sm shadow-xs ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
            <Calendar className="size-5" />
          </div>
          <div>
            <div className="text-[0.72rem] font-semibold text-muted-foreground uppercase tracking-wide">
              Today's Live Threat Intelligence
            </div>
            <div className="text-base sm:text-lg font-bold text-foreground flex flex-wrap items-center gap-2">
              <span>{todayFullDate}</span>
              <span className="inline-flex items-center gap-1 text-xs font-normal text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Monitoring
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs">
          <div className="flex items-center gap-1.5 rounded-md bg-secondary/70 px-3 py-1.5 border border-border/80">
            <Globe className="size-3.5 text-primary shrink-0" />
            <span className="font-semibold text-foreground">{utcTimeStr}</span>
            <span className="text-muted-foreground text-[0.7rem]">(Zulu)</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-md bg-secondary/70 px-3 py-1.5 border border-border/80">
            <Laptop className="size-3.5 text-muted-foreground shrink-0" />
            <span className="text-foreground font-medium">{localTimeStr}</span>
            <span className="text-muted-foreground text-[0.7rem]">{timezoneName}</span>
          </div>
          <button
            type="button"
            onClick={() => setUse24Hour(!use24Hour)}
            className="rounded border border-border bg-background px-2 py-1 text-[0.7rem] font-medium text-foreground hover:bg-secondary cursor-pointer transition-colors"
          >
            {use24Hour ? "24H" : "12H"}
          </button>
        </div>
      </div>
    );
  }

  // BANNER VARIANT: Prominent Readout
  if (variant === "banner") {
    return (
      <div
        className={`rounded-lg border border-border bg-card p-3.5 sm:p-4 shadow-xs ${className}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-2.5 mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">Today: {todayFullDate}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-0.5 border border-border/60">
              <Globe className="size-3 text-primary" />
              {timezoneName} ({formattedOffset})
            </span>
            <button
              type="button"
              onClick={() => setUse24Hour(!use24Hour)}
              className="rounded bg-secondary/80 hover:bg-secondary px-2 py-0.5 text-foreground transition-colors cursor-pointer"
              title="Toggle 12h / 24h format"
            >
              {use24Hour ? "24H" : "12H"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* UTC Clock */}
          <div className="rounded-md bg-secondary/50 border border-border/60 p-2.5 flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Globe className="size-3.5 text-primary" />
                Coordinated Universal Time (UTC)
              </div>
              <div className="text-lg sm:text-xl font-bold text-foreground mt-0.5">
                {utcTimeStr}
              </div>
              <div className="text-xs text-muted-foreground">{utcDateStr}</div>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(time.toISOString(), "UTC ISO")}
              className="text-xs rounded border border-border bg-card px-2 py-1 text-foreground hover:bg-secondary transition-colors cursor-pointer"
            >
              {copiedFormat === "UTC ISO" ? "Copied" : "Copy ISO"}
            </button>
          </div>

          {/* Local Clock */}
          <div className="rounded-md bg-secondary/50 border border-border/60 p-2.5 flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Laptop className="size-3.5 text-primary" />
                Your Station Local Time
              </div>
              <div className="text-lg sm:text-xl font-bold text-foreground mt-0.5">
                {localTimeStr}
              </div>
              <div className="text-xs text-muted-foreground">{todayShortDate}</div>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(localTimeStr, "Local")}
              className="text-xs rounded border border-border bg-card px-2 py-1 text-foreground hover:bg-secondary transition-colors cursor-pointer"
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
        className={`inline-flex items-center gap-1.5 rounded border border-border bg-secondary/80 px-2.5 py-1 text-xs text-foreground ${className}`}
      >
        <Calendar className="size-3 text-primary shrink-0" />
        <span className="font-semibold text-foreground">{todayShortDate}</span>
        <span className="text-muted-foreground">•</span>
        <span className="font-medium text-primary">{utcTimeStr}</span>
      </div>
    );
  }

  // DEFAULT: NAVBAR VARIANT (Clean, normal website header element)
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`group flex items-center gap-1.5 sm:gap-2 rounded-md border border-border bg-card hover:bg-secondary/70 px-2.5 py-1.5 text-xs text-foreground transition-all cursor-pointer shadow-2xs ${className}`}
          title="Click for full date, timezones, and NTP synchronization"
          aria-label="Real-time Today's Date and Clock"
        >
          <Calendar className="size-3.5 text-primary shrink-0" />

          {/* Desktop full format with Today's Date */}
          <div className="hidden md:flex items-center gap-1.5">
            <span className="font-semibold text-foreground">{todayShortDate}</span>
            <span className="text-muted-foreground/60">•</span>
            <span className="font-medium text-primary">{localTimeStr}</span>
            <span className="text-muted-foreground text-[0.7rem]">({utcTimeStr})</span>
          </div>

          {/* Mobile/Compact format */}
          <div className="flex md:hidden items-center gap-1 text-xs">
            <span className="font-semibold text-foreground">{todayShortDate.split(",")[0]}</span>
            <span className="text-primary font-medium">{localTimeStr.slice(0, 5)}</span>
          </div>
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-80 sm:w-96 p-4 bg-card border border-border shadow-lg text-xs space-y-3"
      >
        <div className="flex items-center justify-between border-b border-border pb-2.5">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Calendar className="size-4.5" />
            </div>
            <div>
              <div className="font-bold text-foreground text-sm leading-tight">{todayFullDate}</div>
              <div className="text-[0.72rem] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Real-Time Clock Synchronized
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setUse24Hour(!use24Hour)}
            className="text-[0.7rem] px-2 py-0.5 rounded border border-border bg-secondary hover:bg-secondary/80 text-foreground transition-colors cursor-pointer"
          >
            {use24Hour ? "24-Hour" : "12-Hour"}
          </button>
        </div>

        {/* Clocks Grid */}
        <div className="space-y-2">
          <div className="p-2.5 rounded-md bg-secondary/50 border border-border flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Globe className="size-3 text-primary" />
                Coordinated Universal Time (UTC)
              </div>
              <div className="text-base font-bold text-primary mt-0.5">{utcTimeStr}</div>
              <div className="text-[0.72rem] text-muted-foreground">{utcDateStr}</div>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(time.toISOString(), "UTC ISO")}
              className="text-[0.7rem] rounded border border-border bg-card px-2 py-1 text-foreground hover:bg-secondary cursor-pointer"
            >
              {copiedFormat === "UTC ISO" ? "Copied" : "Copy ISO"}
            </button>
          </div>

          <div className="p-2.5 rounded-md bg-secondary/50 border border-border flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Laptop className="size-3 text-primary" />
                Your Station Local Time ({timezoneName})
              </div>
              <div className="text-base font-bold text-foreground mt-0.5">{localTimeStr}</div>
              <div className="text-[0.72rem] text-muted-foreground">{todayFullDate}</div>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(localTimeStr, "Local")}
              className="text-[0.7rem] rounded border border-border bg-card px-2 py-1 text-foreground hover:bg-secondary cursor-pointer"
            >
              {copiedFormat === "Local" ? "Copied" : "Copy Time"}
            </button>
          </div>
        </div>

        {/* Telemetry metadata */}
        <div className="rounded border border-border/80 bg-secondary/30 p-2.5 text-[0.72rem] space-y-1 text-muted-foreground">
          <div className="flex justify-between">
            <span>Time Zone:</span>
            <span className="text-foreground font-semibold">{timezoneName}</span>
          </div>
          <div className="flex justify-between">
            <span>ISO 8601 Timestamp:</span>
            <span className="text-foreground truncate max-w-[170px]">{time.toISOString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Status:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="size-3" /> Live Active (1s ticks)
            </span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
