interface ProgressBarProps {
  /** Number of completed items */
  completed: number;
  /** Total number of items */
  total: number;
  /** Optional label override — defaults to "X of Y items packed" */
  label?: string;
  /** Color variant */
  color?: 'blue' | 'green' | 'amber';
  /** Height of the bar in pixels */
  height?: number;
  /** Show percentage text */
  showPercent?: boolean;
}

const COLOR_MAP: Record<string, { bar: string; bg: string; text: string }> = {
  blue: { bar: 'bg-blue-600', bg: 'bg-blue-100', text: 'text-blue-700' },
  green: { bar: 'bg-emerald-500', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  amber: { bar: 'bg-amber-500', bg: 'bg-amber-100', text: 'text-amber-700' },
};

export function ProgressBar({
  completed,
  total,
  label,
  color = 'blue',
  height = 8,
  showPercent = false,
}: ProgressBarProps) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  const c = COLOR_MAP[color];
  const defaultLabel = `${completed} of ${total} item${total !== 1 ? 's' : ''} packed`;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className={`text-xs font-medium ${c.text}`}>{label || defaultLabel}</span>
        {showPercent && <span className={`text-xs font-bold ${c.text}`}>{pct}%</span>}
      </div>
      <div className={`w-full rounded-full overflow-hidden ${c.bg}`} style={{ height }}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${c.bar}`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label || defaultLabel}
        />
      </div>
    </div>
  );
}
