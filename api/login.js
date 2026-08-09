import { dbGet } from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  try {
    const { user, pass } = req.body;
    const settings = await dbGet('settings', 'settings.json');
    const validUser = (settings.adminUser || 'admin').trim();
    const validPass = (settings.adminPass || 'admin').trim();

    const cleanUser = (user || '').trim();
    const cleanPass = (pass || '').trim();

    if (cleanUser.toLowerCase() === validUser.toLowerCase() && cleanPass === validPass) {
      return res.status(200).json({ success: true });
    }
    return res.status(200).json({ success: false, error: 'Identifiants incorrects' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
