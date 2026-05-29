import { ScreenHeader } from "@/components/ui/screen-header";
import { Text } from "@/components/ui/text";
import aiService from "@/services/ai.service";
import { useSnippetsStore } from "@/store/snippets.store";
import { Bot, Code2 } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import Markdown from "react-native-markdown-display";

const getMarkdownStyles = (isDark: boolean) => {
  const text = isDark ? "#e5e7eb" : "#1f2937";
  const heading = isDark ? "#fafafa" : "#0a0a0a";
  const codeBg = isDark ? "#171717" : "#f5f5f5";
  const codeText = isDark ? "#e5e7eb" : "#1f2937";
  const border = isDark ? "#262626" : "#e5e5e5";
  const muted = isDark ? "#a1a1aa" : "#71717a";

  return {
    body: { color: text, fontSize: 15, lineHeight: 24 },
    heading1: {
      color: heading,
      fontSize: 22,
      fontWeight: "600" as const,
      marginTop: 16,
      marginBottom: 8,
    },
    heading2: {
      color: heading,
      fontSize: 18,
      fontWeight: "600" as const,
      marginTop: 16,
      marginBottom: 6,
    },
    heading3: {
      color: heading,
      fontSize: 16,
      fontWeight: "600" as const,
      marginTop: 12,
      marginBottom: 6,
    },
    paragraph: { marginTop: 0, marginBottom: 12 },
    strong: { color: heading, fontWeight: "600" as const },
    em: { fontStyle: "italic" as const, color: muted },
    bullet_list: { marginBottom: 12 },
    ordered_list: { marginBottom: 12 },
    list_item: { marginBottom: 4 },
    code_inline: {
      backgroundColor: codeBg,
      color: codeText,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      fontSize: 13,
      fontFamily: "monospace",
    },
    code_block: {
      backgroundColor: codeBg,
      color: codeText,
      padding: 12,
      borderRadius: 12,
      fontSize: 13,
      fontFamily: "monospace",
      marginVertical: 8,
    },
    fence: {
      backgroundColor: codeBg,
      color: codeText,
      padding: 12,
      borderRadius: 12,
      fontSize: 13,
      fontFamily: "monospace",
      marginVertical: 8,
      borderWidth: 0,
    },
    blockquote: {
      backgroundColor: "transparent",
      borderLeftWidth: 2,
      borderLeftColor: muted,
      paddingHorizontal: 12,
      paddingVertical: 4,
      marginVertical: 8,
    },
    hr: { backgroundColor: border, height: 1, marginVertical: 16 },
    link: {
      color: heading,
      textDecorationLine: "underline" as const,
    },
  };
};

type Turn = {
  id: string;
  role: "bot" | "user";
  content: string;
};

export default function DevAi() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { snippets } = useSnippetsStore();
  const scrollRef = useRef<ScrollView>(null);

  const [turns, setTurns] = useState<Turn[]>([]);
  const [thinking, setThinking] = useState(false);
  const [dots, setDots] = useState("");

  const hasStarted = turns.length > 0 || thinking;

  useEffect(() => {
    if (!thinking) {
      setDots("");
      return;
    }
    const interval = setInterval(() => {
      setDots((prev) => {
        switch (prev) {
          case "":
            return ".";
          case ".":
            return "..";
          case "..":
            return "...";
          default:
            return "";
        }
      });
    }, 350);
    return () => clearInterval(interval);
  }, [thinking]);

  const ask = async (snippet: (typeof snippets)[number]) => {
    setTurns((prev) => [
      ...prev,
      {
        id: `u-${Date.now()}`,
        role: "user",
        content: `Analyze this ${snippet.title} snippet, explain the logic, and highlight any issues.`,
      },
    ]);
    setThinking(true);

    try {
      const explanation = await aiService.explainSnippet({
        title: snippet.title,
        language: snippet.language,
        tags: snippet.tags,
        description: snippet.description,
        code: snippet.code,
      });
      setTurns((prev) => [
        ...prev,
        { id: `b-${Date.now()}`, role: "bot", content: explanation },
      ]);
    } catch (error) {
      setTurns((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          role: "bot",
          content:
            "Something went wrong. Try again, or pick a different snippet.",
        },
      ]);
    } finally {
      setThinking(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader title="DevAi" eyebrow="CODE EXPLAINER" />

      <View className="px-6 mb-2">
        <View className="h-px bg-border" />
      </View>

      <ScrollView
        ref={scrollRef}
        className="flex-1 px-6"
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: 24,
          flexGrow: hasStarted ? undefined : 1,
        }}
        onContentSizeChange={() =>
          scrollRef.current?.scrollToEnd({ animated: true })
        }
        showsVerticalScrollIndicator={false}
      >
        {!hasStarted ? (
          <View className="flex-1 items-center justify-center gap-5">
            <View className="h-24 w-24 rounded-2xl border border-border items-center justify-center">
              <Bot
                size={44}
                strokeWidth={1.25}
                color={isDark ? "#fafafa" : "#0a0a0a"}
              />
            </View>
            <View className="items-center gap-2">
              <Text className="text-2xl font-semibold tracking-tight text-foreground text-center">
                Pick a snippet
              </Text>
              <Text className="text-sm text-muted-foreground text-center max-w-[260px] leading-6">
                Choose any snippet below and DevAi will walk you through it —
                what it does, the concepts, possible improvements.
              </Text>
            </View>
          </View>
        ) : (
          <>
            {turns.map((t) => (
              <View key={t.id} className="mb-6 gap-2">
                <Text className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  {t.role === "bot" ? "DEVAI" : "YOU"}
                </Text>
                {t.role === "bot" ? (
                  <Markdown style={getMarkdownStyles(isDark)}>
                    {t.content}
                  </Markdown>
                ) : (
                  <View className="self-start border border-border rounded-xl bg-muted/30 px-4 py-3">
                    <Text className="text-base leading-6 text-foreground">
                      {t.content}
                    </Text>
                  </View>
                )}
              </View>
            ))}

            {thinking ? (
              <View className="mb-6 gap-3">
                <Text className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  DEVAI
                </Text>
                <View className="flex-row items-center gap-3">
                  <View className="h-8 w-8 rounded-lg border border-border bg-muted/30 items-center justify-center">
                    <Bot
                      size={16}
                      color={isDark ? "#fafafa" : "#0a0a0a"}
                      strokeWidth={1.5}
                    />
                  </View>
                  <Text className="text-sm font-medium text-foreground">
                    Thinking{dots}
                  </Text>
                </View>
              </View>
            ) : null}
          </>
        )}
      </ScrollView>

      <View className="border-t border-border px-6 py-4 gap-3">
        <Text className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          {snippets.length === 0
            ? "NO SNIPPETS YET"
            : `PICK A SNIPPET · ${snippets.length}`}
        </Text>

        {snippets.length === 0 ? (
          <Text className="text-sm text-muted-foreground">
            Save a snippet first to ask DevAi about it.
          </Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {snippets.map((s) => (
              <Pressable
                key={s.id}
                onPress={() => ask(s)}
                disabled={thinking}
                className="border border-border rounded-xl bg-muted/30 px-4 py-3 flex-row items-center gap-2 active:opacity-70"
              >
                <Code2
                  size={14}
                  color={isDark ? "#fafafa" : "#0a0a0a"}
                  strokeWidth={1.5}
                />
                <Text className="text-sm font-medium text-foreground">
                  {s.title}
                </Text>
                <Text className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  {s.language}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}
