import { CreateDirectoryDialog } from "@/components/dialogs/CreateDirectoryDialog";
import { DeleteConfirmationDialog } from "@/components/dialogs/DeleteConfirmationDialog";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Fab } from "@/components/ui/fab";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Text } from "@/components/ui/text";
import { useSnippetsStore } from "@/store/snippets.store";
import { useRouter } from "expo-router";
import {
  ChevronDown,
  ChevronRight,
  File as FileIcon,
  Folder,
  FolderOpen,
  FolderPlus,
  Heart,
  Search,
  Trash2,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { useColorScheme } from "nativewind";

export default function Folders() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const iconColor = isDark ? "#fafafa" : "#0a0a0a";
  const mutedIconColor = isDark ? "#a1a1aa" : "#71717a";

  const {
    snippets,
    directories,
    deleteSnippetWithFile,
    createDirectory,
    deleteDirectory,
  } = useSnippetsStore();

  const [query, setQuery] = useState("");
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
  const [showCreateDirDialog, setShowCreateDirDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "snippet" | "directory";
    id?: number;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const trimmedQuery = query.trim().toLowerCase();

  const groupedSnippets = useMemo(() => {
    const groups: Record<string, typeof snippets> = { root: [] };
    snippets.forEach((s) => {
      const parts = s.path.split("/");
      if (parts.length === 1) {
        groups.root.push(s);
        return;
      }
      const dir = parts[0];
      groups[dir] = groups[dir] ?? [];
      groups[dir].push(s);
    });
    return groups;
  }, [snippets]);

  const matchesQuery = (s: (typeof snippets)[number]) =>
    !trimmedQuery ||
    s.title.toLowerCase().includes(trimmedQuery) ||
    s.language.toLowerCase().includes(trimmedQuery) ||
    s.tags?.some((t) => t.toLowerCase().includes(trimmedQuery));

  const filteredRoot = useMemo(
    () => (groupedSnippets.root ?? []).filter(matchesQuery),
    [groupedSnippets, trimmedQuery],
  );

  const filteredDirs = useMemo(() => {
    if (!trimmedQuery) {
      return directories.map((d) => ({
        name: d,
        items: groupedSnippets[d] ?? [],
      }));
    }
    return directories
      .map((d) => ({
        name: d,
        items: (groupedSnippets[d] ?? []).filter(matchesQuery),
      }))
      .filter(
        (entry) =>
          entry.items.length > 0 || entry.name.toLowerCase().includes(trimmedQuery),
      );
  }, [directories, groupedSnippets, trimmedQuery]);

  const totalCount = snippets.length;

  const toggleDir = (dir: string) => {
    setExpandedDirs((prev) => {
      const next = new Set(prev);
      next.has(dir) ? next.delete(dir) : next.add(dir);
      return next;
    });
  };

  const handleCreateDirectory = async (name: string) => {
    try {
      await createDirectory(name);
    } catch (error) {
      Alert.alert("Error", "Failed to create folder");
      console.error(error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.type === "snippet" && deleteTarget.id) {
        await deleteSnippetWithFile(deleteTarget.id);
      } else if (deleteTarget.type === "directory") {
        await deleteDirectory(deleteTarget.name);
      }
      setDeleteTarget(null);
    } catch (error) {
      Alert.alert("Error", `Failed to delete ${deleteTarget.type}`);
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const renderFileRow = (s: (typeof snippets)[number]) => (
    <Pressable
      key={s.id}
      onPress={() => router.push(`/snippet?id=${s.id}`)}
      className="flex-row items-center gap-3 px-3 py-3 rounded-xl border border-border bg-muted/30 active:opacity-70 mb-2"
    >
      <FileIcon size={16} color={mutedIconColor} strokeWidth={1.5} />
      <View className="flex-1 flex-row items-center gap-2">
        <Text
          className="text-sm font-medium text-foreground flex-shrink"
          numberOfLines={1}
        >
          {s.title}
        </Text>
        <Text className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          .{s.language}
        </Text>
      </View>
      {s.isFavorite ? (
        <Heart size={12} color="#ec4899" fill="#ec4899" strokeWidth={1.5} />
      ) : null}
    </Pressable>
  );

  return (
    <>
      <View className="flex-1 bg-background">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 96 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <ScreenHeader
            title="Folders"
            eyebrow="ORGANIZED CODE"
            right={
              <Button
                variant="outline"
                size="sm"
                onPress={() => setShowCreateDirDialog(true)}
                className="h-9 rounded-lg flex-row gap-1.5"
              >
                <Icon as={FolderPlus} size={14} className="text-foreground" />
                <Text className="text-xs font-medium">New folder</Text>
              </Button>
            }
          />

          <View className="px-6 gap-4">
            <View className="relative">
              <View className="absolute left-3 top-0 bottom-0 justify-center z-10">
                <Icon as={Search} size={18} className="text-muted-foreground" />
              </View>
              <Input
                placeholder="Search folders and files..."
                value={query}
                onChangeText={setQuery}
                className="pl-10 h-12 rounded-lg"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <Text className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              {`${directories.length} ${directories.length === 1 ? "folder" : "folders"} · ${totalCount} ${totalCount === 1 ? "file" : "files"}`}
            </Text>
          </View>

          {totalCount === 0 ? (
            <View className="px-6 mt-4">
              <EmptyState
                icon={Folder}
                title="No files yet"
                body="Create your first snippet to start organizing."
              />
            </View>
          ) : (
            <View className="mt-3">
              {filteredDirs.length > 0 ? (
                <View className="px-6 mb-6">
                  <Text className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
                    FOLDERS
                  </Text>
                  <View className="flex-row flex-wrap gap-3">
                    {filteredDirs.map(({ name, items }) => {
                      const expanded = expandedDirs.has(name);
                      return (
                        <Pressable
                          key={name}
                          onPress={() => toggleDir(name)}
                          onLongPress={() =>
                            setDeleteTarget({ type: "directory", name })
                          }
                          className="w-[48%] border border-border rounded-xl bg-muted/30 px-4 py-3 active:opacity-70"
                        >
                          <View className="flex-row items-center justify-between mb-2">
                            {expanded ? (
                              <FolderOpen
                                size={20}
                                color={iconColor}
                                strokeWidth={1.5}
                              />
                            ) : (
                              <Folder
                                size={20}
                                color={iconColor}
                                strokeWidth={1.5}
                              />
                            )}
                            {expanded ? (
                              <ChevronDown
                                size={14}
                                color={mutedIconColor}
                                strokeWidth={1.5}
                              />
                            ) : (
                              <ChevronRight
                                size={14}
                                color={mutedIconColor}
                                strokeWidth={1.5}
                              />
                            )}
                          </View>
                          <Text
                            className="text-sm font-medium text-foreground"
                            numberOfLines={1}
                          >
                            {name}
                          </Text>
                          <Text className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-0.5">
                            {items.length}{" "}
                            {items.length === 1 ? "FILE" : "FILES"}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ) : null}

              {filteredDirs.some((d) => expandedDirs.has(d.name)) ? (
                <View className="px-6 mb-6">
                  {filteredDirs
                    .filter((d) => expandedDirs.has(d.name))
                    .map(({ name, items }) => (
                      <View key={`open-${name}`} className="mb-4">
                        <View className="flex-row items-center justify-between mb-2">
                          <Text className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                            {name.toUpperCase()}
                          </Text>
                          <Pressable
                            onPress={() =>
                              setDeleteTarget({ type: "directory", name })
                            }
                            hitSlop={8}
                          >
                            <Trash2
                              size={12}
                              color={mutedIconColor}
                              strokeWidth={1.5}
                            />
                          </Pressable>
                        </View>
                        {items.length > 0 ? (
                          items.map((s) => renderFileRow(s))
                        ) : (
                          <Text className="text-sm text-muted-foreground py-2">
                            Empty folder.
                          </Text>
                        )}
                      </View>
                    ))}
                </View>
              ) : null}

              {filteredRoot.length > 0 ? (
                <View className="px-6">
                  <Text className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
                    ROOT
                  </Text>
                  {filteredRoot.map((s) => renderFileRow(s))}
                </View>
              ) : null}

              {trimmedQuery &&
              filteredDirs.length === 0 &&
              filteredRoot.length === 0 ? (
                <View className="px-6 mt-2">
                  <EmptyState
                    icon={Search}
                    title="No matches"
                    body="Try a different keyword."
                  />
                </View>
              ) : null}
            </View>
          )}
        </ScrollView>

        <Fab onPress={() => router.push("/(main)/createSnippet")} />
      </View>

      <CreateDirectoryDialog
        visible={showCreateDirDialog}
        onClose={() => setShowCreateDirDialog(false)}
        onCreate={handleCreateDirectory}
      />

      <DeleteConfirmationDialog
        visible={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={`Delete ${deleteTarget?.type === "directory" ? "folder" : "snippet"}`}
        message={`Are you sure you want to delete this ${deleteTarget?.type}?${
          deleteTarget?.type === "directory"
            ? " All snippets inside will also be deleted."
            : ""
        }`}
        itemName={deleteTarget?.name ?? ""}
        isDeleting={isDeleting}
      />
    </>
  );
}
