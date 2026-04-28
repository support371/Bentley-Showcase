import { send, audit, requireRole, parseBody, actor, assertEntity, listEntity, getEntity, createEntity, updateEntity, deleteEntity, activity } from '../_data.js';

export default async function handler(req, res) {
  const entity = req.query.entity;
  const id = req.query.id;
  const project_id = req.query.project_id;
  const filters = { project_id, category: req.query.category, status: req.query.status };

  if (!entity || !assertEntity(entity)) return send(res, 404, { error: 'entity_not_found', entity });

  if (req.method === 'GET') {
    if (id) {
      const record = getEntity(entity, id);
      if (!record) return send(res, 404, { error: 'record_not_found', entity, id });
      return send(res, 200, { entity, record });
    }
    return send(res, 200, { entity, records: listEntity(entity, filters) });
  }

  if (req.method === 'POST') {
    if (!requireRole(req, res, ['admin', 'operator'])) return;
    const body = await parseBody(req);
    const record = createEntity(entity, { ...body, project_id: body.project_id || project_id }, entity);
    audit('entity.create', actor(req), 'ok', { entity, id: record.id, project_id: record.project_id });
    if (record.project_id) activity(record.project_id, 'Record created', `${entity} ${record.id} created`, 'success', actor(req), { entity, id: record.id });
    return send(res, 201, { entity, record });
  }

  if (req.method === 'PATCH' || req.method === 'PUT') {
    if (!requireRole(req, res, ['admin', 'operator'])) return;
    if (!id) return send(res, 400, { error: 'missing_id' });
    const body = await parseBody(req);
    const record = updateEntity(entity, id, body);
    if (!record) return send(res, 404, { error: 'record_not_found', entity, id });
    audit('entity.update', actor(req), 'ok', { entity, id, project_id: record.project_id });
    if (record.project_id) activity(record.project_id, 'Record updated', `${entity} ${id} updated`, 'success', actor(req), { entity, id });
    return send(res, 200, { entity, record });
  }

  if (req.method === 'DELETE') {
    if (!requireRole(req, res, ['admin'])) return;
    if (!id) return send(res, 400, { error: 'missing_id' });
    const existing = getEntity(entity, id);
    const ok = deleteEntity(entity, id);
    if (!ok) return send(res, 404, { error: 'record_not_found', entity, id });
    audit('entity.delete', actor(req), 'ok', { entity, id, project_id: existing?.project_id });
    if (existing?.project_id) activity(existing.project_id, 'Record deleted', `${entity} ${id} deleted`, 'success', actor(req), { entity, id });
    return send(res, 200, { entity, id, deleted: true });
  }

  return send(res, 405, { error: 'method_not_allowed' });
}
