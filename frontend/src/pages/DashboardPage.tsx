import { useEffect, useMemo, useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import StatusBadge from '../components/StatusBadge';
import ChartCard from '../components/ChartCard';
import AlertPanel from '../components/AlertPanel';

type HealthcheckItem = {
  id: number;
  status: string;
  createdAt: string;
  details?: {
    checks?: Array<{
      checkName: string;
      status: string;
      metrics?: Record<string, unknown>;
      message?: string;
    }>;
    diagnosis?: {
      issue: string;
      recommendation: string;
      severity: string;
      root_cause: string;
    };
  };
};

function mapStatusToScore(status: string) {
  if (status === 'OK') return 95;
  if (status === 'WARNING') return 75;
  if (status === 'CRITICAL') return 45;
  return 60;
}

export default function DashboardPage() {
  const [healthchecks, setHealthchecks] = useState<HealthcheckItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchHealthchecks() {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('/api/healthchecks/1');
        if (!response.ok) {
          const body = await response.text();
          throw new Error(body || response.statusText || 'Unable to load live dashboard data');
        }
        const payload = (await response.json()) as HealthcheckItem[];
        setHealthchecks(payload);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load live dashboard data');
      } finally {
        setLoading(false);
      }
    }

    fetchHealthchecks();
  }, []);

  const latest = healthchecks[0];
  const checks = latest?.details?.checks ?? [];
  const passedChecks = checks.filter((check) => check.status === 'OK').length;
  const warningChecks = checks.filter((check) => check.status === 'WARNING').length;
  const criticalChecks = checks.filter((check) => check.status === 'CRITICAL').length;
  const score = checks.length > 0 ? Math.round((passedChecks / checks.length) * 100) : 0;
  const chartData = healthchecks.slice(0, 7).reverse().map((healthcheck) => ({
    label: new Date(healthcheck.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: mapStatusToScore(healthcheck.status),
  }));
  const trend = healthchecks.length > 1 ? score - mapStatusToScore(healthchecks[1].status) : 0;

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-panel">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Overall health</p>
              <h2 className="mt-3 text-4xl font-semibold text-slate-900">
                {loading ? 'Loading…' : latest ? `${score}%` : 'No data'}
              </h2>
              <p className="mt-3 max-w-xl text-sm text-slate-500">
                {loading
                  ? 'Fetching latest live healthcheck results.'
                  : latest
                  ? `Last update ${new Date(latest.createdAt).toLocaleString()}`
                  : 'Live data is not available. Run a healthcheck on a device to populate the dashboard.'}
              </p>
            </div>
            <div className="rounded-3xl bg-slate-50 px-4 py-3 text-slate-700 shadow-sm">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Trend</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">
                {trend > 0 ? `+${trend}` : trend < 0 ? trend : '0'}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Device health</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{latest?.status ?? 'Unknown'}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Checks passed</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{passedChecks}/{checks.length}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Warning checks</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{warningChecks}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Critical checks</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{criticalChecks}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {error ? (
            <AlertPanel title="Live dashboard error" description={error} type="critical" />
          ) : null}

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-panel">
            <h3 className="text-sm uppercase tracking-[0.2em] text-slate-500">Latest health status</h3>
            <div className="mt-6 space-y-3">
              {latest ? (
                <div className="space-y-4">
                  <div className="rounded-3xl border border-slate-100 px-4 py-4">
                    <p className="font-semibold text-slate-900">Status</p>
                    <p className="mt-2 text-sm text-slate-500">{latest.status}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-100 px-4 py-4">
                    <p className="font-semibold text-slate-900">Issue</p>
                    <p className="mt-2 text-sm text-slate-500">{latest.details?.diagnosis?.issue ?? 'No issue information available'}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-100 px-4 py-4">
                    <p className="font-semibold text-slate-900">Recommendation</p>
                    <p className="mt-2 text-sm text-slate-500">{latest.details?.diagnosis?.recommendation ?? 'No recommendation available'}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">No recent healthcheck data found for this device. Run a live healthcheck from the healthcheck page.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <ChartCard title="Recent health score" value={latest ? `${score}%` : 'N/A'} footer="Last 7 runs">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip />
              <Area type="monotone" dataKey="score" stroke="#2563eb" fill="#2563eb" fillOpacity={0.12} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Status breakdown" value="Live" footer="Based on latest check">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[
              { name: 'OK', value: passedChecks },
              { name: 'Warning', value: warningChecks },
              { name: 'Critical', value: criticalChecks },
            ]} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#0f172a" radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>
    </div>
  );
}
