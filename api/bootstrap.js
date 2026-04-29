import { send, store, audit } from './_data.js';

export default function handler(req, res) {
  const db = store();
  audit('api.bootstrap', 'system', 'ok');

  const counts = {
    projects: db.projects?.length || 0,
    tools: db.projectTools?.length || 0,
    runtimeAssets: db.productionServices?.length || 0,
    teamMembers: db.teamMembers?.length || 0,
    integrations: db.integrations?.length || 0,
    jobs: db.orchestratorJobs?.length || 0,
    activityLogs: db.activityLogs?.length || 0,
    auditLogs: db.auditLogs?.length || 0
  };

  return send(res, 200, {
    platform: {
      name: 'GEM Enterprise Platform',
      version: '4.2.2',
      aiEngine: 'Claude Opus 4.6 + GPT-4o/4.1',
      mode: 'project-operating-system',
      workspace: db.workspace
    },
    capabilities: {
      workspace: true,
      projectControl: true,
      projectScopedCrud: true,
      toolCatalog: true,
      runtimeAssets: true,
      teamAccess: true,
      activityTimeline: true,
      actionExecution: true,
      jobs: true,
      audit: true,
      digitalTwinMetadata: true,
      contentPipeline: true,
      agentRouting: true,
      webhookIngestion: true
    },
    endpoints: {
      status: '/api/status',
      health: '/health',
      bootstrap: '/api/bootstrap',
      projects: '/api/projects',
      entities: '/api/entities?entity=alerts&project_id=p1',
      activity: '/api/activity?project_id=p1',
      deployments: '/api/entities?entity=deployments&project_id=p1',
      integrations: '/api/entities?entity=integrations&project_id=p1',
      runtimeAssets: '/api/entities?entity=runtime&project_id=p1',
      toolCatalog: '/api/entities?entity=tools&project_id=p1',
      jobs: '/api/entities?entity=jobs&project_id=p1',
      content: '/api/entities?entity=content&project_id=p1',
      webhook: '/api/entities?entity=jobs&operation=webhook&project_id=p1',
      action: '/api/entities?entity=tools&operation=action&project_id=p1',
      agentChat: '/api/agent/chat',
      itwinModels: '/api/itwin/models?project_id=p1'
    },
    counts,
    projects: db.projects,
    data: db
  });
}
