import { ReactNode } from 'react';

type ChartCardProps = {
  title: string;
  value: string;
  footer?: string;
  children: ReactNode;
};

export default function ChartCard({ title, value, footer, children }: ChartCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-panel">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">{value}</p>
        </div>
        <div className="text-xs text-slate-400">Live</div>
      </div>
      <div className="h-44">{children}</div>
      {footer ? <p className="mt-4 text-sm text-slate-500">{footer}</p> : null}
    </div>
  );
}
