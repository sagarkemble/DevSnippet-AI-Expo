import { Plus } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { Pressable } from "react-native";

type FabProps = {
  onPress: () => void;
};

export const Fab = ({ onPress }: FabProps) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Pressable
      onPress={onPress}
      className="absolute bottom-6 right-6 h-14 w-14 rounded-full bg-foreground items-center justify-center shadow-lg"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
      }}
    >
      <Plus
        size={24}
        color={isDark ? "#0a0a0a" : "#fafafa"}
        strokeWidth={2}
      />
    </Pressable>
  );
};
