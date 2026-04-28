import { send, listEntity, activity, requireRole, parseBody, actor } from '../_data.js';

export default async function handler(req, res) {
  const project_id = req.query.project_id;
  if (req.method === 'GET') {
    const records = listEntity('activityLogs', { project_id }).sort((a, b) => new Date(b.ts) - new Date(a.ts));
    return send(res, 200, { project_id: project_id || null, records });
  }
  if (req.method === 'POST') {
    if (!requireRole(req, res, ['admin', 'operator'])) return;
    const body = await parseBody(req);
    if (!body.project_id && !project_id) return send(res, 400, { error: 'missing_project_id' });
    const record = activity(body.project_id || project_id, body.event || 'Manual activity', body.detail || 'Activity recorded', body.status || 'success', actor(req), body.meta || {});
    return send(res, 201, { record });
  }
  return send(res, 405, { error: 'method_not_allowed' });
}
