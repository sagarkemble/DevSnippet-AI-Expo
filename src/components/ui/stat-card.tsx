import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { LucideIcon } from "lucide-react-native";
import { View } from "react-native";

type StatCardProps = {
  value: number | string;
  label: string;
  icon?: LucideIcon;
  hint?: string;
};

export const StatCard = ({ value, label, icon: IconComp, hint }: StatCardProps) => {
  return (
    <View className="flex-1 border border-border rounded-xl px-4 py-3.5 gap-2">
      <View className="flex-row items-center justify-between">
        <Text className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          {label}
        </Text>
        {IconComp ? (
          <Icon
            as={IconComp}
            size={14}
            className="text-muted-foreground"
            strokeWidth={1.5}
          />
        ) : null}
      </View>
      <View className="flex-row items-baseline gap-1.5">
        <Text className="text-3xl font-semibold font-mono tabular-nums text-foreground leading-none">
          {value}
        </Text>
        {hint ? (
          <Text className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            {hint}
          </Text>
        ) : null}
      </View>
    </View>
  );
};
