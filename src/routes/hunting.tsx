import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Crosshair,
  Search,
  ShieldAlert,
  ShieldCheck,
  Cpu,
  Terminal,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  ExternalLink,
  Eye,
  FileText,
  HelpCircle,
  Hash,
  Globe,
} from "lucide-react";

import { ErrorPanel, LoadingPanel } from "@/components/cyber/States";
import { ThreatDetailModal } from "@/components/cyber/ThreatDetailModal";
import { briefingQueryOptions } from "@/lib/threat-queries";
import { severityStyles, type Threat } from "@/lib/threat-types";
import { RiskMeter, RiskBar } from "@/components/cyber/RiskMeter";
import { QuickAlertModal } from "@/components/cyber/QuickAlertModal";
import { getCustomThreatAlerts } from "@/lib/threat-utils";

export const Route = createFileRoute("/hunting")({
  head: () => ({
    meta: [
      { title: "Threat Hunting & IOC Scanner — CyberGuard" },
      {
        name: "description",
        content:
          "Advanced threat hunting workbench, IOC correlation engine, MITRE ATT&CK matrix mapping, and enterprise risk simulator.",
      },
      { property: "og:title", content: "Threat Hunting & IOC Scanner — CyberGuard" },
      {
        property: "og:description",
        content: "Search IOCs, CVEs, and calculate enterprise tech stack exposure.",
      },
    ],
  }),
  component: HuntingPage,
});

const TECH_STACK_ITEMS = [
  {
    id: "vpn",
    label: "Edge VPN & Firewalls (Pulse/Forti/Cisco)",
    baseRisk: 30,
    tags: ["Zero-day", "Edge"],
  },
  { id: "cicd", label: "NPM / GitHub CI/CD Build Pipelines", baseRisk: 22, tags: ["Supply chain"] },
  {
    id: "ad",
    label: "Windows Active Directory & Domain Controllers",
    baseRisk: 25,
    tags: ["Ransomware"],
  },
  {
    id: "mobile",
    label: "Enterprise Mobile Devices (Android/iOS)",
    baseRisk: 14,
    tags: ["Mobile malware"],
  },
  {
    id: "cloud",
    label: "AWS / Azure / GCP Cloud API Secrets",
    baseRisk: 18,
    tags: ["Credential", "Cloud"],
  },
  { id: "exec", label: "Executive Wire & Finance Desks", baseRisk: 15, tags: ["Phishing"] },
];

