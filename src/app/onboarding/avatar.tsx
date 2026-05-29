import { SegmentedControl } from "@/components/ui/segmented-control";
import { StepShell } from "@/components/ui/step-shell";
import { commonPfpLinks, femalePfpLinks, malePfpLinks } from "@/avatar";
import { useProfileStore } from "@/store/profile.store";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Dimensions, Image, Pressable, View } from "react-native";

type Section = "male" | "female";

const SEGMENTS = [
  { value: "male" as Section, label: "Male" },
  { value: "female" as Section, label: "Female" },
];

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const COLS = 4;
const GAP = 12;
const HORIZONTAL_PADDING = 32;
const TILE = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - GAP * (COLS - 1)) / COLS;

export default function Avatar() {
  const router = useRouter();
  const setAvatarUrl = useProfileStore((s) => s.setAvatarUrl);
  const persisted = useProfileStore((s) => s.avatarUrl);

  const [section, setSection] = useState<Section>("male");
  const [selected, setSelected] = useState(persisted);

  const list = useMemo(() => {
    if (section === "male") return [...malePfpLinks, ...commonPfpLinks];
    return [...femalePfpLinks, ...commonPfpLinks];
  }, [section]);

  const onContinue = () => {
    setAvatarUrl(selected);
    router.push("/onboarding/done");
  };

  return (
    <StepShell
      step={3}
      total={4}
      title="Pick a face."
      body="Show up as someone."
      onContinue={onContinue}
      continueDisabled={!selected}
      onBack={() => router.back()}
    >
      <View className="mb-5">
        <SegmentedControl
          segments={SEGMENTS}
          value={section}
          onChange={setSection}
        />
      </View>

      <View className="flex-row flex-wrap" style={{ gap: GAP }}>
        {list.map((url) => {
          const isSelected = selected === url;
          return (
            <Pressable
              key={url}
              onPress={() => setSelected(url)}
              style={{ width: TILE, height: TILE }}
              className={`rounded-full overflow-hidden ${
                isSelected
                  ? "border-2 border-foreground"
                  : "border border-border"
              }`}
            >
              <Image
                source={{ uri: url }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            </Pressable>
          );
        })}
      </View>
    </StepShell>
  );
}
