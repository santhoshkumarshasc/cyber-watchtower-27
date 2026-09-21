import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  RefreshCw,
  Search,
  X,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  LayoutGrid,
  List,
  ChevronDown,
  Radio,
  Clock,
  Zap,
  FileDown,
  Trash2,
} from "lucide-react";

import { ErrorPanel, LoadingPanel } from "@/components/cyber/States";
import { ThreatCard } from "@/components/cyber/ThreatCard";
import { RiskMeter } from "@/components/cyber/RiskMeter";
import { ThreatDetailModal } from "@/components/cyber/ThreatDetailModal";
import { ThreatComparisonModal } from "@/components/cyber/ThreatComparisonModal";
import { QuickAlertModal } from "@/components/cyber/QuickAlertModal";
import { RealtimeClock } from "@/components/cyber/RealtimeClock";
import { NewsTicker } from "@/components/cyber/NewsTicker";
import { AutoRefreshControl } from "@/components/cyber/AutoRefreshControl";
import { briefingQueryOptions } from "@/lib/threat-queries";
import { severityLevels, severityStyles, type Threat } from "@/lib/threat-types";
import {
  sortByRecentToPast,
  sortByPastToRecent,
  parseRecencyMinutes,
  getCustomThreatAlerts,
  deleteCustomThreatAlert,
  exportThreatsAsJson,
  exportThreatsAsCsv,
  useMinuteTicker,
} from "@/lib/threat-utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Live Threat Feed — CyberGuard" },
      {
        name: "description",
        content:
          "Real-time cyber threat headlines compiled from advisories, vendor labs and security press, with risk scores, recency sorting, and instant alerts.",
      },
      { property: "og:title", content: "Live Threat Feed — CyberGuard" },
      {
        property: "og:description",
        content:
          "Current cyber threats ordered from recent to past with risk percentages and quick alert broadcasting.",
      },
    ],
  }),
  component: FeedPage,
});

