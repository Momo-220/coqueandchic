import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('MONGODB_URI environment variable is missing, using local files.');
    return null;
  }

  try {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db('coqueandchic');
    cachedClient = client;
    cachedDb = db;
    return db;
  } catch (e) {
    console.error('Failed to connect to MongoDB:', e);
    return null;
  }
}

export async function dbGet(collectionName, fallbackFile) {
  // 1. Charger les données locales d'origine (fallback / seeding)
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
    const db = await connectToDatabase();
    if (db) {
      const count = await db.collection(collectionName).countDocuments();

      if (count > 0) {
        // Charger les données depuis MongoDB
        if (collectionName === 'settings') {
          const doc = await db.collection(collectionName).findOne({});
          if (doc) {
            const { _id, ...rest } = doc;
            return rest;
          }
        } else {
          const docs = await db.collection(collectionName).find({}).toArray();
          return docs.map(({ _id, ...rest }) => rest);
        }
      } else {
        // Auto-Seeding : Si la collection est vide, on l'initialise avec les données locales
        if (localData !== null) {
          if (collectionName === 'settings') {
            await db.collection(collectionName).replaceOne({}, localData, { upsert: true });
          } else if (Array.isArray(localData) && localData.length > 0) {
            await db.collection(collectionName).insertMany(localData);
          }
          return localData;
        }
      }
    }
  } catch (e) {
    console.error(`MongoDB error on get ${collectionName}:`, e);
  }

  return localData || (collectionName === 'settings' ? {} : []);
}

export async function dbSet(collectionName, value, fallbackFile) {
  let success = false;
  try {
    const db = await connectToDatabase();
    if (db) {
      if (collectionName === 'settings') {
        await db.collection(collectionName).replaceOne({}, value, { upsert: true });
      } else {
        // Remplacer l'ensemble de la collection par les nouvelles valeurs envoyées
        await db.collection(collectionName).deleteMany({});
        if (Array.isArray(value) && value.length > 0) {
          await db.collection(collectionName).insertMany(value);
        }
      }
      success = true;
    }
  } catch (e) {
    console.error(`MongoDB error on set ${collectionName}:`, e);
  }

  // Backup dans le fichier local
  try {
    const filePath = path.join(process.cwd(), 'data', fallbackFile);
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2), 'utf8');
    success = true;
  } catch (e) {
    console.error(`File write error on set ${collectionName}:`, e);
  }

  return success;
}
