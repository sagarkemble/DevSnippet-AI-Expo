import { Directory, File, Paths } from "expo-file-system";

const fileSystemService = {
  createFile: (filePath: string, content: string): string => {
    try {
      const file = new File(Paths.document, filePath);

      if (!file.exists) {
        file.create();
      }

      file.write(content);
      return file.uri;
    } catch (error) {
      console.error("Error creating file:", error);
      throw error;
    }
  },

  getFileContent: async (filePath: string): Promise<string> => {
    try {
      const file = new File(Paths.document, filePath);

      if (!file.exists) {
        throw new Error("File does not exist");
      }

      return await file.text();
    } catch (error) {
      console.error("Error reading file:", error);
      throw error;
    }
  },

  deleteFile: (filePath: string): void => {
    try {
      const file = new File(Paths.document, filePath);

      if (file.exists) {
        file.delete();
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
  },

  listFiles: (directoryPath = ""): string[] => {
    try {
      const directory = new Directory(Paths.document, directoryPath);

      if (!directory.exists) {
        return [];
      }

      return directory
        .list()
        .filter((item) => item instanceof File)
        .map((file) => file.name);
    } catch (error) {
      console.error("Error listing files:", error);
      throw error;
    }
  },

  createDirectory: (directoryPath: string): string => {
    try {
      const directory = new Directory(Paths.document, directoryPath);

      if (!directory.exists) {
        directory.create();
      }

      return directory.uri;
    } catch (error) {
      console.error("Error creating directory:", error);
      throw error;
    }
  },

  deleteDirectory: (directoryPath: string): void => {
    try {
      const directory = new Directory(Paths.document, directoryPath);

      if (directory.exists) {
        directory.delete();
      }
    } catch (error) {
      console.error("Error deleting directory:", error);
      throw error;
    }
  },

  listDirectories: (directoryPath = ""): string[] => {
    try {
      const directory = new Directory(Paths.document, directoryPath);

      if (!directory.exists) {
        return [];
      }

      return directory
        .list()
        .filter((item) => item instanceof Directory)
        .map((dir) => dir.name);
    } catch (error) {
      console.error("Error listing directories:", error);
      throw error;
    }
  },
};

export default fileSystemService;
