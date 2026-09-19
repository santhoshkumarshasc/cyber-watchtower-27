import { Palette, Check } from "lucide-react";
import { useEffect, useState } from "react";

import { THEME_OPTIONS, getStoredTheme, applyTheme, type ThemeId } from "@/lib/theme";

interface ThemeSelectorProps {
  variant?: "dropdown" | "inline";
}

export function ThemeSelector({ variant = "dropdown" }: ThemeSelectorProps) {
  const [currentTheme, setCurrentTheme] = useState<ThemeId>("cyber-crimson");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const saved = getStoredTheme();
    setCurrentTheme(saved);
    applyTheme(saved);
  }, []);

  const handleSelect = (id: ThemeId) => {
    setCurrentTheme(id);
    applyTheme(id);
    setIsOpen(false);
  };

  const active = THEME_OPTIONS.find((t) => t.id === currentTheme) || THEME_OPTIONS[0];

  if (variant === "inline") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {THEME_OPTIONS.map((theme) => {
          const isSelected = theme.id === currentTheme;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => handleSelect(theme.id)}
              className={`flex items-center justify-between rounded-md border p-2 text-left text-xs transition-all cursor-pointer ${
                isSelected
                  ? "border-primary bg-primary/10 text-foreground font-semibold shadow-xs"
                  : "border-border/60 bg-secondary/30 hover:border-border hover:bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="size-3.5 rounded-full border border-white/20 shrink-0 shadow-xs"
                  style={{ backgroundColor: theme.swatchColor }}
                />
                <div className="min-w-0">
                  <div className="text-[0.75rem] font-medium truncate">{theme.name}</div>
                  <div className="text-[0.62rem] text-muted-foreground truncate">
                    {theme.description}
                  </div>
                </div>
              </div>
              {isSelected && <Check className="size-3.5 text-primary shrink-0 ml-1" />}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
        title={`Theme: ${active.name}`}
      >
        <Palette className="size-3.5" style={{ color: active.swatchColor }} />
        <span className="hidden xl:inline text-[0.75rem] font-medium">{active.name}</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-black/20" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-lg border border-border bg-card p-2 shadow-xl animate-in fade-in-50 zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-2 py-1.5 border-b border-border/60 mb-1.5">
              <span className="label-mono text-[0.68rem] text-muted-foreground">
                SOC Display Theme
              </span>
              <span className="text-[0.68rem] font-mono text-primary font-bold">5 Schemes</span>
            </div>
            <div className="space-y-1">
              {THEME_OPTIONS.map((theme) => {
                const isSelected = theme.id === currentTheme;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => handleSelect(theme.id)}
                    className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-secondary text-foreground font-semibold"
                        : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="size-3.5 rounded-full border border-white/20 shrink-0 shadow-xs"
                        style={{ backgroundColor: theme.swatchColor }}
                      />
                      <div>
                        <div className="text-xs text-foreground font-medium">{theme.name}</div>
                        <div className="text-[0.65rem] text-muted-foreground line-clamp-1">
                          {theme.description}
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check className="size-3.5 text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
