const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

// 1. Lire le fichier .env
const envPath = path.join(__dirname, '../.env');
let mongodbUri = process.env.MONGODB_URI;

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/^MONGODB_URI\s*=\s*(.+)$/m);
  if (match) {
    mongodbUri = match[1].trim();
  }
}

if (!mongodbUri) {
  console.error("❌ Erreur : MONGODB_URI n'est pas défini dans le fichier .env ou dans les variables d'environnement.");
  process.exit(1);
}

const dataDir = path.join(__dirname, '../data');
const collectionsToSeed = [
  { name: 'products', file: 'products.json' },
  { name: 'shipping', file: 'shipping.json' },
  { name: 'orders', file: 'orders.json' },
  { name: 'messages', file: 'messages.json' },
  { name: 'settings', file: 'settings.json' }
];

async function seed() {
  console.log("🔌 Connexion à MongoDB Atlas...");
  const client = new MongoClient(mongodbUri);
  try {
    await client.connect();
    console.log("✅ Connecté avec succès !");
    const db = client.db('coqueandchic');

    for (const col of collectionsToSeed) {
      const filePath = path.join(dataDir, col.file);
      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️ Fichier local manquant : ${col.file}, ignoré.`);
        continue;
      }

      console.log(`\n📦 Initialisation de la collection "${col.name}"...`);
      const fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      if (col.name === 'settings') {
        // Remplacement/Upsert pour les settings
        await db.collection(col.name).replaceOne({}, fileData, { upsert: true });
        console.log(`✅ Collection "${col.name}" initialisée avec succès (configuration générale).`);
      } else {
        // Nettoyage et insertion directe
        await db.collection(col.name).deleteMany({});
        if (Array.isArray(fileData) && fileData.length > 0) {
          await db.collection(col.name).insertMany(fileData);
          console.log(`✅ Collection "${col.name}" peuplée avec ${fileData.length} documents.`);
        } else {
          console.log(`ℹ️ La collection "${col.name}" a été vidée (aucun document à insérer).`);
        }
      }
    }

    console.log("\n🎉 Seeding terminé avec succès sur MongoDB Atlas !");
  } catch (error) {
    console.error("❌ Une erreur est survenue lors du seeding :", error);
  } finally {
    await client.close();
    console.log("🔌 Déconnexion de MongoDB Atlas.");
  }
}

seed();
