import { Database, MongoClient } from "https://deno.land/x/mongo/mod.ts";

let db: Database;

export const connect = () => {
  const client = new MongoClient();
  client.connectWithUri("mongodb://localhost:27017");

  db = client.database("todos");
};

export const getDb = () => {
  return db;
};
