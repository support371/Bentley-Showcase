import { send, store, requireRole, parseBody, actor, audit } from '../_data.js';

export default async function handler(req, res) {
  const db = store();
  if (req.method === 'GET') {
    const limit = Math.min(Number(req.query.limit || 100), 500);
    const status = req.query.status;
    let records = db.auditLogs || [];
    if (status) records = records.filter((r) => r.status === status);
    return send(res, 200, { records: records.slice(0, limit) });
  }
  if (req.method === 'POST') {
    if (!requireRole(req, res, ['admin', 'operator'])) return;
    const body = await parseBody(req);
    const record = audit(body.action || 'audit.manual', actor(req), body.status || 'ok', body.meta || {});
    return send(res, 201, { record });
  }
  return send(res, 405, { error: 'method_not_allowed' });
}
