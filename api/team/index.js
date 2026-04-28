import { send, requireRole, parseBody, actor, listEntity, createEntity, updateEntity, deleteEntity, activity, audit } from '../_data.js';

export default async function handler(req, res) {
  const project_id = req.query.project_id;
  const id = req.query.id;

  if (req.method === 'GET') {
    return send(res, 200, { project_id: project_id || null, records: listEntity('teamMembers', { project_id }) });
  }

  if (req.method === 'POST') {
    if (!requireRole(req, res, ['admin'])) return;
    const body = await parseBody(req);
    const pid = body.project_id || project_id;
    if (!pid) return send(res, 400, { error: 'missing_project_id' });
    if (!body.name || !body.email) return send(res, 400, { error: 'missing_name_or_email' });
    const record = createEntity('teamMembers', { status: 'active', role: 'Viewer', ...body, project_id: pid }, 'tm');
    activity(pid, 'Team member added', `${record.name} added as ${record.role}`, 'success', actor(req), { member_id: record.id });
    audit('team.add', actor(req), 'ok', { project_id: pid, member_id: record.id });
    return send(res, 201, { record });
  }

  if (req.method === 'PATCH' || req.method === 'PUT') {
    if (!requireRole(req, res, ['admin'])) return;
    if (!id) return send(res, 400, { error: 'missing_id' });
    const body = await parseBody(req);
    const record = updateEntity('teamMembers', id, body);
    if (!record) return send(res, 404, { error: 'member_not_found', id });
    activity(record.project_id, 'Team member updated', `${record.name} access updated`, 'success', actor(req), { member_id: id });
    audit('team.update', actor(req), 'ok', { project_id: record.project_id, member_id: id });
    return send(res, 200, { record });
  }

  if (req.method === 'DELETE') {
    if (!requireRole(req, res, ['admin'])) return;
    if (!id) return send(res, 400, { error: 'missing_id' });
    const deleted = deleteEntity('teamMembers', id);
    audit('team.delete', actor(req), deleted ? 'ok' : 'error', { member_id: id });
    return send(res, deleted ? 200 : 404, { deleted, id });
  }

  return send(res, 405, { error: 'method_not_allowed' });
}
