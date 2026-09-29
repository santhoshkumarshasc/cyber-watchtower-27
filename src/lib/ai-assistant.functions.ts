import { createServerFn } from "@tanstack/react-start";
import { GoogleGenAI } from "@google/genai";

export interface AgentChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp?: string;
}

export interface AskCyberAgentPayload {
  messages: Array<{ role: "user" | "model"; content: string }>;
  context?: string;
}

export interface AskCyberAgentResponse {
  reply: string;
  suggestedActions?: string[];
  suggestedCommands?: string[];
  sourceModel: string;
}

const SYSTEM_INSTRUCTION = `You are CyberGuard SOC AI Agent, an elite frontline cybersecurity response, incident triage, and remediation assistant.
You assist security operators, developers, systems engineers, and daily users with:
1. Emergency incident containment, isolation, and virtual patching.
2. Step-by-step terminal execution, package downloads, and installation guidance.
3. CVE analysis, exploit mechanics, and zero-day threat analysis.
4. Cryptographic integrity verification (SHA-256, GPG signatures, SBOM).
5. Safe rollback procedures and system audit verification commands.

GUIDELINES:
- Provide clear, security-hardened terminal commands formatted in markdown \`\`\`bash code blocks.
- When given specific threat or software context, directly address that software, its vulnerable components, and verified mitigation.
- Keep responses concise, authoritative, practical, and action-oriented.
- Highlight safety caveats before executing destructive or service-restarting commands.`;

function getFallbackCyberReply(query: string, context?: string): AskCyberAgentResponse {
  const q = query.toLowerCase();
  const ctx = (context || "").toLowerCase();

  if (
    q.includes("download") ||
    q.includes("verify") ||
    q.includes("sha256") ||
    q.includes("checksum")
  ) {
    return {
      reply: `### Package Download & Integrity Verification Guide

To securely verify any downloaded security binary or patch archive before execution:

1. **Verify SHA-256 Checksum:**
\`\`\`bash
# Calculate SHA-256 hash of downloaded artifact
sha256sum <downloaded_file.tar.gz>

# Or verify against upstream checksum manifest
sha256sum -c checksums.txt 2>&1 | grep -i "ok"
\`\`\`

2. **Verify Digital Signature (GPG):**
\`\`\`bash
# Import vendor release public key
gpg --keyserver keys.openpgp.org --recv-keys <RELEASE_KEY_ID>

# Verify signature
gpg --verify <file>.tar.gz.asc <file>.tar.gz
\`\`\`

3. **Safe Execution Sandbox:**
Execute first inside an isolated test container or staging host prior to production rollout.`,
      suggestedActions: ["Calculate SHA-256", "Review Release Signature", "Run in Docker Sandbox"],
      suggestedCommands: ["sha256sum <file>", "chmod +x <binary>", "sudo ./<binary> --version"],
      sourceModel: "CyberGuard Offline SOC Intelligence",
    };
  }

  if (q.includes("xz") || ctx.includes("xz") || q.includes("cve-2024-3094")) {
    return {
      reply: `### Analysis & Emergency Fix for CVE-2024-3094 (XZ / Liblzma Backdoor)

**Vulnerability Summary:** A malicious backdoor injected into upstream XZ/liblzma versions 5.6.0 and 5.6.1 compromised OpenSSH \`sshd\` authentication routines via systemd linkage.

**Immediate Remediation Command:**
\`\`\`bash
# 1. Inspect current xz-utils version installed
xz --version

# 2. Downgrade/Upgrade to safe release (5.4.x or 5.6.1-patch)
sudo apt-get update && sudo apt-get install --allow-downgrades -y xz-utils=5.4.5-0.3

# 3. Restart SSH daemon safely
sudo systemctl restart ssh || sudo service sshd restart
\`\`\`

**Verification Audit:**
\`\`\`bash
strings $(which xz) | grep -i "5.6.[01]" || echo "XZ safe and uncompromised"
\`\`\``,
      suggestedActions: [
        "Downgrade xz-utils",
        "Verify SSH daemon status",
        "Check active network sockets",
      ],
      suggestedCommands: ["xz --version", "sudo systemctl restart ssh", "ss -tlpn | grep :22"],
      sourceModel: "CyberGuard Offline SOC Intelligence",
    };
  }

  if (q.includes("log4j") || ctx.includes("log4j") || q.includes("cve-2021-44228")) {
    return {
      reply: `### Analysis & Mitigation for Log4Shell (CVE-2021-44228)

**Vulnerability Summary:** Remote Code Execution via JNDI lookup strings in Apache Log4j2 versions 2.0-beta9 to 2.14.1.

**Immediate Mitigation:**
\`\`\`bash
# JVM Flag Hot-Mitigation (prevents JNDI lookup exploitation without code rebuild):
export JAVA_TOOL_OPTIONS="-Dlog4j2.formatMsgNoLookups=true"

# Automated Vulnerability Scan with Trivy:
trivy fs --scanners vuln /app/java-service
\`\`\`

**Permanent Fix:**
Upgrade all \`log4j-core\` dependencies to **2.17.1+** (Java 8) or **2.12.4+** (Java 7).`,
      suggestedActions: ["Set JVM Flag", "Scan with Trivy", "Upgrade pom.xml / build.gradle"],
      suggestedCommands: [
        'export JAVA_TOOL_OPTIONS="-Dlog4j2.formatMsgNoLookups=true"',
        "trivy fs --scanners vuln .",
      ],
      sourceModel: "CyberGuard Offline SOC Intelligence",
    };
  }

  if (q.includes("rollback") || q.includes("revert") || q.includes("undo")) {
    return {
      reply: `### Safe Rollback Procedure

If applying a security patch or software release produces unexpected service degradation:

1. **Service Rollback Command:**
\`\`\`bash
# For Debian/Ubuntu APT:
sudo apt-get install --allow-downgrades <package>=<previous_stable_version>

# For Docker / Container deployments:
docker service rollback <service_name>
# or Docker Compose:
docker compose -f docker-compose.prod.yml down && docker compose -f docker-compose.previous.yml up -d
\`\`\`

2. **Configuration Recovery:**
\`\`\`bash
# Restore previous backup configuration file
sudo cp /etc/<service>/config.conf.bak /etc/<service>/config.conf
sudo systemctl daemon-reload && sudo systemctl restart <service>
\`\`\``,
      suggestedActions: [
        "Verify Backup Config",
        "Execute Container Rollback",
        "Check Service Logs",
      ],
      suggestedCommands: ["journalctl -u <service> -e -n 50", "systemctl status <service>"],
      sourceModel: "CyberGuard Offline SOC Intelligence",
    };
  }

  // General Cyber Guidance
  return {
    reply: `### CyberGuard Frontline SOC Assistance

Regarding **${context ? context : "your cyber security query"}**:

Here is the recommended triage protocol:
1. **Perimeter Inspection:** Audit listening ports and inbound connections (\`ss -tulpn\`).
2. **Virtual Patching:** Apply upstream vendor hotfix or firewall containment rule immediately.
3. **Integrity Validation:** Run automated AST / container scans using open source tooling (**Trivy**, **Falco**, or **OSquery**).

\`\`\`bash
# Quick telemetry snapshot:
who -u
last -n 5
ps aux --sort=-%cpu | head -n 10
\`\`\`

Let me know if you would like step-by-step verification commands, rollback scripts, or specific CVE exploit analysis!`,
    suggestedActions: ["Show Verification Steps", "Provide Rollback Plan", "Check Listening Ports"],
    suggestedCommands: ["ss -tulpn", "trivy fs .", "journalctl -p 3 -xb"],
    sourceModel: "CyberGuard Offline SOC Intelligence",
  };
}

