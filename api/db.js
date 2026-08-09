import { createClient as createRedisClient } from 'redis';
import { createClient as createKvClient } from '@vercel/kv';
import fs from 'fs';
import path from 'path';

let client = null;
let clientType = null; // 'kv' or 'redis'

async function getClient() {
  if (client) return client;

  // 1. Tente de se connecter via Vercel KV (REST API)
  const restUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const restToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (restUrl && restToken) {
    try {
      client = createKvClient({ url: restUrl, token: restToken });
      clientType = 'kv';
      return client;
    } catch (e) {
      console.error('Failed to init Vercel KV REST client:', e);
    }
  }

  // 2. Tente de se connecter via Redis URL standard (TCP)
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    try {
      const redisClient = createRedisClient({ url: redisUrl });
      await redisClient.connect();
      client = redisClient;
      clientType = 'redis';
      return client;
    } catch (e) {
      console.error('Failed to init Redis TCP client:', e);
    }
  }

  return null;
}

export async function dbGet(key, fallbackFile) {
  // Charger les données de dev locales
  const filePath = path.join(process.cwd(), 'data', fallbackFile);
  let localData = null;
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      localData = JSON.parse(content);
    } catch (e) {
      console.error(`Failed to parse local file ${fallbackFile}:`, e);
    }
  }

  try {
    const activeClient = await getClient();
    if (activeClient) {
      let rawData = null;
      if (clientType === 'kv') {
        rawData = await activeClient.get(key);
      } else if (clientType === 'redis') {
        const val = await activeClient.get(key);
        rawData = val ? JSON.parse(val) : null;
      }

      if (rawData !== null && rawData !== undefined) {
        return rawData;
      }

      // Auto-Seeding : Si la DB est vide, on injecte les données de dev locales
      if (localData !== null) {
        if (clientType === 'kv') {
          await activeClient.set(key, localData);
        } else if (clientType === 'redis') {
          await activeClient.set(key, JSON.stringify(localData));
        }
        return localData;
      }
    }
  } catch (e) {
    console.error(`Database error on get ${key}:`, e);
  }

  return localData;
}

export async function dbSet(key, value, fallbackFile) {
  let success = false;
  try {
    const activeClient = await getClient();
    if (activeClient) {
      if (clientType === 'kv') {
        await activeClient.set(key, value);
      } else if (clientType === 'redis') {
        await activeClient.set(key, JSON.stringify(value));
      }
      success = true;
    }
  } catch (e) {
    console.error(`Database error on set ${key}:`, e);
  }

  // Backup écriture locale
  try {
    const filePath = path.join(process.cwd(), 'data', fallbackFile);
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2), 'utf8');
    success = true;
  } catch (e) {
    console.error(`File write error on set ${key}:`, e);
  }

  return success;
}
