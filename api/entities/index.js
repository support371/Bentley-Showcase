import { send, store, audit, requireRole, parseBody, uid } from '../_data.js';

export default async function handler(req, res) {
  const db = store();
  const entity = req.query.entity;
  if (!entity || !Array.isArray(db[entity])) return send(res, 404, { error: 'entity_not_found', entity });

  if (req.method === 'GET') return send(res, 200, { entity, records: db[entity] });

  if (req.method === 'POST') {
    if (!requireRole(req, res, ['admin', 'operator'])) return;
    const body = await parseBody(req);
    const record = { id: body.id || uid(entity), ...body, created_at: new Date().toISOString() };
    db[entity].unshift(record);
    audit('entity.create', req.headers['x-gem-user'] || 'api', 'ok', { entity, id: record.id });
    return send(res, 201, { entity, record });
  }

  return send(res, 405, { error: 'method_not_allowed' });
}
