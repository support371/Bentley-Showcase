import { send, store, audit, parseBody, routeTask, uid } from '../_data.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'method_not_allowed' });
  const body = await parseBody(req);
  const prompt = String(body.prompt || body.message || '').trim();
  const agent = body.agent || 'Architect';
  if (!prompt) return send(res, 400, { error: 'missing_prompt' });

  const route = routeTask(prompt);
  const db = store();
  const response = {
    id: uid('msg'),
    agent,
    route,
    reply: `Task routed to ${route.model} for ${route.classification}. Production execution plan: validate inputs, apply policy gates, generate output, record event, and return operator-ready response.`,
    usage: { inputTokens: Math.ceil(prompt.length / 4), outputTokens: 42 },
    score: route.classification === 'software' ? 94 : 96,
    created_at: new Date().toISOString()
  };
  db.agentConversations.unshift({ prompt, response, created_at: response.created_at });
  db.orchestratorJobs.unshift({ id: uid('job'), task: prompt, classification: route.classification, executor: route.model, status: 'completed' });
  audit('agent.chat', 'api', 'ok', { agent, model: route.model });
  return send(res, 200, response);
}
