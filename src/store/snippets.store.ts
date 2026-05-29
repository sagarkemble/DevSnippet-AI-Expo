import dbService from "@/services/db.service";
import fileSystemService from "@/services/file-system.service";
import { create } from "zustand";

export type Snippet = {
  id: number;
  title: string;
  language: string;
  code: string;
  tags?: string[];
  description?: string;
  isFavorite: boolean;
  path: string;
};

type SnippetsStore = {
  snippets: Snippet[];
  directories: string[];
  loading: boolean;
  loadSnippets: () => Promise<void>;
  loadDirectories: () => Promise<void>;
  addSnippet: (snippet: Snippet) => void;
  updateSnippet: (id: number, updates: Partial<Snippet>) => void;
  deleteSnippet: (id: number) => void;
  deleteSnippetWithFile: (id: number) => Promise<void>;
  createDirectory: (name: string) => Promise<void>;
  deleteDirectory: (name: string) => Promise<void>;
  refreshSnippets: () => Promise<void>;
  wipeAll: () => Promise<void>;
};

export const useSnippetsStore = create<SnippetsStore>((set, get) => ({
  snippets: [],
  directories: [],
  loading: false,

  loadSnippets: async () => {
    set({ loading: true });
    try {
      const dbSnippets = await dbService.getAllSnippets();

      const snippetData = await Promise.all(
        dbSnippets.map(async (snippet) => {
          const code = await fileSystemService.getFileContent(snippet.filePath);
          return {
            id: snippet.id,
            title: snippet.title,
            language: snippet.language,
            code,
            tags: snippet.tags ?? undefined,
            description: snippet.description ?? undefined,
            isFavorite: snippet.isFavorite ?? false,
            path: snippet.filePath,
          };
        }),
      );
      console.log("Loaded snippets:", snippetData);
      set({ snippets: snippetData, loading: false });
    } catch (error) {
      console.error("Failed to load snippets:", error);
      set({ loading: false });
    }
  },

  loadDirectories: async () => {
    try {
      const dirs = await fileSystemService.listDirectories();
      set({ directories: dirs });
      console.log("Loaded directories:", dirs);
    } catch (error) {
      console.error("Failed to load directories:", error);
    }
  },

  addSnippet: (snippet) => {
    set((state) => ({ snippets: [...state.snippets, snippet] }));
  },

  updateSnippet: (id, updates) => {
    set((state) => ({
      snippets: state.snippets.map((s) =>
        s.id === id ? { ...s, ...updates } : s,
      ),
    }));
  },

  deleteSnippet: (id) => {
    set((state) => ({
      snippets: state.snippets.filter((s) => s.id !== id),
    }));
  },

  deleteSnippetWithFile: async (id) => {
    try {
      const snippet = get().snippets.find((s) => s.id === id);
      if (!snippet) return;

      await dbService.deleteSnippet(id);
      fileSystemService.deleteFile(snippet.path);

      set((state) => ({
        snippets: state.snippets.filter((s) => s.id !== id),
      }));
    } catch (error) {
      console.error("Failed to delete snippet:", error);
      throw error;
    }
  },

  createDirectory: async (name) => {
    try {
      fileSystemService.createDirectory(name);
      await get().loadDirectories();
    } catch (error) {
      console.error("Failed to create directory:", error);
      throw error;
    }
  },

  deleteDirectory: async (name) => {
    try {
      const snippetsInDir = get().snippets.filter((s) =>
        s.path.startsWith(name + "/")
      );

      for (const snippet of snippetsInDir) {
        await dbService.deleteSnippet(snippet.id);
      }

      fileSystemService.deleteDirectory(name);

      set((state) => ({
        snippets: state.snippets.filter((s) => !s.path.startsWith(name + "/")),
      }));

      await get().loadDirectories();
    } catch (error) {
      console.error("Failed to delete directory:", error);
      throw error;
    }
  },

  refreshSnippets: async () => {
    await get().loadSnippets();
  },

  wipeAll: async () => {
    try {
      const allSnippets = get().snippets;
      const allDirectories = get().directories;

      await dbService.deleteAllSnippets();

      for (const s of allSnippets) {
        try {
          fileSystemService.deleteFile(s.path);
        } catch (e) {
          console.warn("Failed to delete file", s.path, e);
        }
      }

      for (const dir of allDirectories) {
        try {
          fileSystemService.deleteDirectory(dir);
        } catch (e) {
          console.warn("Failed to delete directory", dir, e);
        }
      }

      set({ snippets: [], directories: [], loading: false });
    } catch (error) {
      console.error("Failed to wipe data:", error);
      throw error;
    }
  },
}));
