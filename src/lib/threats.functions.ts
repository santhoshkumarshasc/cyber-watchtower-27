import { createServerFn } from "@tanstack/react-start";
import { GoogleGenAI } from "@google/genai";

import { briefingSchema, type Briefing } from "./threat-types";
import { getFallbackBriefing } from "./default-briefing";

const PROMPT = `You are CyberGuard, an authoritative real-time cybersecurity threat intelligence desk.
Produce a fresh, urgent situational briefing of the current global cyber threat landscape,
drawing on the kinds of real reporting published by CISA/US-CERT, NIST NVD, national CERTs,
vendor threat labs (Microsoft Security, Google TAG, Mandiant, Kaspersky, Palo Alto Unit 42)
and premier cybersecurity intelligence press (The Hacker News, BleepingComputer, Krebs on Security, Dark Reading).

Return ONLY valid JSON with no markdown fences, matching exactly this structure:
{
  "generatedLabel": "Live Briefing",
  "globalRiskPercent": 78,
  "riskTrend": "+4% vs last 24h",
  "headline": "One authoritative headline summarizing today's active zero-days, ransomware extortion and infrastructure threats",
  "activeIncidents": 142,
  "peopleAffectedLabel": "54.8M accounts & endpoints",
  "categoryBreakdown": [
    { "name": "Zero-Day Exploits", "value": 34 },
    { "name": "Ransomware & Extortion", "value": 26 },
    { "name": "Supply Chain Infiltration", "value": 18 },
    { "name": "Phishing & Social Eng.", "value": 14 },
    { "name": "Data Breaches", "value": 8 }
  ],
  "breakingNews": [
    {
      "id": "news-1",
      "title": "Headline of urgent breaking cyber news",
      "source": "CISA / BleepingComputer / The Hacker News / KrebsOnSecurity",
      "sourceUrl": "https://www.cisa.gov/news-events/cybersecurity-advisories",
      "timestamp": "15m ago",
      "category": "Zero-day / Ransomware / Cloud / Breach",
      "summary": "Concise 1-2 sentence breakdown of what happened and immediate impact",
      "urgency": "critical" | "high" | "medium" | "info"
    }
  ],
  "threats": [
    {
      "id": "short-unique-slug",
      "title": "Clear informative title of threat or incident",
      "source": "CISA / FBI Cyber / Microsoft Threat Intelligence / etc",
      "sourceUrl": "https://www.cisa.gov/news-events/cybersecurity-advisories",
      "category": "Zero-day" | "Ransomware" | "Supply chain" | "Phishing" | "Data breach" | "Mobile malware" | "Critical infrastructure",
      "severity": "critical" | "high" | "medium" | "low",
      "riskPercent": 85,
      "affectedPeople": "e.g. 1.2M devices / 450K patients / Global enterprise",
      "regions": ["North America", "Europe", "Asia-Pacific"],
      "summary": "2 sentences describing attacker actions, exploitation mechanics and operational disruption",
      "recommendedAction": "Concrete immediate defense action (e.g. patch ID, firewall block, credential reset)",
      "publishedLabel": "22 minutes ago",
      "cveList": ["CVE-2026-XXXX"],
      "attackVector": "Exploit mechanism e.g. Pre-auth RCE / Memory Corruption / Spearphishing",
      "mitreTactics": ["T1190 - Exploit Public-Facing Application", "T1078 - Valid Accounts"],
      "indicatorsOfCompromise": ["IP / Hash / Registry entry"],
      "impactSummary": "Brief consequence summary",
      "documents": [
        {
          "title": "Official Advisory or Directive Title",
          "issuer": "Issuing Agency or Lab",
          "kind": "Advisory" | "Technical Report" | "Emergency Directive" | "Patch Notes",
          "url": "https://www.cisa.gov/"
        }
      ]
    }
  ],
  "awareness": [
    {
      "title": "Practice name",
      "audience": "Everyone" | "Employees" | "Developers & IT" | "Small business",
      "body": "2 sentences explaining the critical defense rationale",
      "steps": ["Actionable step 1", "Actionable step 2", "Actionable step 3"]
    }
  ]
}
Include 8 distinct, realistic threats with genuine CVE naming style and valid real-world source URLs (such as cisa.gov, nvd.nist.gov, bleepingcomputer.com, thehackernews.com, krebsonsecurity.com, ncsc.gov.uk).
Keep every string direct and professional.`;

function extractJson(text: string) {
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("Invalid briefing payload format");
  }
  return JSON.parse(cleaned.slice(start, end + 1));
}

// In-memory server-side cache and deduplication
let cachedBriefing: { data: Briefing; timestamp: number } | null = null;
let lastFailureTimestamp = 0;
let inFlightRequest: Promise<Briefing> | null = null;

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes fresh cache
const ERROR_COOLDOWN_MS = 60 * 1000; // 1 minute cooldown if all models fail
const CANDIDATE_MODELS = ["gemini-2.5-flash", "gemini-3.1-flash-lite", "gemini-3.8-flash"];

