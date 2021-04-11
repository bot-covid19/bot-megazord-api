import { MongoClient } from 'mongodb';

const url = "mongodb://mongodb:27017";

export const dbName = "covid";

export function newMongoClient() {
  return new MongoClient(url);
};
