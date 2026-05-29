import { Button } from "@/components/ui/button";
import { CreateFolderDialog } from "@/components/dialogs/CreateFolderDialog";
import { FolderPickerDialog } from "@/components/dialogs/FolderPickerDialog";
import { LanguagePickerDialog } from "@/components/dialogs/LanguagePickerDialog";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { TagPill } from "@/components/ui/tag-pill";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
import { extensionFor, labelFor } from "@/lib/languages";
import { SNIPPET_TAGS } from "@/lib/tags";
import dbService from "@/services/db.service";
import fileSystemService from "@/services/file-system.service";
import { useSnippetsStore } from "@/store/snippets.store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFocusEffect, useRouter } from "expo-router";
import {
  ArrowLeft,
  ChevronRight,
  Heart,
  Save,
} from "lucide-react-native";
import { useColorScheme } from "nativewind";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
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

export default function CreateSnippet() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [languageOpen, setLanguageOpen] = React.useState(false);
  const [directoryOpen, setDirectoryOpen] = React.useState(false);
  const [createDirOpen, setCreateDirOpen] = React.useState(false);
  const [selectedDirectory, setSelectedDirectory] = React.useState("");

  const { directories, loadDirectories, refreshSnippets } = useSnippetsStore();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
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

  useFocusEffect(
    React.useCallback(() => {
      reset({
        title: "",
        language: "",
        code: "",
        tags: [],
        description: "",
        isFavorite: false,
      });
      setSelectedDirectory("");
    }, [reset]),
  );

  const selectedLanguage = watch("language");
  const selectedTags = watch("tags");
  const isFavorite = watch("isFavorite");

  const onSubmit = async (data: FormData) => {
    try {
      const ext = extensionFor(data.language);
      const fileName = `${data.title}.${ext}`;
      const filePath = selectedDirectory
        ? `${selectedDirectory}/${fileName}`
        : fileName;

      fileSystemService.createFile(filePath, data.code);
      await dbService.saveSnippet(
        data.title,
        data.tags ?? [],
        filePath,
        data.language,
        data.isFavorite ?? false,
        data.description ?? "",
      );
      await refreshSnippets();
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to create snippet");
    }
  };

  const iconColor = isDark ? "#fafafa" : "#0a0a0a";

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View className="px-6 pt-4 pb-2 flex-row items-center justify-between">
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          className="flex-row items-center gap-2"
        >
          <ArrowLeft size={20} color={iconColor} strokeWidth={1.5} />
          <Text className="text-base text-foreground">Back</Text>
        </Pressable>
        <Text className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          NEW SNIPPET
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-5">
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, value } }) => (
              <View className="gap-2">
                <Text className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  TITLE
                </Text>
                <Input
                  value={value}
                  onChangeText={onChange}
                  placeholder="What's it called?"
                  className="h-12 text-base"
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
                  selectedLanguage ? "text-foreground" : "text-muted-foreground"
                }
              >
                {selectedLanguage
                  ? labelFor(selectedLanguage)
                  : "Select language"}
              </Text>
              {selectedLanguage ? (
                <Text className="text-xs font-mono text-muted-foreground">
                  .{extensionFor(selectedLanguage)}
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
          {errors.language ? (
            <Text className="text-xs text-destructive">
              {errors.language.message}
            </Text>
          ) : null}

          <View className="gap-2">
            <Text className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              FOLDER
            </Text>
            <Pressable
              onPress={() => setDirectoryOpen(true)}
              className="h-12 px-4 border border-border rounded-md flex-row items-center justify-between"
            >
              <Text
                className={
                  selectedDirectory
                    ? "text-foreground font-mono"
                    : "text-muted-foreground"
                }
              >
                {selectedDirectory || "Root (no folder)"}
              </Text>
              <Icon
                as={ChevronRight}
                size={14}
                className="text-muted-foreground"
                strokeWidth={1.5}
              />
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
                  className="min-h-[200px] font-mono text-sm"
                />
              </View>
            )}
          />
          {errors.code ? (
            <Text className="text-xs text-destructive">
              {errors.code.message}
            </Text>
          ) : null}

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
                  placeholder="What does it do? (optional)"
                  className="min-h-20"
                />
              </View>
            )}
          />

          <View className="gap-3">
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
                    setValue("tags", updated);
                  }}
                />
              ))}
            </View>
          </View>

          <View className="flex-row items-center justify-between py-3 border-t border-b border-border mt-2">
            <View>
              <Text className="text-sm font-medium text-foreground">
                Favorite
              </Text>
              <Text className="text-xs text-muted-foreground">
                Surface this on Library
              </Text>
            </View>
            <Pressable
              onPress={() => setValue("isFavorite", !isFavorite)}
              hitSlop={8}
              className="h-10 w-10 items-center justify-center rounded-lg border border-border"
            >
              <Heart
                size={18}
                color={isFavorite ? "#ec4899" : iconColor}
                fill={isFavorite ? "#ec4899" : "transparent"}
                strokeWidth={1.5}
              />
            </Pressable>
          </View>

          <Button
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            size="lg"
            className="h-14 rounded-xl flex-row gap-2 mt-2"
          >
            <Save
              size={16}
              color={isDark ? "#0a0a0a" : "#fafafa"}
              strokeWidth={1.5}
            />
            <Text className="text-primary-foreground font-medium">
              Save snippet
            </Text>
          </Button>
        </View>
      </ScrollView>

      <LanguagePickerDialog
        visible={languageOpen}
        selected={selectedLanguage}
        onClose={() => setLanguageOpen(false)}
        onSelect={(value) =>
          setValue("language", value, { shouldValidate: true })
        }
      />

      <FolderPickerDialog
        visible={directoryOpen}
        selected={selectedDirectory}
        directories={directories}
        onClose={() => setDirectoryOpen(false)}
        onSelect={setSelectedDirectory}
        onCreateNew={() => {
          setDirectoryOpen(false);
          setCreateDirOpen(true);
        }}
      />

      <CreateFolderDialog
        visible={createDirOpen}
        onClose={() => setCreateDirOpen(false)}
        onCreate={async (name) => {
          fileSystemService.createDirectory(name);
          await loadDirectories();
          setSelectedDirectory(name);
        }}
      />
    </KeyboardAvoidingView>
  );
}
