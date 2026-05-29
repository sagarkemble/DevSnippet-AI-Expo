import { Text } from "@/components/ui/text";
import { Pressable, View } from "react-native";

type TagPillProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  size?: "sm" | "md";
};

export const TagPill = ({
  label,
  selected = false,
  onPress,
  size = "md",
}: TagPillProps) => {
  const padding = size === "sm" ? "px-2.5 py-1" : "px-3 py-1.5";
  const textSize = size === "sm" ? "text-[10px]" : "text-xs";

  const Wrapper = onPress ? Pressable : View;

  return (
    <Wrapper
      onPress={onPress}
      className={`rounded-full border ${padding} ${
        selected
          ? "bg-foreground border-foreground"
          : "border-border bg-transparent"
      }`}
    >
      <Text
        className={`${textSize} font-mono uppercase tracking-widest ${
          selected ? "text-background" : "text-foreground"
        }`}
      >
        {label}
      </Text>
    </Wrapper>
  );
};
