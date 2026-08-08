import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const filePath = path.join(process.cwd(), 'data', 'messages.json');

  if (req.method === 'GET') {
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        return res.status(200).json(JSON.parse(content));
      }
    } catch (e) {}
    return res.status(200).json([]);
  }

  if (req.method === 'POST') {
    try {
      if (req.body) {
        fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2), 'utf8');
      }
    } catch (e) {}
    return res.status(200).json({ status: 'ok' });
  }

  return res.status(405).end();
}
