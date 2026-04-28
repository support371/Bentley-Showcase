import { send, requireRole, parseBody, actor, getEntity, updateEntity, createEntity, activity, audit, routeTask } from '../_data.js';

function resolveAction(type = 'generic') {
  const map = {
    redeploy: { status: 'queued', message: 'Redeploy queued for the selected production service.' },
    publish: { status: 'queued', message: 'Publish workflow queued for selected marketing tool.' },
    run: { status: 'queued', message: 'Automation run queued.' },
    sync: { status: 'queued', message: 'Sync operation queued.' },
    health: { status: 'success', message: 'Health check completed.' },
    logs: { status: 'success', message: 'Log retrieval request recorded.' },
    promote: { status: 'queued', message: 'Promotion workflow queued.' }
  };
  return map[type] || map.run;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'method_not_allowed' });
  if (!requireRole(req, res, ['admin', 'operator'])) return;

  const body = await parseBody(req);
  const project_id = body.project_id || req.query.project_id;
  const action = body.action || req.query.action || 'run';
  const target_type = body.target_type || req.query.target_type || 'project';
  const target_id = body.target_id || req.query.target_id;
  if (!project_id) return send(res, 400, { error: 'missing_project_id' });

  const outcome = resolveAction(action);
  let target = null;
  if (target_id && target_type === 'tool') target = getEntity('projectTools', target_id);
  if (target_id && target_type === 'service') target = getEntity('productionServices', target_id);
  if (target_id && target_type === 'content') target = getEntity('contentDigest', target_id);

  if (target_type === 'tool' && target) updateEntity('projectTools', target.id, { last_run_at: new Date().toISOString(), status: target.status === 'paused' ? 'active' : target.status });
  if (target_type === 'service' && target && action === 'health') updateEntity('productionServices', target.id, { status: 'healthy', last_checked_at: new Date().toISOString() });

  const job = createEntity('orchestratorJobs', {
    project_id,
    task: `${action}:${target_type}:${target?.name || target_id || 'project'}`,
    classification: action === 'redeploy' ? 'workflow' : 'general',
    executor: 'gem-action-runner',
    status: outcome.status === 'success' ? 'completed' : 'queued',
    payload: body
  }, 'job');
  const log = activity(project_id, `Action ${action}`, outcome.message, outcome.status, actor(req), { target_type, target_id, job_id: job.id });
  audit('action.execute', actor(req), outcome.status === 'success' ? 'ok' : 'queued', { project_id, action, target_type, target_id, job_id: job.id });

  return send(res, 202, { action, target_type, target, job, activity: log, outcome });
}
