import { Text } from "@/components/ui/text";
import { LucideIcon } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { View } from "react-native";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  body?: string;
};

export const EmptyState = ({ icon: Icon, title, body }: EmptyStateProps) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View className="items-center justify-center py-16 gap-4">
      <View className="h-16 w-16 rounded-2xl border border-border items-center justify-center">
        <Icon
          size={28}
          strokeWidth={1.25}
          color={isDark ? "#fafafa" : "#0a0a0a"}
        />
      </View>
      <View className="items-center gap-1.5 px-8">
        <Text className="text-base font-semibold text-foreground text-center">
          {title}
        </Text>
        {body ? (
          <Text className="text-sm text-muted-foreground text-center leading-6">
            {body}
          </Text>
        ) : null}
      </View>
    </View>
  );
};
