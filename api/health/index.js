import { send, store } from '../_data.js';

export default function handler(req, res) {
  const db = store();
  const checks = {
    store: { status: 'up', records: Object.values(db).filter(Array.isArray).reduce((sum, arr) => sum + arr.length, 0) },
    projects: { status: db.projects?.length ? 'up' : 'down', count: db.projects?.length || 0 },
    tools: { status: db.projectTools?.length ? 'up' : 'down', count: db.projectTools?.length || 0 },
    runtime: { status: db.productionServices?.length ? 'up' : 'down', count: db.productionServices?.length || 0 },
    audit: { status: Array.isArray(db.auditLogs) ? 'up' : 'down', count: db.auditLogs?.length || 0 }
  };
  const healthy = Object.values(checks).every((c) => c.status === 'up');
  return send(res, healthy ? 200 : 503, {
    ok: healthy,
    status: healthy ? 'healthy' : 'degraded',
    service: 'gem-enterprise-platform-backend',
    version: '4.2.0',
    mode: 'project-operating-system',
    checks,
    uptime: process.uptime?.() || 0
  });
}
