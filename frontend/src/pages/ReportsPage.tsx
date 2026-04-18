import { useEffect, useMemo, useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import ChartCard from '../components/ChartCard';
import AlertPanel from '../components/AlertPanel';

type HealthcheckItem = {
  id: number;
  status: string;
  createdAt: string;
  details?: {
    checks?: Array<{ checkName: string; status: string; }>; 
    diagnosis?: { issue: string; recommendation: string; severity: string; root_cause: string; };
  };
};

function mapStatusToScore(status: string) {
  if (status === 'OK') return 95;
  if (status === 'WARNING') return 75;
  if (status === 'CRITICAL') return 45;
  return 60;
}

export default function ReportsPage() {
  const [healthchecks, setHealthchecks] = useState<HealthcheckItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchReports() {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('/api/healthchecks/1');
        if (!response.ok) {
          const body = await response.text();
          throw new Error(body || response.statusText || 'Unable to load report data');
        }
        const payload = (await response.json()) as HealthcheckItem[];
        setHealthchecks(payload.slice(0, 7));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load report data');
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, []);

  const latest = healthchecks[0];
  const chartData = useMemo(
    () =>
      healthchecks
        .slice()
        .reverse()
        .map((item) => ({
          week: new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          score: mapStatusToScore(item.status),
        })),
    [healthchecks],
  );

  const averageScore = healthchecks.length
    ? Math.round(healthchecks.reduce((sum, item) => sum + mapStatusToScore(item.status), 0) / healthchecks.length)
    : 0;

  return (
    <div className="space-y-6">
      {error ? <AlertPanel title="Report load error" description={error} type="critical" /> : null}

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-panel">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Reports</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">Live health summary</h2>
          </div>
          <button className="rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
            Export report
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <ChartCard title="Recent health score" value={loading ? 'Loading...' : `${averageScore}%`} footer="Last 7 runs">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="week" tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} tickLine={false} axisLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="score" stroke="#0f172a" fill="#0f172a" fillOpacity={0.12} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-panel">
          <h3 className="text-lg font-semibold text-slate-900">Summary</h3>
          <p className="mt-4 text-sm text-slate-600">
            {latest
              ? `Most recent healthcheck status: ${latest.status}. ${latest.details?.diagnosis?.issue ?? 'No current issue summary available.'}`
              : 'No live healthcheck history available for this device. Run a healthcheck to generate report data.'}
          </p>
          <div className="mt-6 space-y-4">
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Average score</p>
              <p className="mt-2 font-semibold text-slate-900">{loading ? 'Loading...' : `${averageScore}%`}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Latest recommendation</p>
              <p className="mt-2 font-semibold text-slate-900">{latest?.details?.diagnosis?.recommendation ?? 'Not available'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
