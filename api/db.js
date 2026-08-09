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
    throw new Error('MONGODB_URI environment variable is missing.');
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
    throw e;
  }
}

export async function dbGet(collectionName, fallbackFile) {
  const db = await connectToDatabase();
  const count = await db.collection(collectionName).countDocuments();

  if (count > 0) {
    // Source de vérité 100% MongoDB Atlas
    if (collectionName === 'settings') {
      const doc = await db.collection(collectionName).findOne({});
      if (doc) {
        const { _id, ...rest } = doc;
        return rest;
      }
      return {};
    } else {
      const docs = await db.collection(collectionName).find({}).toArray();
      return docs.map(({ _id, ...rest }) => rest);
    }
  } else {
    // Auto-Seeding : Uniquement exécuté la première fois si MongoDB est vide
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

    if (localData !== null) {
      if (collectionName === 'settings') {
        await db.collection(collectionName).replaceOne({}, localData, { upsert: true });
      } else if (Array.isArray(localData) && localData.length > 0) {
        await db.collection(collectionName).insertMany(localData);
      }
      return localData;
    }
  }

  return collectionName === 'settings' ? {} : [];
}

export async function dbSet(collectionName, value) {
  const db = await connectToDatabase();
  
  if (collectionName === 'settings') {
    await db.collection(collectionName).replaceOne({}, value, { upsert: true });
  } else {
    // Écriture 100% exclusive sur MongoDB Atlas (zéro fichier local créé ou modifié)
    await db.collection(collectionName).deleteMany({});
    if (Array.isArray(value) && value.length > 0) {
      await db.collection(collectionName).insertMany(value);
    }
  }
  return true;
}
