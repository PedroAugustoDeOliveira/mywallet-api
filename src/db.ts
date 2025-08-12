import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const client = new MongoClient(process.env.MONGO_URI as string);
const databaseName = process.env.MONGO_BASE as string;

let db: Db;

export async function connectToDatabase(): Promise<void> {
  await client.connect();
  db = client.db(databaseName);
  console.log("Connected to MongoDB");
}

export function getDb(): Db {
  if (!db) {
    throw new Error("Database not connected");
  }
  return db;
}
