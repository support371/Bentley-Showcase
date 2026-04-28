import { send, store, projectSummary, audit } from './_data.js';

export default function handler(req, res) {
  const db = store();
  const p1 = projectSummary('p1');
  const checks = [
    ['workspace', Boolean(db.workspace?.id)],
    ['projects', Array.isArray(db.projects) && db.projects.length >= 1],
    ['projectSummary', Boolean(p1?.project?.id)],
    ['toolCatalog', Array.isArray(p1?.tools)],
    ['runtimeAssets', Array.isArray(p1?.productionServices)],
    ['teamAccess', Array.isArray(p1?.teamMembers)],
    ['activityTimeline', Array.isArray(p1?.activityLogs)],
    ['auditLogs', Array.isArray(db.auditLogs)],
    ['jobs', Array.isArray(db.orchestratorJobs)],
    ['digitalTwin', Array.isArray(p1?.imodels)]
  ];
  const failed = checks.filter(([, ok]) => !ok).map(([name]) => name);
  audit('api.smoke', 'system', failed.length ? 'error' : 'ok', { failed });
  return send(res, failed.length ? 503 : 200, {
    ok: failed.length === 0,
    failed,
    checks: Object.fromEntries(checks),
    recommendedEntry: '/api/bootstrap',
    projectEndpoint: '/api/projects?id=p1',
    ui: 'https://bentley-showcase.vercel.app'
  });
}
