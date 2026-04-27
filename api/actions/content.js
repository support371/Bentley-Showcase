import { send, store, parseBody, uid } from '../_data.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'method_not_allowed' });
  const body = await parseBody(req);
  const db = store();
  const job = {
    id: uid('job'),
    task: body.task || body.title || 'Content operation',
    classification: 'content',
    executor: body.executor || 'content-adapter',
    status: 'queued',
    created_at: new Date().toISOString()
  };
  db.orchestratorJobs.unshift(job);
  return send(res, 202, { job });
}
