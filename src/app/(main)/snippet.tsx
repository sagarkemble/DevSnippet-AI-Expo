import { AiExplanationDialog } from "@/components/dialogs/AiExplanationDialog";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ui/code-block";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { TagPill } from "@/components/ui/tag-pill";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
import { LANGUAGES, extensionFor, labelFor } from "@/lib/languages";
import { SNIPPET_TAGS } from "@/lib/tags";
import aiService from "@/services/ai.service";
import dbService from "@/services/db.service";
import fileSystemService from "@/services/file-system.service";
import { useSnippetsStore } from "@/store/snippets.store";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Bot,
  Check,
  ChevronRight,
  Copy,
  Heart,
  Maximize2,
  Pencil,
  Trash2,
  X,
} from "lucide-react-native";
import { useColorScheme } from "nativewind";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import z from "zod";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  language: z.string().min(1, "Language is required"),
  code: z.string().min(1, "Code is required"),
  tags: z.array(z.string()).optional(),
  description: z.string().optional(),
  isFavorite: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

export default function Snippet() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [loading, setLoading] = React.useState(true);
  const [originalPath, setOriginalPath] = React.useState("");
  const [editing, setEditing] = React.useState(false);
  const [languageOpen, setLanguageOpen] = React.useState(false);

  const [explanation, setExplanation] = React.useState("");
  const [aiLoading, setAiLoading] = React.useState(false);
  const [showExplanation, setShowExplanation] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const onCopyCode = async () => {
    await Clipboard.setStringAsync(code);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const { snippets, updateSnippet, deleteSnippetWithFile } = useSnippetsStore();
  const snippet = snippets.find((s) => s.id === Number(id));

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      language: "",
      code: "",
      tags: [],
      description: "",
      isFavorite: false,
    },
  });

  const selectedTags = watch("tags");
  const isFavorite = watch("isFavorite");
  const code = watch("code");
  const language = watch("language");
  const title = watch("title");
  const description = watch("description");

  React.useEffect(() => {
    if (snippet) {
      reset({
        title: snippet.title,
        language: snippet.language,
        code: snippet.code,
        tags: snippet.tags ?? [],
        description: snippet.description ?? "",
        isFavorite: snippet.isFavorite,
      });
      setOriginalPath(snippet.path);
      setLoading(false);
    }
  }, [snippet, reset]);

  const onSave = async (data: FormData) => {
    if (!snippet) return;
    try {
      const ext = extensionFor(data.language);
      const dirParts = originalPath.split("/");
      const dir = dirParts.length > 1 ? dirParts.slice(0, -1).join("/") : "";
      const fileName = `${data.title}.${ext}`;
      const newPath = dir ? `${dir}/${fileName}` : fileName;

      if (newPath !== originalPath) {
        fileSystemService.deleteFile(originalPath);
      }
      fileSystemService.createFile(newPath, data.code);

      await dbService.updateSnippet(snippet.id, {
        title: data.title,
        tags: data.tags ?? [],
        filePath: newPath,
        language: data.language,
        isFavorite: data.isFavorite ?? false,
        description: data.description ?? "",
      });

      updateSnippet(snippet.id, {
        title: data.title,
        language: data.language,
        code: data.code,
        tags: data.tags,
        description: data.description,
        isFavorite: data.isFavorite ?? false,
        path: newPath,
      });

      setOriginalPath(newPath);
      setEditing(false);
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to update snippet");
    }
  };

  const onCancelEdit = () => {
    if (snippet) {
      reset({
        title: snippet.title,
        language: snippet.language,
        code: snippet.code,
        tags: snippet.tags ?? [],
        description: snippet.description ?? "",
        isFavorite: snippet.isFavorite,
      });
    }
    setEditing(false);
  };

  const explainCode = async () => {
    try {
      setAiLoading(true);
      setExplanation("");
      const result = await aiService.explainSnippet({
        title: watch("title"),
        language: watch("language"),
        tags: watch("tags"),
        description: watch("description"),
        code: watch("code"),
      });
      setExplanation(result);
      setShowExplanation(true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to explain code";
      Alert.alert("Error", message);
    } finally {
      setAiLoading(false);
    }
  };

  const onDelete = () => {
    Alert.alert("Delete snippet", "This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteSnippetWithFile(snippet!.id);
            router.back();
          } catch (error) {
            console.log(error);
            Alert.alert("Error", "Failed to delete snippet");
          }
        },
      },
    ]);
  };

  const toggleFavorite = async () => {
    if (!snippet || editing) {
      setValue("isFavorite", !isFavorite, { shouldDirty: true });
      return;
    }
    const next = !isFavorite;
    setValue("isFavorite", next, { shouldDirty: false });
    try {
      await dbService.updateSnippet(snippet.id, { isFavorite: next });
      updateSnippet(snippet.id, { isFavorite: next });
    } catch (error) {
      console.log(error);
      setValue("isFavorite", !next);
    }
  };

  if (loading || !snippet) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  const iconColor = isDark ? "#fafafa" : "#0a0a0a";
  const lineCount = code.split("\n").length;

  return (
    <View className="flex-1 bg-background">
      <View className="px-6 pt-4 pb-3 flex-row items-center justify-between border-b border-border">
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          className="flex-row items-center gap-2 flex-1"
        >
          <ArrowLeft size={20} color={iconColor} strokeWidth={1.5} />
          <Text
            className="text-base font-semibold text-foreground"
            numberOfLines={1}
          >
            {editing ? "Editing" : title}
          </Text>
        </Pressable>

        <View className="flex-row gap-2 ml-3">
          {editing ? (
            <>
              <Pressable
                onPress={onCancelEdit}
                hitSlop={8}
                className="h-9 w-9 items-center justify-center rounded-lg border border-border"
              >
                <X size={16} color={iconColor} strokeWidth={1.5} />
              </Pressable>
              <Pressable
                onPress={handleSubmit(onSave)}
                hitSlop={8}
                disabled={!isDirty}
                className={`h-9 px-3 items-center justify-center rounded-lg flex-row gap-1.5 ${
                  isDirty ? "bg-foreground" : "bg-muted"
                }`}
              >
                <Check
                  size={14}
                  color={
                    isDirty
                      ? isDark
                        ? "#0a0a0a"
                        : "#fafafa"
                      : isDark
                        ? "#52525b"
                        : "#a1a1aa"
                  }
                  strokeWidth={2}
                />
                <Text
                  className={`text-xs font-medium ${
                    isDirty ? "text-background" : "text-muted-foreground"
                  }`}
                >
                  Save
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              <Pressable
                onPress={toggleFavorite}
                hitSlop={8}
                className="h-9 w-9 items-center justify-center rounded-lg border border-border"
              >
                <Heart
                  size={16}
                  color={isFavorite ? "#ec4899" : iconColor}
                  fill={isFavorite ? "#ec4899" : "transparent"}
                  strokeWidth={1.5}
                />
              </Pressable>
              <Pressable
                onPress={() => router.push(`/snippet/view?id=${snippet.id}`)}
                hitSlop={8}
                className="h-9 w-9 items-center justify-center rounded-lg border border-border"
              >
                <Maximize2 size={16} color={iconColor} strokeWidth={1.5} />
              </Pressable>
              <Pressable
                onPress={() => setEditing(true)}
                hitSlop={8}
                className="h-9 w-9 items-center justify-center rounded-lg border border-border"
              >
                <Pencil size={16} color={iconColor} strokeWidth={1.5} />
              </Pressable>
              <Pressable
                onPress={onDelete}
                hitSlop={8}
                className="h-9 w-9 items-center justify-center rounded-lg border border-border"
              >
                <Trash2 size={16} color="#ef4444" strokeWidth={1.5} />
              </Pressable>
            </>
          )}
        </View>
      </View>

      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {editing ? (
          <View className="gap-5">
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, value } }) => (
                <View className="gap-2">
                  <Text className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                    TITLE
                  </Text>
                  <Textarea
                    value={value}
                    onChangeText={onChange}
                    placeholder="What's it called?"
                    className="min-h-12 text-lg font-semibold"
                  />
                </View>
              )}
            />
            {errors.title ? (
              <Text className="text-xs text-destructive">
                {errors.title.message}
              </Text>
            ) : null}

            <View className="gap-2">
              <Text className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                LANGUAGE
              </Text>
              <Pressable
                onPress={() => setLanguageOpen(true)}
                className="h-12 px-4 border border-border rounded-md flex-row items-center justify-between"
              >
                <Text
                  className={
                    language ? "text-foreground" : "text-muted-foreground"
                  }
                >
                  {language ? labelFor(language) : "Select language"}
                </Text>
                {language ? (
                  <Text className="text-xs font-mono text-muted-foreground">
                    .{extensionFor(language)}
                  </Text>
                ) : (
                  <Icon
                    as={ChevronRight}
                    size={14}
                    className="text-muted-foreground"
                    strokeWidth={1.5}
                  />
                )}
              </Pressable>
            </View>

            <Controller
              control={control}
              name="code"
              render={({ field: { onChange, value } }) => (
                <View className="gap-2">
                  <Text className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                    CODE
                  </Text>
                  <Textarea
                    value={value}
                    onChangeText={onChange}
                    placeholder="Paste your code"
                    className="min-h-[260px] font-mono text-sm"
                  />
                </View>
              )}
            />

            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, value } }) => (
                <View className="gap-2">
                  <Text className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                    DESCRIPTION
                  </Text>
                  <Textarea
                    value={value}
                    onChangeText={onChange}
                    placeholder="What does it do?"
                    className="min-h-20"
                  />
                </View>
              )}
            />

            <View className="gap-3 mt-2">
              <Text className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                TAGS
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {SNIPPET_TAGS.map((tag) => (
                  <TagPill
                    key={tag}
                    label={tag}
                    selected={selectedTags?.includes(tag)}
                    onPress={() => {
                      const updated = selectedTags?.includes(tag)
                        ? selectedTags.filter((t) => t !== tag)
                        : [...(selectedTags ?? []), tag];
                      setValue("tags", updated, { shouldDirty: true });
                    }}
                  />
                ))}
              </View>
            </View>
          </View>
        ) : (
          <View className="gap-5">
            <View className="border border-border rounded-xl bg-muted/30 p-5 gap-3">
              <Text className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                {labelFor(language)} · .{extensionFor(language)} · {lineCount}{" "}
                {lineCount === 1 ? "LINE" : "LINES"}
              </Text>
              <Text className="text-3xl font-semibold tracking-tight text-foreground leading-tight">
                {title}
              </Text>
              {description ? (
                <Text className="text-sm leading-6 text-muted-foreground">
                  {description}
                </Text>
              ) : null}
              {selectedTags && selectedTags.length > 0 ? (
                <View className="flex-row flex-wrap gap-2 mt-1">
                  {selectedTags.map((tag) => (
                    <TagPill key={tag} label={tag} size="sm" />
                  ))}
                </View>
              ) : null}
            </View>

            <View className="border border-border rounded-xl bg-muted/30 p-4 gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  CODE
                </Text>
                <View className="flex-row items-center gap-2">
                  <Pressable
                    onPress={onCopyCode}
                    hitSlop={6}
                    className="flex-row items-center gap-1 px-2 py-1 rounded-md border border-border bg-background"
                  >
                    <Icon
                      as={copied ? Check : Copy}
                      size={11}
                      className="text-foreground"
                      strokeWidth={1.75}
                    />
                    <Text className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                      {copied ? "Copied" : "Copy"}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() =>
                      router.push(`/snippet/view?id=${snippet.id}`)
                    }
                    hitSlop={6}
                    className="flex-row items-center gap-1"
                  >
                    <Text className="text-xs text-muted-foreground">
                      Full screen
                    </Text>
                    <Icon
                      as={ChevronRight}
                      size={12}
                      className="text-muted-foreground"
                      strokeWidth={1.5}
                    />
                  </Pressable>
                </View>
              </View>
              <CodeBlock
                code={code}
                language={language}
                variant="transparent"
              />
            </View>

            <Button
              onPress={explainCode}
              disabled={aiLoading}
              variant="outline"
              className="h-12 rounded-xl flex-row gap-2 mt-2"
            >
              {aiLoading ? (
                <ActivityIndicator size="small" color={iconColor} />
              ) : (
                <Bot size={16} color={iconColor} strokeWidth={1.5} />
              )}
              <Text className="text-foreground font-medium">
                {aiLoading ? "Thinking…" : "Explain with DevAi"}
              </Text>
            </Button>
          </View>
        )}
      </ScrollView>

      <Dialog open={languageOpen} onOpenChange={setLanguageOpen}>
        <DialogContent className="h-[80%]">
          <DialogHeader>
            <DialogTitle>Select language</DialogTitle>
          </DialogHeader>
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="mt-2"
            contentContainerStyle={{ paddingBottom: 8 }}
            nestedScrollEnabled
          >
            <View className="gap-1">
              {LANGUAGES.map((lang) => {
                const active = lang.value === language;
                return (
                  <Pressable
                    key={lang.value}
                    onPress={() => {
                      setValue("language", lang.value, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                      setLanguageOpen(false);
                    }}
                    className={`flex-row items-center justify-between px-4 py-3 rounded-lg ${
                      active ? "bg-muted" : ""
                    }`}
                  >
                    <View className="flex-row items-center gap-3 flex-1">
                      <Text
                        className={`text-sm flex-1 ${
                          active
                            ? "font-semibold text-foreground"
                            : "text-foreground"
                        }`}
                      >
                        {lang.label}
                      </Text>
                      <Text className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                        .{lang.ext}
                      </Text>
                    </View>
                    {active ? (
                      <Check
                        size={14}
                        color={iconColor}
                        strokeWidth={1.5}
                        style={{ marginLeft: 8 }}
                      />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </DialogContent>
      </Dialog>

      <AiExplanationDialog
        visible={showExplanation}
        title={snippet.title}
        explanation={explanation}
        onClose={() => setShowExplanation(false)}
      />
    </View>
  );
}
