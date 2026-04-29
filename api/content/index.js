import { send, requireRole, parseBody, actor, listEntity, createEntity, updateEntity, deleteEntity, activity, audit } from '../_data.js';

export default async function handler(req, res) {
  const project_id = req.query.project_id;
  const id = req.query.id;
  if (req.method === 'GET') {
    return send(res, 200, { project_id: project_id || null, records: listEntity('contentDigest', { project_id, status: req.query.status }) });
  }
  if (req.method === 'POST') {
    if (!requireRole(req, res, ['admin', 'operator'])) return;
    const body = await parseBody(req);
    const pid = body.project_id || project_id;
    if (!pid) return send(res, 400, { error: 'missing_project_id' });
    const record = createEntity('contentDigest', { status: 'draft', source: 'manual', category: 'general', ...body, project_id: pid }, 'content');
    activity(pid, 'Content item created', record.title || record.id, 'success', actor(req), { content_id: record.id });
    audit('content.create', actor(req), 'ok', { project_id: pid, content_id: record.id });
    return send(res, 201, { record });
  }
  if (req.method === 'PATCH' || req.method === 'PUT') {
    if (!requireRole(req, res, ['admin', 'operator'])) return;
    if (!id) return send(res, 400, { error: 'missing_id' });
    const body = await parseBody(req);
    const record = updateEntity('contentDigest', id, body);
    if (!record) return send(res, 404, { error: 'content_not_found', id });
    activity(record.project_id, 'Content item updated', record.title || id, 'success', actor(req), { content_id: id });
    return send(res, 200, { record });
  }
  if (req.method === 'DELETE') {
    if (!requireRole(req, res, ['admin'])) return;
    if (!id) return send(res, 400, { error: 'missing_id' });
    const deleted = deleteEntity('contentDigest', id);
    return send(res, deleted ? 200 : 404, { deleted, id });
  }
  return send(res, 405, { error: 'method_not_allowed' });
}
