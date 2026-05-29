import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { AlertTriangle, X } from "lucide-react-native";
import React from "react";
import { Modal, Pressable, View } from "react-native";

type DeleteConfirmationDialogProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName: string;
  isDeleting?: boolean;
};

export const DeleteConfirmationDialog: React.FC<
  DeleteConfirmationDialogProps
> = ({ visible, onClose, onConfirm, title, message, itemName, isDeleting }) => {
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
        <Pressable onPress={(e) => e.stopPropagation()}>
          <Card className="w-full max-w-md">
            <CardHeader className="flex-row items-center justify-between pb-3">
              <View className="flex-row items-center gap-2">
                <Icon as={AlertTriangle} size={20} className="text-destructive" />
                <Text className="text-lg font-semibold">{title}</Text>
              </View>
              <Button
                variant="ghost"
                size="icon"
                onPress={onClose}
                className="h-8 w-8"
                disabled={isDeleting}
              >
                <Icon as={X} size={18} className="text-muted-foreground" />
              </Button>
            </CardHeader>

            <CardContent className="gap-4">
              <View>
                <Text className="text-sm mb-2">{message}</Text>
                <View className="bg-muted p-3 rounded-md">
                  <Text className="font-mono text-sm">{itemName}</Text>
                </View>
                <Text className="text-xs text-muted-foreground mt-2">
                  This action cannot be undone.
                </Text>
              </View>

              <View className="flex-row gap-2 justify-end">
                <Button
                  variant="outline"
                  onPress={onClose}
                  disabled={isDeleting}
                >
                  <Text>Cancel</Text>
                </Button>
                <Button
                  variant="destructive"
                  onPress={onConfirm}
                  disabled={isDeleting}
                >
                  <Text>{isDeleting ? "Deleting..." : "Delete"}</Text>
                </Button>
              </View>
            </CardContent>
          </Card>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
