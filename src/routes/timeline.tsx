import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Clock,
  ArrowUpDown,
  ArrowDownUp,
  ShieldAlert,
  Calendar,
  Filter,
  Search,
  Zap,
  ExternalLink,
  ChevronRight,
  Eye,
  Radio,
  FileDown,
  RotateCcw,
} from "lucide-react";

import { ErrorPanel, LoadingPanel } from "@/components/cyber/States";
import { ThreatDetailModal } from "@/components/cyber/ThreatDetailModal";
import { QuickAlertModal } from "@/components/cyber/QuickAlertModal";
import { RealtimeClock } from "@/components/cyber/RealtimeClock";
import { briefingQueryOptions } from "@/lib/threat-queries";
import {
  parseRecencyMinutes,
  sortByRecentToPast,
  sortByPastToRecent,
  groupThreatsByRecency,
  getCustomThreatAlerts,
  exportThreatsAsJson,
  exportThreatsAsCsv,
  useMinuteTicker,
  getLiveRelativeTime,
  getFormattedExactTime,
  filterVerifiedAvailableSourcesOnly,
} from "@/lib/threat-utils";
import { severityLevels, severityStyles, type Threat } from "@/lib/threat-types";
import { RiskBar } from "@/components/cyber/RiskMeter";

export const Route = createFileRoute("/timeline")({
  head: () => ({
    meta: [
      { title: "Incident Timeline (Recent to Past) — CyberGuard" },
      {
        name: "description",
        content:
          "Strict chronological cyber threat timeline ordered from most recent to past incidents, with time clustering and impact telemetry.",
      },
      { property: "og:title", content: "Incident Timeline — CyberGuard" },
      {
        property: "og:description",
        content: "View cyber threats ordered from newest alerts to historical past campaigns.",
      },
    ],
  }),
  component: TimelinePage,
});

