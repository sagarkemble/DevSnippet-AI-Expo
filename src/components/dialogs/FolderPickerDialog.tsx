import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { FolderPlus, X } from "lucide-react-native";
import React from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";

type FolderPickerDialogProps = {
  visible: boolean;
  selected: string;
  directories: string[];
  onClose: () => void;
  onSelect: (value: string) => void;
  onCreateNew: () => void;
};

export const FolderPickerDialog: React.FC<FolderPickerDialogProps> = ({
  visible,
  selected,
  directories,
  onClose,
  onSelect,
  onCreateNew,
}) => {
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
            <View className="flex-row items-center justify-between px-5 pt-5 pb-3">
              <Text className="text-lg font-semibold text-foreground">
                Pick a folder
              </Text>
              <Pressable
                onPress={onClose}
                hitSlop={12}
                className="h-8 w-8 items-center justify-center rounded-md"
              >
                <Icon as={X} size={18} className="text-muted-foreground" />
              </Pressable>
            </View>

            <View className="px-5 pb-3">
              <Pressable
                onPress={onCreateNew}
                className="border border-border rounded-lg px-4 py-3 flex-row items-center gap-2"
              >
                <Icon
                  as={FolderPlus}
                  size={16}
                  className="text-foreground"
                  strokeWidth={1.5}
                />
                <Text className="text-sm font-medium text-foreground">
                  New folder
                </Text>
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 16 }}
            >
              <View className="gap-1.5">
                <Pressable
                  onPress={() => {
                    onSelect("");
                    onClose();
                  }}
                  className={`px-4 py-3 rounded-lg border ${
                    !selected
                      ? "bg-muted border-border"
                      : "bg-muted/40 border-border/60"
                  }`}
                >
                  <Text
                    className={
                      !selected
                        ? "font-semibold text-foreground"
                        : "text-foreground"
                    }
                  >
                    Root (no folder)
                  </Text>
                </Pressable>
                {directories.map((dir) => {
                  const active = dir === selected;
                  return (
                    <Pressable
                      key={dir}
                      onPress={() => {
                        onSelect(dir);
                        onClose();
                      }}
                      className={`px-4 py-3 rounded-lg border ${
                        active
                          ? "bg-muted border-border"
                          : "bg-muted/40 border-border/60"
                      }`}
                    >
                      <Text
                        className={`font-mono ${active ? "font-semibold text-foreground" : "text-foreground"}`}
                      >
                        {dir}
                      </Text>
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
