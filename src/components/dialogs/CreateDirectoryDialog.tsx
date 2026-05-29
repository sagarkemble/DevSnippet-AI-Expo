import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { FolderPlus, X } from "lucide-react-native";
import React from "react";
import { Modal, Pressable, TextInput, View } from "react-native";

type CreateDirectoryDialogProps = {
  visible: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
};

export const CreateDirectoryDialog: React.FC<CreateDirectoryDialogProps> = ({
  visible,
  onClose,
  onCreate,
}) => {
  const [directoryName, setDirectoryName] = React.useState("");
  const [error, setError] = React.useState("");

  const handleCreate = () => {
    const trimmedName = directoryName.trim();

    if (!trimmedName) {
      setError("Directory name cannot be empty");
      return;
    }

    if (trimmedName.includes("/") || trimmedName.includes("\\")) {
      setError("Directory name cannot contain slashes");
      return;
    }

    if (trimmedName.startsWith(".")) {
      setError("Directory name cannot start with a dot");
      return;
    }

    onCreate(trimmedName);
    setDirectoryName("");
    setError("");
    onClose();
  };

  const handleClose = () => {
    setDirectoryName("");
    setError("");
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
        <Pressable onPress={(e) => e.stopPropagation()}>
          <Card className="w-full max-w-md">
            <CardHeader className="flex-row items-center justify-between pb-3">
              <View className="flex-row items-center gap-2">
                <Icon as={FolderPlus} size={20} className="text-primary" />
                <Text className="text-lg font-semibold">
                  Create New Directory
                </Text>
              </View>
              <Button
                variant="ghost"
                size="icon"
                onPress={handleClose}
                className="h-8 w-8"
              >
                <Icon as={X} size={18} className="text-muted-foreground" />
              </Button>
            </CardHeader>

            <CardContent className="gap-4">
              <View>
                <Text className="text-sm font-medium mb-2">
                  Directory Name
                </Text>
                <TextInput
                  value={directoryName}
                  onChangeText={(text) => {
                    setDirectoryName(text);
                    setError("");
                  }}
                  placeholder="e.g., react-components"
                  className="border border-input bg-background px-3 py-2 rounded-md text-foreground"
                  autoFocus
                  onSubmitEditing={handleCreate}
                />
                {error && (
                  <Text className="text-destructive text-xs mt-1">{error}</Text>
                )}
              </View>

              <View className="flex-row gap-2 justify-end">
                <Button variant="outline" onPress={handleClose}>
                  <Text>Cancel</Text>
                </Button>
                <Button onPress={handleCreate}>
                  <Text>Create</Text>
                </Button>
              </View>
            </CardContent>
          </Card>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
