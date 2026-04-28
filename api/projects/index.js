import { send, store, audit, requireRole, parseBody, actor, createEntity, updateEntity, deleteEntity, getProject, projectSummary, activity } from '../_data.js';

export default async function handler(req, res) {
  const db = store();
  const id = req.query.id;

  if (req.method === 'GET') {
    if (id) {
      const summary = projectSummary(id);
      if (!summary) return send(res, 404, { error: 'project_not_found', id });
      return send(res, 200, summary);
    }
    const summaries = db.projects.map((p) => projectSummary(p.id));
    return send(res, 200, { workspace: db.workspace, projects: summaries });
  }

  if (req.method === 'POST') {
    if (!requireRole(req, res, ['admin'])) return;
    const body = await parseBody(req);
    const project = createEntity('projects', {
      status: 'development',
      runtime: 'Vercel',
      owner: actor(req),
      ...body,
      slug: body.slug || String(body.name || 'project').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }, 'project');
    activity(project.id, 'Project created', `${project.name} created`, 'success', actor(req));
    audit('project.create', actor(req), 'ok', { project_id: project.id });
    return send(res, 201, { project, summary: projectSummary(project.id) });
  }

  if (req.method === 'PATCH' || req.method === 'PUT') {
    if (!requireRole(req, res, ['admin', 'operator'])) return;
    if (!id) return send(res, 400, { error: 'missing_id' });
    const body = await parseBody(req);
    const project = updateEntity('projects', id, body);
    if (!project) return send(res, 404, { error: 'project_not_found', id });
    activity(project.id, 'Project updated', `${project.name} settings updated`, 'success', actor(req));
    audit('project.update', actor(req), 'ok', { project_id: project.id });
    return send(res, 200, { project, summary: projectSummary(project.id) });
  }

  if (req.method === 'DELETE') {
    if (!requireRole(req, res, ['admin'])) return;
    if (!id) return send(res, 400, { error: 'missing_id' });
    const project = getProject(id);
    if (!project) return send(res, 404, { error: 'project_not_found', id });
    const ok = deleteEntity('projects', project.id);
    audit('project.delete', actor(req), 'ok', { project_id: project.id });
    return send(res, 200, { deleted: ok, id: project.id });
  }

  return send(res, 405, { error: 'method_not_allowed' });
}
