import { send, store } from '../_data.js';

export default function handler(req, res) {
  const db = store();
  return send(res, 200, {
    models: db.imodels || [],
    apps: db.itwinApps || [],
    annotations: db.annotations || []
  });
}