async function generateLiveBriefingWithFallback(geminiKey: string): Promise<Briefing | null> {
  const ai = new GoogleGenAI({
    apiKey: geminiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: PROMPT,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      });

      const text = response.text?.trim() ?? "";
      if (!text) continue;

      const rawJson = extractJson(text);
      const parsed = briefingSchema.safeParse(rawJson);
      if (parsed.success) {
        return parsed.data;
      }
    } catch {
      // Continue to next available model in the fallback chain
      continue;
    }
  }

  return null;
}

export const getThreatBriefing = createServerFn({ method: "POST" }).handler(
  async (): Promise<Briefing> => {
    const now = Date.now();

    // 1. Serve fresh cache if available
    if (cachedBriefing && now - cachedBriefing.timestamp < CACHE_TTL_MS) {
      return cachedBriefing.data;
    }

    // 2. Return in-flight request if generation is already running
    if (inFlightRequest) {
      return inFlightRequest;
    }

    // 3. If recent failure occurred within cooldown, serve previous cache or fallback immediately
    if (now - lastFailureTimestamp < ERROR_COOLDOWN_MS) {
      return cachedBriefing?.data ?? getFallbackBriefing();
    }

    // 4. Initiate generation with deduplication
    inFlightRequest = (async () => {
      const geminiKey = process.env["GEMINI_API_KEY"];
      if (geminiKey) {
        try {
          const liveBriefing = await generateLiveBriefingWithFallback(geminiKey);
          if (liveBriefing) {
            cachedBriefing = { data: liveBriefing, timestamp: Date.now() };
            return liveBriefing;
          }
        } catch {
          // Handled gracefully below
        }
      }

      // If generation failed across all models or key is not provided:
      lastFailureTimestamp = Date.now();

      // Return stale cache if available, otherwise authoritative fallback desk briefing
      if (cachedBriefing?.data) {
        return cachedBriefing.data;
      }

      const fallback = getFallbackBriefing();
      cachedBriefing = { data: fallback, timestamp: Date.now() };
      return fallback;
    })().finally(() => {
      inFlightRequest = null;
    });

    return inFlightRequest;
  },
);

export interface ChatMessagePayload {
  message: string;
  history?: { role: "user" | "model"; text: string }[];
}

export interface ChatBotResponse {
  answer: string;
  source: "gemini" | "local_soc_engine";
  suggestedFollowups?: string[];
  timestamp: string;
}

function getLocalSOCFallbackAnswer(query: string): string {
  const lower = query.toLowerCase();

  if (
    lower.includes("ransomware") ||
    lower.includes("encrypt") ||
    lower.includes("lockbit") ||
    lower.includes("blackcat")
  ) {
    return `### 🚨 Emergency Ransomware Containment Protocol (NIST SP 800-61 Rev 2)

**Immediate Triage Steps (T+0 to T+15m):**
1. **Network Isolation**: Physically disconnect infected endpoints from Wi-Fi and Ethernet immediately. **Do NOT power off** the machines (preserving RAM/swap artifacts for memory forensics).
2. **Revoke Active Tokens**: Enforce session invalidation and password resets across all Active Directory / Entra ID domain admin accounts.
3. **Isolate Backup Repositories**: Sever network connectivity to immutable and cloud backup targets to prevent double-extortion wiper scripts.
4. **Identify Ransom Strain**: Retrieve any ransom note or encrypted extension (e.g., \`.locked\`, \`.crypt\`) and cross-reference with CISA #StopRansomware resources.
5. **Report to Regulatory Authorities**: Contact local CERT or CISA Emergency Response (report@cisa.gov or 888-282-0870).`;
  }

  if (
    lower.includes("cve") ||
    lower.includes("vulnerability") ||
    lower.includes("exploit") ||
    lower.includes("zero-day")
  ) {
    return `### 🛡️ Vulnerability Analysis & Virtual Patching Advisory

**Remediation Workflow for Critical CVEs:**
- **Assess CVSS Vector**: Evaluate whether the flaw is pre-authentication Remote Code Execution (RCE) or requires internal lateral access.
- **Apply In-Line Virtual Patches**: Deploy Web Application Firewall (WAF) or Next-Gen Firewall (NGFW) custom inspection rules blocking payload signatures.
- **Isolate Affected Ports**: Restrict management consoles (SSH, RDP, Web GUI) from public internet exposure using Zero Trust Network Access (ZTNA) or VPN tunnels.
- **Audit Access Logs**: Search reverse proxy and syslog entries for anomalous POST requests or curl/wget user-agents around the disclosure window.`;
  }

  if (
    lower.includes("phish") ||
    lower.includes("email") ||
    lower.includes("credential") ||
    lower.includes("mfa")
  ) {
    return `### 🎣 Phishing & Credential Theft Containment Guide

**Incident Verification Steps:**
1. **Defang & Inspect**: Defang malicious links (e.g. \`hxxps://malicious[.]domain/login\`) and check SPF, DKIM, and DMARC alignment in RFC 822 headers.
2. **Revoke OAuth & Refresh Tokens**: An adversary utilizing Evilginx or adversary-in-the-middle (AiTM) can bypass SMS/Push MFA by stealing session cookies. Invalidate all active user sessions.
3. **Purge Mailbox Copies**: Issue an exchange transport rule to quarantine identical incoming subject lines across all employee inboxes.
4. **Enforce FIDO2 / Passkeys**: Transition high-risk users to phishing-resistant hardware security keys.`;
  }

  if (
    lower.includes("ioc") ||
    lower.includes("hash") ||
    lower.includes("ip") ||
    lower.includes("domain")
  ) {
    return `### 🔍 Threat Hunting & IOC Correlation Procedure

**Investigation Guidelines:**
- **Hash Lookup**: Verify SHA256 hashes against VirusTotal, AlienVault OTX, and CIRCL hash databases.
- **Network Telemetry**: Check DNS sinkhole logs and NetFlow records for outbound beacons matching known C2 IP ranges.
- **Threat Actor Attribution**: Check whether the IOC correlates with active campaigns (e.g., Volt Typhoon, Scattered Spider, or Lazarus Group).
- **Automated Blocklist**: Add malicious indicators to your perimeter EDR/SIEM threat intelligence feeds with a 30-day review TTL.`;
  }

  return `### 🛡️ CyberGuard SOC Operational Analysis

**Query**: "${query}"

**Recommended SOC Action Items:**
- **Perimeter Defense**: Review edge firewall ingress rules, disabling exposed management interfaces (RDP 3389, SSH 22, Telnet 23).
- **Telemetry Verification**: Ensure endpoint detection (EDR) sensors are reporting healthy status across critical server nodes.
- **Incident Response Readiness**: Maintain verified offline backups, test break-glass credentials, and consult CISA Known Exploited Vulnerabilities (KEV) daily.

*For specific playbooks, ask about ransomware containment, CVE virtual patching, phishing token revocation, or indicator hunting.*`;
}

