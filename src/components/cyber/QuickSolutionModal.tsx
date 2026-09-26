import { useState } from "react";
import {
  Zap,
  Download,
  Copy,
  Check,
  ExternalLink,
  Terminal,
  ShieldCheck,
  AlertTriangle,
  FolderGit2,
  Cpu,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { OpenSourceProblemSolution, OpenSourceToolRef } from "@/lib/opensource-solutions";

interface QuickSolutionModalProps {
  solution: OpenSourceProblemSolution;
  triggerButton?: React.ReactNode;
}

export function QuickSolutionModal({ solution, triggerButton }: QuickSolutionModalProps) {
  const [open, setOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedToolIdx, setSelectedToolIdx] = useState(0);

  const copyToClipboard = (text: string, key: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev));
    }, 2000);
  };

  const activeTool: OpenSourceToolRef | undefined = solution.openSourceTools[selectedToolIdx];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25 px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            <Zap className="size-3.5 fill-amber-500 text-amber-500" />
            <span>Quick Solution &amp; Download</span>
          </button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-4">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[0.68rem] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
              <Zap className="size-3 fill-amber-500 text-amber-500" /> Instant Quick Solution
            </span>
            <span className="font-mono text-[0.68rem] text-muted-foreground">
              {solution.cveList.join(", ")}
            </span>
          </div>
          <DialogTitle className="text-lg sm:text-xl font-bold font-display text-foreground leading-snug">
            {solution.title}
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Target Software:{" "}
            <span className="font-mono text-foreground font-semibold">
              {solution.affectedSoftware}
            </span>
          </p>
        </DialogHeader>

        {/* 1-Liner Emergency Quick Fix */}
        <div className="rounded-xl border border-primary/40 bg-primary/10 p-4 space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Zap className="size-4 text-primary fill-primary" />
              <span className="text-xs font-bold uppercase tracking-wider font-mono text-primary">
                1-Liner Emergency Terminal Command
              </span>
            </div>
            <button
              type="button"
              onClick={() =>
                copyToClipboard(
                  solution.quickSolution1Liner,
                  "modal-1liner",
                  "Quick Solution 1-Liner",
                )
              }
              className="inline-flex items-center gap-1 rounded bg-primary text-primary-foreground px-2.5 py-1 text-xs font-semibold hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
            >
              {copiedKey === "modal-1liner" ? (
                <Check className="size-3" />
              ) : (
                <Copy className="size-3" />
              )}
              <span>{copiedKey === "modal-1liner" ? "Copied" : "Copy 1-Liner"}</span>
            </button>
          </div>

          <p className="text-xs text-foreground/90 leading-relaxed font-medium">
            {solution.quickSolutionSummary}
          </p>

          <pre className="rounded-md border border-border bg-background p-2.5 font-mono text-xs text-foreground overflow-x-auto select-all">
            {solution.quickSolution1Liner}
          </pre>
        </div>

        {/* Direct Download & Open Source Software Arsenal */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground font-mono">
              <Download className="size-4 text-primary" /> Direct Software Download Links
            </div>
            <span className="text-[0.68rem] text-muted-foreground font-mono">
              Select tool ({solution.openSourceTools.length} available)
            </span>
          </div>

          {/* Tool Selector Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {solution.openSourceTools.map((tool, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedToolIdx(idx)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  selectedToolIdx === idx
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "border border-border bg-secondary/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                {tool.name}
              </button>
            ))}
          </div>

          {activeTool && (
            <div className="space-y-3 pt-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-2.5">
                <div>
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    {activeTool.name}
                    <span className="label-mono text-[0.65rem] font-normal text-muted-foreground">
                      ({activeTool.license})
                    </span>
                  </h4>
                  <p className="text-xs text-muted-foreground">{activeTool.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={activeTool.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-xs font-semibold hover:bg-primary/90 transition-colors shadow-xs"
                  >
                    <Download className="size-3.5" />
                    <span>Direct Download Releases</span>
                    <ExternalLink className="size-2.5 opacity-80" />
                  </a>

                  <a
                    href={activeTool.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary px-2.5 py-1.5 text-xs text-foreground hover:bg-secondary/80 transition-colors"
                    title="Source Repository"
                  >
                    <FolderGit2 className="size-3.5" />
                    <span className="hidden sm:inline">Source</span>
                  </a>
                </div>
              </div>

              {/* Install and Run Commands */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                  <span>Quick Install Command:</span>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(activeTool.installCmd, "tool-install", activeTool.name)
                    }
                    className="text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === "tool-install" ? (
                      <Check className="size-3" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                    <span>{copiedKey === "tool-install" ? "Copied" : "Copy Install"}</span>
                  </button>
                </div>
                <pre className="rounded-md border border-border bg-background p-2 font-mono text-xs text-foreground overflow-x-auto select-all">
                  {activeTool.installCmd}
                </pre>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                  <span>Detection &amp; Execution Command:</span>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(activeTool.executeCmd, "tool-exec", activeTool.name)
                    }
                    className="text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === "tool-exec" ? (
                      <Check className="size-3" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                    <span>{copiedKey === "tool-exec" ? "Copied" : "Copy Run"}</span>
                  </button>
                </div>
                <pre className="rounded-md border border-border bg-background p-2 font-mono text-xs text-muted-foreground overflow-x-auto select-all">
                  {activeTool.executeCmd}
                </pre>
              </div>

              {/* Platform Specific Quick Commands */}
              {activeTool.platforms && activeTool.platforms.length > 0 && (
                <div className="pt-2 border-t border-border/80 space-y-1.5">
                  <span className="text-[0.68rem] font-mono uppercase tracking-wider text-muted-foreground">
                    Direct Platform Packages:
                  </span>
                  <div className="grid gap-1.5 sm:grid-cols-2">
                    {activeTool.platforms.map((plat, pIdx) => (
                      <div
                        key={pIdx}
                        className="rounded border border-border/60 bg-secondary/30 p-2 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground text-[0.72rem]">
                            {plat.platform}
                          </p>
                          <code className="text-[0.65rem] font-mono text-muted-foreground truncate block">
                            {plat.command}
                          </code>
                        </div>
                        <a
                          href={plat.directDownloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 p-1.5 rounded bg-background border border-border text-primary hover:bg-secondary transition-colors"
                          title={`Direct Download for ${plat.platform}`}
                        >
                          <Download className="size-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Verification Check */}
        <div className="rounded-lg border border-border bg-secondary/30 p-3 space-y-1 text-xs">
          <span className="flex items-center gap-1.5 font-bold font-mono text-foreground">
            <ShieldCheck className="size-3.5 text-primary" /> Post-Remediation Verification Command:
          </span>
          <code className="block rounded bg-background p-2 font-mono text-xs text-foreground/90 border border-border/70 select-all">
            {solution.verifiedSolution.verificationStep}
          </code>
        </div>
      </DialogContent>
    </Dialog>
  );
}
