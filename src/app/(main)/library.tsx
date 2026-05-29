import { EmptyState } from "@/components/ui/empty-state";
import { Fab } from "@/components/ui/fab";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { SnippetRow } from "@/components/ui/snippet-row";
import { Text } from "@/components/ui/text";
import { useProfileStore } from "@/store/profile.store";
import { useSnippetsStore } from "@/store/snippets.store";
import { useRouter } from "expo-router";
import {
  Code2,
  FileCode,
  Heart,
  Languages,
  Monitor,
  Moon,
  Search,
  Sun,
} from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, View } from "react-native";

type Segment = "all" | "favorites";

const SEGMENTS = [
  { value: "all" as Segment, label: "All" },
  { value: "favorites" as Segment, label: "Favorites" },
];

export default function Library() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const iconColor = isDark ? "#fafafa" : "#0a0a0a";

  const { snippets } = useSnippetsStore();
  const { username, tags, avatarUrl, theme, cycleTheme } = useProfileStore();

  const [segment, setSegment] = useState<Segment>("all");
  const [query, setQuery] = useState("");

  const ThemeIcon =
    theme === "system" ? Monitor : theme === "light" ? Sun : Moon;
  const themeLabel =
    theme === "system" ? "System" : theme === "light" ? "Light" : "Dark";

  const trimmedQuery = query.trim().toLowerCase();
  const personality = tags[0];

  const stats = useMemo(() => {
    const langs = new Set(snippets.map((s) => s.language));
    const favs = snippets.filter((s) => s.isFavorite);
    return {
      total: snippets.length,
      languages: langs.size,
      favorites: favs.length,
    };
  }, [snippets]);

  const filteredSnippets = useMemo(() => {
    let list = snippets;
    if (segment === "favorites") {
      list = list.filter((s) => s.isFavorite);
    }
    if (trimmedQuery) {
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(trimmedQuery) ||
          s.language.toLowerCase().includes(trimmedQuery) ||
          s.description?.toLowerCase().includes(trimmedQuery) ||
          s.tags?.some((t) => t.toLowerCase().includes(trimmedQuery)) ||
          s.code.toLowerCase().includes(trimmedQuery),
      );
    }
    return list;
  }, [snippets, segment, trimmedQuery]);

  const baseCount = segment === "favorites" ? stats.favorites : stats.total;

  const renderListItems = (items: typeof snippets) =>
    items.map((s) => (
      <SnippetRow
        key={s.id}
        title={s.title}
        language={s.language}
        code={s.code}
        description={s.description}
        tags={s.tags}
        isFavorite={s.isFavorite}
        onPress={() => router.push(`/snippet?id=${s.id}`)}
      />
    ));

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 96 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-6 pt-4 pb-5">
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={() => router.push("/(main)/profile")}
              hitSlop={6}
              className="h-11 w-11 rounded-full overflow-hidden border border-border bg-muted"
            >
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
              ) : null}
            </Pressable>

            <View className="flex-1">
              <Text
                className="text-xl font-semibold tracking-tight text-foreground"
                numberOfLines={1}
              >
                {username || "you"}
              </Text>
              <Text
                className="text-xs font-mono tracking-wide text-muted-foreground mt-1"
                numberOfLines={1}
              >
                {personality || "Set your personality"}
              </Text>
            </View>

            <Pressable
              onPress={cycleTheme}
              hitSlop={6}
              accessibilityLabel={`Theme: ${themeLabel}`}
              className="h-11 w-11 rounded-full border border-border items-center justify-center"
            >
              <ThemeIcon size={18} color={iconColor} strokeWidth={1.5} />
            </Pressable>
          </View>
        </View>

        {snippets.length > 0 ? (
          <View className="px-6 mb-6">
            <View className="flex-row gap-3">
              <View className="flex-1 rounded-2xl border border-border bg-card px-3 py-3">
                <View className="flex-row items-center gap-3">
                  <View className="h-8 w-8 rounded-lg bg-muted items-center justify-center">
                    <FileCode size={15} color={iconColor} strokeWidth={1.5} />
                  </View>

                  <View>
                    <Text className="text-xl font-bold text-foreground">
                      {stats.total}
                    </Text>

                    <Text className="text-xs text-muted-foreground">Snips</Text>
                  </View>
                </View>
              </View>

              <View className="flex-1 rounded-2xl border border-border bg-card px-3 py-3">
                <View className="flex-row items-center gap-3">
                  <View className="h-8 w-8 rounded-lg bg-muted items-center justify-center">
                    <Languages size={15} color={iconColor} strokeWidth={1.5} />
                  </View>

                  <View>
                    <Text className="text-xl font-bold text-foreground">
                      {stats.languages}
                    </Text>

                    <Text className="text-xs text-muted-foreground">Langs</Text>
                  </View>
                </View>
              </View>

              <View className="flex-1 rounded-2xl border border-border bg-card px-3 py-3">
                <View className="flex-row items-center gap-3">
                  <View className="h-8 w-8 rounded-lg bg-muted items-center justify-center">
                    <Heart size={15} color={iconColor} strokeWidth={1.5} />
                  </View>

                  <View>
                    <Text className="text-xl font-bold text-foreground">
                      {stats.favorites}
                    </Text>

                    <Text className="text-xs text-muted-foreground">Fav</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        ) : null}

        <View className="px-6 gap-4">
          <View className="relative">
            <View className="absolute left-3 top-0 bottom-0 justify-center z-10">
              <Icon as={Search} size={18} className="text-muted-foreground" />
            </View>
            <Input
              placeholder="Search snippets..."
              value={query}
              onChangeText={setQuery}
              className="pl-10 h-12 rounded-lg"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <SegmentedControl
            segments={SEGMENTS}
            value={segment}
            onChange={setSegment}
          />

          <Text className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            {trimmedQuery
              ? `${filteredSnippets.length} of ${baseCount} ${baseCount === 1 ? "snippet" : "snippets"}`
              : `${baseCount} ${
                  segment === "favorites"
                    ? baseCount === 1
                      ? "favorite"
                      : "favorites"
                    : baseCount === 1
                      ? "snippet"
                      : "snippets"
                }`}
          </Text>
        </View>

        <View className="px-6 mt-2">
          {filteredSnippets.length > 0 ? (
            renderListItems(filteredSnippets)
          ) : (
            <EmptyState
              icon={segment === "favorites" ? Heart : Code2}
              title={
                trimmedQuery
                  ? "No matches"
                  : segment === "favorites"
                    ? "No favorites yet"
                    : "No snippets yet"
              }
              body={
                trimmedQuery
                  ? "Try a different keyword."
                  : segment === "favorites"
                    ? "Tap the heart on any snippet to add it here."
                    : "Tap + to create your first snippet."
              }
            />
          )}
        </View>
      </ScrollView>

      <Fab onPress={() => router.push("/(main)/createSnippet")} />
    </View>
  );
}
