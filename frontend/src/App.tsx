import { Route, Routes, NavLink } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import HealthcheckPage from './pages/HealthcheckPage';
import DeviceDetailPage from './pages/DeviceDetailPage';
import ReportsPage from './pages/ReportsPage';

const navItems = [
  { path: '/', label: 'Dashboard' },
  { path: '/healthcheck', label: 'Healthcheck' },
  { path: '/device', label: 'Device Detail' },
  { path: '/reports', label: 'Reports' },
];

function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-7xl gap-6 px-4 py-6 lg:px-8">
        <aside className="w-full max-w-[280px] rounded-3xl border border-slate-200 bg-white p-6 shadow-panel">
          <div className="mb-10">
            <span className="text-sm uppercase tracking-[0.3em] text-slate-500">Network Healthcheck</span>
            <h1 className="mt-3 text-2xl font-semibold text-slate-900">Control Center</h1>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/healthcheck" element={<HealthcheckPage />} />
            <Route path="/device" element={<DeviceDetailPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
