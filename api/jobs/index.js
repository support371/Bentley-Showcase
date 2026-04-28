import { send, requireRole, parseBody, actor, listEntity, createEntity, updateEntity, activity, audit } from '../_data.js';

export default async function handler(req, res) {
  const project_id = req.query.project_id;
  const id = req.query.id;

  if (req.method === 'GET') {
    const records = listEntity('orchestratorJobs', { project_id, status: req.query.status });
    const summary = records.reduce((acc, job) => {
      acc.total += 1;
      acc.byStatus[job.status] = (acc.byStatus[job.status] || 0) + 1;
      acc.byClassification[job.classification] = (acc.byClassification[job.classification] || 0) + 1;
      acc.byExecutor[job.executor] = (acc.byExecutor[job.executor] || 0) + 1;
      return acc;
    }, { total: 0, byStatus: {}, byClassification: {}, byExecutor: {} });
    return send(res, 200, { project_id: project_id || null, summary, records });
  }

  if (req.method === 'POST') {
    if (!requireRole(req, res, ['admin', 'operator'])) return;
    const body = await parseBody(req);
    const pid = body.project_id || project_id;
    if (!pid) return send(res, 400, { error: 'missing_project_id' });
    const record = createEntity('orchestratorJobs', { status: 'queued', classification: 'workflow', executor: 'gem-worker', ...body, project_id: pid }, 'job');
    activity(pid, 'Job queued', record.task || record.id, 'queued', actor(req), { job_id: record.id });
    audit('job.create', actor(req), 'queued', { project_id: pid, job_id: record.id });
    return send(res, 202, { record });
  }

  if (req.method === 'PATCH' || req.method === 'PUT') {
    if (!requireRole(req, res, ['admin', 'operator'])) return;
    if (!id) return send(res, 400, { error: 'missing_id' });
    const body = await parseBody(req);
    const record = updateEntity('orchestratorJobs', id, body);
    if (!record) return send(res, 404, { error: 'job_not_found', id });
    activity(record.project_id, 'Job updated', `${record.task || id} -> ${record.status}`, record.status === 'failed' ? 'error' : 'success', actor(req), { job_id: id });
    audit('job.update', actor(req), 'ok', { project_id: record.project_id, job_id: id });
    return send(res, 200, { record });
  }

  return send(res, 405, { error: 'method_not_allowed' });
}
