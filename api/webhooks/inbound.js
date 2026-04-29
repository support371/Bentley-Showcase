import { send, parseBody, actor, activity, audit, createEntity } from '../_data.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'method_not_allowed' });
  const body = await parseBody(req);
  const project_id = body.project_id || req.query.project_id || 'p1';
  const source = body.source || req.headers['x-gem-source'] || 'webhook';
  const event = body.event || body.type || 'Inbound webhook';
  const detail = body.detail || body.message || JSON.stringify(body.payload || body).slice(0, 500);
  const log = activity(project_id, event, detail, body.status || 'success', source, { payload: body.payload || body });
  const job = body.create_job === false ? null : createEntity('orchestratorJobs', {
    project_id,
    task: `${source}:${event}`,
    classification: 'webhook',
    executor: source,
    status: 'queued',
    payload: body
  }, 'job');
  audit('webhook.inbound', actor(req), 'ok', { project_id, source, event, job_id: job?.id });
  return send(res, 202, { received: true, project_id, source, event, activity: log, job });
}
