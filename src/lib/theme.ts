export type ThemeId =
  | "modern-light"
  | "modern-dark"
  | "cyber-crimson"
  | "matrix-emerald"
  | "midnight-cyan"
  | "amber-sentinel"
  | "tactical-light";

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
    id: "modern-light",
    name: "White & Black (Default)",
    category: "light",
    description: "Crisp, minimalist high-contrast white and black theme",
    swatchColor: "#ffffff",
    accentColor: "#09090b",
  },
  {
    id: "modern-dark",
    name: "Black & White (Dark)",
    category: "dark",
    description: "Deep obsidian black with high-contrast white text",
    swatchColor: "#09090b",
    accentColor: "#fafafa",
  },
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
    name: "White Hat",
    category: "light",
    description: "Daylight operations room with high contrast",
    swatchColor: "#f8fafc",
    accentColor: "#2563eb",
  },
];

const THEME_STORAGE_KEY = "cyberguard_active_theme";

export function getStoredTheme(): ThemeId {
  if (typeof window === "undefined") return "modern-light";
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId | null;
    if (saved && THEME_OPTIONS.some((t) => t.id === saved)) {
      return saved;
    }
  } catch {
    // fallback
  }
  return "modern-light";
}

export function isCurrentThemeDark(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

export function applyTheme(themeId: ThemeId) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", themeId);
  if (themeId === "modern-light" || themeId === "tactical-light") {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
  } else {
    document.documentElement.classList.remove("light");
    document.documentElement.classList.add("dark");
  }
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
    window.dispatchEvent(new CustomEvent("cyberguard:theme-changed", { detail: themeId }));
  } catch {
    // ignore
  }
}

export function toggleLightDark(): ThemeId {
  const current = getStoredTheme();
  const next: ThemeId =
    current === "modern-light" || current === "tactical-light" ? "modern-dark" : "modern-light";
  applyTheme(next);
  return next;
}
