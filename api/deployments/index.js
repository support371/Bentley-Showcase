import { send, requireRole, parseBody, actor, listEntity, createEntity, updateEntity, deleteEntity, activity, audit } from '../_data.js';

export default async function handler(req, res) {
  const project_id = req.query.project_id;
  const id = req.query.id;

  if (req.method === 'GET') {
    const records = listEntity('deployments', { project_id, status: req.query.status });
    return send(res, 200, { project_id: project_id || null, records });
  }

  if (req.method === 'POST') {
    if (!requireRole(req, res, ['admin', 'operator'])) return;
    const body = await parseBody(req);
    const pid = body.project_id || project_id;
    if (!pid) return send(res, 400, { error: 'missing_project_id' });
    const record = createEntity('deployments', {
      project_id: pid,
      app_name: body.app_name || 'Application',
      environment_name: body.environment_name || 'Production',
      version: body.version || 'manual',
      commit_sha: body.commit_sha || 'manual',
      status: body.status || 'queued',
      source: body.source || 'api'
    }, 'dep');
    activity(pid, 'Deployment queued', `${record.app_name} ${record.version} queued`, 'queued', actor(req), { deployment_id: record.id });
    audit('deployment.create', actor(req), 'queued', { project_id: pid, deployment_id: record.id });
    return send(res, 202, { record });
  }

  if (req.method === 'PATCH' || req.method === 'PUT') {
    if (!requireRole(req, res, ['admin', 'operator'])) return;
    if (!id) return send(res, 400, { error: 'missing_id' });
    const body = await parseBody(req);
    const record = updateEntity('deployments', id, body);
    if (!record) return send(res, 404, { error: 'deployment_not_found', id });
    activity(record.project_id, 'Deployment updated', `${record.app_name} is ${record.status}`, record.status === 'failed' ? 'error' : 'success', actor(req), { deployment_id: id });
    audit('deployment.update', actor(req), 'ok', { project_id: record.project_id, deployment_id: id });
    return send(res, 200, { record });
  }

  if (req.method === 'DELETE') {
    if (!requireRole(req, res, ['admin'])) return;
    if (!id) return send(res, 400, { error: 'missing_id' });
    const deleted = deleteEntity('deployments', id);
    audit('deployment.delete', actor(req), deleted ? 'ok' : 'error', { deployment_id: id });
    return send(res, deleted ? 200 : 404, { deleted, id });
  }

  return send(res, 405, { error: 'method_not_allowed' });
}
