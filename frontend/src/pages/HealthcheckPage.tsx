import { useMemo, useState } from 'react';
import ChecklistItem from '../components/ChecklistItem';
import AlertPanel from '../components/AlertPanel';
import StatusBadge from '../components/StatusBadge';

const steps = [
  { step: 'Physical', description: 'Inspect cabling and power.', completed: true },
  { step: 'Device', description: 'Validate device health and firmware.', completed: true },
  { step: 'Network', description: 'Verify topology and routing.', completed: false, active: true },
  { step: 'VLAN', description: 'Confirm isolation and tagging.', completed: false },
  { step: 'DNS', description: 'Test resolver performance.', completed: false },
];

type HealthcheckResult = {
  healthcheck: {
    status: string;
    details: Record<string, unknown>;
  };
  diagnosis: {
    issue: string;
    severity: string;
    root_cause: string;
    recommendation: string;
  };
};

export default function HealthcheckPage() {
  const [result, setResult] = useState<HealthcheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const statusBadge = useMemo(() => {
    if (!result) return { label: 'Not run', status: 'PENDING' as const };
    return { label: result.healthcheck.status, status: result.healthcheck.status as 'OK' | 'WARNING' | 'CRITICAL' | 'PENDING' };
  }, [result]);

  async function handleRunHealthcheck() {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/healthchecks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: 1, policy: 'standard', mode: 'parallel' }),
      });

      if (!response.ok) {
        throw new Error(`Healthcheck failed: ${response.statusText}`);
      }

      setResult(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-panel">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Healthcheck workflow</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900">Network checklist</h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">Last result:</span>
              <StatusBadge label={statusBadge.label} status={statusBadge.status} />
            </div>
            <button
              onClick={handleRunHealthcheck}
              disabled={loading}
              className="rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {loading ? 'Running...' : 'Run Healthcheck'}
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <AlertPanel title="Healthcheck error" description={error} type="critical" />
      ) : null}

      {result ? (
        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-panel">
            <h3 className="text-lg font-semibold text-slate-900">Diagnosis</h3>
            <p className="mt-4 text-sm text-slate-600">{result.diagnosis.issue}</p>
            <div className="mt-5 rounded-3xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Severity</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{result.diagnosis.severity}</p>
            </div>
            <div className="mt-5 space-y-4 text-sm text-slate-600">
              <div>
                <p className="font-semibold text-slate-900">Root Cause</p>
                <p className="mt-2">{result.diagnosis.root_cause}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Recommendation</p>
                <p className="mt-2">{result.diagnosis.recommendation}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-panel">
            <h3 className="text-lg font-semibold text-slate-900">Healthcheck details</h3>
            <p className="mt-4 text-sm text-slate-600">Status: {result.healthcheck.status}</p>
            <p className="mt-3 text-sm text-slate-600">Policy: standard</p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        {steps.map((item) => (
          <ChecklistItem key={item.step} {...item} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-panel">
          <h3 className="text-lg font-semibold text-slate-900">Step details</h3>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            The workflow is designed for IT engineers to move from physical validation through DNS and VLAN checks.
            Each step captures the most common failure points and provides a structured verification path.
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-panel">
          <h3 className="text-lg font-semibold text-slate-900">Next action</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>• Confirm VLAN tagging on trunk ports.</li>
            <li>• Validate interface status and error counters.</li>
            <li>• Run DNS query latency from the local resolver.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
