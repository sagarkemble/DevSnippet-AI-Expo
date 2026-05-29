import { useProfileStore } from "@/store/profile.store";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import "../global.css";

export default function Index() {
  const hydrated = useProfileStore((s) => s.hydrated);
  const hasOnboarded = useProfileStore((s) => s.hasOnboarded);

  if (!hydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  if (!hasOnboarded) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(main)/library" />;
}
