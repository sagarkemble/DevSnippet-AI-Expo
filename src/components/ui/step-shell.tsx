import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { ArrowLeft, ArrowRight } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";

type StepShellProps = {
  step: number;
  total: number;
  title: string;
  body?: string;
  children?: React.ReactNode;
  onContinue: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
  onSkip?: () => void;
  onBack?: () => void;
};

export const StepShell = ({
  step,
  total,
  title,
  body,
  children,
  onContinue,
  continueLabel = "Continue",
  continueDisabled = false,
  onSkip,
  onBack,
}: StepShellProps) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
        {onBack ? (
          <Pressable onPress={onBack} hitSlop={12}>
            <Icon
              as={ArrowLeft}
              size={18}
              className="text-muted-foreground"
              strokeWidth={1.5}
            />
          </Pressable>
        ) : (
          <View className="w-4" />
        )}
        {onSkip ? (
          <Pressable onPress={onSkip} hitSlop={12}>
            <Text className="text-sm text-muted-foreground">Skip</Text>
          </Pressable>
        ) : (
          <View className="w-4" />
        )}
      </View>

      <ScrollView
        className="flex-1 px-8"
        contentContainerStyle={{ paddingTop: 24, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-6">
          Step {String(step).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </Text>

        <Text className="text-4xl font-semibold tracking-tight leading-[1.1] text-foreground mb-4">
          {title}
        </Text>

        {body ? (
          <Text className="text-base leading-7 text-muted-foreground mb-10">
            {body}
          </Text>
        ) : null}

        <View>{children}</View>
      </ScrollView>

      <View className="px-6 pb-8 pt-4 gap-6 bg-background border-t border-border">
        <View className="flex-row items-center gap-2">
          {Array.from({ length: total }).map((_, i) => (
            <View
              key={i}
              className={`h-[3px] rounded-full ${
                i + 1 === step
                  ? "bg-foreground w-8"
                  : i + 1 < step
                    ? "bg-foreground/40 w-4"
                    : "bg-border w-4"
              }`}
            />
          ))}
          <View className="flex-1" />
        </View>

        <Button
          onPress={onContinue}
          disabled={continueDisabled}
          size="lg"
          className="h-14 rounded-xl flex-row gap-2"
        >
          <Text className="text-primary-foreground font-medium">
            {continueLabel}
          </Text>
          <ArrowRight
            size={18}
            color={isDark ? "#0a0a0a" : "#fafafa"}
            strokeWidth={2}
          />
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};