function TimelinePage() {
  const { data, isPending, error, refetch } = useQuery(briefingQueryOptions);
  // Re-render every 30 seconds to advance relative timeline minute counters
  useMinuteTicker(30);

  const [sortOrder, setSortOrder] = useState<"recent-to-past" | "past-to-recent">("recent-to-past");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [timeFilter, setTimeFilter] = useState<"all" | "1h" | "6h" | "24h">("all");
  const [search, setSearch] = useState("");
  const [selectedThreat, setSelectedThreat] = useState<Threat | null>(null);
  const [customThreats, setCustomThreats] = useState<Threat[]>(() => getCustomThreatAlerts());

  // Merge server threats with locally broadcasted operator alerts with strict source verification
  const allThreats = useMemo(() => {
    const base = filterVerifiedAvailableSourcesOnly(data?.threats ?? []);
    const validCustom = filterVerifiedAvailableSourcesOnly(customThreats);
    const customIds = new Set(validCustom.map((c) => c.id));
    const dedupedBase = base.filter((b) => !customIds.has(b.id));
    return [...validCustom, ...dedupedBase];
  }, [data, customThreats]);

  // Filter threats
  const filteredThreats = useMemo(() => {
    let list = allThreats;
    const q = search.trim().toLowerCase();

    if (q) {
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.summary.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.source.toLowerCase().includes(q) ||
          t.cveList?.some((c) => c.toLowerCase().includes(q)),
      );
    }

    if (selectedSeverity !== "all") {
      list = list.filter((t) => t.severity === selectedSeverity);
    }

    if (timeFilter === "1h") {
      list = list.filter((t) => parseRecencyMinutes(t.publishedLabel) <= 60);
    } else if (timeFilter === "6h") {
      list = list.filter((t) => parseRecencyMinutes(t.publishedLabel) <= 360);
    } else if (timeFilter === "24h") {
      list = list.filter((t) => parseRecencyMinutes(t.publishedLabel) <= 1440);
    }

    // Sort order
    if (sortOrder === "recent-to-past") {
      return sortByRecentToPast(list);
    } else {
      return sortByPastToRecent(list);
    }
  }, [allThreats, search, selectedSeverity, timeFilter, sortOrder]);

  const clusters = useMemo(() => {
    return groupThreatsByRecency(filteredThreats);
  }, [filteredThreats]);

  if (isPending) return <LoadingPanel label="Constructing chronological threat timeline" />;
  if (error || !data)
    return (
      <ErrorPanel
        message={(error as Error | null)?.message ?? "Timeline streams unavailable."}
        onRetry={() => refetch()}
      />
    );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 panel p-5 md:p-6 border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="label-mono text-primary flex items-center gap-1.5">
              <Clock className="size-3.5" />
              Chronological Intelligence Log
            </span>
            <span className="rounded bg-primary/10 border border-primary/20 px-2 py-0.5 text-[0.68rem] font-mono text-primary">
              Order: Recent &rarr; Past
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-foreground">Incident Timeline</h1>
          <p className="mt-1 max-w-2xl text-xs sm:text-sm text-muted-foreground">
            Explore cyber intrusions and zero-days arranged strictly by occurrence recency. Analyze
            incident progression from immediate zero-day disclosures to historical campaigns.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Threat Alert Dispatcher */}
          <QuickAlertModal
            onAlertDispatched={(newThreat) => {
              setCustomThreats((prev) => [newThreat, ...prev]);
            }}
          />

          <button
            type="button"
            onClick={() => exportThreatsAsCsv(filteredThreats)}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
          >
            <FileDown className="size-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </header>

      {/* Real-time Time Reference Banner */}
      <RealtimeClock variant="banner" />

      {/* Control Bar: Recency Sort Toggle, Time Brackets, Search */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Recency Sort Mode Selector */}
          <div className="flex items-center rounded-md border border-border bg-card p-1">
            <button
              type="button"
              onClick={() => setSortOrder("recent-to-past")}
              className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                sortOrder === "recent-to-past"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ArrowDownUp className="size-3.5" />
              <span>Recent to Past (Newest First)</span>
            </button>
            <button
              type="button"
              onClick={() => setSortOrder("past-to-recent")}
              className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                sortOrder === "past-to-recent"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ArrowUpDown className="size-3.5" />
              <span>Past to Recent (Oldest First)</span>
            </button>
          </div>

          {/* Time Window Brackets */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground mr-1 hidden sm:inline">
              Window:
            </span>
            {(
              [
                { id: "all", label: "All History" },
                { id: "1h", label: "Past 1h" },
                { id: "6h", label: "Past 6h" },
                { id: "24h", label: "Past 24h" },
              ] as const
            ).map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => setTimeFilter(w.id)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  timeFilter === w.id
                    ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                    : "border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[14rem] flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search chronological timeline by CVE, threat actor, or payload..."
              className="w-full rounded-md border border-input bg-card pl-9 pr-8 py-2 text-xs sm:text-sm outline-none placeholder:text-muted-foreground focus:border-primary/70 transition-colors"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {(["all", ...severityLevels] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setSelectedSeverity(lvl)}
                className={`rounded-md border px-3 py-1.5 text-xs font-semibold capitalize transition-colors cursor-pointer ${
                  selectedSeverity === lvl
                    ? "border-primary bg-primary text-primary-foreground shadow-2xs"
                    : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {lvl === "all" ? "All Severities" : lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline Summary Metrics */}
      <div className="flex items-center justify-between text-xs text-muted-foreground label-mono border-b border-border/60 pb-2">
        <span>
          Showing {filteredThreats.length} incidents in{" "}
          {sortOrder === "recent-to-past" ? "recent-to-past" : "past-to-recent"} sequence
        </span>
        <span className="flex items-center gap-1.5 text-primary">
          <Radio className="size-3 animate-pulse" />
          Real-time sync active
        </span>
      </div>

      {/* Vertical Chronological Timeline */}
      {filteredThreats.length === 0 ? (
        <div className="panel p-12 text-center text-muted-foreground">
          <Clock className="size-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-medium">
            No threats match the current timeline window or search filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setSelectedSeverity("all");
              setTimeFilter("all");
            }}
            className="mt-3 text-xs text-primary underline"
          >
            Reset all timeline filters
          </button>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2 sm:before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-border">
          {filteredThreats.map((threat, index) => {
            const mins = parseRecencyMinutes(threat.publishedLabel);
            const isFresh = mins <= 30;

            return (
              <div key={threat.id} className="relative group">
                {/* Timeline node icon */}
                <div
                  className={`absolute -left-6 sm:-left-8 top-1.5 size-4 sm:size-5 rounded-full border-2 flex items-center justify-center transition-transform group-hover:scale-110 ${
                    isFresh
                      ? "border-destructive bg-destructive text-destructive-foreground animate-pulse"
                      : "border-primary bg-background text-primary"
                  }`}
                >
                  <span className="size-1.5 rounded-full bg-current" />
                </div>

                {/* Timeline Card */}
                <div className="panel p-4 sm:p-5 border-border transition-all hover:border-primary/50 hover:shadow-md">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2.5 mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="flex items-center gap-1 font-mono text-xs font-bold text-foreground"
                        title={`Logged: ${getFormattedExactTime(threat.publishedLabel).utc}`}
                        suppressHydrationWarning
                      >
                        <Clock className="size-3 text-primary" />
                        <span suppressHydrationWarning>
                          {getLiveRelativeTime(threat.publishedLabel)}
                        </span>
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[0.65rem] font-mono uppercase font-semibold ${
                          severityStyles[threat.severity].badge
                        }`}
                      >
                        {threat.severity}
                      </span>
                      <span className="rounded bg-secondary px-2 py-0.5 text-[0.65rem] font-mono text-muted-foreground">
                        {threat.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span className="text-muted-foreground hidden sm:inline">
                        Vector #{index + 1}
                      </span>
                      <span className="font-bold text-primary">{threat.riskPercent}% Risk</span>
                    </div>
                  </div>

                  {/* Title & Summary */}
                  <h2 className="text-base sm:text-lg font-bold text-foreground leading-snug">
                    {threat.title}
                  </h2>
                  <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {threat.summary}
                  </p>

                  {/* CVE & Affected Info */}
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                    {threat.cveList && threat.cveList.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground font-mono">CVEs:</span>
                        {threat.cveList.map((cve) => (
                          <span
                            key={cve}
                            className="rounded border border-primary/30 bg-primary/10 px-1.5 py-0.5 font-mono text-[0.7rem] text-primary"
                          >
                            {cve}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="text-muted-foreground font-mono text-[0.72rem]">
                      Scope: <span className="text-foreground">{threat.affectedPeople}</span>
                    </div>

                    <div className="text-muted-foreground font-mono text-[0.72rem]">
                      Source: <span className="text-foreground">{threat.source}</span>
                    </div>
                  </div>

                  {/* Remediation Callout & Action button */}
                  <div className="mt-3.5 pt-3 border-t border-border/50 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs text-muted-foreground flex-1 min-w-[16rem]">
                      <span className="font-semibold text-foreground">Action Directive: </span>
                      {threat.recommendedAction}
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedThreat(threat)}
                      className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5 text-xs font-medium text-foreground hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                    >
                      <Eye className="size-3.5" />
                      <span>Inspect Dossier</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Threat Detail Modal */}
      {selectedThreat && (
        <ThreatDetailModal
          threat={selectedThreat}
          open={Boolean(selectedThreat)}
          onClose={() => setSelectedThreat(null)}
        />
      )}
    </div>
  );
}
