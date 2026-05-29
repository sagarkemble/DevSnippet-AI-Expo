import { StepShell } from "@/components/ui/step-shell";
import { TagPill } from "@/components/ui/tag-pill";
import { PERSONALITY_TAGS, useProfileStore } from "@/store/profile.store";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

export default function Tags() {
  const router = useRouter();
  const setTags = useProfileStore((s) => s.setTags);
  const persisted = useProfileStore((s) => s.tags);
  const [selected, setSelected] = useState<string | null>(
    persisted[0] ?? null,
  );

  const advance = (tag: string | null) => {
    setTags(tag ? [tag] : []);
    router.push("/onboarding/avatar");
  };

  return (
    <StepShell
      step={2}
      total={4}
      title={"Pick your\ndev personality."}
      body="Pick the one that fits best. You can change it later."
      onContinue={() => advance(selected)}
      onSkip={() => advance(null)}
      onBack={() => router.back()}
    >
      <View className="flex-row flex-wrap gap-2">
        {PERSONALITY_TAGS.map((tag) => (
          <TagPill
            key={tag}
            label={tag}
            selected={selected === tag}
            onPress={() => setSelected(selected === tag ? null : tag)}
          />
        ))}
      </View>
    </StepShell>
  );
}
