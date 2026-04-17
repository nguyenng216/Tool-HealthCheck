import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import StatusBadge from '../components/StatusBadge';
import ChartCard from '../components/ChartCard';
import AlertPanel from '../components/AlertPanel';
import { healthScore, deviceStatus, trafficData, healthBreakdown } from '../data/mockData';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-panel">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Overall health</p>
              <h2 className="mt-3 text-4xl font-semibold text-slate-900">{healthScore}%</h2>
              <p className="mt-3 max-w-xl text-sm text-slate-500">
                Health score is computed from device state, alert volume, and recent check results.
              </p>
            </div>
            <div className="rounded-3xl bg-slate-50 px-4 py-3 text-slate-700 shadow-sm">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Trend</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">+4%</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Active devices</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">24</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Alerts</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">8</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Checks passed</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">91%</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Pending tasks</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">5</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <AlertPanel
            title="Network fabric alert"
            description="One VLAN segment is compromised by a misconfigured trunk and must be isolated before next maintenance window."
            type="warning"
          />
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-panel">
            <h3 className="text-sm uppercase tracking-[0.2em] text-slate-500">Device status</h3>
            <div className="mt-6 space-y-3">
              {deviceStatus.map((device) => (
                <div key={device.name} className="flex items-center justify-between rounded-3xl border border-slate-100 px-4 py-4">
                  <div>
                    <p className="font-semibold text-slate-900">{device.name}</p>
                    <p className="text-sm text-slate-500">{device.status}</p>
                  </div>
                  <StatusBadge label={device.badge} status={device.badge as 'OK' | 'WARNING' | 'CRITICAL' | 'PENDING'} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <ChartCard title="Traffic over time" value="1.2 Gbps" footer="Peak at 12:00 UTC">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trafficData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="trafficGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.36} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="traffic" stroke="#2563eb" fillOpacity={1} fill="url(#trafficGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Health distribution" value="Stable" footer="Based on last 24 hours">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={healthBreakdown} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#0f172a" radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>
    </div>
  );
}
