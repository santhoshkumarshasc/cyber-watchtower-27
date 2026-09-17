import { z } from "zod";

export const severityLevels = ["critical", "high", "medium", "low"] as const;

export const documentSchema = z.object({
  title: z.string(),
  issuer: z.string(),
  kind: z.string(),
});

export const threatSchema = z.object({
  id: z.string(),
  title: z.string(),
  source: z.string(),
  category: z.string(),
  severity: z.enum(severityLevels),
  riskPercent: z.number(),
  affectedPeople: z.string(),
  regions: z.array(z.string()),
  summary: z.string(),
  recommendedAction: z.string(),
  publishedLabel: z.string(),
  documents: z.array(documentSchema),
});

export const awarenessSchema = z.object({
  title: z.string(),
  audience: z.string(),
  body: z.string(),
  steps: z.array(z.string()),
});

export const briefingSchema = z.object({
  generatedLabel: z.string(),
  globalRiskPercent: z.number(),
  riskTrend: z.string(),
  headline: z.string(),
  activeIncidents: z.number(),
  peopleAffectedLabel: z.string(),
  categoryBreakdown: z.array(z.object({ name: z.string(), value: z.number() })),
  threats: z.array(threatSchema),
  awareness: z.array(awarenessSchema),
});

export type Briefing = z.infer<typeof briefingSchema>;
export type Threat = z.infer<typeof threatSchema>;
export type Severity = (typeof severityLevels)[number];

export const severityStyles: Record<Severity, { text: string; bg: string; label: string }> = {
  critical: { text: "text-critical", bg: "bg-critical/15 border-critical/40", label: "Critical" },
  high: { text: "text-high", bg: "bg-high/15 border-high/40", label: "High" },
  medium: { text: "text-medium", bg: "bg-medium/15 border-medium/40", label: "Medium" },
  low: { text: "text-low", bg: "bg-low/15 border-low/40", label: "Low" },
};
