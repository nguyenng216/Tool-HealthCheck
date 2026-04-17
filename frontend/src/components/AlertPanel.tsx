type AlertPanelProps = {
  title: string;
  description: string;
  type?: 'info' | 'warning' | 'critical';
};

const styles = {
  info: 'border-sky-200 bg-sky-50 text-sky-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  critical: 'border-rose-200 bg-rose-50 text-rose-900',
};

export default function AlertPanel({ title, description, type = 'info' }: AlertPanelProps) {
  return (
    <div className={`rounded-3xl border p-5 ${styles[type]}`}>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-2 text-sm leading-6">{description}</p>
    </div>
  );
}
