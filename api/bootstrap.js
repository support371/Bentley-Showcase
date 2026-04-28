import { send, store, audit, projectSummary } from './_data.js';

export default function handler(req, res) {
  const db = store();
  const projects = db.projects.map((project) => projectSummary(project.id));
  audit('api.bootstrap', 'system', 'ok');
  return send(res, 200, {
    platform: {
      name: 'GEM Enterprise Platform',
      version: '4.2.0',
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
      agentRouting: true
    },
    endpoints: {
      status: '/api/status',
      health: '/api/health',
      bootstrap: '/api/bootstrap',
      projects: '/api/projects',
      entities: '/api/entities?entity=alerts&project_id=p1',
      catalog: '/api/catalog?project_id=p1',
      runtime: '/api/runtime?project_id=p1',
      team: '/api/team?project_id=p1',
      activity: '/api/activity?project_id=p1',
      actions: '/api/actions',
      jobs: '/api/jobs?project_id=p1',
      audit: '/api/audit',
      itwinModels: '/api/itwin/models?project_id=p1',
      agentChat: '/api/agent/chat',
      genesis: '/api/genesis'
    },
    data: db,
    projectSummaries: projects
  });
}
