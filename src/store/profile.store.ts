import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const PERSONALITY_TAGS = [
  "Stack Overflow Copy-Paster",
  "Bug Creator & Fixer",
  "console.log Debugger",
  "Documentation Avoider",
  "Semicolon Enthusiast",
  "Dark Mode Loyalist",
  "Vim Survivor",
  "Tabs vs Spaces Warrior",
  "Regex Wizard",
  "Friday Deployer",
  "Works on My Machine",
  "Coffee → Code Converter",
  "byteCode",
  "userName",
] as const;

const ADJECTIVES = [
  "bug",
  "git",
  "code",
  "async",
  "lazy",
  "regex",
  "null",
  "stack",
  "merge",
  "fork",
  "deploy",
  "patch",
  "cache",
  "hash",
  "lint",
  "yield",
  "pixel",
  "binary",
  "byte",
  "syntax",
];

const NOUNS = [
  "Dealer",
  "Pirate",
  "Gremlin",
  "Sloth",
  "Wizard",
  "Whisperer",
  "Cowboy",
  "Ninja",
  "Goblin",
  "Hermit",
  "Druid",
  "Hacker",
  "Shaman",
  "Maverick",
  "Wraith",
  "Phantom",
  "Bandit",
  "Smith",
  "Sage",
  "Tinker",
];

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 20;
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

export type UsernameValidation = {
  ok: boolean;
  error?: string;
};

export const validateUsername = (raw: string): UsernameValidation => {
  const value = raw.trim();
  if (value.length === 0) {
    return { ok: false, error: "Pick a username" };
  }
  if (value.length < USERNAME_MIN) {
    return { ok: false, error: `At least ${USERNAME_MIN} characters` };
  }
  if (value.length > USERNAME_MAX) {
    return { ok: false, error: `Max ${USERNAME_MAX} characters` };
  }
  if (!USERNAME_REGEX.test(value)) {
    return { ok: false, error: "Letters, numbers, underscore only" };
  }
  return { ok: true };
};

const pick = <T,>(arr: readonly T[]) =>
  arr[Math.floor(Math.random() * arr.length)];

export const suggestUsername = () => {
  const adj = pick(ADJECTIVES);
  const noun = pick(NOUNS);
  return `${adj}${noun}`;
};

export type ThemePreference = "system" | "light" | "dark";

export type Profile = {
  username: string;
  tags: string[];
  avatarUrl: string;
  theme: ThemePreference;
  hasOnboarded: boolean;
};

type ProfileStore = Profile & {
  hydrated: boolean;
  setUsername: (username: string) => void;
  setTags: (tags: string[]) => void;
  setAvatarUrl: (url: string) => void;
  setTheme: (theme: ThemePreference) => void;
  cycleTheme: () => void;
  completeOnboarding: () => void;
  resetProfile: () => void;
  setHydrated: () => void;
};

const initialProfile: Profile = {
  username: "",
  tags: [],
  avatarUrl: "",
  theme: "system",
  hasOnboarded: false,
};

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set, get) => ({
      ...initialProfile,
      hydrated: false,
      setUsername: (username) => set({ username }),
      setTags: (tags) => set({ tags }),
      setAvatarUrl: (avatarUrl) => set({ avatarUrl }),
      setTheme: (theme) => set({ theme }),
      cycleTheme: () => {
        const order: ThemePreference[] = ["system", "light", "dark"];
        const i = order.indexOf(get().theme);
        set({ theme: order[(i + 1) % order.length] });
      },
      completeOnboarding: () => set({ hasOnboarded: true }),
      resetProfile: () => set({ ...initialProfile }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "devsnippets:profile",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ hydrated: _h, ...rest }) => rest,
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
