export const healthScore = 88;

export const deviceStatus = [
  { name: 'Office Router', status: 'Online', badge: 'OK' },
  { name: 'Data Center Switch', status: 'Warning', badge: 'WARNING' },
  { name: 'WAN Firewall', status: 'Online', badge: 'OK' },
  { name: 'Branch Access', status: 'Critical', badge: 'CRITICAL' },
];

export const trafficData = [
  { name: '00:00', traffic: 340 },
  { name: '04:00', traffic: 420 },
  { name: '08:00', traffic: 880 },
  { name: '12:00', traffic: 1040 },
  { name: '16:00', traffic: 920 },
  { name: '20:00', traffic: 760 },
  { name: '24:00', traffic: 590 },
];

export const healthBreakdown = [
  { name: 'CPU', value: 22 },
  { name: 'Memory', value: 18 },
  { name: 'Interface', value: 25 },
  { name: 'VLAN', value: 15 },
  { name: 'DNS', value: 20 },
];

export const interfaceMetrics = [
  { name: 'eth0', status: 'up', speed: '1 Gbps', errors: 0 },
  { name: 'eth1', status: 'up', speed: '10 Gbps', errors: 4 },
  { name: 'eth2', status: 'down', speed: '1 Gbps', errors: 0 },
];

export const deviceMetrics = [
  { label: 'CPU Load', value: '73%' },
  { label: 'Memory Used', value: '68%' },
  { label: 'Packet Loss', value: '0.3%' },
  { label: 'DNS latency', value: '220 ms' },
];

export const reportEntries = [
  { week: 'Week 1', score: 85 },
  { week: 'Week 2', score: 88 },
  { week: 'Week 3', score: 91 },
  { week: 'Week 4', score: 89 },
];
