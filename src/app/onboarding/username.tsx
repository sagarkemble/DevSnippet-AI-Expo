import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StepShell } from "@/components/ui/step-shell";
import { Text } from "@/components/ui/text";
import {
  USERNAME_MAX,
  suggestUsername,
  useProfileStore,
  validateUsername,
} from "@/store/profile.store";
import { useRouter } from "expo-router";
import { Shuffle } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";

export default function Username() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const setUsername = useProfileStore((s) => s.setUsername);
  const persisted = useProfileStore((s) => s.username);
  const [value, setValue] = useState(persisted);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!persisted && !value) {
      setValue(suggestUsername());
    }
  }, []);

  const validation = useMemo(() => validateUsername(value), [value]);

  const onShuffle = () => {
    setValue(suggestUsername());
    setTouched(false);
  };

  const onContinue = () => {
    if (!validation.ok) {
      setTouched(true);
      return;
    }
    setUsername(value.trim());
    router.push("/onboarding/tags");
  };

  const showError = touched && !validation.ok;

  return (
    <StepShell
      step={1}
      total={4}
      title={"Pick a\nusername."}
      body="Letters, numbers, underscore. 3 to 20 characters. Hit shuffle for something silly."
      onContinue={onContinue}
      continueDisabled={!validation.ok}
      onBack={() => router.back()}
    >
      <View className="gap-3">
        <View className="relative">
          <Input
            value={value}
            onChangeText={(text) => {
              setValue(text);
              if (touched) setTouched(false);
            }}
            placeholder="bugDealer"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={USERNAME_MAX}
            returnKeyType="done"
            onSubmitEditing={onContinue}
            className="h-14 text-lg rounded-xl pr-14 font-mono"
          />
          <View className="absolute right-2 top-2">
            <Button
              size="icon"
              variant="ghost"
              onPress={onShuffle}
              className="h-10 w-10"
            >
              <Shuffle
                size={18}
                color={isDark ? "#fafafa" : "#0a0a0a"}
                strokeWidth={1.5}
              />
            </Button>
          </View>
        </View>

        <View className="flex-row justify-between items-center px-1">
          <Text
            className={`text-xs ${
              showError ? "text-destructive" : "text-muted-foreground"
            }`}
          >
            {showError ? validation.error : value || "username"}
          </Text>
          <Text className="text-xs font-mono text-muted-foreground tabular-nums">
            {value.length} / {USERNAME_MAX}
          </Text>
        </View>
      </View>
    </StepShell>
  );
}
