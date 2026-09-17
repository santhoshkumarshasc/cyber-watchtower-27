import { useState } from "react";
import {
  AlertTriangle,
  Send,
  Zap,
  ShieldAlert,
  Radio,
  X,
  Plus,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  saveCustomThreatAlert,
  getCustomThreatAlerts,
  deleteCustomThreatAlert,
} from "@/lib/threat-utils";
import {
  playAlertChime,
  getStoredAlerts,
  saveStoredAlerts,
  type NotificationAlert,
} from "@/lib/notification-manager";
import { severityStyles, type Threat, type SeverityLevel } from "@/lib/threat-types";

interface QuickAlertModalProps {
  onAlertDispatched?: (newThreat: Threat) => void;
  triggerButton?: React.ReactNode;
}

const PRESET_TEMPLATES = [
  {
    name: "Zero-Day Edge Exploit",
    title: "Active Remote Code Execution in Gateway Ingress",
    category: "Zero-day",
    severity: "critical" as SeverityLevel,
    riskPercent: 98,
    affectedPeople: "High-value enterprise perimeter",
    attackVector: "Pre-Auth TCP/443 Heap Corruption",
    cve: "CVE-2026-9041",
    action: "Block public WAN access to management port and isolate gateway behind VPN.",
    summary: "Immediate unauthenticated RCE detected actively exploited in the wild.",
  },
  {
    name: "Enterprise Ransomware",
    title: "BlackCat Variant Rapid Lateral Infiltration",
    category: "Ransomware",
    severity: "critical" as SeverityLevel,
    riskPercent: 92,
    affectedPeople: "Corporate Active Directory Domain",
    attackVector: "Compromised Service Account Credentials + WMI",
    cve: "N/A - Credential Abuse",
    action: "Disable compromised AD accounts and activate isolated backup immutable vaults.",
    summary: "High-speed encryption binary detected propagating across internal subnets.",
  },
  {
    name: "Supply Chain Injection",
    title: "Poisoned CI/CD Pipeline Package Stealing Build Tokens",
    category: "Supply chain",
    severity: "high" as SeverityLevel,
    riskPercent: 86,
    affectedPeople: "Production build environments",
    attackVector: "Typosquatted build tool dependency",
    cve: "GHSA-2026-09x",
    action: "Pin exact package hashes in lockfile and rotate production deploy keys.",
    summary: "Postinstall scripts actively exfiltrating cloud secrets to attacker telemetry.",
  },
  {
    name: "Deepfake Executive Phishing",
    title: "Voice Clone & Synthetic Video CFO Wire Fraud Campaign",
    category: "Phishing",
    severity: "medium" as SeverityLevel,
    riskPercent: 74,
    affectedPeople: "Finance & Accounts Payable Staff",
    attackVector: "Spear-phishing + Real-time AI Audio Synthesis",
    cve: "N/A - Social Engineering",
    action: "Mandate secondary verbal out-of-band verification for transfers over $10,000.",
    summary: "Sophisticated impersonation using cloned executive voices targeting wire desks.",
  },
];

