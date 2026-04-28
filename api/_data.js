const now = Date.now();
const iso = (offset = 0) => new Date(Date.now() - offset).toISOString();

export const seed = {
  workspace: { id: 'ws1', name: 'GEM Cybersecurity Workspace', status: 'active', plan: 'enterprise' },
  projects: [
    { id: 'p1', name: 'Bentley Showcase', slug: 'bentley-showcase', organization_name: 'GEM Cybersecurity', status: 'production', runtime: 'Vercel', repo: 'support371/Bentley-Showcase', url: 'https://bentley-showcase.vercel.app', owner: 'GEM Cybersecurity', tech_stack: 'React, Vite, Vercel Functions', created_at: iso(86400000) },
    { id: 'p2', name: 'Nexus Financial', slug: 'nexus-financial', organization_name: 'GEM Cybersecurity', status: 'staging', runtime: 'Vercel', repo: 'support371/nexus-financial', url: 'https://nexus-financial.vercel.app', owner: 'Finance Ops', tech_stack: 'React, Node.js, PostgreSQL', created_at: iso(172800000) },
    { id: 'p3', name: 'OpenGuardians Portal', slug: 'openguardians', organization_name: 'OpenGuardians', status: 'development', runtime: 'Vercel', repo: 'support371/openguardians', url: 'https://openguardians.vercel.app', owner: 'Community Ops', tech_stack: 'Next.js, Redis, Docker', created_at: iso(259200000) }
  ],
  projectTools: [
    { id: 'tool1', project_id: 'p1', name: 'Production Frontend', category: 'production', status: 'healthy', owner: 'Engineering', connected_service: 'Vercel', last_run_at: iso(600000), description: 'Live customer-facing frontend and serverless API.' },
    { id: 'tool2', project_id: 'p1', name: 'Deploy Pipeline Guard', category: 'automation', status: 'active', owner: 'DevOps', connected_service: 'GitHub + Vercel', last_run_at: iso(720000), description: 'Build validation, release gate, deployment monitoring.' },
    { id: 'tool3', project_id: 'p1', name: 'Daily Cyber Digest', category: 'marketing', status: 'active', owner: 'Marketing', connected_service: 'Telegram + WhatsApp', last_run_at: iso(3600000), description: 'AI-assisted content digest and channel publishing workflow.' },
    { id: 'tool4', project_id: 'p1', name: 'Bentley iModel Sync', category: 'production', status: 'active', owner: 'Digital Twin Team', connected_service: 'Bentley iTwin', last_run_at: iso(120000), description: 'Tracks model sync, metadata, annotations, and viewer readiness.' },
    { id: 'tool5', project_id: 'p1', name: 'AI Agent Console', category: 'ai', status: 'active', owner: 'Platform', connected_service: 'GEM Orchestrator', last_run_at: iso(240000), description: 'Architect, Sentinel, Analyst, and Codex task routing workspace.' },
    { id: 'tool6', project_id: 'p2', name: 'Ledger Reconciliation', category: 'automation', status: 'active', owner: 'Finance Ops', connected_service: 'PostgreSQL Jobs', last_run_at: iso(10800000), description: 'Daily financial reconciliation automation.' },
    { id: 'tool7', project_id: 'p3', name: 'Community Digest', category: 'marketing', status: 'paused', owner: 'Community', connected_service: 'Email + Social', last_run_at: iso(86400000), description: 'Weekly member update pipeline.' }
  ],
  productionServices: [
    { id: 'svc1', project_id: 'p1', name: 'GEM Enterprise Frontend', environment: 'production', status: 'healthy', url: 'https://bentley-showcase.vercel.app', provider: 'Vercel', latest_commit: '613d60c', actions: ['view', 'redeploy', 'logs'] },
    { id: 'svc2', project_id: 'p1', name: 'Serverless API Layer', environment: 'production', status: 'healthy', url: '/api/status', provider: 'Vercel Functions', latest_commit: '940a279', actions: ['health', 'logs'] },
    { id: 'svc3', project_id: 'p1', name: 'iTwin Metadata Adapter', environment: 'production', status: 'ready', url: '/api/itwin/models', provider: 'GEM API', latest_commit: '940a279', actions: ['sync', 'logs'] },
    { id: 'svc4', project_id: 'p2', name: 'Nexus Financial API', environment: 'staging', status: 'monitoring', url: 'https://nexus-financial.vercel.app/api', provider: 'Vercel', latest_commit: 'b2e9f1a', actions: ['view', 'promote'] }
  ],
  teamMembers: [
    { id: 'tm1', project_id: 'p1', name: 'Gem Admin', email: 'gem@admin.io', role: 'Owner', status: 'active' },
    { id: 'tm2', project_id: 'p1', name: 'Engineering Lead', email: 'eng@gem.io', role: 'Developer', status: 'active' },
    { id: 'tm3', project_id: 'p1', name: 'Marketing Manager', email: 'marketing@gem.io', role: 'Marketing Manager', status: 'active' },
    { id: 'tm4', project_id: 'p1', name: 'Operations Analyst', email: 'ops@gem.io', role: 'Operator', status: 'active' },
    { id: 'tm5', project_id: 'p2', name: 'Finance Operator', email: 'finance@gem.io', role: 'Operator', status: 'active' }
  ],
  activityLogs: [
    { id: 'act1', project_id: 'p1', actor: 'system', event: 'Deployment completed', detail: 'Production deployment is READY on Vercel.', ts: iso(300000), status: 'success' },
    { id: 'act2', project_id: 'p1', actor: 'DevOps', event: 'Build guard passed', detail: 'PostCSS blocker removed and Vite build completed.', ts: iso(600000), status: 'success' },
    { id: 'act3', project_id: 'p1', actor: 'Marketing', event: 'Digest queued', detail: 'Cyber digest prepared for social/channel distribution.', ts: iso(3600000), status: 'queued' },
    { id: 'act4', project_id: 'p1', actor: 'Digital Twin', event: 'iModel sync checked', detail: 'Civil Infrastructure Hub synced successfully.', ts: iso(120000), status: 'success' }
  ],
  deployments: [
    { id: 'dp1', project_id: 'p1', app_name: 'Bentley Showcase', status: 'deployed', environment_name: 'Production', version: 'v4.1.0', commit_sha: '613d60c', created_at: iso(300000) },
    { id: 'dp2', project_id: 'p1', app_name: 'GEM API Layer', status: 'deployed', environment_name: 'Production', version: 'v4.0.0', commit_sha: '940a279', created_at: iso(720000) },
    { id: 'dp3', project_id: 'p2', app_name: 'Nexus Financial', status: 'deployed', environment_name: 'Staging', version: 'v2.8.0', commit_sha: 'b2e9f1a', created_at: iso(86400000) },
    { id: 'dp4', project_id: 'p3', app_name: 'OpenGuardians', status: 'building', environment_name: 'Development', version: 'v1.4.0', commit_sha: 'c7d4e3b', created_at: iso(172800000) }
  ],
  environments: [
    { id: 'en1', project_id: 'p1', name: 'Production', project_name: 'Bentley Showcase', type: 'production', status: 'healthy', region: 'iad1' },
    { id: 'en2', project_id: 'p1', name: 'Preview', project_name: 'Bentley Showcase', type: 'preview', status: 'healthy', region: 'iad1' },
    { id: 'en3', project_id: 'p2', name: 'Staging', project_name: 'Nexus Financial', type: 'staging', status: 'healthy', region: 'us-east-1' }
  ],
  integrations: [
    { id: 'ig1', project_id: 'p1', integration_name: 'GitHub', integration_type: 'cicd', status: 'connected' },
    { id: 'ig2', project_id: 'p1', integration_name: 'Vercel', integration_type: 'deployment', status: 'connected' },
    { id: 'ig3', project_id: 'p1', integration_name: 'Bentley iTwin', integration_type: 'digital_twin', status: 'connected' },
    { id: 'ig4', project_id: 'p1', integration_name: 'Telegram Bot', integration_type: 'channel', status: 'connected' },
    { id: 'ig5', project_id: 'p1', integration_name: 'WhatsApp Cloud', integration_type: 'channel', status: 'pending' },
    { id: 'ig6', project_id: 'p1', integration_name: 'Slack', integration_type: 'notification', status: 'connected' }
  ],
  securityEvents: [
    { id: 'se1', project_id: 'p1', type: 'Brute Force', source_ip: '185.220.101.45', target: 'Auth API', severity: 'critical', status: 'Blocked' },
    { id: 'se2', project_id: 'p1', type: 'SQL Injection', source_ip: '103.45.67.89', target: 'Data API', severity: 'high', status: 'Investigating' },
    { id: 'se3', project_id: 'p1', type: 'DDoS Spike', source_ip: 'Multiple', target: 'Gateway', severity: 'high', status: 'Mitigated' }
  ],
  alerts: [
    { id: 'al1', project_id: 'p1', title: 'High Error Rate', severity: 'Critical', status: 'Active', source: 'Auth API' },
    { id: 'al2', project_id: 'p1', title: 'SSL Cert Expiring', severity: 'High', status: 'Acknowledged', source: 'Cert Monitor' },
    { id: 'al3', project_id: 'p2', title: 'Memory Pressure', severity: 'Medium', status: 'Active', source: 'K8s Cluster' }
  ],
  imodels: [
    { id: 'im1', project_id: 'p1', name: 'Civil Infrastructure Hub', iTwin: 'Smart City Alpha', size: '2.4 GB', lastSync: now - 120000, status: 'Synced', elements: 142890, type: 'Infrastructure' },
    { id: 'im2', project_id: 'p1', name: 'Roads & Bridges Network', iTwin: 'Transport Grid', size: '1.8 GB', lastSync: now - 900000, status: 'Synced', elements: 98340, type: 'Transport' },
    { id: 'im3', project_id: 'p1', name: 'Digital Twin Facility A', iTwin: 'Bentley Connect', size: '4.1 GB', lastSync: now - 3600000, status: 'Synced', elements: 287410, type: 'Facility' }
  ],
  itwinApps: [
    { id: 'ta1', project_id: 'p1', name: '3D Infrastructure Viewer', type: 'Viewer', status: 'Deployed', environment: 'Production', version: 'v2.1.0' },
    { id: 'ta2', project_id: 'p1', name: 'Bridge Inspector', type: 'Inspector', status: 'Deployed', environment: 'Staging', version: 'v1.3.0' },
    { id: 'ta3', project_id: 'p1', name: 'Asset Dashboard', type: 'Dashboard', status: 'Building', environment: 'Development', version: 'v0.4.0' }
  ],
  annotations: [
    { id: 'an1', project_id: 'p1', model_id: 'im1', text: 'Foundation reinforcement needed in Section A', marker_label: 'Section A', author_name: 'A. Chen' },
    { id: 'an2', project_id: 'p1', model_id: 'im1', text: 'Crack detected in support beam', marker_label: 'Node 4', author_name: 'M. Torres' }
  ],
  botChannels: [
    { id: 'bc1', project_id: 'p1', name: 'MyGemAssist_Bot', platform: 'telegram', channel: '@mycybersecureWealthsolution', status: 'active', subscribers: 247, messagesTotal: 3842 },
    { id: 'bc2', project_id: 'p1', name: 'GEM WhatsApp', platform: 'whatsapp', channel: '+1-650-555-1234', status: 'pending', subscribers: 89, messagesTotal: 1204 }
  ],
  orchestratorJobs: [
    { id: 'oj1', project_id: 'p1', task: 'Analyze Q2 cybersecurity threat landscape', classification: 'general', executor: 'gpt-4o', status: 'completed' },
    { id: 'oj2', project_id: 'p1', task: 'Generate Next.js edge middleware for RBAC', classification: 'software', executor: 'gpt-4.1', status: 'completed' },
    { id: 'oj3', project_id: 'p1', task: 'Design automation workflow for KYC processing', classification: 'workflow', executor: 'claude-sonnet', status: 'completed' },
    { id: 'oj4', project_id: 'p1', task: 'Build portfolio rebalance signal engine', classification: 'software', executor: 'gpt-4.1', status: 'running' }
  ],
  contentDigest: [
    { id: 'cd1', project_id: 'p1', title: 'Critical CVE-2026-1234 in OpenSSL', source: 'CISA', category: 'cybersecurity', status: 'published' },
    { id: 'cd2', project_id: 'p1', title: 'Housing Market Q1 2026: 8.4% YoY Growth', source: 'Zillow Research', category: 'real_estate', status: 'published' },
    { id: 'cd3', project_id: 'p1', title: 'Fed Holds Rates Steady at 4.25%', source: 'Reuters', category: 'market_intelligence', status: 'draft' }
  ],
  users: [{ id: 'u1', name: 'Gem Admin', email: 'gem@admin.io', role: 'admin' }],
  auditLogs: [{ id: 'log1', action: 'platform.bootstrap', actor: 'system', status: 'ok', ts: iso(0), meta: {} }],
  agentConversations: [],
  grades: []
};

