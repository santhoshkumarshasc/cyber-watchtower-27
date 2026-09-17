import { AlertTriangle, Loader2 } from "lucide-react";

export function LoadingPanel({ label }: { label: string }) {
  return (
    <div className="panel flex flex-col items-center justify-center gap-3 p-14 text-center">
      <Loader2 className="size-6 animate-spin text-primary" />
      <p className="label-mono">{label}</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        Scanning advisories, vendor labs and security press. This takes a few seconds.
      </p>
    </div>
  );
}

export function ErrorPanel({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="panel flex flex-col items-center justify-center gap-3 border-critical/40 p-14 text-center">
      <AlertTriangle className="size-6 text-critical" />
      <p className="label-mono text-critical">Feed interrupted</p>
      <p className="max-w-md text-sm text-muted-foreground">{message}</p>
      <button
        onClick={onRetry}
        className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Try again
      </button>
    </div>
  );
}