function FeedPage() {
  const { data, isPending, error, refetch, isFetching } = useQuery(briefingQueryOptions);
  // Re-evaluates relative timestamps & recency bucket filter every 30 seconds
  useMinuteTicker(30);

  const [severity, setSeverity] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<
    "recent-to-past" | "past-to-recent" | "risk-desc" | "risk-asc" | "affected"
  >("recent-to-past");
  const [recencyWindow, setRecencyWindow] = useState<"all" | "30m" | "2h" | "24h">("all");
  const [viewMode, setViewMode] = useState<"grid" | "compact">("grid");
  const [visibleCount, setVisibleCount] = useState<number>(8);
  const [selectedThreat, setSelectedThreat] = useState<Threat | null>(null);
  const [customThreats, setCustomThreats] = useState<Threat[]>(() => getCustomThreatAlerts());

  // Merge server threats with locally broadcasted operator alerts
  const allThreats = useMemo(() => {
    const base = data?.threats ?? [];
    const customIds = new Set(customThreats.map((c) => c.id));
    const dedupedBase = base.filter((b) => !customIds.has(b.id));
    return [...customThreats, ...dedupedBase];
  }, [data, customThreats]);

  // Derive unique categories from combined data
  const categories = useMemo(() => {
    if (allThreats.length === 0) return [];
    const set = new Set(allThreats.map((t) => t.category));
    return Array.from(set);
  }, [allThreats]);

  const filteredThreats = useMemo(() => {
    if (allThreats.length === 0) return [];
    const q = search.trim().toLowerCase();

    let list = allThreats.filter((t) => {
      const matchSeverity = severity === "all" || t.severity === severity;
      const matchCategory = category === "all" || t.category === category;
      const matchSearch =
        q === "" ||
        `${t.title} ${t.summary} ${t.category} ${t.source} ${t.cveList?.join(" ") ?? ""}`
          .toLowerCase()
          .includes(q);

      let matchRecency = true;
      if (recencyWindow === "30m") {
        matchRecency = parseRecencyMinutes(t.publishedLabel) <= 30;
      } else if (recencyWindow === "2h") {
        matchRecency = parseRecencyMinutes(t.publishedLabel) <= 120;
      } else if (recencyWindow === "24h") {
        matchRecency = parseRecencyMinutes(t.publishedLabel) <= 1440;
      }

      const matchVerified = !verifiedOnly || t.verified !== false;

      return matchSeverity && matchCategory && matchSearch && matchRecency && matchVerified;
    });

    if (sortBy === "recent-to-past") {
      list = sortByRecentToPast(list);
    } else if (sortBy === "past-to-recent") {
      list = sortByPastToRecent(list);
    } else if (sortBy === "risk-desc") {
      list.sort((a, b) => b.riskPercent - a.riskPercent);
    } else if (sortBy === "risk-asc") {
      list.sort((a, b) => a.riskPercent - b.riskPercent);
    } else if (sortBy === "affected") {
      list.sort((a, b) => b.affectedPeople.localeCompare(a.affectedPeople));
    }

    return list;
  }, [allThreats, severity, category, search, recencyWindow, sortBy, verifiedOnly]);

  const visibleThreats = useMemo(() => {
    return filteredThreats.slice(0, visibleCount);
  }, [filteredThreats, visibleCount]);

  const handleDismissCustomAlert = (threatId: string) => {
    const updated = deleteCustomThreatAlert(threatId);
    setCustomThreats(updated);
  };

  return (
    <div className="space-y-6">
      {/* Real-time Today's Date & Live Monitoring Status Bar */}
      <RealtimeClock variant="hero-bar" />

      {/* Hero Threat Level Briefing Banner */}
      <section className="rounded-lg border border-border bg-card p-5 sm:p-6 md:p-8 shadow-xs">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                <Radio className="size-3.5 animate-pulse text-primary" />
                Global Situational Briefing
              </span>
              <span className="rounded bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
                CISA &middot; NVD &middot; CERT Verified Feeds
              </span>
              <span className="rounded bg-primary/10 border border-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                Recent to Past Order
              </span>
            </div>

            <h1 className="mt-3 text-2xl font-bold leading-tight sm:text-3xl md:text-4xl text-foreground">
              {data ? data.headline : "Real-time cybersecurity threat intelligence desk"}
            </h1>

            <p className="mt-2.5 max-w-2xl text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Active exploits, zero-day vulnerabilities, ransomware intrusions, and supply chain
              compromises compiled from global security response desks with verified sources,
              chronological order, and recommended mitigations.
            </p>

            {data ? (
              <div className="mt-5 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-6 border-t border-border pt-4">
                <Stat
                  label="Active Incidents"
                  value={String(allThreats.length || data.activeIncidents)}
                />
                <Stat label="Accounts Monitored" value={data.peopleAffectedLabel} />
                <Stat label="Risk Trend (24h)" value={data.riskTrend} />
                <Stat
                  label="Feed Ordering"
                  value={sortBy === "recent-to-past" ? "Recent → Past" : "Custom Order"}
                />
              </div>
            ) : null}
          </div>

          <div className="flex flex-col items-center gap-3 md:items-end">
            <RiskMeter value={data?.globalRiskPercent ?? 0} size={170} />
            <div className="flex flex-wrap items-center gap-2">
              <QuickAlertModal
                onAlertDispatched={(newThreat) => {
                  setCustomThreats((prev) => [newThreat, ...prev]);
                }}
              />
              <Link
                to="/timeline"
                className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-secondary/80 transition-colors"
              >
                <Clock className="size-3 text-primary" />
                <span>Full Timeline</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Operator Dispatched Quick Alerts Banner (if any) */}
      {customThreats.length > 0 && (
        <section className="rounded-lg border border-destructive/40 bg-destructive/10 p-3.5 sm:p-4 text-xs">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="flex items-center gap-1.5 font-mono font-bold text-destructive">
              <Zap className="size-4 animate-pulse" />
              OPERATOR FLASH ALERTS DISPATCHED ({customThreats.length})
            </span>
            <span className="text-muted-foreground text-[0.7rem] label-mono">
              Top Ranked in Recent-to-Past Sequence
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {customThreats.map((ct) => (
              <div
                key={ct.id}
                className="flex items-center justify-between gap-2 p-2 rounded bg-card/80 border border-destructive/30"
              >
                <div className="truncate">
                  <span className="font-semibold text-foreground">{ct.title}</span>
                  <span className="ml-2 font-mono text-[0.68rem] text-muted-foreground">
                    ({ct.publishedLabel})
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedThreat(ct)}
                    className="text-[0.7rem] text-primary hover:underline font-mono"
                  >
                    Inspect
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDismissCustomAlert(ct.id)}
                    className="text-muted-foreground hover:text-destructive p-1"
                    title="Dismiss alert"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Breaking News Wire Section */}
      <NewsTicker news={data?.breakingNews} />

      {/* Primary Toolbar: Search, Filters, Auto Refresh, Recency Order */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Severity Filter Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {(["all", ...severityLevels] as const).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setSeverity(level)}
                className={`rounded-md border px-3 py-1.5 text-xs font-semibold capitalize transition-colors cursor-pointer ${
                  severity === level
                    ? "border-primary bg-primary text-primary-foreground shadow-2xs"
                    : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {level === "all" ? "All Severities" : level}
              </button>
            ))}
          </div>

          {/* Quick Action Tools: Recency Toggle, Verified Toggle, Compare Threats, Export */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Verified Only Filter Toggle */}
            <button
              type="button"
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                verifiedOnly
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold shadow-2xs"
                  : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
              title="Toggle Verified Intelligence Feeds Only"
            >
              <ShieldCheck className="size-3.5 text-emerald-500" />
              <span>{verifiedOnly ? "Verified Feeds Only" : "All Feeds"}</span>
            </button>

            {/* 1-Click Recent to Past toggle */}
            <button
              type="button"
              onClick={() =>
                setSortBy(sortBy === "recent-to-past" ? "past-to-recent" : "recent-to-past")
              }
              className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                sortBy === "recent-to-past"
                  ? "border-primary/40 bg-primary/10 text-primary font-semibold shadow-2xs"
                  : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
              title="Toggle Chronological Order"
            >
              <Clock className="size-3.5 text-primary" />
              <span>{sortBy === "recent-to-past" ? "Newest First" : "Oldest First"}</span>
            </button>

            {/* Side-by-side threat comparison matrix */}
            <ThreatComparisonModal threats={allThreats} />

            {/* Export dropdown */}
            <div className="flex items-center rounded-md border border-border bg-card">
              <button
                type="button"
                onClick={() => exportThreatsAsCsv(filteredThreats)}
                className="px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 border-r border-border"
                title="Export CSV"
              >
                <FileDown className="size-3" />
                <span className="hidden sm:inline">CSV</span>
              </button>
              <button
                type="button"
                onClick={() => exportThreatsAsJson(filteredThreats)}
                className="px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                title="Export JSON"
              >
                <span className="hidden sm:inline">JSON</span>
              </button>
            </div>

            {/* Auto Live Refresh Component */}
            <AutoRefreshControl
              onRefresh={() => refetch()}
              isFetching={isFetching}
              briefingData={data}
            />
          </div>
        </div>

        {/* Secondary Filter Bar: Search, Category, Sorting, Recency Windows */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative min-w-[14rem] flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by CVE, title, threat actor, or source…"
              className="w-full rounded-md border border-input bg-card pl-9 pr-8 py-2 text-xs sm:text-sm outline-none placeholder:text-muted-foreground focus:border-primary/70 transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Recency Time Filter Window */}
          <div className="flex items-center rounded-md border border-border bg-card p-0.5 text-xs">
            <span className="text-muted-foreground px-2 hidden sm:inline label-mono text-[0.68rem]">
              Recency:
            </span>
            {(
              [
                { id: "all", label: "All" },
                { id: "30m", label: "< 30m" },
                { id: "2h", label: "< 2h" },
                { id: "24h", label: "< 24h" },
              ] as const
            ).map((win) => (
              <button
                key={win.id}
                type="button"
                onClick={() => setRecencyWindow(win.id)}
                className={`px-2 py-1 rounded text-[0.72rem] font-mono transition-colors cursor-pointer ${
                  recencyWindow === win.id
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {win.label}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          {categories.length > 0 && (
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-md border border-input bg-card px-3 py-2 text-xs sm:text-sm text-foreground outline-none focus:border-primary cursor-pointer pr-8"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as
                    "recent-to-past" | "past-to-recent" | "risk-desc" | "risk-asc" | "affected",
                )
              }
              className="rounded-md border border-input bg-card px-3 py-2 text-xs sm:text-sm text-foreground outline-none focus:border-primary cursor-pointer pr-8 font-medium"
            >
              <option value="recent-to-past">Sort: Recent to Past (Newest First)</option>
              <option value="past-to-recent">Sort: Past to Recent (Oldest First)</option>
              <option value="risk-desc">Sort: Highest Risk (Critical First)</option>
              <option value="risk-asc">Sort: Lowest Risk</option>
              <option value="affected">Sort: Affected Scope</option>
            </select>
          </div>

          {/* View Mode Toggle (Grid vs Compact List) */}
          <div className="flex items-center rounded-md border border-border bg-card p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-secondary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("compact")}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                viewMode === "compact"
                  ? "bg-secondary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Compact View"
            >
              <List className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Results Count Banner */}
      <div className="flex items-center justify-between text-xs text-muted-foreground label-mono">
        <span>
          Showing {visibleThreats.length} of {filteredThreats.length} tracked threats
          {severity !== "all" ? ` [${severity.toUpperCase()}]` : ""}
          {category !== "all" ? ` [${category}]` : ""}
        </span>
        {data && (
          <a
            href="https://www.cisa.gov/news-events/cybersecurity-advisories"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-primary hover:underline"
          >
            <span>CISA Advisories Catalog</span>
            <ExternalLink className="size-3" />
          </a>
        )}
      </div>

      {/* Loading and Error States */}
      {isPending ? <LoadingPanel label="Compiling real-time threat briefing" /> : null}
      {error ? <ErrorPanel message={(error as Error).message} onRetry={() => refetch()} /> : null}

      {/* Threats Grid / Compact Display */}
      {viewMode === "grid" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {visibleThreats.map((threat) => (
            <ThreatCard
              key={threat.id}
              threat={threat}
              onOpenDetails={(t) => setSelectedThreat(t)}
            />
          ))}
        </div>
      ) : (
        /* Compact List View */
        <div className="panel divide-y divide-border overflow-hidden">
          {visibleThreats.map((threat) => {
            const severityStyle = severityStyles[threat.severity];
            const sourceLink =
              threat.sourceUrl ||
              `https://www.google.com/search?q=${encodeURIComponent(threat.title + " advisory")}`;

            return (
              <div
                key={threat.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-secondary/30 transition-colors"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded px-1.5 py-0.2 font-mono text-[0.62rem] uppercase ${severityStyle.bg} ${severityStyle.text}`}
                    >
                      {severityStyle.label}
                    </span>
                    <span className="label-mono text-[0.68rem]">{threat.category}</span>
                    <span className="label-mono text-[0.68rem] text-muted-foreground">
                      &middot; {threat.source}
                    </span>
                  </div>
                  <h4 className="font-medium text-sm text-foreground leading-snug">
                    {threat.title}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-1">{threat.summary}</p>
                </div>

                <div className="flex items-center gap-2 sm:self-center shrink-0">
                  <span className={`font-mono text-xs font-semibold ${severityStyle.text}`}>
                    {Math.round(threat.riskPercent)}% Risk
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedThreat(threat)}
                    className="rounded bg-secondary px-2.5 py-1 text-xs font-medium text-foreground hover:bg-secondary/80"
                  >
                    Dossier
                  </button>
                  <a
                    href={sourceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded bg-primary/90 px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary"
                  >
                    <span>Source</span>
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* "View More Options for Multiple Threats" & Pagination Controls */}
      {filteredThreats.length > visibleCount && (
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + 6)}
            className="flex items-center gap-2 rounded-md border border-border bg-card px-5 py-2.5 text-xs sm:text-sm font-medium text-foreground hover:bg-secondary transition-colors shadow-xs"
          >
            <span>Load More Threats ({filteredThreats.length - visibleCount} remaining)</span>
            <ChevronDown className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setVisibleCount(filteredThreats.length)}
            className="rounded-md border border-border bg-secondary px-4 py-2.5 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            View All ({filteredThreats.length})
          </button>
        </div>
      )}

      {/* Empty State */}
      {data && filteredThreats.length === 0 ? (
        <div className="panel p-10 text-center space-y-3">
          <ShieldAlert className="size-8 text-muted-foreground mx-auto" />
          <p className="text-sm font-medium text-foreground">No threats match this filter</p>
          <p className="text-xs text-muted-foreground">
            Try adjusting your search query, severity filter, or category.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setSeverity("all");
              setCategory("all");
            }}
            className="inline-block rounded-md bg-secondary px-3 py-1.5 text-xs text-primary hover:underline"
          >
            Reset all filters
          </button>
        </div>
      ) : null}

      {/* Threat Detail Modal Dialog */}
      <ThreatDetailModal
        threat={selectedThreat}
        open={Boolean(selectedThreat)}
        onOpenChange={(open) => {
          if (!open) setSelectedThreat(null);
        }}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <p className="text-base sm:text-lg font-bold text-foreground mt-0.5">{value}</p>
    </div>
  );
}
