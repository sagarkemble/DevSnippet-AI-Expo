import { Text } from "@/components/ui/text";
import { Pressable, View } from "react-native";

type Segment<T extends string> = {
  value: T;
  label: string;
};

type SegmentedControlProps<T extends string> = {
  segments: readonly Segment<T>[];
  value: T;
  onChange: (value: T) => void;
};

export const SegmentedControl = <T extends string>({
  segments,
  value,
  onChange,
}: SegmentedControlProps<T>) => {
  return (
    <View className="flex-row border border-border rounded-lg p-1 bg-background">
      {segments.map((seg) => {
        const active = seg.value === value;
        return (
          <Pressable
            key={seg.value}
            onPress={() => onChange(seg.value)}
            className={`flex-1 items-center py-2 rounded-md ${
              active ? "bg-foreground" : "bg-transparent"
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                active ? "text-background" : "text-muted-foreground"
              }`}
            >
              {seg.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};
