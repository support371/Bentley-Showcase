import { send, requireRole, parseBody, actor, listEntity, createEntity, updateEntity, deleteEntity, activity, audit } from '../_data.js';

export default async function handler(req, res) {
  const project_id = req.query.project_id;
  const id = req.query.id;
  const category = req.query.category;

  if (req.method === 'GET') {
    return send(res, 200, { project_id: project_id || null, category: category || null, records: listEntity('projectTools', { project_id, category }) });
  }

  if (req.method === 'POST') {
    if (!requireRole(req, res, ['admin', 'operator'])) return;
    const body = await parseBody(req);
    const pid = body.project_id || project_id;
    if (!pid) return send(res, 400, { error: 'missing_project_id' });
    if (!body.name) return send(res, 400, { error: 'missing_name' });
    const record = createEntity('projectTools', { category: 'automation', status: 'active', owner: actor(req), connected_service: 'manual', ...body, project_id: pid }, 'tool');
    activity(pid, 'Tool added', `${record.name} added to catalog`, 'success', actor(req), { tool_id: record.id, category: record.category });
    audit('catalog.create', actor(req), 'ok', { project_id: pid, tool_id: record.id });
    return send(res, 201, { record });
  }

  if (req.method === 'PATCH' || req.method === 'PUT') {
    if (!requireRole(req, res, ['admin', 'operator'])) return;
    if (!id) return send(res, 400, { error: 'missing_id' });
    const body = await parseBody(req);
    const record = updateEntity('projectTools', id, body);
    if (!record) return send(res, 404, { error: 'tool_not_found', id });
    activity(record.project_id, 'Tool updated', `${record.name} updated`, 'success', actor(req), { tool_id: id });
    audit('catalog.update', actor(req), 'ok', { project_id: record.project_id, tool_id: id });
    return send(res, 200, { record });
  }

  if (req.method === 'DELETE') {
    if (!requireRole(req, res, ['admin'])) return;
    if (!id) return send(res, 400, { error: 'missing_id' });
    const deleted = deleteEntity('projectTools', id);
    audit('catalog.delete', actor(req), deleted ? 'ok' : 'error', { tool_id: id });
    return send(res, deleted ? 200 : 404, { deleted, id });
  }

  return send(res, 405, { error: 'method_not_allowed' });
}
