export default function handler(req, res) {
  return res.status(200).json({ ok: true, service: 'gem-enterprise-platform', version: '4.0.0' });
}
