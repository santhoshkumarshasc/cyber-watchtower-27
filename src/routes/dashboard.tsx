import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ExternalLink, Eye, ShieldAlert, RefreshCw } from "lucide-react";

import { ErrorPanel, LoadingPanel } from "@/components/cyber/States";
import { RiskBar, RiskMeter } from "@/components/cyber/RiskMeter";
import { ThreatDetailModal } from "@/components/cyber/ThreatDetailModal";
import { RealtimeClock } from "@/components/cyber/RealtimeClock";
import { briefingQueryOptions } from "@/lib/threat-queries";
import { severityStyles, type Threat } from "@/lib/threat-types";
import { useMinuteTicker } from "@/lib/threat-utils";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Risk Dashboard — CyberGuard" },
      {
        name: "description",
        content:
          "Global cyber risk index, severity spread, attack-category breakdown and affected-people counts across current incidents.",
      },
      { property: "og:title", content: "Risk Dashboard — CyberGuard" },
      {
        property: "og:description",
        content: "Risk percentages and severity analytics for today's active cyber threats.",
      },
    ],
  }),
  component: DashboardPage,
});

const chartColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function DashboardPage() {
  const { data, isPending, error, refetch, isFetching } = useQuery(briefingQueryOptions);
  // Re-evaluates minute clock telemetry every 30 seconds
  useMinuteTicker(30);

  const [selectedThreat, setSelectedThreat] = useState<Threat | null>(null);

  if (isPending) return <LoadingPanel label="Building risk model" />;
  if (error || !data)
    return (
      <ErrorPanel
        message={(error as Error | null)?.message ?? "No risk data available."}
        onRetry={() => refetch()}
      />
    );

  const severityCounts = (["critical", "high", "medium", "low"] as const).map((level) => ({
    level,
    count: data.threats.filter((t) => t.severity === level).length,
  }));

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="label-mono text-primary">Cyber Risk Analytics</span>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold">Global Risk Dashboard</h1>
          <p className="mt-1.5 max-w-2xl text-xs sm:text-sm text-muted-foreground">
            Current global threat posture, category distribution, and incident impact severity.
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs sm:text-sm font-medium hover:bg-secondary transition-colors cursor-pointer"
        >
          <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin text-primary" : ""}`} />
          <span>Refresh Analysis</span>
        </button>
      </header>

      {/* Real-time Telemetry Reference */}
      <RealtimeClock variant="banner" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Risk Gauge */}
        <div className="panel flex flex-col items-center justify-center gap-3 p-6 text-center">
          <RiskMeter value={data.globalRiskPercent} size={190} />
          <div className="text-xs">
            <span className="font-mono text-muted-foreground">{data.riskTrend}</span>
            <p className="text-[0.68rem] text-muted-foreground mt-0.5">
              Calculated across 140+ intelligence endpoints
            </p>
          </div>
        </div>

        {/* Severity Spread */}
        <div className="panel p-5 sm:p-6">
          <span className="label-mono">Severity Spread</span>
          <div className="mt-4 space-y-3.5">
            {severityCounts.map(({ level, count }) => (
              <div key={level}>
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className={severityStyles[level].text}>{severityStyles[level].label}</span>
                  <span className="font-mono">{count} incidents</span>
                </div>
                <div className="mt-1.5">
                  <RiskBar value={(count / Math.max(1, data.threats.length)) * 100} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-4">
            <div>
              <span className="label-mono text-[0.68rem]">Incidents Tracked</span>
              <p className="font-display text-xl sm:text-2xl font-bold">{data.activeIncidents}</p>
            </div>
            <div>
              <span className="label-mono text-[0.68rem]">Impacted Scope</span>
              <p className="font-display text-xl sm:text-2xl font-bold truncate">
                {data.peopleAffectedLabel}
              </p>
            </div>
          </div>
        </div>

        {/* Attack Category Breakdown Chart */}
        <div className="panel p-5 sm:p-6 md:col-span-2 lg:col-span-1">
          <span className="label-mono">Attack Category Breakdown</span>
          <div className="mt-4 h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.categoryBreakdown}
                layout="vertical"
                margin={{ left: 8, right: 16 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {data.categoryBreakdown.map((entry, i) => (
                    <Cell key={entry.name} fill={chartColors[i % chartColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Responsive Threats Table with "Open Original Source" buttons */}
      <div className="panel overflow-hidden">
        <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-semibold text-sm sm:text-base">Tracked Threat Register</h3>
            <p className="text-xs text-muted-foreground">
              Ranked by assessed probability and severity score with direct source documentation.
            </p>
          </div>
          <span className="label-mono text-xs">{data.threats.length} entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[650px]">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                {["Threat", "Category", "Severity", "Risk", "Affected", "Source", "Action"].map(
                  (h) => (
                    <th key={h} className="px-4 py-3 label-mono text-xs font-semibold">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {[...data.threats]
                .sort((a, b) => b.riskPercent - a.riskPercent)
                .map((t) => {
                  const sourceLink =
                    t.sourceUrl ||
                    `https://www.google.com/search?q=${encodeURIComponent(t.title + " cybersecurity advisory")}`;

                  return (
                    <tr key={t.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="max-w-[20rem] px-4 py-3 font-medium text-foreground">
                        <button
                          type="button"
                          onClick={() => setSelectedThreat(t)}
                          className="text-left hover:text-primary hover:underline"
                        >
                          {t.title}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{t.category}</td>
                      <td
                        className={`px-4 py-3 text-xs font-semibold ${severityStyles[t.severity].text}`}
                      >
                        {severityStyles[t.severity].label}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{Math.round(t.riskPercent)}%</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {t.affectedPeople}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground truncate max-w-[140px]">
                        {t.source}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedThreat(t)}
                            className="flex items-center gap-1 rounded bg-secondary px-2 py-1 text-xs font-medium text-foreground hover:bg-secondary/80"
                            title="Inspect Threat Dossier"
                          >
                            <Eye className="size-3" />
                            <span>Details</span>
                          </button>
                          <a
                            href={sourceLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 rounded bg-primary/90 px-2 py-1 text-xs font-medium text-primary-foreground hover:bg-primary shadow-xs"
                            title="Open original source advisory"
                          >
                            <span>Source</span>
                            <ExternalLink className="size-3" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

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
