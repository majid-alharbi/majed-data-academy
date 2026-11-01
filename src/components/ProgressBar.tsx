export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const v = Math.max(0, Math.min(1, value));
  return (
    <div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-navy-700" role="progressbar" aria-valuenow={Math.round(v * 100)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <div className="h-full rounded-full bg-navy-600 transition-all duration-500 dark:bg-navy-200" style={{ width: `${v * 100}%` }} />
      </div>
    </div>
  );
}
