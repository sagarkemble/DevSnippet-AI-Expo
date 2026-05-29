import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FeedbackDialog,
  type FeedbackTone,
} from "@/components/dialogs/FeedbackDialog";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { TagPill } from "@/components/ui/tag-pill";
import { Text } from "@/components/ui/text";
import { commonPfpLinks, femalePfpLinks, malePfpLinks } from "@/avatar";
import backupService from "@/services/backup.service";
import {
  PERSONALITY_TAGS,
  USERNAME_MAX,
  suggestUsername,
  useProfileStore,
  validateUsername,
  type ThemePreference,
} from "@/store/profile.store";
import { useSnippetsStore } from "@/store/snippets.store";
import { useRouter } from "expo-router";
import {
  ChevronRight,
  Download,
  Pencil,
  Share2,
  Shuffle,
  Trash2,
  Upload,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { useColorScheme } from "nativewind";

type Section = "male" | "female";

const AVATAR_SEGMENTS = [
  { value: "male" as Section, label: "Male" },
  { value: "female" as Section, label: "Female" },
];

const THEME_SEGMENTS = [
  { value: "system" as ThemePreference, label: "System" },
  { value: "light" as ThemePreference, label: "Light" },
  { value: "dark" as ThemePreference, label: "Dark" },
];

const AVATAR_COLS = 6;
const AVATAR_GAP = 8;

export default function Profile() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const profile = useProfileStore();
  const { refreshSnippets, loadDirectories, wipeAll } = useSnippetsStore();
  const router = useRouter();

  const [editUsername, setEditUsername] = useState(false);
  const [usernameDraft, setUsernameDraft] = useState(profile.username);
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [tagDraft, setTagDraft] = useState<string | null>(
    profile.tags[0] ?? null,
  );

  const [editAvatar, setEditAvatar] = useState(false);
  const [avatarDraft, setAvatarDraft] = useState(profile.avatarUrl);
  const [avatarSection, setAvatarSection] = useState<Section>("male");
  const [gridWidth, setGridWidth] = useState(0);

  const tileSize =
    gridWidth > 0
      ? (gridWidth - AVATAR_GAP * (AVATAR_COLS - 1)) / AVATAR_COLS
      : 0;

  const [busy, setBusy] = useState<"export" | "import" | "share" | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{
    tone: FeedbackTone;
    title: string;
    message?: string;
  } | null>(null);

  const avatarList = useMemo(() => {
    if (avatarSection === "male") return [...malePfpLinks, ...commonPfpLinks];
    return [...femalePfpLinks, ...commonPfpLinks];
  }, [avatarSection]);

  const usernameValidation = useMemo(
    () => validateUsername(usernameDraft),
    [usernameDraft],
  );

  const saveUsername = () => {
    if (!usernameValidation.ok) {
      setUsernameTouched(true);
      return;
    }
    profile.setUsername(usernameDraft.trim());
    profile.setTags(tagDraft ? [tagDraft] : []);
    setEditUsername(false);
    setUsernameTouched(false);
  };

  const saveAvatar = () => {
    profile.setAvatarUrl(avatarDraft);
    setEditAvatar(false);
  };

  const handleExport = async () => {
    setBusy("export");
    try {
      const result = await backupService.exportAll();
      if (result.savedTo === "folder") {
        setFeedback({
          tone: "success",
          title: "Export saved",
          message: "Backup saved to the folder you selected.",
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Export failed";
      setFeedback({ tone: "error", title: "Export failed", message });
    } finally {
      setBusy(null);
    }
  };

  const handleImport = async () => {
    setBusy("import");
    try {
      const result = await backupService.importFromPicker();
      if (!result) return;
      await refreshSnippets();
      await loadDirectories();
      const lines = [
        `Imported ${result.imported} snippet${result.imported !== 1 ? "s" : ""}.`,
      ];
      if (result.skipped > 0) {
        lines.push(`Skipped ${result.skipped} (already exist).`);
      }
      setFeedback({
        tone: "success",
        title: "Import complete",
        message: lines.join("\n"),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Import failed";
      setFeedback({ tone: "error", title: "Import failed", message });
    } finally {
      setBusy(null);
    }
  };

  const handleShare = async () => {
    setBusy("share");
    try {
      await backupService.shareAll();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Share failed";
      setFeedback({ tone: "error", title: "Share failed", message });
    } finally {
      setBusy(null);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await wipeAll();
      profile.resetProfile();
      setConfirmDelete(false);
      router.replace("/onboarding");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Delete failed";
      setFeedback({ tone: "error", title: "Couldn't delete", message });
    } finally {
      setDeleting(false);
    }
  };

  const showUsernameError = usernameTouched && !usernameValidation.ok;

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pt-6 pb-2">
          <Text className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            YOUR ACCOUNT
          </Text>
          <Text className="text-3xl font-semibold tracking-tight text-foreground mt-1">
            Profile
          </Text>
        </View>

        <View className="px-6 mb-6">
          <View className="border border-border rounded-2xl bg-muted/30 p-6 items-center gap-4">
            <Pressable
              onPress={() => {
                setAvatarDraft(profile.avatarUrl);
                setEditAvatar(true);
              }}
              className="h-24 w-24 rounded-full overflow-hidden border border-border bg-muted"
            >
              {profile.avatarUrl ? (
                <Image
                  source={{ uri: profile.avatarUrl }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
              ) : null}
            </Pressable>

            <View className="items-center gap-2">
              <Text className="text-2xl font-semibold font-mono text-foreground">
                {profile.username || "anonymous"}
              </Text>
              {profile.tags.length > 0 ? (
                <Text className="text-xs text-muted-foreground">
                  {profile.tags.join(" · ")}
                </Text>
              ) : null}
              <Pressable
                onPress={() => {
                  setUsernameDraft(profile.username);
                  setTagDraft(profile.tags[0] ?? null);
                  setUsernameTouched(false);
                  setEditUsername(true);
                }}
                hitSlop={8}
                className="flex-row items-center gap-1.5 px-3 py-1 rounded-full border border-border"
              >
                <Icon
                  as={Pencil}
                  size={11}
                  className="text-muted-foreground"
                  strokeWidth={1.5}
                />
                <Text className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Edit username
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View className="px-6 mb-8">
          <Text className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
            APPEARANCE
          </Text>
          <SegmentedControl
            segments={THEME_SEGMENTS}
            value={profile.theme}
            onChange={(v) => profile.setTheme(v)}
          />
          <Text className="text-xs text-muted-foreground mt-2">
            {profile.theme === "system"
              ? "Follows your device setting."
              : profile.theme === "light"
                ? "Always light mode."
                : "Always dark mode."}
          </Text>
        </View>

        <View className="px-6 mb-8">
          <Text className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
            BACKUP
          </Text>
          <View className="border border-border rounded-xl bg-muted/30 px-2">
            <BackupRow
              icon={Download}
              label="Export to file"
              hint="Save to a folder of your choice"
              onPress={handleExport}
              busy={busy === "export"}
            />
            <BackupRow
              icon={Upload}
              label="Import from file"
              hint="Restore from a backup"
              onPress={handleImport}
              busy={busy === "import"}
            />
            <BackupRow
              icon={Share2}
              label="Share backup"
              hint="Send through any app"
              onPress={handleShare}
              busy={busy === "share"}
              isLast
            />
          </View>
        </View>

        <View className="px-6 mb-8">
          <Text className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
            ABOUT
          </Text>
          <View className="border border-border rounded-xl p-4 gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-foreground">Version</Text>
              <Text className="text-sm font-mono text-muted-foreground">
                1.0.0
              </Text>
            </View>
            <View className="h-px bg-border my-1" />
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-foreground">DevSnippets-AI</Text>
              <Text className="text-xs text-muted-foreground">
                Local-first
              </Text>
            </View>
          </View>
        </View>

        <View className="px-6 pb-4">
          <Text className="text-xs font-mono uppercase tracking-widest text-destructive mb-3">
            DANGER ZONE
          </Text>
          <Pressable
            onPress={() => setConfirmDelete(true)}
            className="border border-destructive/40 rounded-xl bg-destructive/5 px-4 py-4 flex-row items-center gap-3 active:opacity-70"
          >
            <View className="h-10 w-10 rounded-lg border border-destructive/40 items-center justify-center">
              <Trash2 size={18} color="#ef4444" strokeWidth={1.5} />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold text-destructive">
                Delete account
              </Text>
              <Text className="text-xs text-muted-foreground">
                Wipes everything from this device
              </Text>
            </View>
            <Icon
              as={ChevronRight}
              size={16}
              className="text-destructive"
              strokeWidth={1.5}
            />
          </Pressable>
        </View>
      </ScrollView>

      <Dialog open={editUsername} onOpenChange={setEditUsername}>
        <DialogContent className="max-h-[85%]">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
          </DialogHeader>

          <ScrollView showsVerticalScrollIndicator={false} className="mt-2">
            <Text className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
              USERNAME
            </Text>
            <View className="gap-3">
              <View className="relative">
                <Input
                  value={usernameDraft}
                  onChangeText={(text) => {
                    setUsernameDraft(text);
                    if (usernameTouched) setUsernameTouched(false);
                  }}
                  placeholder="bugDealer"
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={USERNAME_MAX}
                  className="h-12 pr-12 font-mono"
                  autoFocus
                />
                <View className="absolute right-1 top-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-10 w-10"
                    onPress={() => {
                      setUsernameDraft(suggestUsername());
                      setUsernameTouched(false);
                    }}
                  >
                    <Shuffle
                      size={16}
                      color={isDark ? "#fafafa" : "#0a0a0a"}
                      strokeWidth={1.5}
                    />
                  </Button>
                </View>
              </View>
              <View className="flex-row justify-between items-center px-1">
                <Text
                  className={`text-xs ${
                    showUsernameError
                      ? "text-destructive"
                      : "text-muted-foreground"
                  }`}
                >
                  {showUsernameError
                    ? usernameValidation.error
                    : usernameDraft || "username"}
                </Text>
                <Text className="text-xs font-mono text-muted-foreground tabular-nums">
                  {usernameDraft.length} / {USERNAME_MAX}
                </Text>
              </View>
            </View>

            <Text className="text-xs font-mono uppercase tracking-widest text-muted-foreground mt-5 mb-2">
              PERSONALITY
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {PERSONALITY_TAGS.map((tag) => (
                <TagPill
                  key={tag}
                  label={tag}
                  selected={tagDraft === tag}
                  onPress={() =>
                    setTagDraft((prev) => (prev === tag ? null : tag))
                  }
                />
              ))}
            </View>
          </ScrollView>

          <View className="flex-row gap-2 mt-4 justify-end">
            <Button variant="outline" onPress={() => setEditUsername(false)}>
              <Text>Cancel</Text>
            </Button>
            <Button onPress={saveUsername} disabled={!usernameValidation.ok}>
              <Text className="text-primary-foreground">Save</Text>
            </Button>
          </View>
        </DialogContent>
      </Dialog>

      <Dialog open={editAvatar} onOpenChange={setEditAvatar}>
        <DialogContent className="h-[85%]">
          <DialogHeader>
            <DialogTitle>Pick a face</DialogTitle>
          </DialogHeader>
          <View className="mt-3 mb-3">
            <SegmentedControl
              segments={AVATAR_SEGMENTS}
              value={avatarSection}
              onChange={setAvatarSection}
            />
          </View>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 8 }}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
          >
            <View
              onLayout={(e) => setGridWidth(e.nativeEvent.layout.width)}
              className="flex-row flex-wrap"
              style={{ gap: AVATAR_GAP }}
            >
              {tileSize > 0
                ? avatarList.map((url) => {
                    const isSelected = avatarDraft === url;
                    return (
                      <Pressable
                        key={url}
                        onPress={() => setAvatarDraft(url)}
                        style={{ width: tileSize, height: tileSize }}
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
                  })
                : Array.from({ length: 24 }).map((_, i) => (
                    <View
                      key={`skeleton-${i}`}
                      style={{
                        width: `${100 / AVATAR_COLS}%`,
                        aspectRatio: 1,
                      }}
                      className="p-1"
                    >
                      <View className="flex-1 rounded-full bg-muted" />
                    </View>
                  ))}
            </View>
          </ScrollView>
          <View className="flex-row gap-2 mt-3 justify-end">
            <Button variant="outline" onPress={() => setEditAvatar(false)}>
              <Text>Cancel</Text>
            </Button>
            <Button onPress={saveAvatar} disabled={!avatarDraft}>
              <Text className="text-primary-foreground">Save</Text>
            </Button>
          </View>
        </DialogContent>
      </Dialog>
      <Dialog
        open={confirmDelete}
        onOpenChange={(open) => {
          if (!deleting) setConfirmDelete(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <Text className="text-xs font-mono uppercase tracking-widest text-destructive">
              DANGER ZONE
            </Text>
            <DialogTitle>Delete account?</DialogTitle>
          </DialogHeader>

          <View className="gap-3 mt-2">
            <Text className="text-sm leading-6 text-muted-foreground">
              This wipes everything from this device:
            </Text>
            <View className="gap-1 pl-2">
              <Text className="text-sm text-foreground">
                — All snippets and their files
              </Text>
              <Text className="text-sm text-foreground">— All folders</Text>
              <Text className="text-sm text-foreground">
                — Your username, tags, and avatar
              </Text>
            </View>
            <Text className="text-sm leading-6 text-muted-foreground">
              You'll be sent back to onboarding. This can't be undone.
            </Text>
          </View>

          <View className="flex-row gap-2 mt-4 justify-end">
            <Button
              variant="outline"
              onPress={() => setConfirmDelete(false)}
              disabled={deleting}
            >
              <Text>Cancel</Text>
            </Button>
            <Button
              variant="destructive"
              onPress={handleDeleteAccount}
              disabled={deleting}
            >
              <Text className="text-white">
                {deleting ? "Deleting…" : "Delete everything"}
              </Text>
            </Button>
          </View>
        </DialogContent>
      </Dialog>

      <FeedbackDialog
        visible={feedback !== null}
        tone={feedback?.tone}
        title={feedback?.title ?? ""}
        message={feedback?.message}
        onClose={() => setFeedback(null)}
      />
    </View>
  );
}

type BackupRowProps = {
  icon: typeof Download;
  label: string;
  hint: string;
  onPress: () => void;
  busy?: boolean;
  isLast?: boolean;
};

const BackupRow = ({
  icon: RowIcon,
  label,
  hint,
  onPress,
  busy,
  isLast,
}: BackupRowProps) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={busy}
      className={`flex-row items-center gap-3 py-3 px-2 ${
        isLast ? "" : "border-b border-border"
      } ${busy ? "opacity-50" : "active:opacity-70"}`}
    >
      <View className="h-10 w-10 rounded-lg border border-border items-center justify-center bg-background">
        <Icon
          as={RowIcon}
          size={18}
          className="text-foreground"
          strokeWidth={1.5}
        />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-foreground">{label}</Text>
        <Text className="text-xs text-muted-foreground">{hint}</Text>
      </View>
      <Icon
        as={ChevronRight}
        size={14}
        className="text-muted-foreground"
        strokeWidth={1.5}
      />
    </Pressable>
  );
};
