export default function handler(req, res) {
  res.status(200).json({ status: 'healthy', service: 'gem-enterprise-platform', version: '4.0.0' });
}
