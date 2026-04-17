import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import ChartCard from '../components/ChartCard';
import { reportEntries } from '../data/mockData';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-panel">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Reports</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">Weekly summary</h2>
          </div>
          <button className="rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
            Export report
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <ChartCard title="Weekly health score" value="89" footer="Last 4 weeks">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={reportEntries} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="week" tickLine={false} axisLine={false} />
              <YAxis domain={[70, 100]} tickLine={false} axisLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="score" stroke="#0f172a" fill="#0f172a" fillOpacity={0.12} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-panel">
          <h3 className="text-lg font-semibold text-slate-900">Summary</h3>
          <p className="mt-4 text-sm text-slate-600">
            This week shows a stable network score with a slight improvement on VLAN and DNS checks.
          </p>
          <div className="mt-6 space-y-4">
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Top risk</p>
              <p className="mt-2 font-semibold text-slate-900">VLAN isolation failure</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Recommendation</p>
              <p className="mt-2 font-semibold text-slate-900">Audit trunk ACL and VLAN tagging.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
