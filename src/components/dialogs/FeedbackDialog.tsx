import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  X,
  type LucideIcon,
} from "lucide-react-native";
import { useColorScheme } from "nativewind";
import React from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";

export type FeedbackTone = "success" | "error" | "info";

type FeedbackDialogProps = {
  visible: boolean;
  tone?: FeedbackTone;
  title: string;
  message?: string;
  onClose: () => void;
};

const TONE_META: Record<
  FeedbackTone,
  { icon: LucideIcon; light: string; dark: string }
> = {
  success: { icon: CheckCircle2, light: "#16a34a", dark: "#22c55e" },
  error: { icon: AlertCircle, light: "#dc2626", dark: "#ef4444" },
  info: { icon: Info, light: "#0a0a0a", dark: "#fafafa" },
};

export const FeedbackDialog: React.FC<FeedbackDialogProps> = ({
  visible,
  tone = "info",
  title,
  message,
  onClose,
}) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const meta = TONE_META[tone];
  const ToneIcon = meta.icon;
  const iconColor = isDark ? meta.dark : meta.light;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-black/50 justify-center items-center p-4"
        onPress={onClose}
      >
        <Pressable onPress={(e) => e.stopPropagation()} className="w-full">
          <View className="w-full bg-background border border-border rounded-2xl overflow-hidden">
            <View className="flex-row items-start justify-between px-5 pt-5 pb-3">
              <View className="flex-row items-center gap-3 flex-1 pr-3">
                <View className="h-9 w-9 rounded-lg border border-border items-center justify-center bg-muted/30">
                  <ToneIcon size={18} color={iconColor} strokeWidth={1.5} />
                </View>
                <Text
                  className="text-lg font-semibold text-foreground flex-1"
                  numberOfLines={2}
                >
                  {title}
                </Text>
              </View>
              <Pressable
                onPress={onClose}
                hitSlop={12}
                className="h-8 w-8 items-center justify-center rounded-md"
              >
                <Icon as={X} size={18} className="text-muted-foreground" />
              </Pressable>
            </View>

            {message ? (
              <ScrollView
                showsVerticalScrollIndicator={false}
                className="max-h-72"
                contentContainerStyle={{ paddingHorizontal: 20 }}
              >
                <Text className="text-sm leading-6 text-muted-foreground">
                  {message}
                </Text>
              </ScrollView>
            ) : null}

            <View className="px-5 pt-4 pb-5 mt-2 flex-row justify-end">
              <Button onPress={onClose}>
                <Text className="text-primary-foreground">Got it</Text>
              </Button>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
