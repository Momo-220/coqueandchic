import { createClient } from '@vercel/kv';
import fs from 'fs';
import path from 'path';

// Initialise le meilleur client Redis disponible
let kvClient = null;

const restUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const restToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

if (restUrl && restToken) {
  try {
    kvClient = createClient({
      url: restUrl,
      token: restToken,
    });
  } catch (e) {
    console.error('Failed to initialize Vercel KV client:', e);
  }
}

export async function dbGet(key, fallbackFile) {
  // Charger les données locales d'origine
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

  if (kvClient) {
    try {
      const data = await kvClient.get(key);
      if (data !== null && data !== undefined) {
        return data;
      }

      // Auto-Seeding : Si Redis est vide, on l'initialise avec les données de dev
      if (localData !== null) {
        await kvClient.set(key, localData);
        return localData;
      }
    } catch (e) {
      console.error(`Redis error on get ${key}:`, e);
    }
  }

  return localData;
}

export async function dbSet(key, value, fallbackFile) {
  let success = false;
  if (kvClient) {
    try {
      await kvClient.set(key, value);
      success = true;
    } catch (e) {
      console.error(`Redis error on set ${key}:`, e);
    }
  }

  // Écriture locale (sert de backup local)
  try {
    const filePath = path.join(process.cwd(), 'data', fallbackFile);
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2), 'utf8');
    success = true;
  } catch (e) {
    console.error(`File write error on set ${key}:`, e);
  }

  return success;
}
