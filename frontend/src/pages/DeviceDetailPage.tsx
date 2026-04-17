import StatusBadge from '../components/StatusBadge';
import { deviceMetrics, interfaceMetrics } from '../data/mockData';

export default function DeviceDetailPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-panel">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Device</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">Branch Access Switch</h2>
            <div className="mt-3 flex items-center gap-3">
              <StatusBadge label="Critical" status="CRITICAL" />
              <p className="text-sm text-slate-500">5 checks failed in last hour</p>
            </div>
          </div>
          <div className="rounded-3xl bg-slate-50 px-4 py-3 text-slate-700 shadow-sm">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Uptime</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">12 days</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-panel">
          <h3 className="text-lg font-semibold text-slate-900">Interfaces</h3>
          <div className="mt-6 space-y-4">
            {interfaceMetrics.map((iface) => (
              <div key={iface.name} className="rounded-3xl border border-slate-100 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">{iface.name}</p>
                    <p className="text-sm text-slate-500">{iface.speed}</p>
                  </div>
                  <StatusBadge label={iface.status === 'up' ? 'OK' : 'CRITICAL'} status={iface.status === 'up' ? 'OK' : 'CRITICAL'} />
                </div>
                <div className="mt-3 text-sm text-slate-500">CRC errors: {iface.errors}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-panel">
          <h3 className="text-lg font-semibold text-slate-900">Metrics</h3>
          <div className="mt-6 space-y-4">
            {deviceMetrics.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-3xl border border-slate-100 px-4 py-4">
                <p className="text-sm text-slate-600">{item.label}</p>
                <p className="font-semibold text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-panel">
        <h3 className="text-lg font-semibold text-slate-900">Recent logs</h3>
        <div className="mt-5 space-y-3 text-sm text-slate-600">
          <p>• 09:18 - Interface eth1 reported increasing CRC errors.</p>
          <p>• 09:12 - VLAN 20 failed isolation validation on trunk port.</p>
          <p>• 09:09 - DNS resolution latency spike observed from host 10.0.0.12.</p>
        </div>
      </div>
    </div>
  );
}
