import { send, store } from './_data.js';

export default function handler(req, res) {
  const db = store();
  return send(res, 200, {
    status: 'healthy',
    service: 'gem-enterprise-platform',
    version: '4.2.0',
    mode: 'project-operating-system',
    workspace: db.workspace?.name,
    counts: {
      projects: db.projects?.length || 0,
      tools: db.projectTools?.length || 0,
      runtimeAssets: db.productionServices?.length || 0,
      teamMembers: db.teamMembers?.length || 0,
      activityLogs: db.activityLogs?.length || 0,
      auditLogs: db.auditLogs?.length || 0
    }
  });
}