export const askCyberChatbot = createServerFn({ method: "POST" })
  .validator((data: unknown): ChatMessagePayload => {
    if (typeof data !== "object" || data === null || !("message" in data)) {
      throw new Error("Invalid chatbot message format");
    }
    const record = data as Record<string, unknown>;
    return {
      message: String(record.message || "").trim(),
      history: Array.isArray(record.history)
        ? (record.history as { role: "user" | "model"; text: string }[])
        : [],
    };
  })
  .handler(async ({ data }): Promise<ChatBotResponse> => {
    const { message, history } = data;
    const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    if (!message) {
      return {
        answer: "Please provide a cybersecurity question, CVE identifier, or threat hunting query.",
        source: "local_soc_engine",
        timestamp: nowStr,
      };
    }

    const geminiKey = process.env["GEMINI_API_KEY"];
    if (geminiKey) {
      const ai = new GoogleGenAI({
        apiKey: geminiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const systemInstruction = `You are CyberGuard SOC AI, an elite tier-3 incident responder and threat intelligence specialist.
Provide clear, actionable, technical, and formatted cybersecurity analysis.
Use markdown headers, bullet points, and code blocks where appropriate for commands, IOCs, or configurations.
Focus on immediate containment, NIST/SANS incident handling procedures, MITRE ATT&CK mappings, and concrete defense steps.
Keep responses concise, authoritative, and helpful without unnecessary filler.`;

      const contents = [
        ...(history || []).map((h) => ({
          role: h.role === "user" ? ("user" as const) : ("model" as const),
          parts: [{ text: h.text }],
        })),
        { role: "user" as const, parts: [{ text: message }] },
      ];

      for (const model of ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-2.5-flash"]) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents,
            config: {
              systemInstruction,
              temperature: 0.4,
            },
          });

          const text = response.text?.trim();
          if (text) {
            return {
              answer: text,
              source: "gemini",
              suggestedFollowups: [
                "What are the immediate containment steps?",
                "Provide relevant MITRE ATT&CK tactics",
                "How do I verify if my systems are affected?",
              ],
              timestamp: nowStr,
            };
          }
        } catch {
          // Fall through to next model or local SOC engine
          continue;
        }
      }
    }

    // Fallback to local SOC expert engine
    return {
      answer: getLocalSOCFallbackAnswer(message),
      source: "local_soc_engine",
      suggestedFollowups: [
        "How do I isolate an endpoint with suspected ransomware?",
        "Explain CVE-2026-0814 and remediation",
        "Provide emergency incident response checklist",
      ],
      timestamp: nowStr,
    };
  });
