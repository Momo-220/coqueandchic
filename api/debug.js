import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
  const uri = process.env.MONGODB_URI;
  const status = {
    hasUri: !!uri,
    uriMasked: uri ? uri.replace(/:([^@]+)@/, ':****@') : null,
    connected: false,
    error: null,
  };

  if (uri) {
    try {
      const client = new MongoClient(uri);
      await client.connect();
      await client.db('coqueandchic').command({ ping: 1 });
      status.connected = true;
      await client.close();
    } catch (e) {
      status.error = e.message;
    }
  }

  return res.status(200).json(status);
}
