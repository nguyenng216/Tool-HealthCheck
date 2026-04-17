type StatusBadgeProps = {
  label: string;
  status: 'OK' | 'WARNING' | 'CRITICAL' | 'PENDING';
};

const statusStyles = {
  OK: 'bg-emerald-100 text-emerald-700',
  WARNING: 'bg-amber-100 text-amber-700',
  CRITICAL: 'bg-rose-100 text-rose-700',
  PENDING: 'bg-slate-100 text-slate-700',
};

export default function StatusBadge({ label, status }: StatusBadgeProps) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status]}`}>
      {label}
    </span>
  );
}
