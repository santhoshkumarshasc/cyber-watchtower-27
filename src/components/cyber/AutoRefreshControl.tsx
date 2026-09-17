import { useState, useEffect, useRef } from "react";
import { RefreshCw, Play, Pause, Radio } from "lucide-react";
import { toast } from "sonner";

import { dispatchThreatNotification, getStoredPreferences } from "@/lib/notification-manager";
import type { Briefing } from "@/lib/threat-types";

interface AutoRefreshControlProps {
  onRefresh: () => Promise<unknown> | void;
  isFetching: boolean;
  briefingData?: Briefing;
}

export function AutoRefreshControl({
  onRefresh,
  isFetching,
  briefingData,
}: AutoRefreshControlProps) {
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [intervalSec, setIntervalSec] = useState(60);
  const [secondsRemaining, setSecondsRemaining] = useState(intervalSec);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync countdown logic
  useEffect(() => {
    if (!autoUpdate) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Trigger refresh
          onRefresh();
          setLastSyncTime(new Date());
          return intervalSec;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoUpdate, intervalSec, onRefresh]);

  // When data refreshes, scan for critical alerts and dispatch notifications
  useEffect(() => {
    if (briefingData && briefingData.threats) {
      const prefs = getStoredPreferences();
      // Check top threats
      briefingData.threats.forEach((threat) => {
        if (threat.severity === "critical" || threat.severity === "high") {
          dispatchThreatNotification(threat, prefs);
        }
      });
    }
  }, [briefingData]);

  const handleToggleAuto = () => {
    const next = !autoUpdate;
    setAutoUpdate(next);
    setSecondsRemaining(intervalSec);
    toast.info(next ? `Live auto-update active (${intervalSec}s)` : "Live auto-update paused");
  };

  const handleManualRefresh = async () => {
    setSecondsRemaining(intervalSec);
    await onRefresh();
    setLastSyncTime(new Date());
    toast.success("Intelligence desk refreshed");
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-card/70 px-3 py-1.5 text-xs text-foreground backdrop-blur">
      <div className="flex items-center gap-1.5 font-mono">
        <span
          className={`inline-block size-2 rounded-full ${
            autoUpdate ? "bg-primary animate-pulse" : "bg-muted-foreground"
          }`}
        />
        <span className="hidden sm:inline font-medium">
          {autoUpdate ? "Auto-Sync" : "Sync Paused"}
        </span>
      </div>

      {autoUpdate ? (
        <span className="font-mono text-muted-foreground text-[0.7rem]">
          in {secondsRemaining}s
        </span>
      ) : null}

      <select
        value={intervalSec}
        onChange={(e) => {
          const val = Number(e.target.value);
          setIntervalSec(val);
          setSecondsRemaining(val);
        }}
        disabled={!autoUpdate}
        className="rounded border border-border bg-secondary px-1.5 py-0.5 text-xs font-mono text-foreground focus:outline-none focus:border-primary"
      >
        <option value={30}>30s</option>
        <option value={60}>60s</option>
        <option value={120}>2m</option>
        <option value={300}>5m</option>
      </select>

      <button
        type="button"
        onClick={handleToggleAuto}
        title={autoUpdate ? "Pause live auto-update" : "Resume live auto-update"}
        className="flex size-6 items-center justify-center rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
      >
        {autoUpdate ? <Pause className="size-3" /> : <Play className="size-3" />}
      </button>

      <button
        type="button"
        onClick={handleManualRefresh}
        disabled={isFetching}
        title="Sync now"
        className="flex items-center gap-1 rounded bg-secondary px-2 py-0.5 font-mono text-[0.7rem] text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
      >
        <RefreshCw className={`size-3 ${isFetching ? "animate-spin text-primary" : ""}`} />
        <span className="hidden md:inline">Sync</span>
      </button>
    </div>
  );
}
