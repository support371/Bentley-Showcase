import { send, requireRole, parseBody, actor, listEntity, createEntity, updateEntity, deleteEntity, activity, audit } from '../_data.js';

export default async function handler(req, res) {
  const project_id = req.query.project_id;
  const id = req.query.id;

  if (req.method === 'GET') {
    return send(res, 200, { project_id: project_id || null, records: listEntity('productionServices', { project_id }) });
  }

  if (req.method === 'POST') {
    if (!requireRole(req, res, ['admin', 'operator'])) return;
    const body = await parseBody(req);
    const pid = body.project_id || project_id;
    if (!pid) return send(res, 400, { error: 'missing_project_id' });
    const record = createEntity('productionServices', { environment: 'production', status: 'pending', provider: 'custom', actions: ['view', 'health', 'logs'], ...body, project_id: pid }, 'svc');
    activity(pid, 'Runtime asset added', `${record.name} added`, 'success', actor(req), { asset_id: record.id });
    audit('runtime.create', actor(req), 'ok', { project_id: pid, asset_id: record.id });
    return send(res, 201, { record });
  }

  if (req.method === 'PATCH' || req.method === 'PUT') {
    if (!requireRole(req, res, ['admin', 'operator'])) return;
    if (!id) return send(res, 400, { error: 'missing_id' });
    const body = await parseBody(req);
    const record = updateEntity('productionServices', id, body);
    if (!record) return send(res, 404, { error: 'asset_not_found', id });
    activity(record.project_id, 'Runtime asset updated', `${record.name} updated`, 'success', actor(req), { asset_id: id });
    audit('runtime.update', actor(req), 'ok', { project_id: record.project_id, asset_id: id });
    return send(res, 200, { record });
  }

  if (req.method === 'DELETE') {
    if (!requireRole(req, res, ['admin'])) return;
    if (!id) return send(res, 400, { error: 'missing_id' });
    const deleted = deleteEntity('productionServices', id);
    audit('runtime.delete', actor(req), deleted ? 'ok' : 'error', { asset_id: id });
    return send(res, deleted ? 200 : 404, { deleted, id });
  }

  return send(res, 405, { error: 'method_not_allowed' });
}