const ALLOWED_ENTITIES = new Set(Object.keys(seed).filter((key) => Array.isArray(seed[key])));

function clone(value) { return JSON.parse(JSON.stringify(value)); }

export function store() {
  if (!globalThis.__gemStore) globalThis.__gemStore = clone(seed);
  return globalThis.__gemStore;
}

export function resetStore() {
  globalThis.__gemStore = clone(seed);
  return globalThis.__gemStore;
}

export function uid(prefix = 'id') {
  return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function send(res, status, body) {
  res.status(status).setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  return res.end(JSON.stringify(body));
}

export function role(req) { return req.headers['x-gem-role'] || 'admin'; }
export function actor(req) { return req.headers['x-gem-user'] || 'api'; }

export function requireRole(req, res, allowed = ['admin', 'operator']) {
  const current = role(req);
  if (!allowed.includes(current)) {
    send(res, 403, { error: 'forbidden', required: allowed, role: current });
    return false;
  }
  return true;
}

export function parseBody(req) {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === 'object') return resolve(req.body);
    let raw = '';
    req.on('data', chunk => raw += chunk);
    req.on('end', () => {
      try { resolve(raw ? JSON.parse(raw) : {}); } catch { resolve({ raw }); }
    });
  });
}

export function audit(action, actorName = 'system', status = 'ok', meta = {}) {
  const db = store();
  const record = { id: uid('log'), action, actor: actorName, status, meta, ts: new Date().toISOString() };
  db.auditLogs.unshift(record);
  return record;
}

