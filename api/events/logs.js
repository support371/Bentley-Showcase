import { send, store } from '../_data.js';

export default function handler(req, res) {
  const db = store();
  return send(res, 200, { events: db.auditLogs || [] });
}
