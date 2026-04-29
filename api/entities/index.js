import { send, audit, requireRole, parseBody, actor, assertEntity, listEntity, getEntity, createEntity, updateEntity, deleteEntity, activity } from '../_data.js';

function entityAlias(entity) {
  const aliases = {
    tools: 'projectTools',
    catalog: 'projectTools',
    runtime: 'productionServices',
    services: 'productionServices',
    team: 'teamMembers',
    members: 'teamMembers',
    jobs: 'orchestratorJobs',
    content: 'contentDigest',
    audit: 'auditLogs'
  };
  return aliases[entity] || entity;
}

function resolveAction(type = 'run') {
  const map = {
    redeploy: { status: 'queued', message: 'Redeploy workflow queued.' },
    publish: { status: 'queued', message: 'Publish workflow queued.' },
    run: { status: 'queued', message: 'Automation run queued.' },
    sync: { status: 'queued', message: 'Sync workflow queued.' },
    health: { status: 'success', message: 'Health check completed.' },
    logs: { status: 'success', message: 'Log retrieval request recorded.' },
    promote: { status: 'queued', message: 'Promotion workflow queued.' }
  };
  return map[type] || map.run;
}

export default async function handler(req, res) {
  const rawEntity = req.query.entity;
  const entity = entityAlias(rawEntity);
  const id = req.query.id;
  const project_id = req.query.project_id;
  const operation = req.query.operation || req.query.op;
  const filters = { project_id, category: req.query.category, status: req.query.status };

  if (!entity || !assertEntity(entity)) return send(res, 404, { error: 'entity_not_found', entity: rawEntity });

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

    if (operation === 'action') {
      const pid = body.project_id || project_id || 'p1';
      const action = body.action || 'run';
      const targetId = body.target_id || id;
      const outcome = resolveAction(action);
      let target = targetId ? getEntity(entity, targetId) : null;

      if (target && entity === 'projectTools') {
        target = updateEntity(entity, target.id, { last_run_at: new Date().toISOString(), status: target.status === 'paused' ? 'active' : target.status });
      }
      if (target && entity === 'productionServices' && action === 'health') {
        target = updateEntity(entity, target.id, { status: 'healthy', last_checked_at: new Date().toISOString() });
      }

      const job = createEntity('orchestratorJobs', {
        project_id: pid,
        task: `${action}:${entity}:${target?.name || targetId || 'project'}`,
        classification: action === 'redeploy' ? 'workflow' : 'general',
        executor: 'gem-action-runner',
        status: outcome.status === 'success' ? 'completed' : 'queued',
        payload: body
      }, 'job');
      const log = activity(pid, `Action ${action}`, outcome.message, outcome.status, actor(req), { entity, target_id: targetId, job_id: job.id });
      audit('entity.action', actor(req), outcome.status === 'success' ? 'ok' : 'queued', { entity, project_id: pid, action, target_id: targetId, job_id: job.id });
      return send(res, 202, { entity, action, target, job, activity: log, outcome });
    }

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
