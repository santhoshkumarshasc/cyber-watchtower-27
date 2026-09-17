import type { Threat } from "./threat-types";

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
