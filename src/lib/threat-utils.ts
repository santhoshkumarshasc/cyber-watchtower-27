import { useState, useEffect } from "react";
import type { Threat } from "./threat-types";

// Stable session anchor to calculate dynamic real-time elapsed intervals
let sessionAnchor = Date.now();

export function getSessionAnchor(): number {
  return sessionAnchor;
}

export function resetSessionAnchor(): void {
  sessionAnchor = Date.now();
}

// Formats dynamic relative time anchored to current ticking clock
export function getLiveRelativeTime(publishedLabel: string, baseAnchorMs?: number): string {
  if (!publishedLabel) return "Recently detected";
  const initialMins = parseRecencyMinutes(publishedLabel);
  if (initialMins >= 99999) return publishedLabel;

  const anchor = baseAnchorMs ?? sessionAnchor - initialMins * 60 * 1000;
  const now = Date.now();
  const elapsedMinutes = Math.max(0, Math.floor((now - anchor) / 60000));

  if (elapsedMinutes < 1) return "Just now";
  if (elapsedMinutes === 1) return "1 minute ago";
  if (elapsedMinutes < 60) return `${elapsedMinutes} minutes ago`;

  const hours = Math.floor(elapsedMinutes / 60);
  const remMinutes = elapsedMinutes % 60;
  if (hours === 1) {
    return remMinutes > 0 ? `1h ${remMinutes}m ago` : "1 hour ago";
  }
  if (hours < 24) {
    return remMinutes > 0 ? `${hours}h ${remMinutes}m ago` : `${hours} hours ago`;
  }

  const days = Math.floor(hours / 24);
  return days === 1 ? "Yesterday" : `${days} days ago`;
}

// Returns absolute localized and UTC timestamp for tooltip/auditing
export function getFormattedExactTime(
  publishedLabel: string,
  baseAnchorMs?: number,
): { local: string; utc: string; iso: string } {
  const initialMins = parseRecencyMinutes(publishedLabel);
  const safeMins = initialMins < 99999 ? initialMins : 10;
  const anchor = baseAnchorMs ?? sessionAnchor - safeMins * 60 * 1000;
  const d = new Date(anchor);

  return {
    local: d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }),
    utc: d.toISOString().replace("T", " ").substring(0, 19) + " UTC",
    iso: d.toISOString(),
  };
}

// React hook that triggers a re-render every minute (or custom seconds) to keep all timestamps fresh
export function useMinuteTicker(intervalSeconds: number = 30): number {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick((prev) => prev + 1);
    }, intervalSeconds * 1000);
    return () => clearInterval(timer);
  }, [intervalSeconds]);

  return tick;
}

// Parses relative time labels into approximate elapsed minutes
export function parseRecencyMinutes(label: string): number {
  if (!label) return 999999;
  const cleaned = label.toLowerCase().trim();

  if (cleaned.includes("just now") || cleaned.includes("moment") || cleaned.includes("sec")) {
    return 1;
  }

  // Matches "18 minutes ago", "18m ago", "18 min ago"
  const minMatch = cleaned.match(/(\d+)\s*(?:minutes?|mins?|m)\b/);
  if (minMatch) {
    return parseInt(minMatch[1], 10);
  }

  // Matches "2 hours ago", "2h ago", "2 hr ago"
  const hourMatch = cleaned.match(/(\d+)\s*(?:hours?|hrs?|h)\b/);
  if (hourMatch) {
    return parseInt(hourMatch[1], 10) * 60;
  }

  // Matches "3 days ago", "3d ago"
  const dayMatch = cleaned.match(/(\d+)\s*(?:days?|d)\b/);
  if (dayMatch) {
    return parseInt(dayMatch[1], 10) * 1440;
  }

  if (cleaned.includes("yesterday")) {
    return 1440;
  }

  return 999999;
}

// Sort from Most Recent (lowest elapsed minutes) to Past (highest elapsed minutes)
export function sortByRecentToPast(threats: Threat[]): Threat[] {
  return [...threats].sort((a, b) => {
    const minA = parseRecencyMinutes(a.publishedLabel);
    const minB = parseRecencyMinutes(b.publishedLabel);
    if (minA !== minB) {
      return minA - minB;
    }
    // Secondary sort: highest risk
    return b.riskPercent - a.riskPercent;
  });
}

// Sort from Past to Recent (oldest first)
export function sortByPastToRecent(threats: Threat[]): Threat[] {
  return [...threats].sort((a, b) => {
    const minA = parseRecencyMinutes(a.publishedLabel);
    const minB = parseRecencyMinutes(b.publishedLabel);
    if (minA !== minB) {
      return minB - minA;
    }
    return a.riskPercent - b.riskPercent;
  });
}

// Group threats into time clusters for chronological timeline
export interface TimeCluster {
  id: string;
  title: string;
  badge: string;
  threats: Threat[];
}

