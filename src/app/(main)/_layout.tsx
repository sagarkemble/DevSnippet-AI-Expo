import { Tabs } from "expo-router";
import { Bot, Code2, FolderOpen, UserRound } from "lucide-react-native";
import { useColorScheme } from "nativewind";

export default function MainLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const iconColor = isDark ? "#a1a1aa" : "#71717a";
  const activeIconColor = isDark ? "#fafafa" : "#0a0a0a";
  const backgroundColor = isDark ? "#0a0a0a" : "#ffffff";
  const borderColor = isDark ? "#262626" : "#e5e5e5";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        animation: "shift",
        tabBarStyle: {
          backgroundColor,
          borderTopWidth: 1,
          borderTopColor: borderColor,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: activeIconColor,
        tabBarInactiveTintColor: iconColor,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
          letterSpacing: 0.3,
        },
      }}
    >
      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          tabBarIcon: ({ color }) => (
            <Code2 size={22} color={color} strokeWidth={1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="folders"
        options={{
          title: "Folders",
          tabBarIcon: ({ color }) => (
            <FolderOpen size={22} color={color} strokeWidth={1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: "DevAi",
          tabBarIcon: ({ color }) => (
            <Bot size={22} color={color} strokeWidth={1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <UserRound size={22} color={color} strokeWidth={1.5} />
          ),
        }}
      />
      <Tabs.Screen name="snippet" options={{ href: null }} />
      <Tabs.Screen name="createSnippet" options={{ href: null }} />
    </Tabs>
  );
}
