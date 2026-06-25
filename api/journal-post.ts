export default function handler(req: any, res: any) {
  res.status(503).json({ error: 'Service not available' });
}
