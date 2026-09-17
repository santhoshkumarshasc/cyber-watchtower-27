import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { FileText, Users, ExternalLink, Search, ShieldAlert, X, Eye } from "lucide-react";

import { ErrorPanel, LoadingPanel } from "@/components/cyber/States";
import { ThreatDetailModal } from "@/components/cyber/ThreatDetailModal";
import { briefingQueryOptions } from "@/lib/threat-queries";
import { severityStyles, type Threat } from "@/lib/threat-types";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Advisories & Documents — CyberGuard" },
      {
        name: "description",
        content:
          "Related advisories, technical reports and patch notes for each active cyber incident, with affected-people details.",
      },
      { property: "og:title", content: "Advisories & Documents — CyberGuard" },
      {
        property: "og:description",
        content: "Reference documents behind every tracked cyber incident.",
      },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const { data, isPending, error, refetch } = useQuery(briefingQueryOptions);
  const [search, setSearch] = useState("");
  const [selectedThreat, setSelectedThreat] = useState<Threat | null>(null);

  const filteredThreats = useMemo(() => {
    if (!data?.threats) return [];
    const q = search.trim().toLowerCase();
    if (!q) return data.threats;
    return data.threats.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.source.toLowerCase().includes(q) ||
        t.documents.some(
          (d) => d.title.toLowerCase().includes(q) || d.issuer.toLowerCase().includes(q),
        ),
    );
  }, [data, search]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="label-mono text-primary">Intelligence Library</span>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold">
            Advisories &amp; Official Directives
          </h1>
          <p className="mt-1.5 max-w-2xl text-xs sm:text-sm text-muted-foreground">
            Official emergency directives, technical vendor whitepapers, and remediation guides with
            direct external source access.
          </p>
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents or issuers…"
            className="w-full rounded-md border border-input bg-card pl-9 pr-8 py-2 text-xs sm:text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </header>

      {isPending ? <LoadingPanel label="Collecting advisories" /> : null}
      {error ? <ErrorPanel message={(error as Error).message} onRetry={() => refetch()} /> : null}

      <div className="space-y-4">
        {filteredThreats.map((threat) => {
          const sourceLink =
            threat.sourceUrl ||
            `https://www.google.com/search?q=${encodeURIComponent(threat.title + " cybersecurity advisory")}`;

          return (
            <article key={threat.id} className="panel p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-2.5 py-0.5 font-mono text-[0.65rem] tracking-widest uppercase ${severityStyles[threat.severity].bg} ${severityStyles[threat.severity].text}`}
                  >
                    {severityStyles[threat.severity].label}
                  </span>
                  <span className="label-mono">{threat.category}</span>
                  <span className="label-mono text-muted-foreground">&middot; {threat.source}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="size-3.5" />
                    {threat.affectedPeople}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedThreat(threat)}
                    className="flex items-center gap-1 rounded bg-secondary px-2.5 py-1 text-xs font-medium text-foreground hover:bg-secondary/80"
                  >
                    <Eye className="size-3" />
                    <span>Dossier</span>
                  </button>
                  {/* Open Original Source Button */}
                  <a
                    href={sourceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded bg-primary/90 px-3 py-1 text-xs font-semibold text-primary-foreground hover:bg-primary transition-colors shadow-xs"
                    title="Open original incident source advisory"
                  >
                    <span>Source</span>
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>

              <div>
                <h2 className="text-base sm:text-lg font-semibold text-foreground">
                  {threat.title}
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {threat.summary}
                </p>
              </div>

              {/* Document Reference Grid with Direct Source Links */}
              <div className="grid gap-2.5 sm:grid-cols-2 pt-1 border-t border-border/60">
                {threat.documents.map((doc) => {
                  const docUrl =
                    doc.url ||
                    `https://www.google.com/search?q=${encodeURIComponent(doc.title + " " + doc.issuer)}`;

                  return (
                    <div
                      key={doc.title}
                      className="flex items-start justify-between gap-3 rounded-md border border-border bg-secondary/30 p-3 hover:border-primary/40 transition-colors"
                    >
                      <div className="flex items-start gap-2.5">
                        <FileText className="mt-0.5 size-4 shrink-0 text-primary" />
                        <div>
                          <p className="text-xs sm:text-sm font-medium leading-snug">{doc.title}</p>
                          <p className="label-mono text-[0.68rem] mt-1 text-muted-foreground">
                            {doc.kind} &middot; {doc.issuer}
                          </p>
                        </div>
                      </div>

                      <a
                        href={docUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 flex items-center gap-1 rounded bg-secondary px-2 py-1 text-xs text-primary hover:bg-secondary/80 transition-colors"
                        title="Open Document Source"
                      >
                        <span className="hidden sm:inline text-[0.7rem]">Source</span>
                        <ExternalLink className="size-3" />
                      </a>
                    </div>
                  );
                })}
              </div>
            </article>
          );
        })}

        {filteredThreats.length === 0 && data && (
          <div className="panel p-10 text-center text-sm text-muted-foreground">
            No advisories match your search criteria.
          </div>
        )}
      </div>

      <ThreatDetailModal
        threat={selectedThreat}
        open={Boolean(selectedThreat)}
        onOpenChange={(open) => {
          if (!open) setSelectedThreat(null);
        }}
      />
    </div>
  );
}