export const askCyberAgent = createServerFn({ method: "POST" })
  .validator((data: AskCyberAgentPayload) => data)
  .handler(async ({ data }): Promise<AskCyberAgentResponse> => {
    const geminiKey = process.env.GEMINI_API_KEY || "";
    const lastUserMessage = data.messages[data.messages.length - 1]?.content || "";

    if (!geminiKey) {
      return getFallbackCyberReply(lastUserMessage, data.context);
    }

    try {
      const ai = new GoogleGenAI({
        apiKey: geminiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const conversationHistory = data.messages.map((m) => ({
        role: m.role === "user" ? ("user" as const) : ("model" as const),
        parts: [{ text: m.content }],
      }));

      const contextPrompt = data.context ? `\n\n[ACTIVE INCIDENT CONTEXT]:\n${data.context}\n` : "";

      // Append system instruction and context to prompt
      const promptWithContext = `${SYSTEM_INSTRUCTION}${contextPrompt}\n\nUser request: ${lastUserMessage}`;

      const candidateModels = ["gemini-2.5-flash", "gemini-3.1-flash-lite"];

      for (const model of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: [
              ...conversationHistory.slice(0, -1),
              { role: "user", parts: [{ text: promptWithContext }] },
            ],
            config: {
              temperature: 0.3,
              maxOutputTokens: 1024,
            },
          });

          const replyText = response.text?.trim();
          if (replyText) {
            // Extract commands if any
            const codeBlockRegex = /```(?:bash|sh|zsh)?\n([\s\S]*?)```/g;
            const extractedCommands: string[] = [];
            let match;
            while ((match = codeBlockRegex.exec(replyText)) !== null) {
              const cmdLines = match[1]
                .split("\n")
                .map((l) => l.trim())
                .filter((l) => l && !l.startsWith("#"));
              if (cmdLines[0]) extractedCommands.push(cmdLines[0]);
            }

            return {
              reply: replyText,
              suggestedActions: [
                "Verify SHA-256 Checksum",
                "Explain Rollback Procedure",
                "Run Verification Healthcheck",
              ],
              suggestedCommands: extractedCommands.slice(0, 3),
              sourceModel: model,
            };
          }
        } catch {
          continue;
        }
      }

      return getFallbackCyberReply(lastUserMessage, data.context);
    } catch {
      return getFallbackCyberReply(lastUserMessage, data.context);
    }
  });
