import { useState } from "react";
import {
  ExternalLink,
  ShieldAlert,
  Copy,
  Check,
  FileText,
  MapPin,
  Users,
  Code,
  Terminal,
  Activity,
  AlertTriangle,
  FolderGit2,
  Zap,
  Download,
} from "lucide-react";
import { toast } from "sonner";

import { RiskBar } from "./RiskMeter";
import { severityStyles, type Threat } from "@/lib/threat-types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  findOpenSourceSolutionsForQuery,
  getQuickSolutionForThreat,
} from "@/lib/opensource-solutions";
import { QuickSolutionModal } from "./QuickSolutionModal";

interface ThreatDetailModalProps {
  threat: Threat | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ThreatDetailModal({ threat, open, onOpenChange }: ThreatDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [copiedIocs, setCopiedIocs] = useState(false);

  if (!threat) return null;

  const severity = severityStyles[threat.severity];

  const handleCopySummary = () => {
    const text = `[CYBERGUARD THREAT INTELLIGENCE]
Title: ${threat.title}
Severity: ${severity.label.toUpperCase()} (${Math.round(threat.riskPercent)}% Risk)
Category: ${threat.category}
Source: ${threat.source}
Source URL: ${threat.sourceUrl || "N/A"}
Affected: ${threat.affectedPeople}
Regions: ${threat.regions.join(", ")}
CVEs: ${threat.cveList?.join(", ") || "None"}
Attack Vector: ${threat.attackVector || "Unspecified"}
Action Required: ${threat.recommendedAction}
Summary: ${threat.summary}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Threat briefing copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyIocs = () => {
    if (!threat.indicatorsOfCompromise || threat.indicatorsOfCompromise.length === 0) return;
    const text = threat.indicatorsOfCompromise.join("\n");
    navigator.clipboard.writeText(text);
    setCopiedIocs(true);
    toast.success("Indicators of compromise copied");
    setTimeout(() => setCopiedIocs(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl border-border bg-card p-0 sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="border-b border-border p-5 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-2.5 py-0.5 font-mono text-[0.68rem] tracking-wider uppercase ${severity.bg} ${severity.text}`}
            >
              {severity.label} Severity
            </span>
            <span className="label-mono">{threat.category}</span>
            <span className="ml-auto label-mono">{threat.publishedLabel}</span>
          </div>
          <DialogTitle className="mt-2 text-xl font-bold leading-tight">{threat.title}</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto p-5 space-y-5 text-sm">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 rounded-lg border border-border bg-secondary/30 p-3">
            <div>
              <span className="label-mono text-[0.68rem]">Risk Score</span>
              <div className="mt-1 flex items-center gap-2">
                <span className={`font-mono text-base font-bold ${severity.text}`}>
                  {Math.round(threat.riskPercent)}%
                </span>
                <div className="flex-1">
                  <RiskBar value={threat.riskPercent} />
                </div>
              </div>
            </div>

            <div>
              <span className="label-mono text-[0.68rem]">Impact Population</span>
              <p className="mt-1 flex items-center gap-1.5 text-xs font-medium">
                <Users className="size-3.5 text-muted-foreground" />
                {threat.affectedPeople}
              </p>
            </div>

            <div>
              <span className="label-mono text-[0.68rem]">Target Regions</span>
              <p className="mt-1 flex items-center gap-1.5 text-xs font-medium truncate">
                <MapPin className="size-3.5 text-muted-foreground" />
                {threat.regions.join(", ")}
              </p>
            </div>
          </div>

          {/* Core Situation Summary */}
          <div>
            <h4 className="label-mono text-xs uppercase tracking-wider text-muted-foreground">
              Threat Overview &amp; Analysis
            </h4>
            <p className="mt-1.5 leading-relaxed text-foreground/90">{threat.summary}</p>
          </div>

          {/* Immediate Action Needed */}
          <div className="rounded-md border border-primary/40 bg-primary/10 p-3.5">
            <span className="flex items-center gap-1.5 label-mono text-xs font-semibold text-primary">
              <AlertTriangle className="size-4" /> Immediate Recommended Mitigation
            </span>
            <p className="mt-1 font-medium text-foreground">{threat.recommendedAction}</p>
          </div>

          {/* Technical Exploitation Vector & CVEs */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-border bg-card p-3 space-y-1">
              <span className="flex items-center gap-1.5 label-mono text-[0.7rem]">
                <Terminal className="size-3.5 text-primary" /> Attack Vector
              </span>
              <p className="text-xs text-foreground/80">
                {threat.attackVector || "Network exploitation / unauthenticated remote attack"}
              </p>
            </div>

            <div className="rounded-md border border-border bg-card p-3 space-y-1">
              <span className="flex items-center gap-1.5 label-mono text-[0.7rem]">
                <Code className="size-3.5 text-primary" /> Tracked CVEs
              </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {threat.cveList && threat.cveList.length > 0 ? (
                  threat.cveList.map((cve) => (
                    <a
                      key={cve}
                      href={`https://nvd.nist.gov/vuln/detail/${cve}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-0.5 font-mono text-[0.7rem] text-primary hover:underline"
                    >
                      {cve} <ExternalLink className="size-2.5" />
                    </a>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">CVE pending assignment</span>
                )}
              </div>
            </div>
          </div>

          {/* MITRE ATT&CK Tactics */}
          {threat.mitreTactics && threat.mitreTactics.length > 0 ? (
            <div>
              <span className="label-mono text-[0.7rem]">MITRE ATT&CK Techniques</span>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {threat.mitreTactics.map((tactic) => (
                  <span
                    key={tactic}
                    className="rounded border border-border bg-secondary/50 px-2 py-0.5 font-mono text-[0.7rem] text-muted-foreground"
                  >
                    {tactic}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {/* Indicators of Compromise (IOCs) */}
          {threat.indicatorsOfCompromise && threat.indicatorsOfCompromise.length > 0 ? (
            <div className="rounded-md border border-border bg-secondary/20 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 label-mono text-xs text-foreground">
                  <Activity className="size-3.5 text-primary" /> Indicators of Compromise (IOCs)
                </span>
                <button
                  type="button"
                  onClick={handleCopyIocs}
                  className="flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer"
                >
                  {copiedIocs ? <Check className="size-3" /> : <Copy className="size-3" />}
                  {copiedIocs ? "Copied" : "Copy IOCs"}
                </button>
              </div>
              <div className="space-y-1 font-mono text-xs bg-background/80 p-2.5 rounded border border-border/80 overflow-x-auto">
                {threat.indicatorsOfCompromise.map((ioc, idx) => (
                  <p key={idx} className="text-muted-foreground select-all">
                    {ioc}
                  </p>
                ))}
              </div>
            </div>
          ) : null}

          {/* Open Source Defensive Software & Scripts */}
          {(() => {
            const explicitTools = threat.openSourceTools || [];
            const matchedSolution = getQuickSolutionForThreat(
              threat.title,
              threat.cveList,
              threat.appName,
            );
            const matchedSolutions = findOpenSourceSolutionsForQuery(
              `${threat.title} ${threat.appName || ""} ${threat.cveList?.join(" ") || ""}`,
            );
            const fallbackTools = matchedSolutions.flatMap((s) => s.openSourceTools);
            const displayedTools =
              explicitTools.length > 0 ? explicitTools : fallbackTools.slice(0, 3);

            if (displayedTools.length === 0 && !matchedSolution) return null;

            return (
              <div className="rounded-md border border-border bg-card p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 label-mono text-xs font-semibold text-foreground">
                    <FolderGit2 className="size-3.5 text-primary" /> Open Source Defensive Software
                    Available
                  </span>
                  <a
                    href="/opensource"
                    className="label-mono text-[0.68rem] text-primary hover:underline flex items-center gap-1"
                  >
                    View All OSS Solutions <ExternalLink className="size-2.5" />
                  </a>
                </div>

                {/* 1-Click Quick Solution Banner if problem is identified */}
                {matchedSolution && (
                  <div className="rounded border border-amber-500/40 bg-amber-500/10 p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5 text-[0.68rem] font-mono font-bold text-amber-600 dark:text-amber-400">
                        <Zap className="size-3.5 fill-amber-500 text-amber-500 shrink-0" />
                        <span>Instant Quick Solution Available:</span>
                      </div>
                      <p className="text-xs text-foreground/90 font-medium truncate">
                        {matchedSolution.quickSolutionSummary}
                      </p>
                    </div>

                    <QuickSolutionModal
                      solution={matchedSolution}
                      triggerButton={
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 rounded bg-amber-600 dark:bg-amber-500 text-white dark:text-black font-semibold text-xs px-2.5 py-1.5 hover:opacity-90 transition-opacity cursor-pointer shrink-0 shadow-xs"
                        >
                          <Zap className="size-3.5 fill-current" />
                          <span>Get Quick Solution</span>
                        </button>
                      }
                    />
                  </div>
                )}

                <div className="grid gap-2 sm:grid-cols-2">
                  {displayedTools.map((tool, idx) => {
                    const downloadUrl =
                      "downloadUrl" in tool && typeof tool.downloadUrl === "string"
                        ? tool.downloadUrl
                        : tool.repoUrl;

                    return (
                      <div
                        key={idx}
                        className="rounded border border-border/80 bg-secondary/30 p-2.5 space-y-1.5 flex flex-col justify-between"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-foreground">{tool.name}</span>
                            <span className="label-mono text-[0.62rem] rounded bg-primary/10 text-primary px-1.5 py-0.2">
                              {tool.type}
                            </span>
                          </div>
                          <p className="text-[0.72rem] text-muted-foreground leading-snug">
                            {tool.description}
                          </p>
                        </div>

                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between gap-1">
                            {(() => {
                              const cmd =
                                "command" in tool && typeof tool.command === "string"
                                  ? tool.command
                                  : "executeCmd" in tool && typeof tool.executeCmd === "string"
                                    ? tool.executeCmd
                                    : "";
                              return (
                                <>
                                  <code className="text-[0.68rem] font-mono text-foreground/80 bg-background/80 px-1.5 py-0.5 rounded border border-border/50 truncate flex-1">
                                    {cmd}
                                  </code>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(cmd);
                                      toast.success(`Copied command for ${tool.name}`);
                                    }}
                                    className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
                                    title="Copy command"
                                  >
                                    <Copy className="size-3" />
                                  </button>
                                </>
                              );
                            })()}
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[0.68rem]">
                            <span className="text-muted-foreground font-mono">{tool.license}</span>
                            <a
                              href={downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                            >
                              <Download className="size-3" />
                              <span>Direct Download</span>
                              <ExternalLink className="size-2.5" />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Reference Advisories and Documents */}
          <div>
            <span className="label-mono text-[0.7rem]">Reference Advisories &amp; Documents</span>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {threat.documents.map((doc) => (
                <div
                  key={doc.title}
                  className="flex items-start justify-between gap-2 rounded-md border border-border bg-secondary/30 p-2.5"
                >
                  <div className="flex items-start gap-2">
                    <FileText className="size-4 shrink-0 text-primary mt-0.5" />
                    <div>
                      <p className="text-xs font-medium leading-snug">{doc.title}</p>
                      <p className="label-mono text-[0.65rem] mt-0.5">
                        {doc.kind} · {doc.issuer}
                      </p>
                    </div>
                  </div>
                  {doc.url ? (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 p-1 text-muted-foreground hover:text-primary transition-colors"
                      title="Open document source"
                    >
                      <ExternalLink className="size-3.5" />
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="border-t border-border p-4 flex flex-wrap items-center justify-between gap-3 bg-card/50">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 rounded-md border border-border bg-secondary px-3 py-2 text-xs font-medium text-foreground hover:bg-secondary/80 transition-colors"
            >
              {copied ? <Check className="size-3.5 text-primary" /> : <Copy className="size-3.5" />}
              {copied ? "Copied" : "Copy Threat Dossier"}
            </button>
          </div>

          {/* Prominent Open Original Source Button */}
          {threat.sourceUrl ? (
            <a
              href={threat.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
            >
              <ExternalLink className="size-3.5" /> Open Original Source Advisory
            </a>
          ) : (
            <a
              href={`https://www.google.com/search?q=${encodeURIComponent(threat.title + " cybersecurity advisory")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <ExternalLink className="size-3.5" /> Search Source Advisories
            </a>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
