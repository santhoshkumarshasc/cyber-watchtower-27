import { useState } from "react";
import {
  Newspaper,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Radio,
  Clock,
  ShieldCheck,
} from "lucide-react";

import type { NewsItem } from "@/lib/threat-types";
import {
  useMinuteTicker,
  getLiveRelativeTime,
  isSourceAvailableAndVerified,
} from "@/lib/threat-utils";

interface NewsTickerProps {
  news?: NewsItem[];
}

export function NewsTicker({ news }: NewsTickerProps) {
  const [expanded, setExpanded] = useState(true);
  // Re-evaluate news timestamps every 30 seconds
  useMinuteTicker(30);

  const verifiedNews = (news ?? []).filter(isSourceAvailableAndVerified);

  if (verifiedNews.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden shadow-xs">
      {/* Header / Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 sm:px-4 bg-secondary/40 border-b border-border">
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Radio className="size-4 animate-pulse" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">
                Verified Cyber News &amp; Security Dispatches
              </span>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[0.68rem] font-medium text-emerald-600 dark:text-emerald-400">
                {verifiedNews.length} Live Feeds
              </span>
            </div>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Confirmed official security bulletins and vendor PSIRT advisories
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary cursor-pointer transition-colors"
          >
            {expanded ? (
              <>
                <span>Collapse News</span>
                <ChevronUp className="size-3.5" />
              </>
            ) : (
              <>
                <span>Show All ({news.length})</span>
                <ChevronDown className="size-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* When collapsed: single ticker highlight */}
      {!expanded ? (
        <div className="px-4 py-3 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 truncate">
            <span
              className={`shrink-0 rounded px-1.5 py-0.5 text-[0.68rem] font-semibold uppercase ${
                news[0].urgency === "critical"
                  ? "bg-destructive/15 text-destructive border border-destructive/30"
                  : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
              }`}
            >
              {news[0].urgency}
            </span>
            <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[0.68rem] font-medium text-emerald-600 dark:text-emerald-400 shrink-0">
              <ShieldCheck className="size-3" />
              <span>VERIFIED</span>
            </span>
            <span className="font-semibold text-foreground truncate">{news[0].title}</span>
            <span className="text-muted-foreground text-xs shrink-0" suppressHydrationWarning>
              · {news[0].source} ({getLiveRelativeTime(news[0].timestamp)})
            </span>
          </div>

          <a
            href={news[0].sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Source <ExternalLink className="size-3" />
          </a>
        </div>
      ) : (
        /* Expanded: Grid of all breaking news cards with full summary and open source button */
        <div className="p-4 grid gap-3 sm:grid-cols-2">
          {news.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-lg border border-border bg-background p-4 hover:border-primary/50 transition-colors shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`rounded px-2 py-0.5 text-[0.68rem] uppercase font-bold ${
                        item.urgency === "critical"
                          ? "bg-destructive/15 text-destructive border border-destructive/20"
                          : item.urgency === "high"
                            ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                            : "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                      }`}
                    >
                      {item.urgency}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[0.68rem] font-medium text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="size-3" />
                      <span>Verified</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3 text-muted-foreground" />
                    <span suppressHydrationWarning>{getLiveRelativeTime(item.timestamp)}</span>
                  </div>
                </div>

                <h4 className="mt-2.5 text-sm font-semibold leading-snug text-foreground">
                  {item.title}
                </h4>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                  {item.summary}
                </p>
              </div>

              <div className="mt-3.5 flex items-center justify-between border-t border-border pt-2.5 text-xs">
                <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                  <span>Source:</span>
                  <span className="text-foreground font-semibold truncate max-w-[140px] sm:max-w-[200px]">
                    {item.source}
                  </span>
                </span>
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-secondary/80 hover:text-primary transition-colors"
                >
                  <span>Read Article</span>
                  <ExternalLink className="size-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
