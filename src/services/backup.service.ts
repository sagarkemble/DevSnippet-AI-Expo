import dbService from "@/services/db.service";
import fileSystemService from "@/services/file-system.service";
import * as DocumentPicker from "expo-document-picker";
import { File, Paths } from "expo-file-system";
import * as LegacyFS from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

export type ExportedSnippet = {
  title: string;
  path: string;
  language: string;
  tags: string[];
  description: string;
  isFavorite: boolean;
  code: string;
};

export type BackupFile = {
  app: "DevSnippets-AI";
  version: 1;
  exportedAt: string;
  snippets: ExportedSnippet[];
};

export type ImportResult = {
  imported: number;
  skipped: number;
  skippedPaths: string[];
};

const BACKUP_DIR = "backups";

const ensureParentDir = (filePath: string) => {
  const parts = filePath.split("/");
  if (parts.length <= 1) return;
  const parent = parts.slice(0, -1).join("/");
  fileSystemService.createDirectory(parent);
};

const buildBackup = async (): Promise<BackupFile> => {
  const rows = await dbService.getAllSnippets();
  const snippets: ExportedSnippet[] = await Promise.all(
    rows.map(async (row) => ({
      title: row.title,
      path: row.filePath,
      language: row.language,
      tags: row.tags ?? [],
      description: row.description ?? "",
      isFavorite: row.isFavorite ?? false,
      code: await fileSystemService.getFileContent(row.filePath),
    })),
  );

  return {
    app: "DevSnippets-AI",
    version: 1,
    exportedAt: new Date().toISOString(),
    snippets,
  };
};

const validateBackup = (data: unknown): data is BackupFile => {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  if (d.app !== "DevSnippets-AI") return false;
  if (d.version !== 1) return false;
  if (!Array.isArray(d.snippets)) return false;
  return d.snippets.every((s) => {
    if (!s || typeof s !== "object") return false;
    const x = s as Record<string, unknown>;
    return (
      typeof x.title === "string" &&
      typeof x.path === "string" &&
      typeof x.language === "string" &&
      typeof x.code === "string"
    );
  });
};

const backupService = {
  exportAll: async (): Promise<{ savedTo: "folder" | "shared" }> => {
    const backup = await buildBackup();
    const json = JSON.stringify(backup, null, 2);

    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `devsnippets-backup-${stamp}.json`;

    if (Platform.OS === "android") {
      const perms =
        await LegacyFS.StorageAccessFramework.requestDirectoryPermissionsAsync();

      if (perms.granted) {
        const target =
          await LegacyFS.StorageAccessFramework.createFileAsync(
            perms.directoryUri,
            filename,
            "application/json",
          );
        await LegacyFS.StorageAccessFramework.writeAsStringAsync(target, json);
        return { savedTo: "folder" };
      }
    }

    fileSystemService.createDirectory(BACKUP_DIR);
    const file = new File(Paths.document, `${BACKUP_DIR}/${filename}`);
    if (!file.exists) {
      file.create();
    }
    file.write(json);

    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      throw new Error("Sharing is not available on this device");
    }

    await Sharing.shareAsync(file.uri, {
      mimeType: "application/json",
      dialogTitle: "Export DevSnippets backup",
      UTI: "public.json",
    });

    return { savedTo: "shared" };
  },

  shareAll: async (): Promise<void> => {
    const backup = await buildBackup();
    const json = JSON.stringify(backup, null, 2);

    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `devsnippets-backup-${stamp}.json`;

    fileSystemService.createDirectory(BACKUP_DIR);
    const file = new File(Paths.document, `${BACKUP_DIR}/${filename}`);
    if (!file.exists) {
      file.create();
    }
    file.write(json);

    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      throw new Error("Sharing is not available on this device");
    }

    await Sharing.shareAsync(file.uri, {
      mimeType: "application/json",
      dialogTitle: "Share DevSnippets backup",
      UTI: "public.json",
    });
  },

  importFromPicker: async (): Promise<ImportResult | null> => {
    let raw: string;

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/json", "*/*"],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || !result.assets?.[0]) return null;

      const asset = result.assets[0];
      const sourceFile = new File(asset.uri);
      raw = await sourceFile.text();
    } catch (pickerError) {
      if (Platform.OS !== "android") {
        throw pickerError;
      }

      const perms =
        await LegacyFS.StorageAccessFramework.requestDirectoryPermissionsAsync();

      if (!perms.granted) {
        throw new Error(
          "Permission denied. Grant folder access to import a backup.",
        );
      }

      const files =
        await LegacyFS.StorageAccessFramework.readDirectoryAsync(
          perms.directoryUri,
        );
      const jsonFiles = files.filter((uri) =>
        uri.toLowerCase().endsWith(".json"),
      );

      if (jsonFiles.length === 0) {
        throw new Error("No JSON files found in the selected folder.");
      }

      const newest = jsonFiles.sort().reverse()[0];
      raw = await LegacyFS.StorageAccessFramework.readAsStringAsync(newest);
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error("Selected file is not valid JSON");
    }

    if (!validateBackup(parsed)) {
      throw new Error("Not a valid DevSnippets backup file");
    }

    const existing = await dbService.getAllSnippets();
    const existingPaths = new Set(existing.map((r) => r.filePath));

    let imported = 0;
    const skippedPaths: string[] = [];

    for (const snippet of parsed.snippets) {
      if (existingPaths.has(snippet.path)) {
        skippedPaths.push(snippet.path);
        continue;
      }

      try {
        ensureParentDir(snippet.path);
        fileSystemService.createFile(snippet.path, snippet.code);

        await dbService.saveSnippet(
          snippet.title,
          snippet.tags ?? [],
          snippet.path,
          snippet.language,
          snippet.isFavorite ?? false,
          snippet.description ?? "",
        );

        imported += 1;
      } catch (err) {
        console.error(`Failed to import ${snippet.path}`, err);
        skippedPaths.push(snippet.path);
      }
    }

    return {
      imported,
      skipped: skippedPaths.length,
      skippedPaths,
    };
  },
};

export default backupService;
