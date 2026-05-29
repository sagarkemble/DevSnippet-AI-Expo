import { drizzle } from "drizzle-orm/expo-sqlite";
import * as SQLite from "expo-sqlite";

const expoDb = SQLite.openDatabaseSync("snippets.db");

export const db = drizzle(expoDb);
export { expoDb };
