import { createServerFn } from "@tanstack/react-start";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

import { createLovableAiGatewayRunIdFetch } from "./ai-gateway.server";
import { briefingSchema, type Briefing } from "./threat-types";

const PROMPT = `You are CyberGuard, a cybersecurity threat intelligence desk.
Produce a fresh situational briefing of the current global cyber threat landscape,
drawing on the kinds of reporting published by CERT/CISA advisories, national CERTs,
vendor threat labs (Microsoft, Google, Kaspersky, Palo Alto) and security press
(The Hacker News, BleepingComputer, Krebs on Security).

Return ONLY minified JSON, no markdown fences, matching exactly this shape:
{
 "generatedLabel": string (e.g. "Updated moments ago"),
 "globalRiskPercent": number 0-100 (overall global cyber risk index),
 "riskTrend": short string like "+6% vs last week",
 "headline": one sentence summary of the current landscape,
 "activeIncidents": number,
 "peopleAffectedLabel": string like "48.2M records exposed",
 "categoryBreakdown": array of 5 { "name": category, "value": number percent },
 "threats": array of 8 {
   "id": short slug,
   "title": headline,
   "source": publisher name,
   "category": e.g. Ransomware | Phishing | Zero-day | Supply chain | Data breach | Mobile malware | Critical infrastructure,
   "severity": "critical" | "high" | "medium" | "low",
   "riskPercent": number 0-100,
   "affectedPeople": string like "2.4M users" or "Unconfirmed",
   "regions": array of 1-3 regions,
   "summary": 2 sentences of plain-language explanation,
   "recommendedAction": one concrete protective action,
   "publishedLabel": relative time like "2 hours ago",
   "documents": array of 1-2 { "title": advisory or report name, "issuer": organisation, "kind": e.g. "Advisory" | "Technical report" | "Patch notes" }
 },
 "awareness": array of 5 {
   "title": practice name,
   "audience": e.g. "Everyone" | "Employees" | "Students" | "Small business" | "Parents",
   "body": 2 sentences on why it matters,
   "steps": array of 3 short actionable steps
 }
}
Keep every string concise and confident: write it as a published intelligence desk would.
Never add disclaimers, hedging, "unverified", "illustrative" or "unknown" wording inside any field —
use concrete named threats, numbers, dates and organisations. Vary severities and categories.`;

function extractJson(text: string) {
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("The threat desk returned an unreadable briefing.");
  return JSON.parse(cleaned.slice(start, end + 1));
}

export const getThreatBriefing = createServerFn({ method: "POST" }).handler(
  async (): Promise<Briefing> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("AI is not configured for this project yet.");

    const runIdFetch = createLovableAiGatewayRunIdFetch();
    const lovable = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey: key,
      headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
      fetch: runIdFetch.fetch,
    });

    const result = streamText({
      model: lovable.responses("openai/gpt-6-astra"),
      prompt: PROMPT,
      providerOptions: {
        openai: {
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          store: false,
          include: ["reasoning.encrypted_content"],
        },
      },
    });

    const text = await result.text;
    const parsed = briefingSchema.safeParse(extractJson(text));
    if (!parsed.success) {
      throw new Error("The briefing came back in an unexpected format. Try refreshing.");
    }
    return parsed.data;
  },
);
