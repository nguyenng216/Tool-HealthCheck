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
    details: {
      dataSource?: 'demo' | 'live';
      mode?: string;
      policy?: string;
      [key: string]: unknown;
    };
  };
  diagnosis: {
    issue: string;
    severity: string;
    root_cause: string;
    recommendation: string;
  };
};

type ConnectivityResult = {
  deviceId: number;
  ssh: { ok: boolean; message: string };
  snmp: { ok: boolean; message: string };
};

type LiveConfig = {
  deviceId: number;
  cliProtocol: 'ssh' | 'telnet' | 'serial';
  sshUsername: string;
  sshPassword: string;
  sshPort: number;
  sshAdapter: string;
  telnetPort: number;
  serialPort: string;
  serialBaudRate: number;
  snmpCommunity: string;
  snmpVersion: string;
  snmpInterfaceIndex: number;
};

export default function HealthcheckPage() {
  const [result, setResult] = useState<HealthcheckResult | null>(null);
  const [connectivity, setConnectivity] = useState<ConnectivityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [testingConnectivity, setTestingConnectivity] = useState(false);
  const [savingCredential, setSavingCredential] = useState(false);
  const [error, setError] = useState('');
  const [config, setConfig] = useState<LiveConfig>({
    deviceId: 1,
    cliProtocol: 'ssh',
    sshUsername: 'admin',
    sshPassword: '',
    sshPort: 22,
    sshAdapter: 'cisco',
    telnetPort: 23,
    serialPort: 'COM3',
    serialBaudRate: 9600,
    snmpCommunity: 'public',
    snmpVersion: '2c',
    snmpInterfaceIndex: 1,
  });

  const statusBadge = useMemo(() => {
    if (!result) return { label: 'Not run', status: 'PENDING' as const };
    return { label: result.healthcheck.status, status: result.healthcheck.status as 'OK' | 'WARNING' | 'CRITICAL' | 'PENDING' };
  }, [result]);

  const dataSource = result?.healthcheck.details?.dataSource ?? 'demo';

  async function handleRunHealthcheck() {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/healthchecks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: config.deviceId, policy: 'standard', mode: 'parallel' }),
      });

      if (!response.ok) {
        let serverMessage = response.statusText;
        try {
          const payload = (await response.json()) as { message?: string | string[] };
          if (Array.isArray(payload.message)) {
            serverMessage = payload.message.join(', ');
          } else if (payload.message) {
            serverMessage = payload.message;
          }
        } catch {
          // Keep status text fallback if server body is not JSON.
        }
        throw new Error(`Healthcheck failed: ${serverMessage}`);
      }

      setResult(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  async function handleTestConnectivity() {
    setTestingConnectivity(true);
    setError('');
    setConnectivity(null);

    try {
      const response = await fetch('/api/healthchecks/connectivity-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!response.ok) {
        throw new Error(`Connectivity test failed: ${response.statusText}`);
      }
      setConnectivity((await response.json()) as ConnectivityResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown connectivity test error');
    } finally {
      setTestingConnectivity(false);
    }
  }

  async function handleSaveCredential() {
    setSavingCredential(true);
    setError('');

    try {
      const response = await fetch('/api/healthchecks/device-credential', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!response.ok) {
        throw new Error(`Save credential failed: ${response.statusText}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown credential save error');
    } finally {
      setSavingCredential(false);
    }
  }

  function updateConfig<K extends keyof LiveConfig>(key: K, value: LiveConfig[K]) {
    setConfig((previous) => ({ ...previous, [key]: value }));
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

      {!error && dataSource === 'demo' ? (
        <AlertPanel
          title="Demo data mode"
          description="Current healthcheck metrics are simulated. Switch backend HEALTHCHECK_MODE=live and connect to network devices to collect real telemetry."
          type="warning"
        />
      ) : null}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-panel">
        <h3 className="text-lg font-semibold text-slate-900">Live connectivity setup</h3>
        <p className="mt-2 text-sm text-slate-600">
          Configure SSH/SNMP credential for selected device, test connectivity, then save encrypted credential.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="text-sm text-slate-700">
            Device ID
            <input
              type="number"
              min={1}
              value={config.deviceId}
              onChange={(event) => updateConfig('deviceId', Number(event.target.value))}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="text-sm text-slate-700">
            SSH Username
            <input
              type="text"
              value={config.sshUsername}
              onChange={(event) => updateConfig('sshUsername', event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="text-sm text-slate-700">
            CLI Protocol
            <select
              value={config.cliProtocol}
              onChange={(event) => updateConfig('cliProtocol', event.target.value as LiveConfig['cliProtocol'])}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
            >
              <option value="ssh">SSH</option>
              <option value="telnet">Telnet</option>
              <option value="serial">Serial (PuTTY/plink)</option>
            </select>
          </label>
          <label className="text-sm text-slate-700">
            SSH Password
            <input
              type="password"
              value={config.sshPassword}
              onChange={(event) => updateConfig('sshPassword', event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="text-sm text-slate-700">
            SSH Port
            <input
              type="number"
              min={1}
              value={config.sshPort}
              onChange={(event) => updateConfig('sshPort', Number(event.target.value))}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="text-sm text-slate-700">
            Telnet Port
            <input
              type="number"
              min={1}
              value={config.telnetPort}
              onChange={(event) => updateConfig('telnetPort', Number(event.target.value))}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="text-sm text-slate-700">
            Serial Port
            <input
              type="text"
              value={config.serialPort}
              onChange={(event) => updateConfig('serialPort', event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="text-sm text-slate-700">
            Serial BaudRate
            <input
              type="number"
              min={1200}
              value={config.serialBaudRate}
              onChange={(event) => updateConfig('serialBaudRate', Number(event.target.value))}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="text-sm text-slate-700">
            SNMP Community
            <input
              type="text"
              value={config.snmpCommunity}
              onChange={(event) => updateConfig('snmpCommunity', event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="text-sm text-slate-700">
            SNMP Interface Index
            <input
              type="number"
              min={1}
              value={config.snmpInterfaceIndex}
              onChange={(event) => updateConfig('snmpInterfaceIndex', Number(event.target.value))}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={handleTestConnectivity}
            disabled={testingConnectivity}
            className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {testingConnectivity ? 'Testing...' : 'Test Connectivity'}
          </button>
          <button
            onClick={handleSaveCredential}
            disabled={savingCredential}
            className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {savingCredential ? 'Saving...' : 'Save Credential'}
          </button>
        </div>

        {connectivity ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <AlertPanel
              title={connectivity.ssh.ok ? 'SSH OK' : 'SSH Failed'}
              description={connectivity.ssh.message}
              type={connectivity.ssh.ok ? 'info' : 'critical'}
            />
            <AlertPanel
              title={connectivity.snmp.ok ? 'SNMP OK' : 'SNMP Failed'}
              description={connectivity.snmp.message}
              type={connectivity.snmp.ok ? 'info' : 'critical'}
            />
          </div>
        ) : null}
      </div>

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
            <p className="mt-3 text-sm text-slate-600">Policy: {String(result.healthcheck.details?.policy ?? 'standard')}</p>
            <p className="mt-3 text-sm text-slate-600">Data source: {String(result.healthcheck.details?.dataSource ?? 'demo')}</p>
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
