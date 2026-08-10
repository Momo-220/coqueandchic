import { MongoClient } from 'mongodb';

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

export async function dbGet(collectionName) {
  const db = await connectToDatabase();

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
}

export async function dbSet(collectionName, value) {
  const db = await connectToDatabase();
  
  if (collectionName === 'settings') {
    await db.collection(collectionName).replaceOne({}, value, { upsert: true });
  } else {
    // Écriture 100% directe et définitive sur MongoDB Atlas
    await db.collection(collectionName).deleteMany({});
    if (Array.isArray(value) && value.length > 0) {
      await db.collection(collectionName).insertMany(value);
    }
  }
  return true;
}

export async function dbAdd(collectionName, item) {
  const db = await connectToDatabase();
  await db.collection(collectionName).insertOne(item);
  return true;
}

export async function dbUpdate(collectionName, query, updateValues) {
  const db = await connectToDatabase();
  await db.collection(collectionName).updateOne(query, { $set: updateValues });
  return true;
}

export async function dbDelete(collectionName, query) {
  const db = await connectToDatabase();
  await db.collection(collectionName).deleteOne(query);
  return true;
}
