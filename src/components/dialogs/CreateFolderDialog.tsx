import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { FolderPlus, X } from "lucide-react-native";
import React from "react";
import { Modal, Pressable, View } from "react-native";

type CreateFolderDialogProps = {
  visible: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
};

export const CreateFolderDialog: React.FC<CreateFolderDialogProps> = ({
  visible,
  onClose,
  onCreate,
}) => {
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState("");

  const reset = () => {
    setName("");
    setError("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleCreate = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Folder name can't be empty");
      return;
    }
    if (trimmed.includes("/") || trimmed.includes("\\")) {
      setError("Folder name can't contain slashes");
      return;
    }
    if (trimmed.startsWith(".")) {
      setError("Folder name can't start with a dot");
      return;
    }
    onCreate(trimmed);
    reset();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable
        className="flex-1 bg-black/50 justify-center items-center p-4"
        onPress={handleClose}
      >
        <Pressable onPress={(e) => e.stopPropagation()} className="w-full">
          <View className="w-full bg-background border border-border rounded-2xl overflow-hidden">
            <View className="flex-row items-center justify-between px-5 pt-5 pb-3">
              <View className="flex-row items-center gap-2">
                <Icon
                  as={FolderPlus}
                  size={16}
                  className="text-foreground"
                  strokeWidth={1.5}
                />
                <Text className="text-lg font-semibold text-foreground">
                  New folder
                </Text>
              </View>
              <Pressable
                onPress={handleClose}
                hitSlop={12}
                className="h-8 w-8 items-center justify-center rounded-md"
              >
                <Icon as={X} size={18} className="text-muted-foreground" />
              </Pressable>
            </View>

            <View className="px-5 pb-5 gap-3">
              <Input
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (error) setError("");
                }}
                placeholder="Folder name"
                autoFocus
                autoCapitalize="none"
                autoCorrect={false}
                className="h-12"
                onSubmitEditing={handleCreate}
              />
              {error ? (
                <Text className="text-xs text-destructive">{error}</Text>
              ) : null}

              <View className="flex-row gap-2 mt-2 justify-end">
                <Button variant="outline" onPress={handleClose}>
                  <Text>Cancel</Text>
                </Button>
                <Button onPress={handleCreate} disabled={!name.trim()}>
                  <Text className="text-primary-foreground">Create</Text>
                </Button>
              </View>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