export function QuickAlertModal({ onAlertDispatched, triggerButton }: QuickAlertModalProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Zero-day");
  const [severity, setSeverity] = useState<SeverityLevel>("critical");
  const [riskPercent, setRiskPercent] = useState(90);
  const [affectedPeople, setAffectedPeople] = useState("Enterprise network endpoints");
  const [summary, setSummary] = useState("");
  const [action, setAction] = useState("");
  const [cve, setCve] = useState("");
  const [attackVector, setAttackVector] = useState("");
  const [ioc, setIoc] = useState("");

  const applyTemplate = (tmpl: (typeof PRESET_TEMPLATES)[number]) => {
    setTitle(tmpl.title);
    setCategory(tmpl.category);
    setSeverity(tmpl.severity);
    setRiskPercent(tmpl.riskPercent);
    setAffectedPeople(tmpl.affectedPeople);
    setSummary(tmpl.summary);
    setAction(tmpl.action);
    setCve(tmpl.cve);
    setAttackVector(tmpl.attackVector);
  };

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim()) {
      toast.error("Please provide both an alert headline and summary.");
      return;
    }

    const threatId = `custom-alert-${Date.now()}`;
    const newThreat: Threat = {
      id: threatId,
      title: title.trim(),
      source: "SOC Operator Flash Alert",
      sourceUrl: "https://www.cisa.gov/news-events/cybersecurity-advisories",
      category,
      severity,
      riskPercent,
      affectedPeople: affectedPeople.trim() || "Monitored infrastructure",
      regions: ["Global", "Regional SOC"],
      summary: summary.trim(),
      recommendedAction:
        action.trim() || "Enforce zero-trust network isolation and inspect ingress telemetry.",
      publishedLabel: "Just now",
      cveList: cve.trim() ? [cve.trim()] : [],
      attackVector: attackVector.trim() || "Ingress Network Exploit",
      mitreTactics: ["T1190 - Initial Access", "T1078 - Defense Evasion"],
      indicatorsOfCompromise: ioc.trim() ? [ioc.trim()] : ["198.51.100.22", "ioc-telemetry.net"],
      impactSummary: "Immediate high-priority threat detected by operational desk.",
      documents: [
        {
          title: `Flash Advisory: ${title.trim()}`,
          issuer: "Internal Security Operations",
          kind: "Flash Directive",
        },
      ],
    };

    // 1. Save to custom threats
    saveCustomThreatAlert(newThreat);

    // 2. Play audible alert chime
    playAlertChime();

    // 3. Save to notification center history
    const existingAlerts = getStoredAlerts();
    const newNotification: NotificationAlert = {
      id: `alert-${Date.now()}`,
      threatId: newThreat.id,
      title: newThreat.title,
      severity: newThreat.severity,
      timestamp: Date.now(),
      source: newThreat.source,
      sourceUrl: newThreat.sourceUrl,
      read: false,
    };
    saveStoredAlerts([newNotification, ...existingAlerts]);

    // 4. Trigger desktop push notification if allowed
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      try {
        new Notification(`[FLASH ALERT ${severity.toUpperCase()}] ${title}`, {
          body: summary,
          icon: "/favicon.ico",
        });
      } catch {
        // Notification permission fallback
      }
    }

    // 5. Toast alert banner
    toast.error(`FLASH THREAT BROADCAST [${severity.toUpperCase()}]`, {
      description: title,
      duration: 6000,
    });

    if (onAlertDispatched) {
      onAlertDispatched(newThreat);
    }

    // Reset and close
    setTitle("");
    setSummary("");
    setAction("");
    setCve("");
    setIoc("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground shadow-xs hover:bg-destructive/90 transition-all cursor-pointer animate-pulse"
          >
            <Zap className="size-3.5" />
            <span>New Threat Quick Alert</span>
          </button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader className="border-b border-border/70 pb-3">
          <div className="flex items-center gap-2 text-destructive">
            <Radio className="size-4 animate-pulse" />
            <span className="label-mono text-xs uppercase tracking-wider">
              Emergency Broadcast Center
            </span>
          </div>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            Dispatch Quick Threat Alert
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Instantly broadcast a new cyber threat bulletin into the live intelligence stream.
            Dispatched alerts appear at the top in Recent-to-Past order with audio notification.
          </DialogDescription>
        </DialogHeader>

        {/* 1-Click Fast Templates */}
        <div className="space-y-2 py-2">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span className="flex items-center gap-1.5 label-mono text-[0.7rem] text-primary">
              <Sparkles className="size-3" /> Quick Incident Presets
            </span>
            <span className="text-[0.68rem]">Click to autofill form</span>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PRESET_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.name}
                type="button"
                onClick={() => applyTemplate(tmpl)}
                className="flex flex-col items-start p-2 rounded-md border border-border/80 bg-secondary/50 hover:bg-secondary hover:border-primary/50 text-left transition-colors cursor-pointer"
              >
                <span className="text-[0.72rem] font-semibold text-foreground truncate w-full">
                  {tmpl.name}
                </span>
                <span
                  className={`mt-1 inline-block px-1 py-0.2 rounded text-[0.6rem] font-mono uppercase ${severityStyles[tmpl.severity].badge}`}
                >
                  {tmpl.severity}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleDispatch} className="space-y-3.5 pt-1">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Alert Headline / Threat Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Active Zero-Day Exploit Detected in SSL VPN Ingress"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs sm:text-sm text-foreground outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as SeverityLevel)}
                className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary"
              >
                <option value="critical">Critical (P1)</option>
                <option value="high">High (P2)</option>
                <option value="medium">Medium (P3)</option>
                <option value="low">Low (P4)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary"
              >
                <option value="Zero-day">Zero-day</option>
                <option value="Ransomware">Ransomware</option>
                <option value="Supply chain">Supply chain</option>
                <option value="Phishing">Phishing</option>
                <option value="Mobile malware">Mobile malware</option>
                <option value="Cloud Security">Cloud Security</option>
                <option value="Credential Infiltration">Credential Infiltration</option>
              </select>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium text-foreground mb-1">
                Risk Score: {riskPercent}%
              </label>
              <input
                type="range"
                min="30"
                max="99"
                value={riskPercent}
                onChange={(e) => setRiskPercent(parseInt(e.target.value, 10))}
                className="w-full accent-primary h-2 cursor-pointer mt-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                CVE Identifier (optional)
              </label>
              <input
                type="text"
                value={cve}
                onChange={(e) => setCve(e.target.value)}
                placeholder="e.g. CVE-2026-3184"
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Affected Systems / Populations
              </label>
              <input
                type="text"
                value={affectedPeople}
                onChange={(e) => setAffectedPeople(e.target.value)}
                placeholder="e.g. 500K VPN gateway endpoints"
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Threat Summary &amp; Impact Analysis *
            </label>
            <textarea
              required
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Describe how the attack operates, affected versions, and potential blast radius..."
              className="w-full rounded-md border border-input bg-background p-2.5 text-xs sm:text-sm text-foreground outline-none focus:border-primary resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Recommended Containment / Mitigation
            </label>
            <input
              type="text"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="e.g. Apply vendor hotfix KB-50921 and revoke exposed service account tokens."
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Attack Vector
              </label>
              <input
                type="text"
                value={attackVector}
                onChange={(e) => setAttackVector(e.target.value)}
                placeholder="e.g. Remote Pre-Auth Buffer Overflow TCP/443"
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Indicators of Compromise (IP / Domain)
              </label>
              <input
                type="text"
                value={ioc}
                onChange={(e) => setIoc(e.target.value)}
                placeholder="e.g. 198.51.100.22, malicious-c2.net"
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md border border-input px-3.5 py-1.5 text-xs text-muted-foreground hover:bg-secondary cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-md bg-destructive px-4 py-1.5 text-xs font-semibold text-destructive-foreground hover:bg-destructive/90 cursor-pointer transition-colors shadow-xs"
            >
              <Send className="size-3.5" />
              <span>Broadcast Threat Alert</span>
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
