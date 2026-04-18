import { useEffect, useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import AlertPanel from '../components/AlertPanel';

type HealthcheckItem = {
  id: number;
  status: string;
  createdAt: string;
  details?: {
    checks?: Array<{
      checkName: string;
      status: string;
      message?: string;
      metrics?: Record<string, unknown>;
    }>;
    diagnosis?: {
      issue: string;
      recommendation: string;
      severity: string;
      root_cause: string;
    };
  };
};

export default function DeviceDetailPage() {
  const [healthcheck, setHealthcheck] = useState<HealthcheckItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadHealthcheck() {
      try {
        setLoading(true);
        setError('');
        const response = await fetch('/api/healthchecks/1');
        if (!response.ok) {
          const body = await response.text();
          throw new Error(body || response.statusText || 'Unable to load device details');
        }
        const payload = (await response.json()) as HealthcheckItem[];
        setHealthcheck(payload[0] ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load device details');
      } finally {
        setLoading(false);
      }
    }

    loadHealthcheck();
  }, []);

  return (
    <div className="space-y-6">
      {error ? (
        <AlertPanel title="Device detail error" description={error} type="critical" />
      ) : null}

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-panel">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Device</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">Live Device Detail</h2>
            <div className="mt-3 flex items-center gap-3">
              <StatusBadge label={healthcheck?.status ?? 'PENDING'} status={(healthcheck?.status as 'OK' | 'WARNING' | 'CRITICAL' | 'PENDING') ?? 'PENDING'} />
              <p className="text-sm text-slate-500">
                {healthcheck
                  ? `Last healthcheck ${new Date(healthcheck.createdAt).toLocaleString()}`
                  : loading
                  ? 'Loading latest device state…'
                  : 'No live healthcheck data yet.'}
              </p>
            </div>
          </div>
          <div className="rounded-3xl bg-slate-50 px-4 py-3 text-slate-700 shadow-sm">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Status</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">{healthcheck?.status ?? 'Unknown'}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-panel">
          <h3 className="text-lg font-semibold text-slate-900">Checks</h3>
          <div className="mt-6 space-y-4">
            {healthcheck?.details?.checks?.length ? (
              healthcheck.details.checks.map((check) => (
                <div key={check.checkName} className="rounded-3xl border border-slate-100 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">{check.checkName}</p>
                      <p className="text-sm text-slate-500">{check.message ?? 'Live check result'}</p>
                    </div>
                    <StatusBadge label={check.status} status={check.status as 'OK' | 'WARNING' | 'CRITICAL' | 'PENDING'} />
                  </div>
                  {check.metrics ? (
                    <pre className="mt-3 overflow-x-auto rounded-2xl bg-slate-50 p-3 text-xs text-slate-600">
                      {JSON.stringify(check.metrics, null, 2)}
                    </pre>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-slate-100 p-6 text-sm text-slate-500">
                No live check results available. Run a healthcheck to fetch real device metrics.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-panel">
          <h3 className="text-lg font-semibold text-slate-900">Diagnosis</h3>
          <div className="mt-6 space-y-4 text-sm text-slate-600">
            <div>
              <p className="font-semibold text-slate-900">Issue</p>
              <p className="mt-2">{healthcheck?.details?.diagnosis?.issue ?? 'No issue reported'}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Root cause</p>
              <p className="mt-2">{healthcheck?.details?.diagnosis?.root_cause ?? 'No root cause available'}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Recommendation</p>
              <p className="mt-2">{healthcheck?.details?.diagnosis?.recommendation ?? 'No recommendation available'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
