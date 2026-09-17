import { useState } from "react";
import { Scale, X, ArrowRight, ShieldCheck, ShieldAlert, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { severityStyles, type Threat } from "@/lib/threat-types";
import { RiskBar } from "./RiskMeter";

interface ThreatComparisonModalProps {
  threats: Threat[];
  triggerButton?: React.ReactNode;
}

export function ThreatComparisonModal({ threats, triggerButton }: ThreatComparisonModalProps) {
  const [open, setOpen] = useState(false);
  const [threatAId, setThreatAId] = useState<string>(threats[0]?.id ?? "");
  const [threatBId, setThreatBId] = useState<string>(threats[1]?.id ?? threats[0]?.id ?? "");

  const threatA = threats.find((t) => t.id === threatAId) ?? threats[0];
  const threatB = threats.find((t) => t.id === threatBId) ?? threats[1] ?? threats[0];

  if (!threats || threats.length < 2) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
          >
            <Scale className="size-3.5" />
            <span>Compare Threats</span>
          </button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader className="border-b border-border pb-3">
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <Scale className="size-5 text-primary" />
            Side-by-Side Threat Comparison Matrix
          </DialogTitle>
        </DialogHeader>

        {/* Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Threat Vector A:
            </label>
            <select
              value={threatAId}
              onChange={(e) => setThreatAId(e.target.value)}
              className="w-full rounded-md border border-input bg-background p-2 text-xs text-foreground outline-none focus:border-primary"
            >
              {threats.map((t) => (
                <option key={t.id} value={t.id}>
                  [{t.severity.toUpperCase()}] {t.title.slice(0, 50)}...
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Threat Vector B:
            </label>
            <select
              value={threatBId}
              onChange={(e) => setThreatBId(e.target.value)}
              className="w-full rounded-md border border-input bg-background p-2 text-xs text-foreground outline-none focus:border-primary"
            >
              {threats.map((t) => (
                <option key={t.id} value={t.id}>
                  [{t.severity.toUpperCase()}] {t.title.slice(0, 50)}...
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 divide-y md:divide-y-0 md:divide-x divide-border pt-2">
          {/* Threat A */}
          {threatA && (
            <div className="space-y-4 pr-0 md:pr-4">
              <div className="flex items-center justify-between">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-mono uppercase ${severityStyles[threatA.severity].badge}`}
                >
                  {threatA.severity} severity
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  {threatA.publishedLabel}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-foreground leading-snug">
                  {threatA.title}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {threatA.category} &middot; {threatA.source}
                </p>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span>Risk Score</span>
                  <span className="font-bold text-primary">{threatA.riskPercent}%</span>
                </div>
                <RiskBar percent={threatA.riskPercent} severity={threatA.severity} />
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded bg-secondary/50 border border-border/60">
                  <span className="font-semibold block text-foreground mb-0.5">
                    Affected Scope:
                  </span>
                  <span className="text-muted-foreground">{threatA.affectedPeople}</span>
                </div>

                <div className="p-2.5 rounded bg-secondary/50 border border-border/60">
                  <span className="font-semibold block text-foreground mb-0.5">Attack Vector:</span>
                  <span className="text-muted-foreground">
                    {threatA.attackVector ?? "Standard network intrusion"}
                  </span>
                </div>

                <div className="p-2.5 rounded bg-secondary/50 border border-border/60">
                  <span className="font-semibold block text-foreground mb-0.5">Targeted CVEs:</span>
                  <span className="text-muted-foreground">
                    {threatA.cveList && threatA.cveList.length > 0
                      ? threatA.cveList.join(", ")
                      : "Zero-Day (Pending CVE)"}
                  </span>
                </div>

                <div className="p-2.5 rounded bg-secondary/50 border border-border/60">
                  <span className="font-semibold block text-primary mb-0.5">
                    Remediation Directive:
                  </span>
                  <span className="text-muted-foreground leading-relaxed">
                    {threatA.recommendedAction}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Threat B */}
          {threatB && (
            <div className="space-y-4 pt-4 md:pt-0 md:pl-4">
              <div className="flex items-center justify-between">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-mono uppercase ${severityStyles[threatB.severity].badge}`}
                >
                  {threatB.severity} severity
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  {threatB.publishedLabel}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-foreground leading-snug">
                  {threatB.title}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {threatB.category} &middot; {threatB.source}
                </p>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span>Risk Score</span>
                  <span className="font-bold text-primary">{threatB.riskPercent}%</span>
                </div>
                <RiskBar percent={threatB.riskPercent} severity={threatB.severity} />
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded bg-secondary/50 border border-border/60">
                  <span className="font-semibold block text-foreground mb-0.5">
                    Affected Scope:
                  </span>
                  <span className="text-muted-foreground">{threatB.affectedPeople}</span>
                </div>

                <div className="p-2.5 rounded bg-secondary/50 border border-border/60">
                  <span className="font-semibold block text-foreground mb-0.5">Attack Vector:</span>
                  <span className="text-muted-foreground">
                    {threatB.attackVector ?? "Standard network intrusion"}
                  </span>
                </div>

                <div className="p-2.5 rounded bg-secondary/50 border border-border/60">
                  <span className="font-semibold block text-foreground mb-0.5">Targeted CVEs:</span>
                  <span className="text-muted-foreground">
                    {threatB.cveList && threatB.cveList.length > 0
                      ? threatB.cveList.join(", ")
                      : "Zero-Day (Pending CVE)"}
                  </span>
                </div>

                <div className="p-2.5 rounded bg-secondary/50 border border-border/60">
                  <span className="font-semibold block text-primary mb-0.5">
                    Remediation Directive:
                  </span>
                  <span className="text-muted-foreground leading-relaxed">
                    {threatB.recommendedAction}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
