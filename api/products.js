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
      const data = await dbGet('products');
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
          await dbAdd('products', data.product);
        } else if (data.action === 'update') {
          await dbUpdate('products', { id: data.id }, data.product);
        } else if (data.action === 'delete') {
          await dbDelete('products', { id: data.id });
        }
        return res.status(200).json({ status: 'ok' });
      } else {
        // Fallback rétrocompatible pour l'envoi de la liste entière
        await dbSet('products', data);
        return res.status(200).json({ status: 'ok' });
      }
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).end();
}
