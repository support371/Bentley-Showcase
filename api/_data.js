const now = Date.now();

export const seed = {
  securityEvents: [
    { id: 'se1', type: 'Brute Force', source_ip: '185.220.101.45', target: 'Auth API', severity: 'critical', status: 'Blocked' },
    { id: 'se2', type: 'SQL Injection', source_ip: '103.45.67.89', target: 'Data API', severity: 'high', status: 'Investigating' },
    { id: 'se3', type: 'DDoS Spike', source_ip: 'Multiple', target: 'Gateway', severity: 'high', status: 'Mitigated' }
  ],
  alerts: [
    { id: 'al1', title: 'High Error Rate', severity: 'Critical', status: 'Active', source: 'Auth API' },
    { id: 'al2', title: 'SSL Cert Expiring', severity: 'High', status: 'Acknowledged', source: 'Cert Monitor' },
    { id: 'al3', title: 'Memory Pressure', severity: 'Medium', status: 'Active', source: 'K8s Cluster' }
  ],
  deployments: [
    { id: 'dp1', app_name: 'GEM Platform', status: 'deployed', environment_name: 'Production', version: 'v4.0.0' },
    { id: 'dp2', app_name: 'Nexus Financial', status: 'deployed', environment_name: 'Staging', version: 'v2.8.0' },
    { id: 'dp3', app_name: 'OpenGuardians', status: 'building', environment_name: 'Development', version: 'v1.4.0' }
  ],
  environments: [
    { id: 'en1', name: 'Production', project_name: 'GEM Platform', type: 'production', status: 'healthy', region: 'us-east-1' },
    { id: 'en2', name: 'Staging', project_name: 'GEM Platform', type: 'staging', status: 'healthy', region: 'us-east-1' },
    { id: 'en3', name: 'Development', project_name: 'OpenGuardians', type: 'development', status: 'deploying', region: 'us-west-2' }
  ],
  organizations: [
    { id: 'or1', name: 'GEM Cybersecurity', slug: 'gem-cyber', plan: 'enterprise', status: 'active' },
    { id: 'or2', name: 'Alliance Trust Realty', slug: 'atr', plan: 'professional', status: 'active' },
    { id: 'or3', name: 'OpenGuardians', slug: 'og', plan: 'starter', status: 'trial' }
  ],
  licenses: [
    { id: 'li1', organization_name: 'GEM Cybersecurity', plan: 'enterprise', status: 'active', seats_used: 38, seat_limit: 100 },
    { id: 'li2', organization_name: 'Alliance Trust Realty', plan: 'professional', status: 'active', seats_used: 12, seat_limit: 25 }
  ],
  integrations: [
    { id: 'ig1', integration_name: 'GitHub', integration_type: 'cicd', status: 'connected' },
    { id: 'ig2', integration_name: 'Slack', integration_type: 'notification', status: 'connected' },
    { id: 'ig3', integration_name: 'Vercel', integration_type: 'cicd', status: 'connected' },
    { id: 'ig4', integration_name: 'Telegram Bot', integration_type: 'notification', status: 'connected' },
    { id: 'ig5', integration_name: 'WhatsApp Cloud', integration_type: 'notification', status: 'pending' },
    { id: 'ig6', integration_name: 'Bentley iTwin', integration_type: 'cicd', status: 'connected' }
  ],
  projects: [
    { id: 'pj1', name: 'GEM Enterprise Platform', organization_name: 'GEM Cybersecurity', tech_stack: 'Next.js, TypeScript, Prisma', status: 'active' },
    { id: 'pj2', name: 'Nexus Financial', organization_name: 'GEM Cybersecurity', tech_stack: 'React, Node.js, PostgreSQL', status: 'active' },
    { id: 'pj3', name: 'OpenGuardians Portal', organization_name: 'OpenGuardians', tech_stack: 'Next.js, Redis, Docker', status: 'active' }
  ],
  imodels: [
    { id: 'im1', name: 'Civil Infrastructure Hub', iTwin: 'Smart City Alpha', size: '2.4 GB', lastSync: now - 120000, status: 'Synced', elements: 142890, type: 'Infrastructure' },
    { id: 'im2', name: 'Roads & Bridges Network', iTwin: 'Transport Grid', size: '1.8 GB', lastSync: now - 900000, status: 'Synced', elements: 98340, type: 'Transport' },
    { id: 'im3', name: 'Digital Twin Facility A', iTwin: 'Bentley Connect', size: '4.1 GB', lastSync: now - 3600000, status: 'Synced', elements: 287410, type: 'Facility' },
    { id: 'im4', name: 'Underground Utilities', iTwin: 'Infrastructure Hub', size: '890 MB', lastSync: now - 10800000, status: 'Outdated', elements: 56200, type: 'Utilities' },
    { id: 'im5', name: 'Water Treatment Plant', iTwin: 'Civil Works', size: '1.1 GB', lastSync: now - 43200000, status: 'Synced', elements: 74500, type: 'Facility' }
  ],
  itwinApps: [
    { id: 'ta1', name: '3D Infrastructure Viewer', type: 'Viewer', status: 'Deployed', environment: 'Production', version: 'v2.1.0' },
    { id: 'ta2', name: 'Bridge Inspector', type: 'Inspector', status: 'Deployed', environment: 'Staging', version: 'v1.3.0' },
    { id: 'ta3', name: 'Asset Dashboard', type: 'Dashboard', status: 'Building', environment: 'Development', version: 'v0.4.0' },
    { id: 'ta4', name: 'Utility Map Viewer', type: 'Map', status: 'Draft', environment: 'Development', version: 'v0.1.0' }
  ],
  annotations: [
    { id: 'an1', model_id: 'im1', text: 'Foundation reinforcement needed in Section A', marker_label: 'Section A', author_name: 'A. Chen' },
    { id: 'an2', model_id: 'im1', text: 'Crack detected in support beam', marker_label: 'Node 4', author_name: 'M. Torres' }
  ],
  automations: [
    { id: 'au1', name: 'Deploy Pipeline Guard', trigger: 'push', status: 'active', runs: 847, desc: 'Validates build and security scan' },
    { id: 'au2', name: 'Threat Alert Escalation', trigger: 'webhook', status: 'active', runs: 234, desc: 'Routes to Sentinel agent' },
    { id: 'au3', name: 'Daily Digest Publisher', trigger: 'schedule', status: 'active', runs: 142, desc: 'Generates news cards' }
  ],
  botChannels: [
    { id: 'bc1', name: 'MyGemAssist_Bot', platform: 'telegram', channel: '@mycybersecureWealthsolution', status: 'active', subscribers: 247, messagesTotal: 3842 },
    { id: 'bc2', name: 'GEM WhatsApp', platform: 'whatsapp', channel: '+1-650-555-1234', status: 'pending', subscribers: 89, messagesTotal: 1204 }
  ],
  orchestratorJobs: [
    { id: 'oj1', task: 'Analyze Q2 cybersecurity threat landscape', classification: 'general', executor: 'gpt-4o', status: 'completed' },
    { id: 'oj2', task: 'Generate Next.js edge middleware for RBAC', classification: 'software', executor: 'gpt-4.1', status: 'completed' },
    { id: 'oj3', task: 'Design automation workflow for KYC processing', classification: 'workflow', executor: 'claude-sonnet', status: 'completed' },
    { id: 'oj4', task: 'Build portfolio rebalance signal engine', classification: 'software', executor: 'gpt-4.1', status: 'running' }
  ],
  contentDigest: [
    { id: 'cd1', title: 'Critical CVE-2026-1234 in OpenSSL', source: 'CISA', category: 'cybersecurity', status: 'published' },
    { id: 'cd2', title: 'Housing Market Q1 2026: 8.4% YoY Growth', source: 'Zillow Research', category: 'real_estate', status: 'published' },
    { id: 'cd3', title: 'Fed Holds Rates Steady at 4.25%', source: 'Reuters', category: 'market_intelligence', status: 'draft' }
  ],
  grades: [],
  agentConversations: [],
  users: [{ id: 'u1', name: 'Gem Admin', role: 'admin' }],
  auditLogs: [{ id: 'log1', action: 'platform.bootstrap', actor: 'system', status: 'ok', ts: new Date().toISOString() }]
};

