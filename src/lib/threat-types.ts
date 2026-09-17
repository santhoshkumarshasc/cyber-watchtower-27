import { z } from "zod";

export const severityLevels = ["critical", "high", "medium", "low"] as const;

export const documentSchema = z.object({
  title: z.string().default("Advisory Report"),
  issuer: z.string().default("Threat Intelligence Lab"),
  kind: z.string().default("Advisory"),
  url: z.string().optional(),
});

export const threatSchema = z.object({
  id: z.string().default(() => `threat-${Math.random().toString(36).slice(2, 9)}`),
  title: z.string(),
  source: z.string().default("Global Cyber Desk"),
  sourceUrl: z.string().optional(),
  category: z.string().default("General Threat"),
  severity: z.enum(severityLevels).catch("high"),
  riskPercent: z.number().catch(75),
  affectedPeople: z.string().default("Enterprise networks"),
  regions: z.array(z.string()).default(["Global"]),
  summary: z.string(),
  recommendedAction: z
    .string()
    .default("Implement defense-in-depth isolation and audit access logs."),
  publishedLabel: z.string().default("Recently detected"),
  documents: z.array(documentSchema).default([]),
  cveList: z.array(z.string()).optional().default([]),
  attackVector: z.string().optional().default("Network ingress"),
  mitreTactics: z.array(z.string()).optional().default([]),
  indicatorsOfCompromise: z.array(z.string()).optional().default([]),
  impactSummary: z.string().optional().default("Elevated risk of infrastructure breach"),
});

export const newsItemSchema = z.object({
  id: z.string().default(() => `news-${Math.random().toString(36).slice(2, 9)}`),
  title: z.string(),
  source: z.string().default("Cyber Threat Wire"),
  sourceUrl: z.string().default("https://www.cisa.gov/news-events/cybersecurity-advisories"),
  timestamp: z.string().default("Just now"),
  category: z.string().default("Security Bulletin"),
  summary: z.string(),
  urgency: z.enum(["critical", "high", "medium", "info"]).catch("high"),
});

export const awarenessSchema = z.object({
  title: z.string(),
  audience: z.string().default("All Users"),
  body: z.string(),
  steps: z.array(z.string()).default([]),
});

export const briefingSchema = z.object({
  generatedLabel: z.string().default("Live Briefing"),
  globalRiskPercent: z.number().catch(76),
  riskTrend: z.string().default("+3% vs last 24h"),
  headline: z.string(),
  activeIncidents: z.number().catch(140),
  peopleAffectedLabel: z.string().default("Enterprise networks under monitoring"),
  categoryBreakdown: z.array(z.object({ name: z.string(), value: z.number() })).default([]),
  threats: z.array(threatSchema),
  awareness: z.array(awarenessSchema).default([]),
  breakingNews: z.array(newsItemSchema).optional().default([]),
});

export type Briefing = z.infer<typeof briefingSchema>;
export type Threat = z.infer<typeof threatSchema>;
export type DocumentRef = z.infer<typeof documentSchema>;
export type NewsItem = z.infer<typeof newsItemSchema>;
export type Severity = (typeof severityLevels)[number];

export const severityStyles: Record<Severity, { text: string; bg: string; label: string }> = {
  critical: { text: "text-critical", bg: "bg-critical/15 border-critical/40", label: "Critical" },
  high: { text: "text-high", bg: "bg-high/15 border-high/40", label: "High" },
  medium: { text: "text-medium", bg: "bg-medium/15 border-medium/40", label: "Medium" },
  low: { text: "text-low", bg: "bg-low/15 border-low/40", label: "Low" },
};
