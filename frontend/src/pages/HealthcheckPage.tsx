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
  cliProtocol: 'ssh' | 'telnet' | 'serial' | 'snmp';
  ip?: string;
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
  const [sshInfoMessage, setSshInfoMessage] = useState('');
  const [activeProtocolTab, setActiveProtocolTab] = useState<'ssh' | 'telnet' | 'serial' | 'snmp'>('ssh');
  const [autoRunHealthcheck, setAutoRunHealthcheck] = useState(true);
  const [sshPortOpen, setSshPortOpen] = useState(false);
  const [config, setConfig] = useState<LiveConfig>({
    deviceId: 1,
    cliProtocol: 'ssh',
    ip: '',
    sshUsername: '',
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

  async function handleRunLiveHealthcheck() {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/healthchecks/live-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!response.ok) {
        throw new Error(`Live healthcheck failed: ${response.statusText}`);
      }
      setResult(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown live healthcheck error');
    } finally {
      setLoading(false);
    }
  }

  async function handleTestConnectivity() {
    setTestingConnectivity(true);
    setError('');
    setConnectivity(null);
    setSshInfoMessage('');

    try {
      const response = await fetch('/api/healthchecks/connectivity-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const body = await response.text();
        const message = body || response.statusText || 'Connectivity test failed';
        if (activeProtocolTab === 'ssh') {
          setSshInfoMessage(message);
          setSshPortOpen(false);
          return;
        }
        throw new Error(`Connectivity test failed: ${message}`);
      }

      const result = (await response.json()) as ConnectivityResult;
      setConnectivity(result);

      if (activeProtocolTab === 'ssh') {
        setSshPortOpen(!!result.ssh.ok);
        setSshInfoMessage(result.ssh.message);
      } else {
        setSshPortOpen(false);
      }

      if (autoRunHealthcheck && (config.cliProtocol === 'telnet' || config.cliProtocol === 'serial')) {
        await handleRunLiveHealthcheck();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown connectivity test error';
      if (activeProtocolTab === 'ssh') {
        setSshInfoMessage(message);
        setSshPortOpen(false);
      } else {
        setError(message);
      }
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
    if (key === 'ip' || key === 'sshPort' || key === 'cliProtocol') {
      setSshPortOpen(false);
      setConnectivity(null);
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

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-panel">
        <h3 className="text-lg font-semibold text-slate-900">Live connectivity setup</h3>
        <p className="mt-2 text-sm text-slate-600">
          Configure SSH, Telnet, Serial or SNMP credentials for the selected device. For SSH, enter IP first to test port connectivity, then enter credentials.
        </p>
        <div className="mt-5">
          <div className="flex flex-wrap items-center gap-2 rounded-3xl border border-slate-200 bg-slate-50 p-3">
            {['ssh', 'telnet', 'serial', 'snmp'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setActiveProtocolTab(tab as 'ssh' | 'telnet' | 'serial' | 'snmp');
                  updateConfig('cliProtocol', tab as LiveConfig['cliProtocol']);
                  setSshPortOpen(false);
                }}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeProtocolTab === tab ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 shadow-sm'
                }`}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>


          <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-inner">
            {activeProtocolTab === 'ssh' ? (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="text-sm text-slate-700">
                    SSH IP
                    <input
                      type="text"
                      value={config.ip}
                      onChange={(event) => updateConfig('ip', event.target.value)}
                      placeholder="e.g. 192.168.1.1"
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
                </div>

                {sshPortOpen ? (
                  <>
                    <div className="grid gap-4 md:grid-cols-2">
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
                        SSH Password
                        <input
                          type="password"
                          value={config.sshPassword}
                          onChange={(event) => updateConfig('sshPassword', event.target.value)}
                          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                        />
                      </label>
                    </div>
                    {sshInfoMessage ? (
                      <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                        {sshInfoMessage}
                      </div>
                    ) : null}
                  </>
                ) : (
                  <>
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                      Enter SSH IP and Port, then press <strong>Test Connectivity</strong>.
                      If the SSH port is reachable, username and password inputs will appear.
                    </div>
                    {sshInfoMessage ? (
                      <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
                        {sshInfoMessage}
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            ) : null}

            {activeProtocolTab === 'telnet' ? (
              <div className="grid gap-4 md:grid-cols-2">
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
                  Username
                  <input
                    type="text"
                    value={config.sshUsername}
                    onChange={(event) => updateConfig('sshUsername', event.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                  />
                </label>
                <label className="text-sm text-slate-700">
                  Password
                  <input
                    type="password"
                    value={config.sshPassword}
                    onChange={(event) => updateConfig('sshPassword', event.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                  />
                </label>
              </div>
            ) : null}

            {activeProtocolTab === 'serial' ? (
              <div className="grid gap-4 md:grid-cols-2">
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
                  Baud Rate
                  <input
                    type="number"
                    min={1200}
                    value={config.serialBaudRate}
                    onChange={(event) => updateConfig('serialBaudRate', Number(event.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                  />
                </label>
              </div>
            ) : null}

            {activeProtocolTab === 'snmp' ? (
              <div className="grid gap-4 md:grid-cols-2">
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
                <label className="text-sm text-slate-700">
                  SNMP Version
                  <input
                    type="text"
                    value={config.snmpVersion}
                    onChange={(event) => updateConfig('snmpVersion', event.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
                  />
                </label>
              </div>
            ) : null}
          </div>

          {(config.cliProtocol === 'ssh' || config.cliProtocol === 'telnet') && (
            <div className="mt-4 flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <input
                id="autoRunHealthcheck"
                type="checkbox"
                checked={autoRunHealthcheck}
                onChange={(event) => setAutoRunHealthcheck(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-slate-900"
              />
              <label htmlFor="autoRunHealthcheck" className="text-sm text-slate-700">
                Automatically run healthcheck after successful {config.cliProtocol.toUpperCase()} connectivity
              </label>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={handleTestConnectivity}
            disabled={testingConnectivity}
            className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {testingConnectivity
              ? 'Testing...'
              : activeProtocolTab === 'ssh' && !config.sshUsername && !config.sshPassword
              ? 'Check SSH IP'
              : activeProtocolTab === 'ssh'
              ? 'Connect SSH'
              : 'Test Connectivity'}
          </button>
          <button
            onClick={handleSaveCredential}
            disabled={savingCredential}
            className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {savingCredential ? 'Saving...' : 'Save Credential'}
          </button>
        </div>
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
