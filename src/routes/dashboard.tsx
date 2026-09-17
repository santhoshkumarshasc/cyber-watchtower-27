import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { ErrorPanel, LoadingPanel } from "@/components/cyber/States";
import { RiskBar, RiskMeter } from "@/components/cyber/RiskMeter";
import { briefingQueryOptions } from "@/lib/threat-queries";
import { severityStyles } from "@/lib/threat-types";

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

const chartColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function DashboardPage() {
  const { data, isPending, error, refetch } = useQuery(briefingQueryOptions);

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
      <header>
        <span className="label-mono text-primary">Analytics</span>
        <h1 className="mt-2 text-3xl font-bold">Risk dashboard</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          How dangerous the current landscape is, where the pressure is coming from, and which
          incidents are hitting the most people.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="panel flex flex-col items-center justify-center gap-3 p-6">
          <RiskMeter value={data.globalRiskPercent} size={200} />
          <p className="font-mono text-xs text-muted-foreground">{data.riskTrend}</p>
        </div>

        <div className="panel p-6">
          <span className="label-mono">Severity spread</span>
          <div className="mt-4 space-y-4">
            {severityCounts.map(({ level, count }) => (
              <div key={level}>
                <div className="flex items-center justify-between text-sm">
                  <span className={severityStyles[level].text}>{severityStyles[level].label}</span>
                  <span className="font-mono">{count}</span>
                </div>
                <div className="mt-1.5">
                  <RiskBar value={(count / Math.max(1, data.threats.length)) * 100} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-4">
            <div>
              <span className="label-mono">Incidents</span>
              <p className="font-display text-2xl font-bold">{data.activeIncidents}</p>
            </div>
            <div>
              <span className="label-mono">People affected</span>
              <p className="font-display text-2xl font-bold">{data.peopleAffectedLabel}</p>
            </div>
          </div>
        </div>

        <div className="panel p-6">
          <span className="label-mono">Attack categories</span>
          <div className="mt-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.categoryBreakdown} layout="vertical" margin={{ left: 8 }}>
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
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

      <div className="panel overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              {["Threat", "Category", "Severity", "Risk", "Affected", "Source"].map((h) => (
                <th key={h} className="px-4 py-3 label-mono">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...data.threats]
              .sort((a, b) => b.riskPercent - a.riskPercent)
              .map((t) => (
                <tr key={t.id} className="border-b border-border/60 last:border-0">
                  <td className="max-w-[22rem] px-4 py-3 font-medium">{t.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.category}</td>
                  <td className={`px-4 py-3 ${severityStyles[t.severity].text}`}>
                    {severityStyles[t.severity].label}
                  </td>
                  <td className="px-4 py-3 font-mono">{Math.round(t.riskPercent)}%</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.affectedPeople}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.source}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
