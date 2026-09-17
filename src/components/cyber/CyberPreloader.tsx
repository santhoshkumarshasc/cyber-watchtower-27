import { Shield, CheckCircle2, Terminal, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

const BOOT_STEPS = [
  "Mounting CyberGuard Intelligence Engine v2.4...",
  "Synchronizing CISA US-CERT & NIST NVD telemetry feeds...",
  "Calibrating real-time recent-to-past incident queues...",
  "Initializing MITRE ATT&CK & IOC correlation tables...",
  "Activating SOC defensive sentinel neural assistant...",
];

export function CyberPreloader() {
  const [visible, setVisible] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(15);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    // Only run on session start or if forced
    if (typeof window !== "undefined") {
      const alreadyShown = sessionStorage.getItem("cyberguard_preloader_shown");
      if (!alreadyShown) {
        setVisible(true);
        sessionStorage.setItem("cyberguard_preloader_shown", "true");
      }
    }
  }, []);

  useEffect(() => {
    if (!visible) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setHasCompleted(true);
          setTimeout(() => setVisible(false), 350);
          return 100;
        }
        const next = prev + Math.floor(Math.random() * 22) + 12;
        return Math.min(next, 100);
      });
    }, 180);

    const stepInterval = setInterval(() => {
      setStepIndex((prev) => {
        if (prev < BOOT_STEPS.length - 1) return prev + 1;
        clearInterval(stepInterval);
        return prev;
      });
    }, 240);

    return () => {
      clearInterval(interval);
      clearInterval(stepInterval);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/98 backdrop-blur-lg px-4 font-mono transition-opacity duration-300">
      <div className="w-full max-w-md rounded-xl border border-primary/30 bg-card p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/80 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded bg-primary/20 text-primary">
              <Shield className="size-4 animate-pulse" />
            </span>
            <span className="text-sm font-bold font-display tracking-wider text-foreground">
              CYBER<span className="text-primary">GUARD</span> // BOOT_SEQ
            </span>
          </div>
          <span className="text-[0.68rem] text-primary label-mono">SYS_INIT</span>
        </div>

        {/* Console Steps Log */}
        <div className="space-y-1.5 text-xs text-muted-foreground bg-background/60 rounded p-3 border border-border/50 min-h-[90px]">
          {BOOT_STEPS.slice(0, stepIndex + 1).map((step, idx) => {
            const isLatest = idx === stepIndex;
            return (
              <div key={step} className="flex items-center gap-2 text-[0.72rem]">
                {isLatest && progress < 100 ? (
                  <Terminal className="size-3 text-primary animate-pulse shrink-0" />
                ) : (
                  <CheckCircle2 className="size-3 text-emerald-500 shrink-0" />
                )}
                <span
                  className={isLatest ? "text-foreground font-medium" : "text-muted-foreground"}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground label-mono text-[0.68rem]">
              Integrity Telemetry
            </span>
            <span className="font-bold text-primary">{Math.min(progress, 100)}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-primary transition-all duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Footer / Skip Action */}
        <div className="flex items-center justify-between pt-1 text-[0.7rem] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-primary animate-ping" />
            Active Defenses Online
          </span>
          <button
            type="button"
            onClick={() => setVisible(false)}
            className="text-primary hover:underline flex items-center gap-0.5 cursor-pointer font-medium"
          >
            <span>Skip</span>
            <ChevronRight className="size-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
