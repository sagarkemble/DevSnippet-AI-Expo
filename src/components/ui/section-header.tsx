import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { ChevronRight } from "lucide-react-native";
import { Pressable, View } from "react-native";

type SectionHeaderProps = {
  label: string;
  count?: number;
  actionLabel?: string;
  onAction?: () => void;
};

export const SectionHeader = ({
  label,
  count,
  actionLabel,
  onAction,
}: SectionHeaderProps) => {
  const display =
    count !== undefined
      ? `${label} · ${String(count).padStart(2, "0")}`
      : label;

  return (
    <View className="flex-row items-center justify-between mb-3">
      <Text className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
        {display}
      </Text>
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          hitSlop={8}
          className="flex-row items-center gap-1"
        >
          <Text className="text-xs text-muted-foreground">{actionLabel}</Text>
          <Icon
            as={ChevronRight}
            size={12}
            className="text-muted-foreground"
            strokeWidth={1.5}
          />
        </Pressable>
      ) : null}
    </View>
  );
};
