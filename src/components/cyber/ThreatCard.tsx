import { useState } from "react";
import {
  FileText,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  Users,
  ExternalLink,
  ChevronRight,
  Info,
  Clock,
} from "lucide-react";

import { RiskBar } from "./RiskMeter";
import { ThreatDetailModal } from "./ThreatDetailModal";
import { severityStyles, type Threat } from "@/lib/threat-types";
import { useMinuteTicker, getLiveRelativeTime, getFormattedExactTime } from "@/lib/threat-utils";

interface ThreatCardProps {
  threat: Threat;
  onOpenDetails?: (threat: Threat) => void;
}

export function ThreatCard({ threat, onOpenDetails }: ThreatCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  // Re-evaluates relative timestamp whenever minute ticker fires
  useMinuteTicker(30);

  const severity = severityStyles[threat.severity];
  const liveTime = getLiveRelativeTime(threat.publishedLabel);
  const exactTime = getFormattedExactTime(threat.publishedLabel);

  const sourceLink =
    threat.sourceUrl ||
    `https://www.google.com/search?q=${encodeURIComponent(threat.title + " cyber advisory")}`;

  const handleOpenDetails = () => {
    if (onOpenDetails) {
      onOpenDetails(threat);
    } else {
      setModalOpen(true);
    }
  };

  return (
    <>
      <article className="group relative flex flex-col justify-between overflow-hidden rounded-lg border border-border bg-card p-4 sm:p-5 transition-all hover:border-primary/50 hover:shadow-sm">
        <div>
          {/* Header metadata */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded px-2 py-0.5 text-[0.68rem] font-bold uppercase tracking-wider ${severity.bg} ${severity.text}`}
            >
              {severity.label}
            </span>
            <span className="text-xs font-semibold text-muted-foreground">{threat.category}</span>
            <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[0.68rem] font-medium text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="size-3 text-emerald-500" />
              <span>Verified Advisory</span>
            </span>
            <span
              className="ml-auto flex items-center gap-1 text-xs text-muted-foreground"
              title={`Logged: ${exactTime.local} (${exactTime.utc})`}
            >
              <Clock className="size-3 text-primary" />
              <span className="font-medium text-foreground">{liveTime}</span>
            </span>
          </div>

          {/* Title & Summary */}
          <h3
            className="mt-3 text-base sm:text-lg leading-snug font-semibold text-foreground group-hover:text-primary transition-colors cursor-pointer"
            onClick={handleOpenDetails}
          >
            {threat.title}
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {threat.summary}
          </p>

          {/* Risk Metrics */}
          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 rounded-md bg-secondary/30 p-2.5">
            <div>
              <span className="text-[0.68rem] font-medium text-muted-foreground uppercase">
                Risk score
              </span>
              <div className="mt-1 flex items-center gap-1.5">
                <span className={`text-xs sm:text-sm font-bold ${severity.text}`}>
                  {Math.round(threat.riskPercent)}%
                </span>
                <div className="flex-1 max-w-[60px]">
                  <RiskBar value={threat.riskPercent} />
                </div>
              </div>
            </div>

            <div>
              <span className="text-[0.68rem] font-medium text-muted-foreground uppercase">
                Affected
              </span>
              <p className="mt-1 flex items-center gap-1 text-xs text-foreground truncate">
                <Users className="size-3 text-muted-foreground shrink-0" />
                <span className="truncate">{threat.affectedPeople}</span>
              </p>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <span className="text-[0.68rem] font-medium text-muted-foreground uppercase">
                Regions
              </span>
              <p className="mt-1 flex items-center gap-1 text-xs text-foreground truncate">
                <MapPin className="size-3 text-muted-foreground shrink-0" />
                <span className="truncate">{threat.regions.join(", ")}</span>
              </p>
            </div>
          </div>

          {/* Immediate Action */}
          <div className="mt-3.5 rounded-md border border-primary/20 bg-primary/5 p-3">
            <span className="text-[0.7rem] font-semibold text-primary uppercase tracking-wide">
              Recommended Action
            </span>
            <p className="mt-0.5 text-xs sm:text-sm font-medium text-foreground">
              {threat.recommendedAction}
            </p>
          </div>

          {/* Document references */}
          {threat.documents && threat.documents.length > 0 ? (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {threat.documents.map((doc) =>
                doc.url ? (
                  <a
                    key={doc.title}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded border border-border bg-secondary/60 px-2 py-0.5 text-[0.7rem] text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                    title={`Open ${doc.issuer}`}
                  >
                    <FileText className="size-3 text-primary shrink-0" />
                    <span className="truncate max-w-[200px]">{doc.title}</span>
                    <ExternalLink className="size-2.5 shrink-0 opacity-70" />
                  </a>
                ) : (
                  <span
                    key={doc.title}
                    className="flex items-center gap-1 rounded border border-border bg-secondary/40 px-2 py-0.5 text-[0.7rem] text-muted-foreground"
                  >
                    <FileText className="size-3 shrink-0" />
                    <span className="truncate max-w-[200px]">{doc.title}</span>
                  </span>
                ),
              )}
            </div>
          ) : null}
        </div>

        {/* Footer Actions: Source & Buttons */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
          <div className="flex items-center gap-2 label-mono text-xs truncate max-w-[220px]">
            <ShieldCheck className="size-3.5 text-emerald-400 shrink-0" />
            <span className="truncate text-foreground font-medium">
              {threat.verificationAgency || threat.source}
            </span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* View More Details Button */}
            <button
              type="button"
              onClick={handleOpenDetails}
              className="flex items-center gap-1 rounded-md border border-border bg-secondary px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-secondary/80 transition-colors"
            >
              <span>View details</span>
              <ChevronRight className="size-3" />
            </button>

            {/* Prominent Open Original Source Button */}
            <a
              href={sourceLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-md bg-primary/90 px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary transition-colors shadow-xs"
              title="Open original advisory or news source in new tab"
            >
              <span>Source</span>
              <ExternalLink className="size-3" />
            </a>
          </div>
        </div>
      </article>

      {!onOpenDetails && (
        <ThreatDetailModal threat={threat} open={modalOpen} onOpenChange={setModalOpen} />
      )}
    </>
  );
}
