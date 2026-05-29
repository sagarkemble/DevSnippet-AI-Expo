import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { LANGUAGES } from "@/lib/languages";
import { Check, X } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import React from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";

type LanguagePickerDialogProps = {
  visible: boolean;
  selected: string;
  onClose: () => void;
  onSelect: (value: string) => void;
};

export const LanguagePickerDialog: React.FC<LanguagePickerDialogProps> = ({
  visible,
  selected,
  onClose,
  onSelect,
}) => {
  const { colorScheme } = useColorScheme();
  const iconColor = colorScheme === "dark" ? "#fafafa" : "#0a0a0a";

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
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="w-full"
        >
          <View className="w-full bg-background border border-border rounded-2xl max-h-[80%] overflow-hidden">
            <View className="flex-row items-center justify-between px-5 pt-5 pb-3">
              <Text className="text-lg font-semibold text-foreground">
                Select language
              </Text>
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
              contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 16 }}
            >
              <View className="gap-1">
                {LANGUAGES.map((lang) => {
                  const active = lang.value === selected;
                  return (
                    <Pressable
                      key={lang.value}
                      onPress={() => {
                        onSelect(lang.value);
                        onClose();
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
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
