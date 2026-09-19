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
import { useMinuteTicker, getLiveRelativeTime } from "@/lib/threat-utils";

interface NewsTickerProps {
  news?: NewsItem[];
}

export function NewsTicker({ news }: NewsTickerProps) {
  const [expanded, setExpanded] = useState(false);
  // Re-evaluate news timestamps every 30 seconds
  useMinuteTicker(30);

  if (!news || news.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-card/60 backdrop-blur overflow-hidden transition-all">
      {/* Header / Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:px-4 bg-secondary/30">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded bg-primary/15 text-primary">
            <Radio className="size-4 animate-pulse" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-bold tracking-tight">
                Breaking Cyber Intel &amp; News Wire
              </span>
              <span className="rounded bg-primary/20 px-1.5 py-0.2 font-mono text-[0.62rem] text-primary">
                {news.length} Active Feeds
              </span>
            </div>
            <p className="text-[0.72rem] text-muted-foreground hidden sm:block">
              Verified security dispatches from CISA, NIST, BleepingComputer, and international
              CERTs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 rounded-md border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary/80 transition-colors"
          >
            {expanded ? (
              <>
                <span>Collapse Wire</span>
                <ChevronUp className="size-3.5" />
              </>
            ) : (
              <>
                <span>View Latest Dispatches</span>
                <ChevronDown className="size-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* When collapsed: single ticker highlight */}
      {!expanded ? (
        <div className="px-4 py-2.5 flex items-center justify-between gap-3 text-xs border-t border-border/50">
          <div className="flex items-center gap-2 truncate">
            <span
              className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[0.65rem] uppercase ${
                news[0].urgency === "critical"
                  ? "bg-critical/15 text-critical border border-critical/30"
                  : "bg-high/15 text-high border border-high/30"
              }`}
            >
              {news[0].urgency}
            </span>
            <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[0.62rem] font-mono text-emerald-400 shrink-0">
              <ShieldCheck className="size-2.5" />
              <span>VERIFIED</span>
            </span>
            <span className="font-medium text-foreground truncate">{news[0].title}</span>
            <span className="text-muted-foreground text-[0.7rem] shrink-0">
              · {news[0].source} ({getLiveRelativeTime(news[0].timestamp)})
            </span>
          </div>

          <a
            href={news[0].sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-1 font-mono text-[0.7rem] text-primary hover:underline"
          >
            Open Source <ExternalLink className="size-3" />
          </a>
        </div>
      ) : (
        /* Expanded: Grid of all breaking news cards with full summary and open source button */
        <div className="p-4 grid gap-3 sm:grid-cols-2 border-t border-border">
          {news.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-md border border-border bg-card p-3.5 transition-colors hover:border-primary/40"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`rounded px-1.5 py-0.5 font-mono text-[0.65rem] uppercase font-semibold ${
                      item.urgency === "critical"
                        ? "bg-critical/15 text-critical border border-critical/30"
                        : item.urgency === "high"
                          ? "bg-high/15 text-high border border-high/30"
                          : "bg-medium/15 text-medium border border-medium/30"
                    }`}
                  >
                    {item.urgency}
                  </span>
                  <div className="flex items-center gap-1 text-[0.68rem] text-muted-foreground font-mono">
                    <Clock className="size-3 text-primary" />
                    <span>{getLiveRelativeTime(item.timestamp)}</span>
                  </div>
                </div>

                <h4 className="mt-2 text-sm font-semibold leading-snug text-foreground">
                  {item.title}
                </h4>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{item.summary}</p>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5 text-xs">
                <span className="label-mono text-[0.68rem] flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="size-3" />
                  <span className="truncate max-w-[140px] sm:max-w-[200px]">
                    {item.verificationAgency || item.source}
                  </span>
                </span>
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded bg-secondary px-2.5 py-1 text-xs font-medium text-primary hover:bg-secondary/80 transition-colors"
                >
                  <ExternalLink className="size-3" />
                  <span>Open Source</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
