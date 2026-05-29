import { db, expoDb } from "@/db";
import migrations from "@/drizzle/migrations";
import "@/global.css";
import { NAV_THEME } from "@/lib/theme";
import { useProfileStore } from "@/store/profile.store";
import { useSnippetsStore } from "@/store/snippets.store";
import { PortalHost } from "@rn-primitives/portal";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { Stack } from "expo-router";
import { ThemeProvider } from "expo-router/react-navigation";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import { useEffect } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useDrizzleStudio(expoDb);
  const { colorScheme, setColorScheme } = useColorScheme();
  const themePref = useProfileStore((s) => s.theme);
  const hydrated = useProfileStore((s) => s.hydrated);
  const { loadSnippets, loadDirectories } = useSnippetsStore();

  useEffect(() => {
    if (!hydrated) return;
    setColorScheme(themePref);
  }, [themePref, hydrated, setColorScheme]);

  const isDark = colorScheme === "dark";

  const { success, error } = useMigrations(db, migrations);

  useEffect(() => {
    if (success) {
      loadSnippets();
      loadDirectories();
    }
  }, [success, loadSnippets, loadDirectories]);

  useEffect(() => {
    if (success && hydrated) {
      SplashScreen.hideAsync();
    }
  }, [success, hydrated]);

  if (error) {
    console.log(error);
    return null;
  }
  if (!success) {
    return null;
  }

  return (
    <ThemeProvider value={isDark ? NAV_THEME.dark : NAV_THEME.light}>
      <SafeAreaProvider>
        <SafeAreaView className="flex-1 bg-background">
          <StatusBar style={isDark ? "light" : "dark"} />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(main)" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="snippet/view" />
          </Stack>
          <PortalHost />
        </SafeAreaView>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
