import { kv } from '@vercel/kv';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const useKV = !!process.env.KV_REST_API_URL;
  const filePath = path.join(process.cwd(), 'data', 'settings.json');

  if (req.method === 'GET') {
    try {
      if (useKV) {
        const data = await kv.get('cc_settings');
        if (data) return res.status(200).json(data);
      }
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        return res.status(200).json(JSON.parse(content));
      }
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
    return res.status(200).json({});
  }

  if (req.method === 'POST') {
    try {
      const data = req.body;
      if (useKV) {
        await kv.set('cc_settings', data);
      }
      try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      } catch (e) {}
      return res.status(200).json({ status: 'ok' });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).end();
}
