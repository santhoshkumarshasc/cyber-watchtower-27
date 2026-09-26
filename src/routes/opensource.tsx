import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  FolderGit2,
  Search,
  Terminal,
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  Wrench,
  AlertTriangle,
  FileCode2,
  Sparkles,
  Zap,
  Download,
} from "lucide-react";
import { toast } from "sonner";

import {
  OPEN_SOURCE_PROBLEM_SOLUTIONS,
  type OpenSourceProblemSolution,
  type OpenSourceToolRef,
} from "@/lib/opensource-solutions";
import { QuickSolutionModal } from "@/components/cyber/QuickSolutionModal";

export const Route = createFileRoute("/opensource")({
  head: () => ({
    meta: [
      { title: "Open Source Threat & Remediation Hub — CyberGuard" },
      {
        name: "description",
        content:
          "Real-time problem solutions and open-source software tools for critical threats, CVEs, supply-chain vulnerabilities, and infrastructure security.",
      },
      { property: "og:title", content: "Open Source Threat & Remediation Hub — CyberGuard" },
      {
        property: "og:description",
        content:
          "Direct problem solutions and open-source software tools for vulnerabilities across Linux, Docker, npm, Python, Log4j, and OpenSSL.",
      },
    ],
  }),
  component: OpenSourceHubPage,
});

const CATEGORIES = [
  "All",
  "Supply Chain & Packages",
  "Linux Kernel & OS",
  "Web & API Infrastructure",
  "Containers & Cloud Native",
  "Cryptography & Network",
] as const;

function OpenSourceHubPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [expandedId, setExpandedId] = useState<string | null>("oss-xz-backdoor");
  const [activeTabByItem, setActiveTabByItem] = useState<
    Record<string, "solution" | "tools" | "config">
  >({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Quick problem diagnosis query
  const [diagnosticInput, setDiagnosticInput] = useState("");
  const [diagnosticResult, setDiagnosticResult] = useState<OpenSourceProblemSolution | null>(null);

  const filteredSolutions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return OPEN_SOURCE_PROBLEM_SOLUTIONS.filter((item) => {
      const matchCat = selectedCategory === "All" || item.category === selectedCategory;
      if (!matchCat) return false;
      if (!q) return true;

      return (
        item.title.toLowerCase().includes(q) ||
        item.affectedSoftware.toLowerCase().includes(q) ||
        item.problemSummary.toLowerCase().includes(q) ||
        item.cveList.some((c) => c.toLowerCase().includes(q)) ||
        item.openSourceTools.some((t) => t.name.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, selectedCategory]);

  const copyToClipboard = (text: string, key: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev));
    }, 2000);
  };

  const handleDiagnose = (input: string) => {
    const trimmed = input.trim().toLowerCase();
    if (!trimmed) {
      setDiagnosticResult(null);
      return;
    }
    const match = OPEN_SOURCE_PROBLEM_SOLUTIONS.find(
      (item) =>
        item.title.toLowerCase().includes(trimmed) ||
        item.affectedSoftware.toLowerCase().includes(trimmed) ||
        item.cveList.some((c) => c.toLowerCase().includes(trimmed)) ||
        item.id.toLowerCase().includes(trimmed),
    );
    if (match) {
      setDiagnosticResult(match);
      setExpandedId(match.id);
      toast.success(`Matched threat profile for "${input}"`);
    } else {
      setDiagnosticResult(null);
      toast.info(`No exact automated match. Browse verified problem solutions below.`);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Hero */}
      <div className="rounded-xl border border-border bg-card p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-mono font-semibold text-primary">
                <FolderGit2 className="size-3.5" /> Open Source Security Matrix
              </span>
              <span className="label-mono text-[0.7rem] text-muted-foreground">
                Verified oss-security Threads &amp; Upstream Advisories
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-display">
              Open Source Problem &amp; Solution Hub
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Real-time technical diagnosis of critical open source software problems, supply chain
              compromises, and memory corruption vulnerabilities paired with step-by-step verified
              remediations and production-ready open source security software (Trivy, Falco,
              OSquery, Wazuh, Semgrep, Suricata).
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 shrink-0 md:w-64">
            <div className="rounded-lg border border-border bg-secondary/30 p-2.5 text-center">
              <span className="label-mono text-[0.65rem] text-muted-foreground uppercase">
                Tracked Problems
              </span>
              <p className="text-xl font-bold font-mono text-foreground mt-0.5">
                {OPEN_SOURCE_PROBLEM_SOLUTIONS.length} Dossiers
              </p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/30 p-2.5 text-center">
              <span className="label-mono text-[0.65rem] text-muted-foreground uppercase">
                Free OSS Tools
              </span>
              <p className="text-xl font-bold font-mono text-primary mt-0.5">10+ Tools</p>
            </div>
          </div>
        </div>

        {/* Quick Problem Matcher / Scanner Box */}
        <div className="mt-5 rounded-lg border border-primary/30 bg-primary/5 p-3.5 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="size-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground font-mono">
              Real-Time Problem Solver &amp; Package Matcher
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                value={diagnosticInput}
                onChange={(e) => setDiagnosticInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleDiagnose(diagnosticInput)}
                placeholder="Enter software package, CVE, or problem (e.g. xz, log4j, runc, openssl, redis, ebpf)..."
                className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              />
            </div>
            <button
              type="button"
              onClick={() => handleDiagnose(diagnosticInput)}
              className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs cursor-pointer shrink-0"
            >
              <Wrench className="size-3.5" />
              <span>Get Solution &amp; Tools</span>
            </button>
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-mono text-[0.68rem]">Quick queries:</span>
            {[
              "CVE-2024-3094 (XZ)",
              "Log4Shell",
              "runc escape",
              "OpenSSL 3.0",
              "Redis RCE",
              "npm typosquat",
            ].map((query) => (
              <button
                key={query}
                type="button"
                onClick={() => {
                  setDiagnosticInput(query);
                  handleDiagnose(query);
                }}
                className="rounded border border-border/80 bg-background/80 px-2 py-0.5 text-[0.68rem] font-mono text-foreground hover:bg-secondary hover:text-primary transition-colors cursor-pointer"
              >
                {query}
              </button>
            ))}
          </div>

          {/* Diagnostic Result Quick Action Card */}
          {diagnosticResult && (
            <div className="mt-3.5 rounded-lg border border-amber-500/40 bg-card p-3.5 space-y-2.5 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-2">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 rounded bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                    <Zap className="size-3.5 fill-current" /> Matched Quick Solution
                  </span>
                  <span className="text-xs font-bold text-foreground">
                    {diagnosticResult.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <QuickSolutionModal solution={diagnosticResult} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[0.7rem] font-mono text-muted-foreground">
                  <span>Emergency 1-Liner Fix:</span>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        diagnosticResult.quickSolution1Liner,
                        "diag-1liner",
                        "Emergency 1-liner fix",
                      )
                    }
                    className="text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === "diag-1liner" ? (
                      <Check className="size-3" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                    <span>{copiedKey === "diag-1liner" ? "Copied" : "Copy Command"}</span>
                  </button>
                </div>
                <pre className="rounded bg-background p-2 font-mono text-xs text-foreground border border-border/70 overflow-x-auto select-all">
                  {diagnosticResult.quickSolution1Liner}
                </pre>
              </div>

              {/* Direct Software Download Quick Links */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[0.68rem] font-mono text-muted-foreground">
                  Direct Software Downloads:
                </span>
                {diagnosticResult.openSourceTools.map((tool, tIdx) => (
                  <a
                    key={tIdx}
                    href={tool.downloadUrl || tool.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded bg-secondary hover:bg-secondary/80 border border-border/80 px-2 py-0.5 text-[0.68rem] font-mono text-foreground transition-colors"
                  >
                    <Download className="size-2.5 text-primary" />
                    <span>{tool.name} Releases</span>
                    <ExternalLink className="size-2 opacity-70" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filter & Category Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search problems, tools, CVEs..."
            className="w-full rounded-md border border-input bg-card pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Problem & Solution Accordion Cards */}
      <div className="space-y-4">
        {filteredSolutions.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <AlertTriangle className="size-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-semibold text-foreground">
              No open source threat matches found
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Try another search keyword or clear category filters.
            </p>
          </div>
        ) : (
          filteredSolutions.map((item) => {
            const isExpanded = expandedId === item.id;
            const currentTab = activeTabByItem[item.id] || "solution";

            return (
              <div
                key={item.id}
                className={`rounded-xl border transition-all overflow-hidden bg-card ${
                  isExpanded
                    ? "border-primary/50 shadow-md ring-1 ring-primary/20"
                    : "border-border hover:border-border/80"
                }`}
              >
                {/* Header / Click to Expand */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none bg-card hover:bg-secondary/20 transition-colors"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 font-mono text-[0.65rem] font-bold uppercase tracking-wider ${
                          item.severity === "critical"
                            ? "bg-destructive/15 text-destructive border border-destructive/30"
                            : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {item.severity} · CVSS {item.cvssScore}
                      </span>
                      <span className="label-mono text-[0.68rem] text-muted-foreground">
                        {item.category}
                      </span>
                      <span className="label-mono text-[0.68rem] text-muted-foreground truncate max-w-xs">
                        {item.threadName}
                      </span>
                    </div>

                    <h2 className="text-base sm:text-lg font-bold text-foreground leading-snug tracking-tight">
                      {item.title}
                    </h2>

                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Affected Software:
                      </span>
                      <span className="font-mono text-xs text-foreground bg-secondary/60 px-2 py-0.5 rounded border border-border/60">
                        {item.affectedSoftware}
                      </span>
                      {item.cveList.map((cve) => (
                        <span
                          key={cve}
                          className="font-mono text-[0.7rem] text-primary bg-primary/10 px-1.5 py-0.5 rounded"
                        >
                          {cve}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <div className="hidden sm:block" onClick={(e) => e.stopPropagation()}>
                      <QuickSolutionModal solution={item} />
                    </div>
                    <span className="hidden md:inline text-xs font-medium text-muted-foreground">
                      {item.openSourceTools.length} OSS Tools
                    </span>
                    <button
                      type="button"
                      className="size-8 rounded-md border border-border bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground"
                    >
                      {isExpanded ? (
                        <ChevronUp className="size-4" />
                      ) : (
                        <ChevronDown className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Dossier Content */}
                {isExpanded && (
                  <div className="border-t border-border bg-secondary/10 p-4 sm:p-6 space-y-5 animate-in fade-in duration-200">
                    {/* Emergency 1-Liner Quick Fix Banner */}
                    <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3.5 sm:p-4 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 font-mono">
                          <Zap className="size-4 fill-amber-500 text-amber-500" />
                          <span>⚡ Instant 1-Liner Terminal Quick Solution</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <QuickSolutionModal solution={item} />
                          <button
                            type="button"
                            onClick={() =>
                              copyToClipboard(
                                item.quickSolution1Liner,
                                `${item.id}-quick-1liner`,
                                "1-Liner Solution",
                              )
                            }
                            className="inline-flex items-center gap-1 rounded bg-primary text-primary-foreground px-2.5 py-1 text-xs font-semibold hover:bg-primary/90 transition-colors cursor-pointer shadow-xs"
                          >
                            {copiedKey === `${item.id}-quick-1liner` ? (
                              <Check className="size-3" />
                            ) : (
                              <Copy className="size-3" />
                            )}
                            <span>
                              {copiedKey === `${item.id}-quick-1liner` ? "Copied" : "Copy 1-Liner"}
                            </span>
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-foreground/90 font-medium">
                        {item.quickSolutionSummary}
                      </p>
                      <pre className="rounded-md border border-border bg-background p-2 font-mono text-xs text-foreground select-all overflow-x-auto">
                        {item.quickSolution1Liner}
                      </pre>
                    </div>

                    {/* The Problem: Root Cause & Attack Mechanism */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg border border-border bg-card p-3.5 space-y-1.5">
                        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-destructive font-mono">
                          <AlertTriangle className="size-3.5" /> Real-Time Problem Root Cause
                        </span>
                        <p className="text-xs leading-relaxed text-foreground/90">
                          {item.problemSummary}
                        </p>
                      </div>

                      <div className="rounded-lg border border-border bg-card p-3.5 space-y-1.5">
                        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-500 font-mono">
                          <Cpu className="size-3.5" /> Exploitation Mechanism &amp; Vector
                        </span>
                        <p className="text-xs leading-relaxed text-foreground/90">
                          {item.attackMechanism}
                        </p>
                      </div>
                    </div>

                    {/* Sub-tab Navigation */}
                    <div className="flex items-center gap-2 border-b border-border pb-2">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveTabByItem((prev) => ({ ...prev, [item.id]: "solution" }))
                        }
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                          currentTab === "solution"
                            ? "bg-primary text-primary-foreground shadow-xs"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                        }`}
                      >
                        <ShieldCheck className="size-3.5" />
                        <span>Verified Solution &amp; Mitigation</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setActiveTabByItem((prev) => ({ ...prev, [item.id]: "tools" }))
                        }
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                          currentTab === "tools"
                            ? "bg-primary text-primary-foreground shadow-xs"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                        }`}
                      >
                        <FolderGit2 className="size-3.5" />
                        <span>Open Source Software Tools ({item.openSourceTools.length})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setActiveTabByItem((prev) => ({ ...prev, [item.id]: "config" }))
                        }
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                          currentTab === "config"
                            ? "bg-primary text-primary-foreground shadow-xs"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                        }`}
                      >
                        <FileCode2 className="size-3.5" />
                        <span>Patch &amp; Configuration</span>
                      </button>
                    </div>

                    {/* Tab 1: Solution */}
                    {currentTab === "solution" && (
                      <div className="space-y-3">
                        <div className="rounded-lg border border-primary/40 bg-primary/10 p-3.5 space-y-1">
                          <span className="flex items-center gap-1.5 text-xs font-bold text-primary font-mono">
                            <ShieldCheck className="size-4" /> Immediate Mitigation Guideline
                          </span>
                          <p className="text-xs font-medium text-foreground">
                            {item.verifiedSolution.immediateMitigation}
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono text-muted-foreground uppercase">
                              Standard Patch Command:
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                copyToClipboard(
                                  item.verifiedSolution.patchCommand,
                                  `${item.id}-patch`,
                                  "Patch command",
                                )
                              }
                              className="flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer"
                            >
                              {copiedKey === `${item.id}-patch` ? (
                                <Check className="size-3" />
                              ) : (
                                <Copy className="size-3" />
                              )}
                              <span>
                                {copiedKey === `${item.id}-patch` ? "Copied" : "Copy Command"}
                              </span>
                            </button>
                          </div>
                          <pre className="rounded-md border border-border bg-background p-2.5 font-mono text-xs text-foreground overflow-x-auto select-all">
                            {item.verifiedSolution.patchCommand}
                          </pre>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-xs font-mono text-muted-foreground uppercase">
                            Verification &amp; Sanity Audit:
                          </span>
                          <pre className="rounded-md border border-border bg-background p-2.5 font-mono text-xs text-muted-foreground overflow-x-auto select-all">
                            {item.verifiedSolution.verificationStep}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Tab 2: Open Source Tools Available */}
                    {currentTab === "tools" && (
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {item.openSourceTools.map((tool, idx) => {
                          const downloadUrl =
                            "downloadUrl" in tool && typeof tool.downloadUrl === "string"
                              ? tool.downloadUrl
                              : tool.repoUrl;

                          return (
                            <div
                              key={idx}
                              className="rounded-lg border border-border bg-card p-3.5 flex flex-col justify-between space-y-3"
                            >
                              <div className="space-y-1.5">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                                      {tool.name}
                                    </h4>
                                    <span className="label-mono text-[0.62rem] text-muted-foreground">
                                      {tool.type} · {tool.license}
                                    </span>
                                  </div>
                                  <a
                                    href={tool.repoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-muted-foreground hover:text-primary p-1"
                                    title="View Source on GitHub"
                                  >
                                    <ExternalLink className="size-3.5" />
                                  </a>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {tool.description}
                                </p>
                              </div>

                              <div className="space-y-2 pt-1">
                                <div className="flex items-center justify-between text-[0.68rem] text-muted-foreground font-mono">
                                  <span>Terminal Execution</span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      copyToClipboard(
                                        tool.executeCmd,
                                        `${item.id}-tool-${idx}`,
                                        tool.name,
                                      )
                                    }
                                    className="text-primary hover:underline flex items-center gap-1 cursor-pointer"
                                  >
                                    {copiedKey === `${item.id}-tool-${idx}` ? (
                                      <Check className="size-2.5" />
                                    ) : (
                                      <Copy className="size-2.5" />
                                    )}
                                    <span>Copy</span>
                                  </button>
                                </div>
                                <code className="block rounded bg-background p-2 font-mono text-[0.7rem] text-foreground border border-border/70 overflow-x-auto select-all">
                                  {tool.executeCmd}
                                </code>

                                <div className="flex items-center justify-between pt-1 border-t border-border/60">
                                  <span className="label-mono text-[0.62rem] text-muted-foreground">
                                    Official Package
                                  </span>
                                  <a
                                    href={downloadUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 rounded bg-primary text-primary-foreground px-2 py-1 text-xs font-semibold hover:bg-primary/90 transition-colors shadow-xs"
                                  >
                                    <Download className="size-3" />
                                    <span>Direct Download</span>
                                    <ExternalLink className="size-2.5 opacity-80" />
                                  </a>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Tab 3: Config */}
                    {currentTab === "config" && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono text-muted-foreground uppercase">
                            Configuration Snippet &amp; Hardening Rule:
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              copyToClipboard(
                                item.verifiedSolution.configurationFix,
                                `${item.id}-config`,
                                "Configuration snippet",
                              )
                            }
                            className="flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer"
                          >
                            {copiedKey === `${item.id}-config` ? (
                              <Check className="size-3" />
                            ) : (
                              <Copy className="size-3" />
                            )}
                            <span>
                              {copiedKey === `${item.id}-config` ? "Copied" : "Copy Configuration"}
                            </span>
                          </button>
                        </div>
                        <pre className="rounded-lg border border-border bg-background p-3 font-mono text-xs text-foreground overflow-x-auto select-all">
                          {item.verifiedSolution.configurationFix}
                        </pre>
                      </div>
                    )}

                    {/* Upstream Thread Link */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/70 text-xs">
                      <span className="text-muted-foreground">
                        Original Thread / Advisory Source:
                      </span>
                      <a
                        href={item.threadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-primary hover:underline font-mono text-[0.72rem]"
                      >
                        <span>{item.threadName}</span>
                        <ExternalLink className="size-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Directory of Open Source Security Software */}
      <div className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Wrench className="size-5 text-primary" />
          <div>
            <h3 className="text-base font-bold text-foreground">
              Featured Open Source Security Software Arsenal
            </h3>
            <p className="text-xs text-muted-foreground">
              Production-grade open source software available to deploy immediately on Linux,
              Kubernetes, and cloud servers.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 pt-2">
          {[
            {
              name: "Trivy",
              vendor: "Aqua Security",
              license: "Apache 2.0",
              category: "Vulnerability & Container Scanner",
              url: "https://github.com/aquasecurity/trivy",
              downloadUrl: "https://github.com/aquasecurity/trivy/releases/latest",
              cmd: "trivy fs --scanners vuln,secret .",
            },
            {
              name: "Falco",
              vendor: "CNCF Incubating",
              license: "Apache 2.0",
              category: "Runtime eBPF Threat Detector",
              url: "https://github.com/falcosecurity/falco",
              downloadUrl: "https://github.com/falcosecurity/falco/releases/latest",
              cmd: "falco -c /etc/falco/falco.yaml",
            },
            {
              name: "OSquery",
              vendor: "Linux Foundation",
              license: "Apache 2.0",
              category: "SQL OS Instrumentation",
              url: "https://github.com/osquery/osquery",
              downloadUrl: "https://github.com/osquery/osquery/releases/latest",
              cmd: "osqueryi 'SELECT * FROM processes;'",
            },
            {
              name: "Wazuh",
              vendor: "Wazuh Inc.",
              license: "GPL 2.0",
              category: "Open Source SIEM & XDR",
              url: "https://github.com/wazuh/wazuh",
              downloadUrl: "https://github.com/wazuh/wazuh/releases/latest",
              cmd: "wazuh-control start",
            },
            {
              name: "Semgrep",
              vendor: "Semgrep",
              license: "LGPL 2.1",
              category: "Static AST Code Analysis (SAST)",
              url: "https://github.com/semgrep/semgrep",
              downloadUrl: "https://github.com/semgrep/semgrep/releases/latest",
              cmd: "semgrep scan --config auto",
            },
            {
              name: "Suricata",
              vendor: "OISF",
              license: "GPL 2.0",
              category: "Network IDS / IPS Engine",
              url: "https://github.com/OISF/suricata",
              downloadUrl: "https://suricata.io/download/",
              cmd: "suricata -i eth0",
            },
            {
              name: "Grype",
              vendor: "Anchore",
              license: "Apache 2.0",
              category: "Fast Dependency & Image Scanner",
              url: "https://github.com/anchore/grype",
              downloadUrl: "https://github.com/anchore/grype/releases/latest",
              cmd: "grype dir:.",
            },
            {
              name: "YARA",
              vendor: "VirusTotal",
              license: "BSD-3-Clause",
              category: "Pattern Matching & Malware Classifier",
              url: "https://github.com/VirusTotal/yara",
              downloadUrl: "https://github.com/VirusTotal/yara/releases/latest",
              cmd: "yara -r rules.yar /target/dir",
            },
          ].map((tool) => (
            <div
              key={tool.name}
              className="rounded-lg border border-border bg-secondary/20 p-3 flex flex-col justify-between space-y-2 hover:border-primary/40 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-foreground">{tool.name}</span>
                  <span className="label-mono text-[0.6rem] text-muted-foreground">
                    {tool.license}
                  </span>
                </div>
                <p className="text-[0.68rem] text-primary font-medium">{tool.vendor}</p>
                <p className="text-[0.72rem] text-muted-foreground mt-1">{tool.category}</p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-border/60">
                <code className="text-[0.65rem] font-mono text-muted-foreground truncate block">
                  {tool.cmd}
                </code>
                <div className="flex items-center justify-between pt-0.5">
                  <a
                    href={tool.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-xs text-primary hover:underline"
                  >
                    <Download className="size-3" />
                    <span>Releases</span>
                  </a>
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5"
                  >
                    GitHub <ExternalLink className="size-2.5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