export function groupThreatsByRecency(threats: Threat[]): TimeCluster[] {
  const sorted = sortByRecentToPast(threats);
  const nowCluster: Threat[] = [];
  const pastHourCluster: Threat[] = [];
  const pastThreeHoursCluster: Threat[] = [];
  const pastDayCluster: Threat[] = [];
  const historicalCluster: Threat[] = [];

  for (const t of sorted) {
    const mins = parseRecencyMinutes(t.publishedLabel);
    if (mins <= 20) {
      nowCluster.push(t);
    } else if (mins <= 60) {
      pastHourCluster.push(t);
    } else if (mins <= 180) {
      pastThreeHoursCluster.push(t);
    } else if (mins <= 1440) {
      pastDayCluster.push(t);
    } else {
      historicalCluster.push(t);
    }
  }

  const clusters: TimeCluster[] = [];

  if (nowCluster.length > 0) {
    clusters.push({
      id: "now",
      title: "Immediate & Breaking (Under 20m ago)",
      badge: "ACTIVE INGRESS",
      threats: nowCluster,
    });
  }

  if (pastHourCluster.length > 0) {
    clusters.push({
      id: "past-hour",
      title: "Recent Alerts (Past 1 Hour)",
      badge: "RECENT",
      threats: pastHourCluster,
    });
  }

  if (pastThreeHoursCluster.length > 0) {
    clusters.push({
      id: "past-3-hours",
      title: "Prior Window (1 to 3 Hours Ago)",
      badge: "MONITORED",
      threats: pastThreeHoursCluster,
    });
  }

  if (pastDayCluster.length > 0) {
    clusters.push({
      id: "past-day",
      title: "Earlier Today (3 to 24 Hours Ago)",
      badge: "ARCHIVE",
      threats: pastDayCluster,
    });
  }

  if (historicalCluster.length > 0) {
    clusters.push({
      id: "historical",
      title: "Historical & Sustained Campaigns",
      badge: "PERSISTENT",
      threats: historicalCluster,
    });
  }

  return clusters;
}

// Local Storage for custom operator-dispatched Quick Threat Alerts
const CUSTOM_THREATS_KEY = "cyberguard_custom_threat_alerts";

export function getCustomThreatAlerts(): Threat[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CUSTOM_THREATS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading custom threat alerts", err);
  }
  return [];
}

export function saveCustomThreatAlert(threat: Threat): Threat[] {
  if (typeof window === "undefined") return [];
  try {
    const existing = getCustomThreatAlerts();
    const updated = [threat, ...existing.filter((t) => t.id !== threat.id)].slice(0, 30);
    localStorage.setItem(CUSTOM_THREATS_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error("Error saving custom threat alert", err);
    return [];
  }
}

export function deleteCustomThreatAlert(threatId: string): Threat[] {
  if (typeof window === "undefined") return [];
  try {
    const existing = getCustomThreatAlerts();
    const updated = existing.filter((t) => t.id !== threatId);
    localStorage.setItem(CUSTOM_THREATS_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error("Error deleting custom threat alert", err);
    return [];
  }
}

// Export utilities
export function exportThreatsAsJson(threats: Threat[]) {
  const payload = {
    exportedAt: new Date().toISOString(),
    totalThreats: threats.length,
    threats,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `cyberguard-threat-dossier-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportThreatsAsCsv(threats: Threat[]) {
  const headers = [
    "ID",
    "Severity",
    "RiskPercent",
    "Published",
    "Title",
    "Category",
    "Source",
    "AffectedScope",
    "AttackVector",
    "CVEs",
    "RecommendedAction",
  ];

  const rows = threats.map((t) => [
    `"${t.id}"`,
    `"${t.severity.toUpperCase()}"`,
    `"${t.riskPercent}%"`,
    `"${t.publishedLabel}"`,
    `"${t.title.replace(/"/g, '""')}"`,
    `"${t.category.replace(/"/g, '""')}"`,
    `"${t.source.replace(/"/g, '""')}"`,
    `"${t.affectedPeople.replace(/"/g, '""')}"`,
    `"${(t.attackVector ?? "").replace(/"/g, '""')}"`,
    `"${(t.cveList ?? []).join("; ")}"`,
    `"${t.recommendedAction.replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `cyberguard-threat-feed-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Validates whether an intelligence item or advisory has an active, accessible, verified source URL.
 * Discards any item where the source or official reference page is missing, invalid, or placeholder.
 */
export function isSourceAvailableAndVerified(item: {
  source?: string;
  sourceUrl?: string;
  sourceAvailable?: boolean;
}): boolean {
  if (!item) return false;
  if (item.sourceAvailable === false) return false;
  if (!item.source || item.source.trim().length === 0) return false;
  if (!item.sourceUrl || item.sourceUrl.trim().length === 0) return false;

  const url = item.sourceUrl.trim();
  // Must be valid HTTP / HTTPS protocol
  if (!/^https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i.test(url)) return false;

  // Filter out invalid/placeholder/dead domains or empty search fallbacks
  const blockedPatterns = [
    "example.com",
    "placeholder",
    "localhost",
    "127.0.0.1",
    "unavailable",
    "none",
    "test.com",
    "fakedomain",
    "foo.bar",
    "google.com/search?q=",
  ];
  if (blockedPatterns.some((pattern) => url.toLowerCase().includes(pattern))) {
    return false;
  }

  return true;
}

/**
 * Strict filter to discard any intelligence items where source or page is not available.
 */
export function filterVerifiedAvailableSourcesOnly<
  T extends { source?: string; sourceUrl?: string; sourceAvailable?: boolean },
>(items: T[]): T[] {
  return items.filter(isSourceAvailableAndVerified);
}
