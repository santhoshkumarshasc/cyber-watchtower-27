import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  Radar,
  Radio,
  Clock,
  Terminal,
  Server,
  Zap,
  Lock,
  FileText,
  Users,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Crosshair,
  Bot,
} from "lucide-react";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Hero Mission Section */}
      <section className="panel relative overflow-hidden p-6 sm:p-8 md:p-10 shadow-alert">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="label-mono text-primary flex items-center gap-1.5">
            <Radio className="size-3.5 text-primary animate-pulse" />
            OPERATIONAL MANDATE & DESK ARCHITECTURE
          </span>
          <span className="rounded bg-secondary px-2 py-0.5 font-mono text-[0.68rem] text-muted-foreground">
            CyberGuard Platform v2.4
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-display text-foreground leading-tight max-w-3xl">
          Authoritative, real-time threat intelligence for frontline defenders.
        </h1>

        <p className="mt-3 text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed max-w-3xl">
          CyberGuard was engineered to bridge the gap between complex government security
          disclosures and actionable defense engineering. We monitor, categorize, and synthesize
          real-time exploits, ransomware campaigns, and zero-day vulnerabilities across the globe
          with transparent chronological ordering and verified technical sources.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-xs sm:text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
          >
            <span>Explore Live Threat Desk</span>
            <ChevronRight className="size-4" />
          </Link>
          <Link
            to="/hunting"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-xs sm:text-sm font-semibold text-foreground hover:bg-secondary transition-colors cursor-pointer"
          >
            <Crosshair className="size-4 text-primary" />
            <span>Threat Hunting Workbench</span>
          </Link>
        </div>
      </section>

      {/* Core Intelligence Pillars */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Radar className="size-4 text-primary" />
          <h2 className="text-lg font-bold font-display text-foreground">
            Data Pipelines & Intelligence Ingestion
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="panel p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-primary">
              <Server className="size-4" />
              <span className="font-semibold text-sm text-foreground">
                Official Government Desks
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Direct telemetry feeds from CISA (Cybersecurity and Infrastructure Security Agency),
              NIST NVD (National Vulnerability Database), US-CERT, and international CERT incident
              networks.
            </p>
            <div className="pt-2 text-[0.68rem] font-mono text-muted-foreground flex items-center gap-1">
              <CheckCircle2 className="size-3 text-emerald-500" />
              <span>Verified CISA KEV Catalog</span>
            </div>
          </div>

          <div className="panel p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-primary">
              <Terminal className="size-4" />
              <span className="font-semibold text-sm text-foreground">
                Vendor Threat Research Labs
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Active exploit signatures aggregated from Google Threat Analysis Group (TAG),
              Microsoft Security Threat Intelligence, Mandiant Intelligence, and Palo Alto Unit 42.
            </p>
            <div className="pt-2 text-[0.68rem] font-mono text-muted-foreground flex items-center gap-1">
              <CheckCircle2 className="size-3 text-emerald-500" />
              <span>Attribution & IOC verification</span>
            </div>
          </div>

          <div className="panel p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-primary">
              <Clock className="size-4" />
              <span className="font-semibold text-sm text-foreground">
                Chronological Recency Engine
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every threat event is stamped and arranged in strict Recent-to-Past order with
              time-window filtering (&lt; 30m, &lt; 2h, &lt; 24h), ensuring emerging zero-days stay
              at the forefront.
            </p>
            <div className="pt-2 text-[0.68rem] font-mono text-muted-foreground flex items-center gap-1">
              <CheckCircle2 className="size-3 text-emerald-500" />
              <span>Zero-lag sorting pipeline</span>
            </div>
          </div>
        </div>
      </section>

      {/* Incident Response Standards & SLAs */}
      <section className="panel p-6 sm:p-8 space-y-6">
        <div>
          <span className="label-mono text-primary">DEFENSE STANDARDS</span>
          <h2 className="text-xl font-bold font-display text-foreground mt-1">
            Incident Response Protocol (NIST SP 800-61 Rev. 2)
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Standard operating procedures followed across CyberGuard defense playbooks and automated
            triage guidelines.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-border/80 bg-secondary/30 p-4 space-y-2">
            <div className="font-mono text-xs font-bold text-destructive">PHASE 1 (T+0 to 15m)</div>
            <div className="font-semibold text-sm text-foreground">Isolation & Sever</div>
            <p className="text-xs text-muted-foreground">
              Immediate physical/logical network isolation of compromised hosts. Preservation of
              volatile RAM artifacts.
            </p>
          </div>

          <div className="rounded-lg border border-border/80 bg-secondary/30 p-4 space-y-2">
            <div className="font-mono text-xs font-bold text-high">PHASE 2 (T+15m to 1h)</div>
            <div className="font-semibold text-sm text-foreground">Attribution & Scope</div>
            <p className="text-xs text-muted-foreground">
              Cross-reference adversary tactics against MITRE ATT&CK matrix and identify active C2
              beacons in DNS logs.
            </p>
          </div>

          <div className="rounded-lg border border-border/80 bg-secondary/30 p-4 space-y-2">
            <div className="font-mono text-xs font-bold text-primary">PHASE 3 (T+1h to 4h)</div>
            <div className="font-semibold text-sm text-foreground">Virtual Patching</div>
            <p className="text-xs text-muted-foreground">
              Deployment of in-line WAF/NGFW inspection rules and microsegmentation of critical
              database and auth nodes.
            </p>
          </div>

          <div className="rounded-lg border border-border/80 bg-secondary/30 p-4 space-y-2">
            <div className="font-mono text-xs font-bold text-emerald-500">PHASE 4 (T+24h)</div>
            <div className="font-semibold text-sm text-foreground">Dossier & Forensics</div>
            <p className="text-xs text-muted-foreground">
              Root-cause analysis, credential cycling across all domain admins, and formal
              CISA/regulatory reporting.
            </p>
          </div>
        </div>
      </section>

      {/* Advanced Capabilities Overview */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="size-4 text-primary" />
          <h2 className="text-lg font-bold font-display text-foreground">
            Platform Feature Matrix
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 text-xs">
          <div className="panel p-4 flex items-start gap-3">
            <Bot className="size-5 text-primary shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-foreground text-sm">Tier-3 SOC AI Assistant</div>
              <p className="text-muted-foreground mt-0.5">
                Always-accessible conversational chatbot powered by Gemini 3.8 Flash with full
                offline incident response fallback for CVE queries, ransomware containment, and IOC
                verification.
              </p>
            </div>
          </div>

          <div className="panel p-4 flex items-start gap-3">
            <Zap className="size-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-foreground text-sm">
                Operator Quick Threat Alerts
              </div>
              <p className="text-muted-foreground mt-0.5">
                Dispatch instantaneous emergency broadcasts across the operator network with audible
                chimes, desktop push notifications, and immediate top-of-feed placement.
              </p>
            </div>
          </div>

          <div className="panel p-4 flex items-start gap-3">
            <Crosshair className="size-5 text-primary shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-foreground text-sm">
                Threat Hunting & Exposure Matrix
              </div>
              <p className="text-muted-foreground mt-0.5">
                Search artifacts, correlate MITRE techniques, and calculate your organization's
                composite risk score based on connected cloud, VPN, and active directory assets.
              </p>
            </div>
          </div>

          <div className="panel p-4 flex items-start gap-3">
            <Lock className="size-5 text-primary shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-foreground text-sm">5 Dynamic Display Themes</div>
              <p className="text-muted-foreground mt-0.5">
                Tailored for SOC operations rooms: Red Alert (SOC), Terminal Matrix Green, Deep
                Space Radar, Amber Sentinel, and White Hat Light mode.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Methodology Footer */}
      <section className="panel p-6 border-border/80 text-xs text-muted-foreground space-y-3">
        <div className="flex items-center gap-2 text-foreground font-semibold">
          <ShieldCheck className="size-4 text-emerald-500" />
          <span>Integrity & Privacy Guarantee</span>
        </div>
        <p className="leading-relaxed">
          CyberGuard operates with zero telemetry collection of user intellectual property. Custom
          alerts and saved intelligence dossiers are securely persisted inside your browser's
          encrypted sandbox. External threat links redirect exclusively to verified authoritative
          domains (cisa.gov, nvd.nist.gov, cert.org).
        </p>
      </section>
    </div>
  );
}
