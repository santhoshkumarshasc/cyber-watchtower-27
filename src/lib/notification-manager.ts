import { toast } from "sonner";
import type { Threat } from "./threat-types";

export type NotificationPreferences = {
  enabled: boolean;
  alertCritical: boolean;
  alertHigh: boolean;
  soundEnabled: boolean;
};

export type NotificationAlert = {
  id: string;
  threatId: string;
  title: string;
  severity: string;
  timestamp: number;
  source: string;
  sourceUrl?: string;
  read: boolean;
};

const PREFS_KEY = "cyberguard_notification_prefs";
const ALERTS_KEY = "cyberguard_notification_history";
const SEEN_THREATS_KEY = "cyberguard_notified_threat_ids";

export function getStoredPreferences(): NotificationPreferences {
  if (typeof window === "undefined") {
    return { enabled: false, alertCritical: true, alertHigh: true, soundEnabled: true };
  }
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading notification preferences", e);
  }
  return { enabled: false, alertCritical: true, alertHigh: true, soundEnabled: true };
}

export function saveStoredPreferences(prefs: NotificationPreferences) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.error("Error saving notification preferences", e);
  }
}

export function getStoredAlerts(): NotificationAlert[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ALERTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading notification history", e);
  }
  return [];
}

export function saveStoredAlerts(alerts: NotificationAlert[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts.slice(0, 50)));
    window.dispatchEvent(new CustomEvent("cyberguard:alerts-updated"));
  } catch (e) {
    console.error("Error saving notification history", e);
  }
}

export function getUnreadAlertCount(): number {
  return getStoredAlerts().filter((a) => !a.read).length;
}

// Gentle audio alert using Web Audio API synthesis
export function playAlertChime() {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // Audio may be blocked until user interaction; ignore silently
  }
}

export async function requestWebNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied";
  }
  try {
    const perm = await Notification.requestPermission();
    return perm;
  } catch (err) {
    console.warn("Failed to request notification permission:", err);
    return Notification.permission;
  }
}

export function dispatchThreatNotification(
  threat: Threat,
  prefs: NotificationPreferences,
  onAlertAdded?: (alert: NotificationAlert) => void,
) {
  if (!prefs.enabled) return;

  const isCritical = threat.severity === "critical" && prefs.alertCritical;
  const isHigh = threat.severity === "high" && prefs.alertHigh;

  if (!isCritical && !isHigh) return;

  // Check if we've already notified for this threat ID recently
  let seenIds: string[] = [];
  try {
    const raw = localStorage.getItem(SEEN_THREATS_KEY);
    if (raw) seenIds = JSON.parse(raw);
  } catch {
    seenIds = [];
  }

  if (seenIds.includes(threat.id)) return;

  seenIds.push(threat.id);
  if (seenIds.length > 200) seenIds = seenIds.slice(-100);
  try {
    localStorage.setItem(SEEN_THREATS_KEY, JSON.stringify(seenIds));
  } catch {
    // ignore
  }

  // Play audio if enabled
  if (prefs.soundEnabled) {
    playAlertChime();
  }

  // Trigger Sonner toast
  toast.error(`Cyber Alert [${threat.severity.toUpperCase()}]: ${threat.title}`, {
    description: `${threat.source} — Risk Score: ${Math.round(threat.riskPercent)}%`,
    duration: 6000,
    action: threat.sourceUrl
      ? {
          label: "Open Source",
          onClick: () => window.open(threat.sourceUrl, "_blank", "noopener,noreferrer"),
        }
      : undefined,
  });

  // Trigger Browser Notification API
  if (
    typeof window !== "undefined" &&
    "Notification" in window &&
    Notification.permission === "granted"
  ) {
    try {
      const notif = new Notification(`CyberGuard: ${threat.severity.toUpperCase()} Alert`, {
        body: `${threat.title}\nSource: ${threat.source}`,
        icon: "/favicon.ico",
        tag: threat.id,
      });
      notif.onclick = () => {
        window.focus();
        if (threat.sourceUrl) {
          window.open(threat.sourceUrl, "_blank", "noopener,noreferrer");
        }
      };
    } catch {
      // Ignored if notifications fail in iframe
    }
  }

  // Save to alert history
  const alertItem: NotificationAlert = {
    id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    threatId: threat.id,
    title: threat.title,
    severity: threat.severity,
    timestamp: Date.now(),
    source: threat.source,
    sourceUrl: threat.sourceUrl,
    read: false,
  };

  const existingAlerts = getStoredAlerts();
  const updated = [alertItem, ...existingAlerts];
  saveStoredAlerts(updated);

  if (onAlertAdded) {
    onAlertAdded(alertItem);
  }
}
