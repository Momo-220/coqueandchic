import { dbGet, dbSet, dbAdd, dbUpdate, dbDelete } from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const data = await dbGet('orders');
      return res.status(200).json(data || []);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const data = req.body;
      if (data && typeof data === 'object' && data.action) {
        if (data.action === 'add') {
          await dbAdd('orders', data.order);
        } else if (data.action === 'update') {
          await dbUpdate('orders', { id: data.id }, data.order);
        } else if (data.action === 'delete') {
          await dbDelete('orders', { id: data.id });
        }
        return res.status(200).json({ status: 'ok' });
      } else {
        // Fallback rétrocompatible
        await dbSet('orders', data);
        return res.status(200).json({ status: 'ok' });
      }
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).end();
}
