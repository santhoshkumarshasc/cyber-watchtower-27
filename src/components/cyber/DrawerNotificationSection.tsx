import { useState, useEffect } from "react";
import {
  Bell,
  Check,
  ExternalLink,
  Volume2,
  VolumeX,
  ShieldAlert,
  Trash2,
  Send,
  Radio,
} from "lucide-react";
import { toast } from "sonner";

import {
  getStoredPreferences,
  saveStoredPreferences,
  getStoredAlerts,
  saveStoredAlerts,
  requestWebNotificationPermission,
  playAlertChime,
  type NotificationPreferences,
  type NotificationAlert,
} from "@/lib/notification-manager";

export function DrawerNotificationSection() {
  const [prefs, setPrefs] = useState<NotificationPreferences>({
    enabled: false,
    alertCritical: true,
    alertHigh: true,
    soundEnabled: true,
  });
  const [alerts, setAlerts] = useState<NotificationAlert[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  const syncState = () => {
    setPrefs(getStoredPreferences());
    setAlerts(getStoredAlerts());
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  };

  useEffect(() => {
    syncState();

    const handleAlertsUpdated = () => {
      setAlerts(getStoredAlerts());
    };

    window.addEventListener("cyberguard:alerts-updated", handleAlertsUpdated);
    return () => {
      window.removeEventListener("cyberguard:alerts-updated", handleAlertsUpdated);
    };
  }, []);

  const unreadCount = alerts.filter((a) => !a.read).length;

  const handleToggleEnable = async (checked: boolean) => {
    if (checked && permission !== "granted") {
      const newPerm = await requestWebNotificationPermission();
      setPermission(newPerm);
      if (newPerm !== "granted") {
        toast.info("Browser notifications were not granted. In-app alerts remain active.");
      }
    }
    const updated = { ...prefs, enabled: checked };
    setPrefs(updated);
    saveStoredPreferences(updated);
    toast.success(checked ? "Alert notifications enabled" : "Alert notifications paused");
  };

  const updatePref = <K extends keyof NotificationPreferences>(
    key: K,
    val: NotificationPreferences[K],
  ) => {
    const updated = { ...prefs, [key]: val };
    setPrefs(updated);
    saveStoredPreferences(updated);
  };

  const handleTestNotification = () => {
    if (prefs.soundEnabled) {
      playAlertChime();
    }
    toast.error("Cyber Alert [CRITICAL]: Active Edge Gateway Exploit Detected", {
      description: "CISA US-CERT Advisory ED 26-02 — Emergency directive in effect",
      duration: 5000,
      action: {
        label: "Open Source",
        onClick: () =>
          window.open(
            "https://www.cisa.gov/news-events/cybersecurity-advisories",
            "_blank",
            "noopener,noreferrer",
          ),
      },
    });

    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      try {
        new Notification("CyberGuard: Critical Threat Alert", {
          body: "Emergency patch advisory: Active perimeter gateway exploitation observed.",
          icon: "/favicon.ico",
        });
      } catch {
        // Safe inside iframe
      }
    }

    const testAlert: NotificationAlert = {
      id: `test-${Date.now()}`,
      threatId: "test-alert",
      title: "Active Remote Code Execution in Enterprise Perimeter Gateways",
      severity: "critical",
      timestamp: Date.now(),
      source: "CISA / US-CERT",
      sourceUrl: "https://www.cisa.gov/news-events/cybersecurity-advisories",
      read: false,
    };
    const updated = [testAlert, ...alerts];
    setAlerts(updated);
    saveStoredAlerts(updated);
  };

  const handleMarkAllRead = () => {
    const marked = alerts.map((a) => ({ ...a, read: true }));
    setAlerts(marked);
    saveStoredAlerts(marked);
  };

  const handleClearAlerts = () => {
    setAlerts([]);
    saveStoredAlerts([]);
    toast.info("Notification history cleared");
  };

  return (
    <div className="rounded-lg border border-border/70 bg-secondary/20 p-3.5 space-y-3.5">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary/15 text-primary border border-primary/30">
            <Bell className="size-3.5" />
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="label-mono text-xs text-foreground font-semibold">
                ALERT NOTIFICATIONS
              </span>
              {unreadCount > 0 ? (
                <span className="rounded-full bg-primary px-1.5 py-0.2 text-[0.62rem] font-bold text-primary-foreground font-mono">
                  {unreadCount} UNREAD
                </span>
              ) : null}
            </div>
            <p className="text-[0.68rem] text-muted-foreground font-mono">
              In-app chimes &amp; live threat broadcasts
            </p>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={prefs.enabled}
            onChange={(e) => handleToggleEnable(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-8 h-4 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-primary-foreground after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary" />
        </label>
      </div>

      {/* Preferences & Settings */}
      <div className="rounded-md border border-border/60 bg-background/50 p-2.5 space-y-2.5 text-xs">
        <div className="flex items-center justify-between text-[0.7rem]">
          <span className="text-muted-foreground">Browser Push Permission:</span>
          <span
            className={`rounded-full px-2 py-0.5 font-mono text-[0.62rem] uppercase font-medium ${
              permission === "granted"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                : permission === "denied"
                  ? "bg-destructive/15 text-destructive border border-destructive/30"
                  : "bg-muted text-muted-foreground border border-border"
            }`}
          >
            {permission === "granted" ? "Granted" : permission === "denied" ? "Blocked" : "Default"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 border-t border-border/40 pt-2 text-[0.72rem]">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={prefs.alertCritical}
              onChange={(e) => updatePref("alertCritical", e.target.checked)}
              className="rounded border-border text-primary accent-primary size-3.5"
            />
            <span>Critical alerts</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={prefs.alertHigh}
              onChange={(e) => updatePref("alertHigh", e.target.checked)}
              className="rounded border-border text-primary accent-primary size-3.5"
            />
            <span>High alerts</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer col-span-2">
            <input
              type="checkbox"
              checked={prefs.soundEnabled}
              onChange={(e) => updatePref("soundEnabled", e.target.checked)}
              className="rounded border-border text-primary accent-primary size-3.5"
            />
            <span className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
              {prefs.soundEnabled ? (
                <Volume2 className="size-3 text-primary" />
              ) : (
                <VolumeX className="size-3 text-muted-foreground" />
              )}
              Web Audio synthesizer chime on critical threat
            </span>
          </label>
        </div>

        <button
          type="button"
          onClick={handleTestNotification}
          className="flex w-full items-center justify-center gap-1.5 rounded border border-primary/30 bg-primary/10 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors cursor-pointer"
        >
          <Send className="size-3" />
          <span>Dispatch Test Alert</span>
        </button>
      </div>

      {/* Alert Feed List */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="label-mono text-[0.7rem] text-muted-foreground">
            RECENT ALERTS ({alerts.length})
          </span>
          <div className="flex items-center gap-2">
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-[0.68rem] text-muted-foreground hover:text-foreground cursor-pointer font-mono"
              >
                <Check className="size-2.5" /> Read all
              </button>
            ) : null}
            {alerts.length > 0 ? (
              <button
                type="button"
                onClick={handleClearAlerts}
                className="flex items-center gap-1 text-[0.68rem] text-destructive hover:opacity-80 cursor-pointer font-mono"
              >
                <Trash2 className="size-2.5" /> Clear
              </button>
            ) : null}
          </div>
        </div>

        {alerts.length === 0 ? (
          <div className="rounded border border-dashed border-border/80 bg-background/30 p-3 text-center text-xs text-muted-foreground font-mono">
            No incident alerts logged yet. System will sound chime when emergency advisories
            trigger.
          </div>
        ) : (
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {alerts.slice(0, 10).map((alert) => (
              <div
                key={alert.id}
                className={`rounded border p-2 text-xs transition-all ${
                  alert.read
                    ? "border-border/60 bg-background/40 opacity-75"
                    : "border-primary/40 bg-primary/5"
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`rounded px-1.5 py-0.2 font-mono text-[0.58rem] uppercase font-bold ${
                      alert.severity === "critical"
                        ? "bg-destructive/20 text-destructive border border-destructive/30"
                        : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    }`}
                  >
                    {alert.severity}
                  </span>
                  <span className="text-[0.62rem] text-muted-foreground font-mono">
                    {new Date(alert.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="mt-1 font-medium leading-snug line-clamp-2 text-foreground text-[0.72rem]">
                  {alert.title}
                </p>
                <div className="mt-1 flex items-center justify-between text-[0.65rem] text-muted-foreground">
                  <span className="truncate max-w-[140px]">{alert.source}</span>
                  {alert.sourceUrl ? (
                    <a
                      href={alert.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-0.5 text-primary hover:underline"
                    >
                      <span>Source</span>
                      <ExternalLink className="size-2.5" />
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
