import { createServerFn } from "@tanstack/react-start";
import { GoogleGenAI } from "@google/genai";

import { briefingSchema, type Briefing } from "./threat-types";
import { getFallbackBriefing } from "./default-briefing";
import { filterVerifiedAvailableSourcesOnly } from "./threat-utils";

const PROMPT = `You are CyberGuard, an authoritative real-time cybersecurity threat intelligence desk.
Produce a fresh, urgent situational briefing of the current global cyber threat landscape,
strictly researching and verifying cybersecurity vulnerabilities across all computing platforms
and popular daily-usage applications (such as WhatsApp, Google Chrome, Apple iOS & Safari,
Microsoft Windows & Outlook, Telegram, Android OS & Google Play, Zoom Workplace, Adobe Acrobat Reader, and Signal).

CRITICAL DIRECTIVES:
1. STRICT SOURCE AVAILABILITY RULE: ONLY collect and include threats and news items that have confirmed, active, accessible, and publicly available official security advisory pages.
2. IF A SOURCE OR ADVISORY PAGE IS NOT AVAILABLE OR UNCONFIRMED, DO NOT INCLUDE THAT THREAT OR NEWS ITEM ON THE WEBPAGE.
3. Every "sourceUrl" MUST be an actual, working, authoritative URL from official entities (e.g. https://www.cisa.gov/, https://nvd.nist.gov/, https://chromereleases.googleblog.com/, https://support.apple.com/, https://msrc.microsoft.com/, https://www.whatsapp.com/security/advisories/, https://www.zoom.com/en/trust/security-bulletin/, https://helpx.adobe.com/security/, https://source.android.com/security/bulletin).
4. Focus on vulnerabilities affecting popular apps and operating platforms used by millions of daily users.

Return ONLY valid JSON with no markdown fences, matching exactly this structure:
{
  "generatedLabel": "Live Intelligence Desk · Verified Source Audit",
  "globalRiskPercent": 82,
  "riskTrend": "+4% vs last 24h",
  "headline": "Authoritative headline summarizing verified zero-days and vulnerabilities across daily-use apps and OS platforms",
  "activeIncidents": 154,
  "peopleAffectedLabel": "3.4 Billion daily active app users",
  "categoryBreakdown": [
    { "name": "Browser & Web Engines", "value": 32 },
    { "name": "Daily Messaging & VoIP", "value": 28 },
    { "name": "Mobile OS & Kernel", "value": 22 },
    { "name": "Workplace & Office Apps", "value": 18 }
  ],
  "breakingNews": [
    {
      "id": "news-1",
      "title": "Headline of urgent verified cyber news",
      "source": "Official Agency or Vendor Lab (e.g. Google Chrome Releases / Apple Support / CISA KEV / MSRC)",
      "sourceUrl": "https://www.cisa.gov/known-exploited-vulnerabilities-catalog",
      "timestamp": "15m ago",
      "category": "Zero-day / Browser / Mobile",
      "summary": "Concise 1-2 sentence breakdown of impact on everyday users and confirmed patch",
      "urgency": "critical" | "high" | "medium" | "info"
    }
  ],
  "threats": [
    {
      "id": "short-unique-slug",
      "title": "Clear informative title specifying the app or platform (e.g. Google Chrome, WhatsApp, Apple iOS, Windows Outlook)",
      "appName": "Name of popular daily app (e.g. WhatsApp / Google Chrome / Apple Safari / Microsoft Outlook / Telegram / Zoom / Android OS / Adobe Acrobat)",
      "platform": "Operating platform (e.g. iOS & Android / Windows & macOS / Cross-Platform)",
      "source": "CISA KEV / NIST NVD / Google Chrome Security / Apple Support / MSRC",
      "sourceUrl": "https://nvd.nist.gov/vuln/detail/CVE-XXXX-XXXX",
      "sourceAvailable": true,
      "category": "Zero-day" | "Daily Messaging & VoIP" | "Browser & Web Engines" | "Mobile OS & Kernel" | "Workplace & Office",
      "severity": "critical" | "high" | "medium" | "low",
      "riskPercent": 88,
      "affectedPeople": "e.g. 2.5 Billion mobile accounts / Global enterprise",
      "regions": ["North America", "Europe", "Asia-Pacific", "Global"],
      "summary": "2 sentences describing exploitation mechanics, vulnerable components, and user impact",
      "recommendedAction": "Concrete immediate defense action (e.g. update app from App Store / Google Play / Settings)",
      "publishedLabel": "22 minutes ago",
      "cveList": ["CVE-2024-XXXX"],
      "attackVector": "Exploit mechanism e.g. Pre-auth RCE / Memory Corruption / WebP Parsing / Drive-by Web",
      "mitreTactics": ["T1190 - Exploit Public-Facing Application", "T1204 - User Execution"],
      "indicatorsOfCompromise": ["File hash / Memory pattern / URI link"],
      "impactSummary": "Brief consequence summary",
      "documents": [
        {
          "title": "Official Advisory Title",
          "issuer": "Issuing Agency or Vendor PSIRT",
          "kind": "Advisory" | "Technical Report" | "Emergency Directive" | "Patch Notes",
          "url": "https://nvd.nist.gov/"
        }
      ]
    }
  ],
  "awareness": [
    {
      "title": "Practice name",
      "audience": "Everyone" | "Employees" | "Developers & IT" | "Small business",
      "body": "2 sentences explaining the critical defense rationale for daily app hygiene",
      "steps": ["Actionable step 1", "Actionable step 2", "Actionable step 3"]
    }
  ]
}
Ensure every threat has a confirmed and available sourceUrl. If any threat lacks an available source page, omit it.`;

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

const CACHE_TTL_MS = 60 * 1000; // 1 minute fresh cache for real-time cadence
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
        // Enforce strict source verification: discard any threat or news without an available, active source URL
        const data = parsed.data;
        data.threats = filterVerifiedAvailableSourcesOnly(data.threats);
        if (data.breakingNews) {
          data.breakingNews = filterVerifiedAvailableSourcesOnly(data.breakingNews);
        }
        if (data.threats.length > 0) {
          return data;
        }
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
      if (cachedBriefing?.data) return cachedBriefing.data;
      const fb = getFallbackBriefing();
      fb.threats = filterVerifiedAvailableSourcesOnly(fb.threats);
      return fb;
    }

    // 4. Initiate generation with deduplication
    inFlightRequest = (async () => {
      const geminiKey = process.env["GEMINI_API_KEY"];
      if (geminiKey) {
        try {
          const liveBriefing = await generateLiveBriefingWithFallback(geminiKey);
          if (liveBriefing && liveBriefing.threats.length > 0) {
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
      fallback.threats = filterVerifiedAvailableSourcesOnly(fallback.threats);
      if (fallback.breakingNews) {
        fallback.breakingNews = filterVerifiedAvailableSourcesOnly(fallback.breakingNews);
      }
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
