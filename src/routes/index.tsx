import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";

import { ErrorPanel, LoadingPanel } from "@/components/cyber/States";
import { ThreatCard } from "@/components/cyber/ThreatCard";
import { RiskMeter } from "@/components/cyber/RiskMeter";
import { briefingQueryOptions } from "@/lib/threat-queries";
import { severityLevels } from "@/lib/threat-types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Live Threat Feed — CyberGuard" },
      {
        name: "description",
        content:
          "Real-time cyber threat headlines compiled from advisories, vendor labs and security press, with risk scores and affected-people counts.",
      },
      { property: "og:title", content: "Live Threat Feed — CyberGuard" },
      {
        property: "og:description",
        content: "Current cyber threats with risk percentages, affected people and what to do next.",
      },
    ],
  }),
  component: FeedPage,
});

function FeedPage() {
  const { data, isPending, error, refetch, isFetching } = useQuery(briefingQueryOptions);
  const [severity, setSeverity] = useState<string>("all");
  const [search, setSearch] = useState("");

  const threats = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    return data.threats.filter(
      (t) =>
        (severity === "all" || t.severity === severity) &&
        (q === "" ||
          `${t.title} ${t.summary} ${t.category} ${t.source}`.toLowerCase().includes(q)),
    );
  }, [data, severity, search]);

  return (
    <div className="space-y-6">
      <section className="panel relative overflow-hidden p-6 shadow-alert md:p-8">
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <span className="label-mono text-primary">Threat level briefing</span>
            <h1 className="mt-3 text-3xl leading-tight font-bold md:text-4xl">
              {data ? data.headline : "Real-time cyber threat awareness and protection"}
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
              CyberGuard compiles current attacks, breaches and advisories from multiple public
              intelligence sources, scores the risk, and tells you exactly what to do about it.
            </p>
            {data ? (
              <div className="mt-5 flex flex-wrap gap-6">
                <Stat label="Active incidents" value={String(data.activeIncidents)} />
                <Stat label="People affected" value={data.peopleAffectedLabel} />
                <Stat label="Trend" value={data.riskTrend} />
                <Stat label="Updated" value={data.generatedLabel} />
              </div>
            ) : null}
          </div>
          <RiskMeter value={data?.globalRiskPercent ?? 0} />
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1">
          {(["all", ...severityLevels] as const).map((level) => (
            <button
              key={level}
              onClick={() => setSeverity(level)}
              className={`rounded-md border px-3 py-1.5 font-mono text-xs tracking-widest uppercase transition-colors ${
                severity === level
                  ? "border-primary/50 bg-primary/15 text-primary"
                  : "border-border text-muted-foreground hover:bg-secondary"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search threats, sources, categories…"
          className="min-w-[14rem] flex-1 rounded-md border border-input bg-card px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/60"
        />
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} />
          Refresh feed
        </button>
      </div>

      {isPending ? <LoadingPanel label="Compiling live briefing" /> : null}
      {error ? <ErrorPanel message={(error as Error).message} onRetry={() => refetch()} /> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {threats.map((threat) => (
          <ThreatCard key={threat.id} threat={threat} />
        ))}
      </div>

      {data && threats.length === 0 ? (
        <p className="panel p-10 text-center text-sm text-muted-foreground">
          No threats match this filter.
        </p>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="label-mono">{label}</span>
      <p className="font-display text-lg font-semibold">{value}</p>
    </div>
  );
}
