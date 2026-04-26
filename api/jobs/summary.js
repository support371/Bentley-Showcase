import { send, store } from '../_data.js';

export default function handler(req, res) {
  const db = store();
  const jobs = db.orchestratorJobs || [];
  const summary = jobs.reduce((acc, job) => {
    acc.total += 1;
    acc.byStatus[job.status] = (acc.byStatus[job.status] || 0) + 1;
    acc.byClassification[job.classification] = (acc.byClassification[job.classification] || 0) + 1;
    acc.byExecutor[job.executor] = (acc.byExecutor[job.executor] || 0) + 1;
    return acc;
  }, { total: 0, byStatus: {}, byClassification: {}, byExecutor: {} });
  return send(res, 200, { summary, jobs });
}