export function send(res, status, body) {
  res.status(status).setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  return res.end(JSON.stringify(body));
}

export function role(req) {
  return req.headers['x-gem-role'] || 'admin';
}

export function requireRole(req, res, allowed = ['admin', 'operator']) {
  const current = role(req);
  if (!allowed.includes(current)) {
    send(res, 403, { error: 'forbidden', required: allowed, role: current });
    return false;
  }
  return true;
}

export function entityName(req) {
  return req.query?.entity || req.url?.split('/').filter(Boolean).pop();
}

export function parseBody(req) {
  return new Promise((resolve) => {
    if (req.body) return resolve(req.body);
    let raw = '';
    req.on('data', chunk => raw += chunk);
    req.on('end', () => {
      try { resolve(raw ? JSON.parse(raw) : {}); } catch { resolve({ raw }); }
    });
  });
}

export function routeTask(prompt = '') {
  const t = prompt.toLowerCase();
  if (/code|debug|typescript|react|api|repo|build/.test(t)) return { classification: 'software', provider: 'openai', model: process.env.OPENAI_CODE_MODEL || 'gpt-4.1' };
  if (/workflow|pipeline|process|analy[sz]e|evaluate/.test(t)) return { classification: 'workflow', provider: 'anthropic', model: process.env.ANTHROPIC_WORKFLOW_MODEL || 'claude-sonnet-4' };
  if (/architecture|design|tradeoff|complex|review|reason/.test(t)) return { classification: 'complex_reasoning', provider: 'anthropic', model: process.env.ANTHROPIC_REASONING_MODEL || 'claude-opus-4.6' };
  return { classification: 'general', provider: 'openai', model: process.env.OPENAI_GENERAL_MODEL || 'gpt-4o' };
}