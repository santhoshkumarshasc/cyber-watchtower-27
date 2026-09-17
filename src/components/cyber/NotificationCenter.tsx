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
  X,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<NotificationPreferences>({
    enabled: false,
    alertCritical: true,
    alertHigh: true,
    soundEnabled: true,
  });
  const [alerts, setAlerts] = useState<NotificationAlert[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    setPrefs(getStoredPreferences());
    setAlerts(getStoredAlerts());
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
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
      title: "Active Remote Code Execution in Enterprise VPN & Perimeter Gateways",
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
    toast.info("Notification log cleared");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="Threat Alerts and Notifications"
          className="relative flex size-9 items-center justify-center rounded-md border border-border bg-card text-foreground transition-colors hover:border-primary/50 hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <Bell className="size-4" />
          {unreadCount > 0 ? (
            <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[0.65rem] font-bold text-primary-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-md border-border bg-card p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-border p-4 pb-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 font-display text-base font-bold">
              <ShieldAlert className="size-5 text-primary" />
              Cyber Threat Alerts &amp; Notifications
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="max-h-[75vh] overflow-y-auto p-4 space-y-4">
          {/* Notification Controls */}
          <div className="rounded-md border border-border bg-secondary/30 p-3 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Browser Web Notifications</p>
                <p className="text-xs text-muted-foreground">
                  Receive instant alerts when critical cyber threats are published
                </p>
              </div>
              <input
                type="checkbox"
                checked={prefs.enabled}
                onChange={(e) => handleToggleEnable(e.target.checked)}
                className="size-4 rounded border-border text-primary accent-primary focus:ring-primary"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="label-mono">Status:</span>
              <span
                className={`rounded-full px-2 py-0.5 font-mono text-[0.68rem] uppercase ${
                  permission === "granted"
                    ? "bg-low/15 text-low border border-low/40"
                    : permission === "denied"
                      ? "bg-critical/15 text-critical border border-critical/40"
                      : "bg-muted text-muted-foreground border border-border"
                }`}
              >
                {permission === "granted"
                  ? "Permission Granted"
                  : permission === "denied"
                    ? "Blocked in Browser"
                    : "Not Requested"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-border/60 pt-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={prefs.alertCritical}
                  onChange={(e) => updatePref("alertCritical", e.target.checked)}
                  className="rounded border-border text-primary accent-primary"
                />
                <span>Critical alerts</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={prefs.alertHigh}
                  onChange={(e) => updatePref("alertHigh", e.target.checked)}
                  className="rounded border-border text-primary accent-primary"
                />
                <span>High severity alerts</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer col-span-2">
                <input
                  type="checkbox"
                  checked={prefs.soundEnabled}
                  onChange={(e) => updatePref("soundEnabled", e.target.checked)}
                  className="rounded border-border text-primary accent-primary"
                />
                <span className="flex items-center gap-1.5">
                  {prefs.soundEnabled ? (
                    <Volume2 className="size-3.5 text-primary" />
                  ) : (
                    <VolumeX className="size-3.5 text-muted-foreground" />
                  )}
                  Sound chime on alert
                </span>
              </label>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={handleTestNotification}
                className="flex w-full items-center justify-center gap-1.5 rounded border border-primary/30 bg-primary/10 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
              >
                <Send className="size-3.5" /> Send Test Alert Now
              </button>
            </div>
          </div>

          {/* Alert History */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="label-mono">Recent Alerts ({alerts.length})</span>
              <div className="flex items-center gap-2">
                {unreadCount > 0 ? (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Check className="size-3" /> Mark all read
                  </button>
                ) : null}
                {alerts.length > 0 ? (
                  <button
                    type="button"
                    onClick={handleClearAlerts}
                    className="flex items-center gap-1 text-xs text-destructive hover:opacity-80"
                  >
                    <Trash2 className="size-3" /> Clear
                  </button>
                ) : null}
              </div>
            </div>

            {alerts.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">
                No alerts recorded yet. You will be notified when new critical threats emerge.
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`rounded-md border p-2.5 text-xs transition-colors ${
                      alert.read
                        ? "border-border bg-card/60 opacity-80"
                        : "border-primary/40 bg-primary/5"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`rounded-full px-1.5 py-0.2 font-mono text-[0.62rem] uppercase ${
                          alert.severity === "critical"
                            ? "bg-critical/20 text-critical"
                            : "bg-high/20 text-high"
                        }`}
                      >
                        {alert.severity}
                      </span>
                      <span className="text-[0.65rem] text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="mt-1 font-medium leading-snug">{alert.title}</p>
                    <div className="mt-1.5 flex items-center justify-between">
                      <span className="text-[0.68rem] text-muted-foreground">{alert.source}</span>
                      {alert.sourceUrl ? (
                        <a
                          href={alert.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[0.68rem] text-primary hover:underline"
                        >
                          Open source <ExternalLink className="size-2.5" />
                        </a>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
