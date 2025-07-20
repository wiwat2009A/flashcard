// lib/mongodb-client.ts
import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI!;
const dbName = process.env.DB_NAME!;

if (!uri) {
  throw new Error("Missing MONGODB_URI in environment variables");
}

if (!dbName) {
  throw new Error("Missing DB_NAME in environment variables");
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function getClient(): Promise<MongoClient> {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  return client;
}

export async function getDb(): Promise<Db> {
  if (cachedDb) return cachedDb;
  const client = await getClient();
  const db = client.db(dbName);
  cachedDb = db;
  return db;
}
