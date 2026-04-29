import { send, requireRole, parseBody, actor, listEntity, createEntity, updateEntity, deleteEntity, activity, audit } from '../_data.js';

export default async function handler(req, res) {
  const project_id = req.query.project_id;
  const id = req.query.id;
  if (req.method === 'GET') {
    return send(res, 200, { project_id: project_id || null, records: listEntity('integrations', { project_id, status: req.query.status }) });
  }
  if (req.method === 'POST') {
    if (!requireRole(req, res, ['admin'])) return;
    const body = await parseBody(req);
    const pid = body.project_id || project_id;
    if (!pid) return send(res, 400, { error: 'missing_project_id' });
    const record = createEntity('integrations', { status: 'pending', integration_type: 'custom', ...body, project_id: pid }, 'integration');
    activity(pid, 'Integration added', record.integration_name || record.id, 'success', actor(req), { integration_id: record.id });
    audit('integration.create', actor(req), 'ok', { project_id: pid, integration_id: record.id });
    return send(res, 201, { record });
  }
  if (req.method === 'PATCH' || req.method === 'PUT') {
    if (!requireRole(req, res, ['admin', 'operator'])) return;
    if (!id) return send(res, 400, { error: 'missing_id' });
    const body = await parseBody(req);
    const record = updateEntity('integrations', id, body);
    if (!record) return send(res, 404, { error: 'integration_not_found', id });
    activity(record.project_id, 'Integration updated', record.integration_name || id, 'success', actor(req), { integration_id: id });
    audit('integration.update', actor(req), 'ok', { project_id: record.project_id, integration_id: id });
    return send(res, 200, { record });
  }
  if (req.method === 'DELETE') {
    if (!requireRole(req, res, ['admin'])) return;
    if (!id) return send(res, 400, { error: 'missing_id' });
    const deleted = deleteEntity('integrations', id);
    audit('integration.delete', actor(req), deleted ? 'ok' : 'error', { integration_id: id });
    return send(res, deleted ? 200 : 404, { deleted, id });
  }
  return send(res, 405, { error: 'method_not_allowed' });
}
