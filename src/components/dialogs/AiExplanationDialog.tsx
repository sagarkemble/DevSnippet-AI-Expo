import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { Bot, X } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import React from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import Markdown from "react-native-markdown-display";

type AiExplanationDialogProps = {
  visible: boolean;
  title: string;
  explanation: string;
  onClose: () => void;
};

const getMarkdownStyles = (isDark: boolean) => {
  const text = isDark ? "#e5e7eb" : "#1f2937";
  const heading = isDark ? "#fafafa" : "#0a0a0a";
  const codeBg = isDark ? "#171717" : "#f5f5f5";
  return {
    body: { color: text, fontSize: 14, lineHeight: 22 },
    heading1: {
      color: heading,
      fontSize: 20,
      fontWeight: "600" as const,
      marginTop: 12,
      marginBottom: 6,
    },
    heading2: {
      color: heading,
      fontSize: 17,
      fontWeight: "600" as const,
      marginTop: 12,
      marginBottom: 6,
    },
    heading3: {
      color: heading,
      fontSize: 15,
      fontWeight: "600" as const,
      marginTop: 10,
      marginBottom: 4,
    },
    paragraph: { marginTop: 0, marginBottom: 10 },
    strong: { color: heading, fontWeight: "600" as const },
    code_inline: {
      backgroundColor: codeBg,
      color: text,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      fontSize: 13,
      fontFamily: "monospace",
    },
    fence: {
      backgroundColor: codeBg,
      color: text,
      padding: 12,
      borderRadius: 12,
      fontSize: 13,
      fontFamily: "monospace",
      marginVertical: 8,
      borderWidth: 0,
    },
  };
};

export const AiExplanationDialog: React.FC<AiExplanationDialogProps> = ({
  visible,
  title,
  explanation,
  onClose,
}) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

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
          <View className="w-full bg-background border border-border rounded-2xl h-[85%] overflow-hidden">
            <View className="flex-row items-center justify-between px-5 pt-5 pb-3 border-b border-border">
              <View className="flex-1 pr-3">
                <View className="flex-row items-center gap-2 mb-1">
                  <Icon
                    as={Bot}
                    size={12}
                    className="text-muted-foreground"
                    strokeWidth={1.5}
                  />
                  <Text className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                    EXPLANATION
                  </Text>
                </View>
                <Text
                  className="text-lg font-semibold text-foreground"
                  numberOfLines={1}
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

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingTop: 12,
                paddingBottom: 24,
              }}
            >
              <Markdown style={getMarkdownStyles(isDark)}>
                {explanation}
              </Markdown>
            </ScrollView>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
