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
  Maximize2,
  Minimize2,
  Bot,
  Layers,
  FileCode2,
  CheckCircle2,
  X,
  Volume2,
  Mic,
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
import { CyberAIAgent } from "./CyberAIAgent";
import { GeminiLiveVoice } from "./GeminiLiveVoice";

interface QuickSolutionModalProps {
  solution: OpenSourceProblemSolution;
  triggerButton?: React.ReactNode;
}

export function QuickSolutionModal({ solution, triggerButton }: QuickSolutionModalProps) {
  const [open, setOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isLiveVoiceOpen, setIsLiveVoiceOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"fix" | "deployment" | "ai">("fix");
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

  const handleDownloadClick = (url: string, toolName: string) => {
    // Automatically maximize to full screen on download click as requested
    setIsFullScreen(true);
    setActiveTab("deployment");
    toast.success(`🚀 Download initiated for ${toolName}!`, {
      description: "Switched to Full-Screen Deployment Station with AI Agent voice & chat support.",
      duration: 5000,
    });
    // Open download in a new tab without popup blocker interference
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const activeTool: OpenSourceToolRef | undefined = solution.openSourceTools[selectedToolIdx];

  const agentContext = `Software: ${solution.affectedSoftware} | CVE: ${solution.cveList.join(", ")} | Vulnerability: ${solution.title} | Immediate 1-liner fix: ${solution.quickSolution1Liner} | Tool: ${activeTool?.name ?? "General remediation"}`;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          setIsFullScreen(false);
        }
      }}
    >
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

      <DialogContent
        className={`transition-all duration-300 overflow-y-auto flex flex-col ${
          isFullScreen
            ? "fixed inset-0 z-50 w-screen h-screen max-w-none max-h-none rounded-none p-4 sm:p-6 md:p-8 bg-background/98 backdrop-blur-xl border-none"
            : "w-[95vw] sm:w-[90vw] md:max-w-3xl lg:max-w-4xl max-h-[92vh] p-4 sm:p-6 bg-card border-border rounded-xl"
        }`}
      >
        {/* Top Header Bar */}
        <DialogHeader className="border-b border-border/80 pb-3 sm:pb-4 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 text-[0.68rem] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full shrink-0">
                <Zap className="size-3 fill-amber-500 text-amber-500" /> Instant Quick Solution
              </span>
              <span className="font-mono text-[0.68rem] text-muted-foreground truncate">
                {solution.cveList.join(", ")}
              </span>
              <span className="rounded bg-primary/10 border border-primary/20 px-2 py-0.5 font-mono text-[0.65rem] text-primary font-semibold">
                CVSS {solution.cvssScore} · {solution.severity.toUpperCase()}
              </span>
            </div>

            {/* Header Control Actions: Gemini Live Voice, Fullscreen Toggle & AI Voice Agent Button */}
            <div className="flex flex-wrap items-center gap-1.5 self-end sm:self-center shrink-0">
              <button
                type="button"
                onClick={() => setIsLiveVoiceOpen(true)}
                className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white px-2.5 py-1 text-xs font-bold shadow-xs hover:opacity-90 transition-opacity cursor-pointer animate-pulse"
                title="Talk with Gemini Live Real-Time Voice"
              >
                <Mic className="size-3" />
                <span>Gemini Live Voice</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab(activeTab === "ai" ? "fix" : "ai")}
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                  activeTab === "ai"
                    ? "bg-primary text-primary-foreground"
                    : "border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20"
                }`}
                title="Open AI Voice & Chat Assistant"
              >
                <Bot className="size-3.5" />
                <span className="hidden sm:inline">AI Agent Copilot</span>
                <span className="sm:hidden">AI</span>
                <Volume2 className="size-3 opacity-80" />
              </button>

              <button
                type="button"
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary hover:bg-secondary/80 px-2.5 py-1 text-xs font-medium text-foreground transition-colors cursor-pointer"
                title={isFullScreen ? "Exit Full-Screen View" : "Expand to Full-Screen View"}
              >
                {isFullScreen ? (
                  <>
                    <Minimize2 className="size-3.5 text-primary" />
                    <span className="hidden sm:inline">Exit Full Screen</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="size-3.5 text-primary" />
                    <span className="hidden sm:inline">Full Screen</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <DialogTitle className="text-base sm:text-xl font-bold font-display text-foreground leading-snug">
            {solution.title}
          </DialogTitle>

          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>
              Target Software:{" "}
              <strong className="font-mono text-foreground">{solution.affectedSoftware}</strong>
            </span>
            <span>&middot;</span>
            <span className="label-mono">{solution.category}</span>
          </div>

          {/* Sub-Navigation Tabs */}
          <div className="flex items-center gap-1.5 pt-2 border-t border-border/60 overflow-x-auto scrollbar-none flex-nowrap max-w-full">
            <button
              type="button"
              onClick={() => setActiveTab("fix")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                activeTab === "fix"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <Zap className="size-3.5" />
              <span>1-Click Fix &amp; Tools</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("deployment")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                activeTab === "deployment"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <Terminal className="size-3.5" />
              <span>Full-Screen Deployment Guide</span>
              {isFullScreen && (
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("ai")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                activeTab === "ai"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <Bot className="size-3.5" />
              <span>AI Agent (Voice &amp; Chat)</span>
              <span className="flex size-1.5 rounded-full bg-primary" />
            </button>
          </div>
        </DialogHeader>

        {/* Tab 1: Quick Fix & Direct Downloads */}
        {activeTab === "fix" && (
          <div className="space-y-4 pt-2">
            {/* 1-Liner Emergency Quick Fix Banner */}
            <div className="rounded-xl border border-primary/40 bg-primary/10 p-3.5 sm:p-5 space-y-2.5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Zap className="size-4 text-primary fill-primary shrink-0" />
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
                  className="inline-flex items-center justify-center gap-1 rounded bg-primary text-primary-foreground px-2.5 py-1 text-xs font-semibold hover:bg-primary/90 transition-all cursor-pointer shadow-xs shrink-0 self-start sm:self-auto"
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

              <pre className="rounded-md border border-border bg-background p-2.5 font-mono text-xs text-foreground overflow-x-auto select-all max-w-full">
                {solution.quickSolution1Liner}
              </pre>
            </div>

            {/* Direct Download & Open Source Software Arsenal */}
            <div className="rounded-xl border border-border bg-card p-3.5 sm:p-5 space-y-3 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground font-mono">
                  <Download className="size-4 text-primary shrink-0" /> Direct Software Downloads
                </div>
                <span className="text-[0.68rem] text-muted-foreground font-mono">
                  Clicking Download automatically expands to Full-Screen Deployment Station
                </span>
              </div>

              {/* Tool Selector Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none flex-nowrap max-w-full">
                {solution.openSourceTools.map((tool, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedToolIdx(idx)}
                    className={`rounded-md px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                      selectedToolIdx === idx
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "border border-border bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  >
                    {tool.name}
                  </button>
                ))}
              </div>

              {activeTool && (
                <div className="space-y-3 pt-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-border pb-2.5">
                    <div>
                      <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                        {activeTool.name}
                        <span className="label-mono text-[0.65rem] font-normal text-muted-foreground">
                          ({activeTool.license})
                        </span>
                      </h4>
                      <p className="text-xs text-muted-foreground">{activeTool.description}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {/* Direct Download button with auto fullscreen expansion */}
                      <button
                        type="button"
                        onClick={() => handleDownloadClick(activeTool.downloadUrl, activeTool.name)}
                        className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-3.5 py-1.5 text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm cursor-pointer"
                      >
                        <Download className="size-3.5" />
                        <span>Direct Download Release</span>
                        <ExternalLink className="size-2.5 opacity-80" />
                      </button>

                      <a
                        href={activeTool.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary px-2.5 py-1.5 text-xs text-foreground hover:bg-secondary/80 transition-colors"
                        title="Source Repository"
                      >
                        <FolderGit2 className="size-3.5" />
                        <span>GitHub Source</span>
                      </a>
                    </div>
                  </div>

                  {/* Install and Run Commands */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
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
                          <span>{copiedKey === "tool-install" ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                      <pre className="rounded-md border border-border bg-background p-2 font-mono text-xs text-foreground overflow-x-auto select-all">
                        {activeTool.installCmd}
                      </pre>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                        <span>Execute &amp; Scan Command:</span>
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
                          <span>{copiedKey === "tool-exec" ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                      <pre className="rounded-md border border-border bg-background p-2 font-mono text-xs text-muted-foreground overflow-x-auto select-all">
                        {activeTool.executeCmd}
                      </pre>
                    </div>
                  </div>

                  {/* Platform Specific Packages */}
                  {activeTool.platforms && activeTool.platforms.length > 0 && (
                    <div className="pt-2 border-t border-border/80 space-y-1.5">
                      <span className="text-[0.68rem] font-mono uppercase tracking-wider text-muted-foreground">
                        Platform Packages (Auto-expands to full screen on download):
                      </span>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {activeTool.platforms.map((plat, pIdx) => (
                          <div
                            key={pIdx}
                            className="rounded border border-border/60 bg-secondary/30 p-2.5 flex items-center justify-between gap-2 text-xs"
                          >
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground text-[0.72rem]">
                                {plat.platform}
                              </p>
                              <code className="text-[0.65rem] font-mono text-muted-foreground truncate block">
                                {plat.command}
                              </code>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                handleDownloadClick(
                                  plat.directDownloadUrl,
                                  `${activeTool.name} for ${plat.platform}`,
                                )
                              }
                              className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer"
                              title={`Download for ${plat.platform}`}
                            >
                              <Download className="size-3" />
                              <span className="hidden sm:inline text-[0.65rem]">Download</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Verification Check Command */}
            <div className="rounded-lg border border-border bg-secondary/30 p-3.5 space-y-1.5 text-xs">
              <span className="flex items-center gap-1.5 font-bold font-mono text-foreground">
                <ShieldCheck className="size-3.5 text-primary" /> Post-Remediation Verification
                Command:
              </span>
              <code className="block rounded bg-background p-2 font-mono text-xs text-foreground/90 border border-border/70 select-all overflow-x-auto">
                {solution.verifiedSolution.verificationStep}
              </code>
            </div>
          </div>
        )}

        {/* Tab 2: Full-Screen Deployment Station & Integrity Guide */}
        {activeTab === "deployment" && (
          <div className="space-y-5 pt-2">
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 sm:p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <Terminal className="size-4" />
                  <span>Interactive Deployment Station &amp; Integrity Verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 font-mono text-[0.68rem] font-bold">
                    ✓ Full Screen Active
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Step-by-step checklist to safely unpack, cryptographically verify SHA-256
                signatures, execute remediation in an isolated sandbox, and audit running daemons.
              </p>
            </div>

            {/* Step 1 to Step 4 Deployment Flow */}
            <div className="grid gap-3.5 md:grid-cols-2">
              {/* Step 1 */}
              <div className="rounded-lg border border-border bg-card p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-primary">
                    STEP 1: Download &amp; Checksum Verification
                  </span>
                  <CheckCircle2 className="size-4 text-emerald-500" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Verify the cryptographic integrity of the downloaded package before unpacking.
                </p>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[0.68rem] font-mono text-muted-foreground">
                    <span>SHA-256 Validation Command:</span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          "sha256sum *.{tar.gz,zip,deb,rpm}",
                          "sha256",
                          "SHA256 command",
                        )
                      }
                      className="text-primary hover:underline text-[0.68rem] cursor-pointer"
                    >
                      Copy
                    </button>
                  </div>
                  <pre className="rounded bg-background p-2 font-mono text-xs text-foreground border border-border/80 select-all overflow-x-auto">
                    sha256sum *.{`{tar.gz,zip,deb,rpm}`}
                  </pre>
                </div>
              </div>

              {/* Step 2 */}
              <div className="rounded-lg border border-border bg-card p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-primary">
                    STEP 2: Unpack &amp; Permission Hardening
                  </span>
                  <Terminal className="size-4 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Ensure strict ownership so unprivileged accounts cannot tamper with the binary.
                </p>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[0.68rem] font-mono text-muted-foreground">
                    <span>Hardening Command:</span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          "chmod 750 <binary> && sudo chown root:root <binary>",
                          "perm-cmd",
                          "Hardening command",
                        )
                      }
                      className="text-primary hover:underline text-[0.68rem] cursor-pointer"
                    >
                      Copy
                    </button>
                  </div>
                  <pre className="rounded bg-background p-2 font-mono text-xs text-foreground border border-border/80 select-all overflow-x-auto">
                    chmod 750 binary &amp;&amp; sudo chown root:root binary
                  </pre>
                </div>
              </div>

              {/* Step 3 */}
              <div className="rounded-lg border border-border bg-card p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-primary">
                    STEP 3: Execute Remediation
                  </span>
                  <Zap className="size-4 text-amber-500 fill-amber-500" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Run the official verified mitigation for {solution.affectedSoftware}.
                </p>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[0.68rem] font-mono text-muted-foreground">
                    <span>Execution Script:</span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          solution.verifiedSolution.patchCommand,
                          "patch-cmd-step3",
                          "Patch Command",
                        )
                      }
                      className="text-primary hover:underline text-[0.68rem] cursor-pointer"
                    >
                      Copy
                    </button>
                  </div>
                  <pre className="rounded bg-background p-2 font-mono text-xs text-foreground border border-border/80 select-all overflow-x-auto">
                    {solution.verifiedSolution.patchCommand}
                  </pre>
                </div>
              </div>

              {/* Step 4 */}
              <div className="rounded-lg border border-border bg-card p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-primary">
                    STEP 4: Verification &amp; Sanity Audit
                  </span>
                  <ShieldCheck className="size-4 text-emerald-500" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Confirm the exploit vector is sealed and normal service operations are healthy.
                </p>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[0.68rem] font-mono text-muted-foreground">
                    <span>Audit Command:</span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          solution.verifiedSolution.verificationStep,
                          "verify-cmd-step4",
                          "Verification Command",
                        )
                      }
                      className="text-primary hover:underline text-[0.68rem] cursor-pointer"
                    >
                      Copy
                    </button>
                  </div>
                  <pre className="rounded bg-background p-2 font-mono text-xs text-foreground border border-border/80 select-all overflow-x-auto">
                    {solution.verifiedSolution.verificationStep}
                  </pre>
                </div>
              </div>
            </div>

            {/* Quick Access to Embedded AI Agent inside Deployment Station */}
            <div className="rounded-xl border border-border bg-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                  <Bot className="size-4 text-primary" />
                  <span>Need live guidance while deploying?</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Use our AI Security Copilot with voice and chat support to clarify commands,
                  generate rollback scripts, or troubleshoot deployment errors.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("ai")}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer shadow-xs shrink-0"
              >
                <Bot className="size-4" />
                <span>Launch Voice &amp; Chat Copilot</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: AI Agent Voice & Chat Copilot */}
        {activeTab === "ai" && (
          <div className="pt-2">
            <CyberAIAgent
              context={agentContext}
              initialPrompt={`How do I safely download and apply the patch for ${solution.title}?`}
              compact={!isFullScreen}
              className={isFullScreen ? "h-[65vh] w-full" : ""}
            />
          </div>
        )}
      </DialogContent>

      {/* Real-time Gemini Live Interactive Voice Session */}
      <GeminiLiveVoice
        isOpen={isLiveVoiceOpen}
        onClose={() => setIsLiveVoiceOpen(false)}
        context={agentContext}
      />
    </Dialog>
  );
}
