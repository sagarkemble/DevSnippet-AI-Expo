import { CodeBlock } from "@/components/ui/code-block";
import { Text } from "@/components/ui/text";
import { useSnippetsStore } from "@/store/snippets.store";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import * as Sharing from "expo-sharing";
import { File, Paths } from "expo-file-system";
import {
  ArrowLeft,
  Check,
  Copy,
  RotateCw,
  Share2,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { useColorScheme } from "nativewind";

export default function SnippetView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const { snippets } = useSnippetsStore();
  const snippet = snippets.find((s) => s.id === Number(id));

  const [copied, setCopied] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, []);

  if (!snippet) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6 gap-3">
        <Text className="text-base font-semibold text-foreground">
          Snippet not found
        </Text>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text className="text-sm text-muted-foreground">Go back</Text>
        </Pressable>
      </View>
    );
  }

  const iconColor = isDark ? "#fafafa" : "#0a0a0a";
  const lineCount = snippet.code.split("\n").length;

  const onCopy = async () => {
    await Clipboard.setStringAsync(snippet.code);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const onShare = async () => {
    try {
      const filename = `${snippet.title}.${snippet.language}`;
      const file = new File(Paths.cache, filename);
      if (!file.exists) {
        file.create();
      }
      file.write(snippet.code);

      const can = await Sharing.isAvailableAsync();
      if (!can) {
        Alert.alert("Sharing unavailable");
        return;
      }
      await Sharing.shareAsync(file.uri, {
        dialogTitle: `Share ${snippet.title}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const onRotate = async () => {
    try {
      if (isLandscape) {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT_UP,
        );
      } else {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.LANDSCAPE,
        );
      }
      setIsLandscape((s) => !s);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <View className="px-5 pt-4 pb-3 flex-row items-center justify-between border-b border-border">
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
            {snippet.title}
          </Text>
        </Pressable>

        <View className="flex-row gap-2 ml-3">
          <Pressable
            onPress={onCopy}
            hitSlop={8}
            className="h-9 w-9 items-center justify-center rounded-lg border border-border"
          >
            {copied ? (
              <Check size={16} color={iconColor} strokeWidth={1.75} />
            ) : (
              <Copy size={16} color={iconColor} strokeWidth={1.5} />
            )}
          </Pressable>
          <Pressable
            onPress={onShare}
            hitSlop={8}
            className="h-9 w-9 items-center justify-center rounded-lg border border-border"
          >
            <Share2 size={16} color={iconColor} strokeWidth={1.5} />
          </Pressable>
          <Pressable
            onPress={onRotate}
            hitSlop={8}
            className="h-9 w-9 items-center justify-center rounded-lg border border-border"
          >
            <RotateCw size={16} color={iconColor} strokeWidth={1.5} />
          </Pressable>
        </View>
      </View>

      <View className="px-5 py-2 flex-row gap-3">
        <Text className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          {snippet.language}
        </Text>
        <Text className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          ·
        </Text>
        <Text className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          {lineCount} {lineCount === 1 ? "LINE" : "LINES"}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="border border-border rounded-xl bg-muted/30 p-4">
          <CodeBlock
            code={snippet.code}
            language={snippet.language}
            showLineNumbers
            wrap={false}
            variant="transparent"
            fontSize={14}
          />
        </View>
      </ScrollView>
    </View>
  );
}
