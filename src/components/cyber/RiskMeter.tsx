function riskColor(value: number) {
  if (value >= 75) return "var(--critical)";
  if (value >= 55) return "var(--high)";
  if (value >= 35) return "var(--medium)";
  return "var(--low)";
}

export function RiskMeter({ value, size = 190 }: { value: number; size?: number }) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (clamped / 100) * circumference * 0.75;
  const track = circumference * 0.75;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-[135deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${track} ${circumference}`}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={riskColor(clamped)}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          className="transition-[stroke-dasharray] duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-display text-5xl font-bold tabular-nums"
          style={{ color: riskColor(clamped) }}
        >
          {clamped}%
        </span>
        <span className="label-mono mt-1">Global risk</span>
      </div>
    </div>
  );
}

export function RiskBar({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full transition-[width] duration-700"
        style={{ width: `${clamped}%`, backgroundColor: riskColor(clamped) }}
      />
    </div>
  );
}
