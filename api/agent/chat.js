import { send, store, audit, parseBody, routeTask, uid, activity, actor, createEntity } from '../_data.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'method_not_allowed' });
  const body = await parseBody(req);
  const prompt = String(body.prompt || body.message || '').trim();
  const agent = body.agent || 'Architect';
  const project_id = body.project_id || req.query.project_id || 'p1';
  if (!prompt) return send(res, 400, { error: 'missing_prompt' });

  const route = routeTask(prompt);
  const db = store();
  const response = {
    id: uid('msg'),
    project_id,
    agent,
    route,
    reply: `Task routed to ${route.model} for ${route.classification}. Production execution plan: validate inputs, apply policy gates, generate output, record event, and return operator-ready response.`,
    usage: { inputTokens: Math.ceil(prompt.length / 4), outputTokens: 42 },
    score: route.classification === 'software' ? 94 : 96,
    created_at: new Date().toISOString()
  };
  db.agentConversations.unshift({ project_id, prompt, response, created_at: response.created_at });
  const job = createEntity('orchestratorJobs', { project_id, task: prompt, classification: route.classification, executor: route.model, status: 'completed', agent }, 'job');
  const grade = createEntity('grades', { project_id, agentName: agent, score: response.score, model: route.model, job_id: job.id }, 'grade');
  const log = activity(project_id, 'AI task completed', `${agent} routed task to ${route.model}`, 'success', actor(req), { job_id: job.id, message_id: response.id });
  audit('agent.chat', actor(req), 'ok', { project_id, agent, model: route.model, job_id: job.id });
  return send(res, 200, { ...response, job, grade, activity: log });
}
