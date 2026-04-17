type ChecklistItemProps = {
  step: string;
  description: string;
  completed?: boolean;
  active?: boolean;
};

export default function ChecklistItem({ step, description, completed, active }: ChecklistItemProps) {
  return (
    <div className={`rounded-3xl border p-4 ${active ? 'border-slate-900 bg-slate-50' : 'border-slate-200 bg-white'}`}>
      <div className="flex items-center gap-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-2xl text-sm font-semibold ${
            completed ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
          }`}
        >
          {completed ? '✓' : step.slice(0, 1)}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">{step}</p>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
      </div>
    </div>
  );
}