function HuntingPage() {
  const { data, isPending, error, refetch } = useQuery(briefingQueryOptions);
  const [iocQuery, setIocQuery] = useState("");
  const [selectedThreat, setSelectedThreat] = useState<Threat | null>(null);
  const [selectedTechs, setSelectedTechs] = useState<string[]>(["vpn", "cicd", "ad"]);
  const [customThreats] = useState<Threat[]>(() => getCustomThreatAlerts());

  const allThreats = useMemo(() => {
    const base = data?.threats ?? [];
    return [...customThreats, ...base];
  }, [data, customThreats]);

  // IOC Search Matches
  const iocMatches = useMemo(() => {
    const q = iocQuery.trim().toLowerCase();
    if (!q) return [];

    return allThreats.filter((t) => {
      const matchIoc = t.indicatorsOfCompromise?.some((ioc) => ioc.toLowerCase().includes(q));
      const matchCve = t.cveList?.some((cve) => cve.toLowerCase().includes(q));
      const matchVector = t.attackVector?.toLowerCase().includes(q);
      const matchMitre = t.mitreTactics?.some((m) => m.toLowerCase().includes(q));
      const matchGeneral = t.title.toLowerCase().includes(q) || t.summary.toLowerCase().includes(q);
      return matchIoc || matchCve || matchVector || matchMitre || matchGeneral;
    });
  }, [allThreats, iocQuery]);

  // MITRE ATT&CK compilation
  const mitreTactics = useMemo(() => {
    const map = new Map<string, { count: number; threats: Threat[] }>();
    allThreats.forEach((t) => {
      (t.mitreTactics ?? []).forEach((tactic) => {
        const existing = map.get(tactic) ?? { count: 0, threats: [] };
        existing.count += 1;
        existing.threats.push(t);
        map.set(tactic, existing);
      });
    });
    return Array.from(map.entries()).map(([tactic, meta]) => ({
      tactic,
      count: meta.count,
      threats: meta.threats,
    }));
  }, [allThreats]);

  // Tech stack risk calculation
  const calculatedExposure = useMemo(() => {
    let score = 20; // baseline ambient internet exposure
    selectedTechs.forEach((techId) => {
      const found = TECH_STACK_ITEMS.find((item) => item.id === techId);
      if (found) score += found.baseRisk;
    });
    return Math.min(score, 99);
  }, [selectedTechs]);

  const toggleTech = (id: string) => {
    setSelectedTechs((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  if (isPending) return <LoadingPanel label="Initializing Threat Hunting Correlator" />;
  if (error || !data)
    return (
      <ErrorPanel
        message={(error as Error | null)?.message ?? "Hunting engine offline."}
        onRetry={() => refetch()}
      />
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 panel p-5 md:p-6 border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="label-mono text-primary flex items-center gap-1.5">
              <Crosshair className="size-3.5" />
              Advanced Operations
            </span>
            <span className="rounded bg-primary/10 border border-primary/20 px-2 py-0.5 text-[0.68rem] font-mono text-primary">
              Threat Hunting &amp; IOC Correlator
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-foreground">
            Threat Hunting &amp; Exposure Workbench
          </h1>
          <p className="mt-1 max-w-2xl text-xs sm:text-sm text-muted-foreground">
            Cross-reference suspicious IPs, domains, CVE identifiers, and MITRE ATT&CK techniques
            against live adversary campaigns. Model your infrastructure attack surface in real-time.
          </p>
        </div>

        <QuickAlertModal />
      </header>

      {/* Feature 1: IOC & Artifact Scanner */}
      <section className="panel p-5 sm:p-6 border-border space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="size-4 text-primary" />
            <h2 className="text-base sm:text-lg font-bold text-foreground">
              Live IOC &amp; Artifact Cross-Reference
            </h2>
          </div>
          <span className="text-xs text-muted-foreground label-mono">
            {allThreats.length} Tracked Threat Campaigns
          </span>
        </div>

        <p className="text-xs text-muted-foreground">
          Enter an indicator of compromise (IP, domain, hash, CVE ID, or MITRE tactic) to check if
          it is associated with any active threat campaign.
        </p>

        {/* Input Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={iocQuery}
            onChange={(e) => setIocQuery(e.target.value)}
            placeholder="Type IP, domain, hash, or CVE (e.g. 198.51.100.22, CVE-2026-3184, T1190)..."
            className="w-full rounded-md border border-input bg-card pl-10 pr-24 py-2.5 text-xs sm:text-sm text-foreground outline-none focus:border-primary transition-colors font-mono"
          />
          {iocQuery && (
            <button
              type="button"
              onClick={() => setIocQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>

        {/* Quick Sample Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-muted-foreground mr-1">Sample IOCs:</span>
          {["198.51.100.22", "CVE-2026-3184", "T1190", "discordapp[.]com", "GHSA-2026"].map(
            (sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => setIocQuery(sample)}
                className="rounded bg-secondary/80 hover:bg-secondary px-2 py-0.5 font-mono text-[0.72rem] text-primary border border-border cursor-pointer transition-colors"
              >
                {sample}
              </button>
            ),
          )}
        </div>

        {/* Results Area */}
        {iocQuery.trim() !== "" && (
          <div className="mt-4 pt-4 border-t border-border/70 space-y-3">
            <div className="flex items-center justify-between text-xs label-mono">
              <span className="text-foreground font-semibold">
                Match Results: {iocMatches.length} Campaign(s) Found
              </span>
              {iocMatches.length > 0 ? (
                <span className="text-destructive flex items-center gap-1 font-bold">
                  <AlertTriangle className="size-3" /> MATCH CONFIRMED
                </span>
              ) : (
                <span className="text-green-500 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="size-3" /> NO ACTIVE CAMPAIGN MATCH
                </span>
              )}
            </div>

            {iocMatches.length === 0 ? (
              <div className="p-4 rounded bg-secondary/30 text-xs text-muted-foreground">
                No active threats in the current intelligence stream explicitly reference "
                {iocQuery}". Check for alternate domain variations or unindexed internal telemetry.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {iocMatches.map((threat) => (
                  <div
                    key={threat.id}
                    className="p-4 rounded-md border border-border bg-card hover:border-primary/50 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[0.65rem] font-mono uppercase ${severityStyles[threat.severity].badge}`}
                        >
                          {threat.severity}
                        </span>
                        <span className="text-muted-foreground font-mono text-[0.7rem]">
                          {threat.publishedLabel}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-foreground leading-snug">
                        {threat.title}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {threat.summary}
                      </p>

                      <div className="mt-2 text-xs font-mono text-primary">
                        Vector: {threat.attackVector ?? "Network ingress"}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedThreat(threat)}
                      className="mt-3 w-full py-1.5 rounded bg-secondary hover:bg-primary hover:text-primary-foreground text-xs font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Eye className="size-3.5" />
                      <span>Inspect Campaign Dossier</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Feature 2: Attack Surface Exposure Simulator */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 panel p-5 sm:p-6 border-border space-y-4">
          <div className="flex items-center gap-2">
            <Sliders className="size-4 text-primary" />
            <h2 className="text-base sm:text-lg font-bold text-foreground">
              Attack Surface Exposure Simulator
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Select the components deployed in your organization to simulate combined threat exposure
            and identify overlapping vulnerabilities from active zero-days.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            {TECH_STACK_ITEMS.map((item) => {
              const active = selectedTechs.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleTech(item.id)}
                  className={`p-3 rounded-md border text-left transition-colors cursor-pointer flex items-start justify-between gap-2 ${
                    active
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-border/80 hover:bg-secondary/50"
                  }`}
                >
                  <div>
                    <span className="text-xs font-semibold block text-foreground leading-snug">
                      {item.label}
                    </span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-secondary px-1.5 py-0.2 text-[0.65rem] font-mono text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span
                    className={`size-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                      active ? "border-primary bg-primary text-primary-foreground" : "border-border"
                    }`}
                  >
                    {active && <CheckCircle2 className="size-3" />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Calculated Score Card */}
        <div className="panel p-5 sm:p-6 border-border flex flex-col justify-between space-y-4">
          <div>
            <span className="label-mono text-primary text-xs">Simulated Exposure</span>
            <h3 className="text-lg font-bold mt-1">Composite Attack Surface</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Calculated based on {selectedTechs.length} selected enterprise stack vectors.
            </p>
          </div>

          <div className="flex justify-center py-2">
            <RiskMeter value={calculatedExposure} size={150} />
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between font-mono">
              <span className="text-muted-foreground">Exposure Level:</span>
              <span
                className={`font-bold ${
                  calculatedExposure > 75
                    ? "text-destructive"
                    : calculatedExposure > 50
                      ? "text-amber-500"
                      : "text-green-500"
                }`}
              >
                {calculatedExposure > 75
                  ? "CRITICAL RISK"
                  : calculatedExposure > 50
                    ? "ELEVATED RISK"
                    : "CONTROLLED"}
              </span>
            </div>
            <div className="p-2.5 rounded bg-secondary/60 text-[0.72rem] text-muted-foreground leading-relaxed">
              {calculatedExposure > 75
                ? "Immediate intervention required: Critical perimeter components (VPN/CI-CD) match actively exploited CISA Known Exploited Vulnerabilities."
                : "Moderate posture: Ensure routine MFA rotation and verify lockfile package integrity across deploy pipelines."}
            </div>
          </div>
        </div>
      </section>

      {/* Feature 3: MITRE ATT&CK Matrix Navigator */}
      <section className="panel p-5 sm:p-6 border-border space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="size-4 text-primary" />
            <h2 className="text-base sm:text-lg font-bold text-foreground">
              Observed MITRE ATT&amp;CK Tactics
            </h2>
          </div>
          <span className="text-xs text-muted-foreground label-mono">
            {mitreTactics.length} Tactics Mapped
          </span>
        </div>

        <p className="text-xs text-muted-foreground">
          Adversary tactics and techniques extracted from active intelligence reports. Click any
          tactic to view corresponding threat dossiers.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          {mitreTactics.map((item) => (
            <div
              key={item.tactic}
              className="p-3.5 rounded-md border border-border bg-card hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center justify-between text-xs font-mono text-primary mb-1">
                <span className="font-bold">{item.tactic.split(" - ")[0]}</span>
                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[0.68rem]">
                  {item.count} {item.count === 1 ? "Incident" : "Incidents"}
                </span>
              </div>
              <span className="text-xs font-semibold block text-foreground leading-snug">
                {item.tactic.split(" - ")[1] ?? item.tactic}
              </span>

              <div className="mt-2.5 flex items-center justify-between text-[0.7rem] text-muted-foreground">
                <span className="truncate max-w-[140px]">
                  {item.threats[0]?.category ?? "Threat vector"}
                </span>
                {item.threats[0] && (
                  <button
                    type="button"
                    onClick={() => setSelectedThreat(item.threats[0])}
                    className="text-primary hover:underline cursor-pointer flex items-center gap-0.5"
                  >
                    <span>View</span>
                    <ExternalLink className="size-2.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Threat Detail Modal */}
      {selectedThreat && (
        <ThreatDetailModal
          threat={selectedThreat}
          open={Boolean(selectedThreat)}
          onClose={() => setSelectedThreat(null)}
        />
      )}
    </div>
  );
}
