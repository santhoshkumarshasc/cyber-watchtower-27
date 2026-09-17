import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { FileText, Users } from "lucide-react";

import { ErrorPanel, LoadingPanel } from "@/components/cyber/States";
import { briefingQueryOptions } from "@/lib/threat-queries";
import { severityStyles } from "@/lib/threat-types";

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

  return (
    <div className="space-y-6">
      <header>
        <span className="label-mono text-primary">Library</span>
        <h1 className="mt-2 text-3xl font-bold">Advisories &amp; related documents</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Every incident in the feed with the reference material issued about it and who it affects.
        </p>
      </header>

      {isPending ? <LoadingPanel label="Collecting advisories" /> : null}
      {error ? <ErrorPanel message={(error as Error).message} onRetry={() => refetch()} /> : null}

      <div className="space-y-4">
        {data?.threats.map((threat) => (
          <article key={threat.id} className="panel p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full border px-2.5 py-0.5 font-mono text-[0.65rem] tracking-widest uppercase ${severityStyles[threat.severity].bg} ${severityStyles[threat.severity].text}`}
              >
                {severityStyles[threat.severity].label}
              </span>
              <span className="label-mono">{threat.category}</span>
              <span className="ml-auto flex items-center gap-1.5 text-sm text-muted-foreground">
                <Users className="size-3.5" />
                {threat.affectedPeople}
              </span>
            </div>
            <h2 className="mt-3 text-lg font-semibold">{threat.title}</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">{threat.summary}</p>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {threat.documents.map((doc) => (
                <div
                  key={doc.title}
                  className="flex items-start gap-3 rounded-md border border-border bg-secondary/40 p-3"
                >
                  <FileText className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{doc.title}</p>
                    <p className="label-mono mt-1">
                      {doc.kind} · {doc.issuer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
