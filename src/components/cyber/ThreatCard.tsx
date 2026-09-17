import { FileText, MapPin, ShieldAlert, Users } from "lucide-react";

import { RiskBar } from "./RiskMeter";
import { severityStyles, type Threat } from "@/lib/threat-types";

export function ThreatCard({ threat }: { threat: Threat }) {
  const severity = severityStyles[threat.severity];

  return (
    <article className="panel group relative overflow-hidden p-5 transition-colors hover:border-primary/50">
      <div
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ backgroundColor: `var(--${threat.severity})` }}
      />
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full border px-2.5 py-0.5 font-mono text-[0.65rem] tracking-[0.14em] uppercase ${severity.bg} ${severity.text}`}
        >
          {severity.label}
        </span>
        <span className="label-mono">{threat.category}</span>
        <span className="ml-auto label-mono">{threat.publishedLabel}</span>
      </div>

      <h3 className="mt-3 text-lg leading-snug font-semibold">{threat.title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{threat.summary}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div>
          <span className="label-mono">Risk</span>
          <div className="mt-1 flex items-center gap-2">
            <span className={`font-mono text-sm font-semibold ${severity.text}`}>
              {Math.round(threat.riskPercent)}%
            </span>
            <RiskBar value={threat.riskPercent} />
          </div>
        </div>
        <div>
          <span className="label-mono">Affected</span>
          <p className="mt-1 flex items-center gap-1.5 text-sm">
            <Users className="size-3.5 text-muted-foreground" />
            {threat.affectedPeople}
          </p>
        </div>
        <div>
          <span className="label-mono">Regions</span>
          <p className="mt-1 flex items-center gap-1.5 text-sm">
            <MapPin className="size-3.5 text-muted-foreground" />
            {threat.regions.join(", ")}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-md border border-primary/25 bg-primary/10 p-3">
        <span className="label-mono text-primary">Do this now</span>
        <p className="mt-1 text-sm">{threat.recommendedAction}</p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3">
        <span className="flex items-center gap-1.5 label-mono">
          <ShieldAlert className="size-3.5" /> {threat.source}
        </span>
        {threat.documents.map((doc) => (
          <span
            key={doc.title}
            className="flex items-center gap-1.5 rounded border border-border bg-secondary/50 px-2 py-1 text-xs text-muted-foreground"
          >
            <FileText className="size-3.5" />
            {doc.title}
          </span>
        ))}
      </div>
    </article>
  );
}
