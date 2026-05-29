import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const snippets = sqliteTable("snippets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  filePath: text("file_path").notNull(),
  language: text("language").notNull(),
  tags: text("tags", { mode: "json" }).$type<string[]>(),
  description: text("description"),
  isFavorite: integer("is_favorite", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }),
});