export function activity(project_id, event, detail, status = 'success', actorName = 'system', meta = {}) {
  const db = store();
  const record = { id: uid('act'), project_id, actor: actorName, event, detail, status, meta, ts: new Date().toISOString() };
  db.activityLogs.unshift(record);
  audit('activity.create', actorName, status === 'error' ? 'error' : 'ok', { project_id, event });
  return record;
}

export function assertEntity(entity) {
  if (!ALLOWED_ENTITIES.has(entity)) return false;
  return true;
}

export function listEntity(entity, filters = {}) {
  const db = store();
  let records = db[entity] || [];
  if (filters.project_id) records = records.filter((r) => !r.project_id || r.project_id === filters.project_id);
  if (filters.category) records = records.filter((r) => r.category === filters.category);
  if (filters.status) records = records.filter((r) => String(r.status).toLowerCase() === String(filters.status).toLowerCase());
  return records;
}

export function getEntity(entity, id) {
  const db = store();
  return (db[entity] || []).find((r) => r.id === id) || null;
}

export function createEntity(entity, body, prefix = entity) {
  const db = store();
  const record = { id: body.id || uid(prefix), ...body, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  db[entity].unshift(record);
  return record;
}

export function updateEntity(entity, id, patch) {
  const db = store();
  const index = (db[entity] || []).findIndex((r) => r.id === id);
  if (index < 0) return null;
  db[entity][index] = { ...db[entity][index], ...patch, id, updated_at: new Date().toISOString() };
  return db[entity][index];
}

export function deleteEntity(entity, id) {
  const db = store();
  const before = db[entity]?.length || 0;
  db[entity] = (db[entity] || []).filter((r) => r.id !== id);
  return db[entity].length !== before;
}

export function getProject(projectIdOrSlug) {
  const db = store();
  return db.projects.find((p) => p.id === projectIdOrSlug || p.slug === projectIdOrSlug) || null;
}

export function projectSummary(projectId) {
  const db = store();
  const project = getProject(projectId);
  if (!project) return null;
  const byProject = (entity) => (db[entity] || []).filter((r) => !r.project_id || r.project_id === project.id);
  return {
    project,
    counts: {
      tools: byProject('projectTools').length,
      productionServices: byProject('productionServices').length,
      deployments: byProject('deployments').length,
      integrations: byProject('integrations').length,
      teamMembers: byProject('teamMembers').length,
      openAlerts: byProject('alerts').filter((a) => a.status === 'Active').length,
      activity: byProject('activityLogs').length
    },
    tools: byProject('projectTools'),
    productionServices: byProject('productionServices'),
    deployments: byProject('deployments'),
    environments: byProject('environments'),
    integrations: byProject('integrations'),
    teamMembers: byProject('teamMembers'),
    activityLogs: byProject('activityLogs'),
    alerts: byProject('alerts'),
    securityEvents: byProject('securityEvents'),
    botChannels: byProject('botChannels'),
    imodels: byProject('imodels'),
    itwinApps: byProject('itwinApps'),
    orchestratorJobs: byProject('orchestratorJobs'),
    contentDigest: byProject('contentDigest')
  };
}

export function routeTask(prompt = '') {
  const t = prompt.toLowerCase();
  if (/code|debug|typescript|react|api|repo|build/.test(t)) return { classification: 'software', provider: 'openai', model: process.env.OPENAI_CODE_MODEL || 'gpt-4.1' };
  if (/workflow|pipeline|process|analy[sz]e|evaluate/.test(t)) return { classification: 'workflow', provider: 'anthropic', model: process.env.ANTHROPIC_WORKFLOW_MODEL || 'claude-sonnet-4' };
  if (/architecture|design|tradeoff|complex|review|reason/.test(t)) return { classification: 'complex_reasoning', provider: 'anthropic', model: process.env.ANTHROPIC_REASONING_MODEL || 'claude-opus-4.6' };
  return { classification: 'general', provider: 'openai', model: process.env.OPENAI_GENERAL_MODEL || 'gpt-4o' };
}
