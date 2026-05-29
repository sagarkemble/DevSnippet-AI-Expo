import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useRouter } from "expo-router";
import { ArrowRight, Bot, Braces, Code, FolderTree } from "lucide-react-native";
import React from "react";
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { useColorScheme } from "nativewind";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type Slide = {
  eyebrow: string;
  title: string;
  body: string;
  Icon: typeof Braces;
};

const SLIDES: Slide[] = [
  {
    eyebrow: "01 — Save",
    title: "Never lose\na snippet again.",
    body: "Capture code the moment you write it. Stored locally, organized by language, ready when you need it.",
    Icon: Braces,
  },
  {
    eyebrow: "02 — Organize",
    title: "A library that\nstays tidy.",
    body: "Group by directory, tag by intent, find by keyword. No more hunting through gists and screenshots.",
    Icon: FolderTree,
  },
  {
    eyebrow: "03 — Understand",
    title: "Ask AI what\nthe code does.",
    body: "Step-by-step explanations for any snippet. Beginner-friendly, with concepts and possible improvements.",
    Icon: Bot,
  },
];

const OnBoarding = () => {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const scrollRef = React.useRef<ScrollView>(null);
  const [index, setIndex] = React.useState(0);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (next !== index) setIndex(next);
  };

  const goTo = (i: number) => {
    scrollRef.current?.scrollTo({ x: i * SCREEN_WIDTH, animated: true });
  };

  const onContinue = () => {
    if (index < SLIDES.length - 1) {
      goTo(index + 1);
    } else {
      router.push("/onboarding/username");
    }
  };

  const onSkip = () => router.push("/onboarding/username");

  const isLast = index === SLIDES.length - 1;

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
        <View className="flex-row items-center gap-2">
          <Code size={20} color={isDark ? "#fafafa" : "#0a0a0a"} />
          <Text className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            DevSnippets
          </Text>
        </View>
        {!isLast && (
          <Pressable onPress={onSkip} hitSlop={12}>
            <Text className="text-sm text-muted-foreground">Skip</Text>
          </Pressable>
        )}
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        className="flex-1"
      >
        {SLIDES.map((slide, i) => {
          const { Icon } = slide;
          return (
            <View
              key={i}
              style={{ width: SCREEN_WIDTH }}
              className="flex-1 px-8 justify-center"
            >
              <View className="items-start gap-12">
                <View className="h-32 w-32 rounded-2xl border border-border items-center justify-center">
                  <Icon
                    size={56}
                    strokeWidth={1.25}
                    color={isDark ? "#fafafa" : "#0a0a0a"}
                  />
                </View>

                <View className="gap-5">
                  <Text className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                    {slide.eyebrow}
                  </Text>
                  <Text className="text-4xl font-semibold tracking-tight leading-[1.1] text-foreground">
                    {slide.title}
                  </Text>
                  <Text className="text-base leading-7 text-muted-foreground max-w-[90%]">
                    {slide.body}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View className="px-6 pb-8 pt-4 gap-6">
        <View className="flex-row items-center gap-2">
          {SLIDES.map((_, i) => (
            <Pressable
              key={i}
              onPress={() => goTo(i)}
              hitSlop={8}
              className={`h-[3px] rounded-full ${
                i === index ? "bg-foreground w-8" : "bg-border w-4"
              }`}
            />
          ))}
          <View className="flex-1" />
          <Text className="text-xs font-mono tabular-nums text-muted-foreground">
            {String(index + 1).padStart(2, "0")} /{" "}
            {String(SLIDES.length).padStart(2, "0")}
          </Text>
        </View>

        <Button
          onPress={onContinue}
          size="lg"
          className="h-14 rounded-xl flex-row gap-2"
        >
          <Text className="text-primary-foreground font-medium">
            {isLast ? "Get started" : "Continue"}
          </Text>
          <ArrowRight
            size={18}
            color={isDark ? "#0a0a0a" : "#fafafa"}
            strokeWidth={2}
          />
        </Button>
      </View>
    </View>
  );
};

export default OnBoarding;
