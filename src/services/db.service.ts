import { db } from "@/db";
import { snippets } from "@/db/schema";
import { eq } from "drizzle-orm";

const dbService = {
  saveSnippet: async (
    title: string,
    tags: string[],
    path: string,
    language: string,
    isFavorite: boolean,
    description?: string,
  ) => {
    const result = await db.insert(snippets).values({
      title,
      language,
      filePath: path,
      tags,
      isFavorite,
      description,
    });
    return result;
  },
  getAllSnippets: async () => {
    const result = await db.select().from(snippets).all();
    return result;
  },
  deleteSnippet: async (id: number) => {
    const result = await db.delete(snippets).where(eq(snippets.id, id));
    return result;
  },
  updateSnippet: async (
    id: number,
    data: {
      title?: string;
      tags?: string[];
      filePath?: string;
      language?: string;
      isFavorite?: boolean;
      description?: string;
    },
  ) => {
    const result = await db
      .update(snippets)
      .set(data)
      .where(eq(snippets.id, id));
    return result;
  },
  deleteAllSnippets: async () => {
    const result = await db.delete(snippets);
    return result;
  },
};

export default dbService;
