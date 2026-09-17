export type ThemeId =
  "cyber-crimson" | "matrix-emerald" | "midnight-cyan" | "amber-sentinel" | "tactical-light";

export interface ThemeOption {
  id: ThemeId;
  name: string;
  category: "dark" | "light";
  description: string;
  swatchColor: string;
  accentColor: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "cyber-crimson",
    name: "Red Alert (SOC)",
    category: "dark",
    description: "High-urgency crimson alert telemetry desk",
    swatchColor: "#e11d48",
    accentColor: "#f43f5e",
  },
  {
    id: "matrix-emerald",
    name: "Terminal Matrix",
    category: "dark",
    description: "Cyber offensive security & phosphor terminal",
    swatchColor: "#10b981",
    accentColor: "#34d399",
  },
  {
    id: "midnight-cyan",
    name: "Deep Space Radar",
    category: "dark",
    description: "Electric cyan radar & oceanic obsidian layout",
    swatchColor: "#06b6d4",
    accentColor: "#38bdf8",
  },
  {
    id: "amber-sentinel",
    name: "Amber Sentinel",
    category: "dark",
    description: "Industrial SCADA & critical infrastructure gold",
    swatchColor: "#f59e0b",
    accentColor: "#fbbf24",
  },
  {
    id: "tactical-light",
    name: "White Hat (Light)",
    category: "light",
    description: "High-contrast daylight operations room with cobalt blue",
    swatchColor: "#2563eb",
    accentColor: "#3b82f6",
  },
];

const THEME_STORAGE_KEY = "cyberguard_active_theme";

export function getStoredTheme(): ThemeId {
  if (typeof window === "undefined") return "cyber-crimson";
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId | null;
    if (saved && THEME_OPTIONS.some((t) => t.id === saved)) {
      return saved;
    }
  } catch {
    // fallback
  }
  return "cyber-crimson";
}

export function applyTheme(themeId: ThemeId) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", themeId);
  if (themeId === "tactical-light") {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
  } else {
    document.documentElement.classList.remove("light");
    document.documentElement.classList.add("dark");
  }
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
  } catch {
    // ignore
  }
}
