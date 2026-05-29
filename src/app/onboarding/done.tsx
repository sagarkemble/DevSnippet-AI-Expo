import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { PERSONALITY_TAGS, useProfileStore } from "@/store/profile.store";
import { useRouter } from "expo-router";
import { ArrowRight, Check } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import React from "react";
import { Image, View } from "react-native";

export default function Done() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const username = useProfileStore((s) => s.username);
  const avatarUrl = useProfileStore((s) => s.avatarUrl);
  const tags = useProfileStore((s) => s.tags);
  const completeOnboarding = useProfileStore((s) => s.completeOnboarding);

  const personality = tags[0];

  const onOpen = () => {
    completeOnboarding();
    router.replace("/(main)/library");
  };

  return (
    <View className="flex-1 bg-background px-6 justify-between pt-10 pb-8">
      <View className="flex-1 items-center justify-center gap-10">
        <View className="items-center gap-1">
          <View className="flex-row items-center gap-1.5">
            <Check
              size={12}
              color={isDark ? "#fafafa" : "#0a0a0a"}
              strokeWidth={2.5}
            />
            <Text className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Setup complete · 04 / 04
            </Text>
          </View>
        </View>

        <View className="items-center gap-5">
          <View className="relative">
            <View className="absolute -inset-3 rounded-full border border-border" />
            <View className="absolute -inset-6 rounded-full border border-border opacity-40" />
            <View className="absolute -inset-9 rounded-full border border-border opacity-20" />

            {avatarUrl ? (
              <View className="h-28 w-28 rounded-full overflow-hidden border-2 border-foreground bg-muted">
                <Image
                  source={{ uri: avatarUrl }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
              </View>
            ) : (
              <View className="h-28 w-28 rounded-full border-2 border-foreground bg-muted" />
            )}
          </View>

          <View className="items-center gap-2 px-2">
            <Text className="text-4xl font-semibold tracking-tight text-foreground text-center leading-[1.05]">
              Welcome,
            </Text>
            <Text
              className="text-4xl font-semibold tracking-tight font-mono text-foreground text-center leading-[1.05]"
              numberOfLines={1}
            >
              {username || "you"}.
            </Text>
          </View>

          {personality ? (
            <View className="px-3.5 py-1.5 rounded-full border border-border bg-muted/40">
              <Text className="text-xs font-mono text-foreground">
                {personality}
              </Text>
            </View>
          ) : null}
        </View>

        <View className="w-full px-2">
          <View className="border border-border rounded-2xl bg-muted/30 px-5 py-4 gap-3">
            <Text className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              What's next
            </Text>
            <View className="gap-2.5">
              <Row text="Save your first snippet" />
              <Row text="Organize them into folders" />
              <Row text="Ask DevAi to explain code" />
            </View>
          </View>
        </View>
      </View>

      <View className="gap-3">
        <Button
          onPress={onOpen}
          size="lg"
          className="h-14 rounded-xl flex-row gap-2"
        >
          <Text className="text-primary-foreground font-medium">
            Let's go
          </Text>
          <ArrowRight
            size={18}
            color={isDark ? "#0a0a0a" : "#fafafa"}
            strokeWidth={2}
          />
        </Button>
        <Text className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground text-center">
          Local-first · Yours alone
        </Text>
      </View>
    </View>
  );
}

const Row = ({ text }: { text: string }) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  return (
    <View className="flex-row items-center gap-2.5">
      <View className="h-5 w-5 rounded-md border border-border items-center justify-center">
        <Check
          size={10}
          color={isDark ? "#fafafa" : "#0a0a0a"}
          strokeWidth={2.5}
        />
      </View>
      <Text className="text-sm text-foreground">{text}</Text>
    </View>
  );
};
