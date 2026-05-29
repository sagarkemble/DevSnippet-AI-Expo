import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { ArrowLeft } from "lucide-react-native";
import { Pressable, View } from "react-native";

type ScreenHeaderProps = {
  title: string;
  eyebrow?: string;
  right?: React.ReactNode;
  onBack?: () => void;
};

export const ScreenHeader = ({
  title,
  eyebrow,
  right,
  onBack,
}: ScreenHeaderProps) => {
  return (
    <View className="px-6 pt-4 pb-4 flex-row items-end justify-between">
      <View className="flex-1 gap-1">
        {eyebrow ? (
          <Text className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            {eyebrow}
          </Text>
        ) : null}
        <View className="flex-row items-center gap-3">
          {onBack ? (
            <Pressable onPress={onBack} hitSlop={12}>
              <Icon
                as={ArrowLeft}
                size={20}
                className="text-foreground"
                strokeWidth={1.5}
              />
            </Pressable>
          ) : null}
          <Text className="text-3xl font-semibold tracking-tight text-foreground">
            {title}
          </Text>
        </View>
      </View>
      {right ? <View className="ml-4">{right}</View> : null}
    </View>
  );
};
