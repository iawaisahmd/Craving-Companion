import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type BadHabitType =
  | "cigarettes"
  | "vaping"
  | "alcohol"
  | "junk-food"
  | "social-media"
  | "gambling"
  | "caffeine"
  | "nail-biting"
  | "late-night-scrolling"
  | "overeating"
  | "procrastination"
  | "other";

export const BAD_HABITS: { value: BadHabitType; label: string; icon: string; color: string }[] = [
  { value: "cigarettes",          label: "Cigarettes",         icon: "flame",            color: "#F08A5D" },
  { value: "vaping",              label: "Vaping",             icon: "cloud",            color: "#98A2B3" },
  { value: "alcohol",             label: "Alcohol",            icon: "wine",             color: "#C8A96B" },
  { value: "junk-food",           label: "Junk food",          icon: "fast-food",        color: "#FF6B9D" },
  { value: "social-media",        label: "Social media",       icon: "phone-portrait",   color: "#2D8CFF" },
  { value: "gambling",            label: "Gambling",           icon: "cash",             color: "#5FCB8B" },
  { value: "caffeine",            label: "Caffeine",           icon: "cafe",             color: "#9B80FF" },
  { value: "nail-biting",         label: "Nail biting",        icon: "hand-left",        color: "#FF751F" },
  { value: "late-night-scrolling",label: "Late-night screen",  icon: "moon",             color: "#6E56CF" },
  { value: "overeating",          label: "Overeating",         icon: "nutrition",        color: "#00C9B1" },
  { value: "procrastination",     label: "Procrastination",    icon: "time",             color: "#F08A5D" },
  { value: "other",               label: "Something else",     icon: "ellipsis-horizontal", color: "#98A2B3" },
];

export type TriggerType =
  | "stress"
  | "boredom"
  | "social"
  | "after-meal"
  | "alcohol"
  | "habit"
  | "other";

export interface UserProfile {
  // Legacy single type kept for compatibility
  quitType: BadHabitType;
  // New: multi-select bad habits
  badHabits: BadHabitType[];
  dailySpend: number;
  biggestTrigger: TriggerType;
  contactName: string;
  contactPhone: string;
  quitReason: string;
  quitDate: string;
  hapticsEnabled: boolean;
  soundEnabled: boolean;
}

export interface TriggerEntry {
  id: string;
  timestamp: string;
  trigger: TriggerType;
  urgeStrength: number;
  resisted: boolean;
  note?: string;
}

export interface RescueSession {
  id: string;
  timestamp: string;
  intensityBefore: number;
  intensityAfter: number;
  interventionUsed: "breathe" | "distract" | "text";
  resisted: boolean;
}

export interface Habit {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  isCustom: boolean;
  createdAt: string;
}

export interface HabitCompletion {
  habitId: string;
  date: string; // YYYY-MM-DD
  completedAt: string;
}

export const SUGGESTED_HABITS: Omit<Habit, "isCustom" | "createdAt">[] = [
  { id: "breathing",  name: "Deep breathing",   description: "3 minutes of slow, calm breaths",         icon: "leaf",        color: "#5FCB8B" },
  { id: "water",      name: "Drink water",       description: "A full glass of cold water",               icon: "water",       color: "#2D8CFF" },
  { id: "walk",       name: "Short walk",        description: "10 minutes outside, fresh air",            icon: "footsteps",   color: "#FF751F" },
  { id: "meditation", name: "Meditate",          description: "5 minutes of quiet stillness",             icon: "moon",        color: "#9B80FF" },
  { id: "journal",    name: "Journal",           description: "Write 3 things you're grateful for",       icon: "pencil",      color: "#C8A96B" },
  { id: "stretch",    name: "Stretch",           description: "5 minutes of gentle stretching",           icon: "body",        color: "#F08A5D" },
  { id: "fruit",      name: "Eat fruit or veg",  description: "One healthy snack instead",                icon: "nutrition",   color: "#5FCB8B" },
  { id: "connect",    name: "Call someone",      description: "Check in with a friend or family",         icon: "call",        color: "#2D8CFF" },
  { id: "exercise",   name: "Exercise",          description: "20 minutes of movement",                   icon: "barbell",     color: "#FF6B9D" },
  { id: "read",       name: "Read",              description: "10 minutes of a book or article",          icon: "book",        color: "#9B80FF" },
  { id: "sleep",      name: "Sleep on time",     description: "In bed by your target time",               icon: "bed",         color: "#6E56CF" },
  { id: "cold-water", name: "Cold water splash", description: "Splash cold water on your face",           icon: "snow",        color: "#2D8CFF" },
];

interface AppState {
  profile: UserProfile | null;
  isOnboarded: boolean;
  triggerLog: TriggerEntry[];
  rescueSessions: RescueSession[];
  habits: Habit[];
  habitCompletions: HabitCompletion[];
  loading: boolean;
}

interface AppContextValue extends AppState {
  saveProfile: (profile: UserProfile) => Promise<void>;
  addTriggerEntry: (entry: Omit<TriggerEntry, "id" | "timestamp">) => Promise<void>;
  addRescueSession: (session: Omit<RescueSession, "id" | "timestamp">) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  resetData: () => Promise<void>;
  getDaysSmokeeFree: () => number;
  getMoneySaved: () => number;
  getCravingsResisted: () => number;
  addHabit: (habit: Omit<Habit, "id" | "isCustom" | "createdAt">) => Promise<void>;
  removeHabit: (habitId: string) => Promise<void>;
  toggleHabitCompletion: (habitId: string) => Promise<void>;
  isHabitCompletedToday: (habitId: string) => boolean;
  getHabitStreak: (habitId: string) => number;
  getTodayCompletionCount: () => number;
  getWeeklyCompletions: (habitId: string) => boolean[];
}

const AppContext = createContext<AppContextValue | null>(null);

const KEYS = {
  PROFILE: "@urge90_profile",
  TRIGGERS: "@urge90_triggers",
  RESCUE: "@urge90_rescue",
  HABITS: "@urge90_habits",
  HABIT_COMPLETIONS: "@urge90_habit_completions",
};

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function dateStr(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    profile: null,
    isOnboarded: false,
    triggerLog: [],
    rescueSessions: [],
    habits: [],
    habitCompletions: [],
    loading: true,
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [profileRaw, triggersRaw, rescueRaw, habitsRaw, completionsRaw] = await Promise.all([
        AsyncStorage.getItem(KEYS.PROFILE),
        AsyncStorage.getItem(KEYS.TRIGGERS),
        AsyncStorage.getItem(KEYS.RESCUE),
        AsyncStorage.getItem(KEYS.HABITS),
        AsyncStorage.getItem(KEYS.HABIT_COMPLETIONS),
      ]);
      const profile = profileRaw ? JSON.parse(profileRaw) : null;
      // Migrate old profiles that don't have badHabits
      if (profile && !profile.badHabits) {
        profile.badHabits = [profile.quitType || "cigarettes"];
      }
      setState({
        profile,
        isOnboarded: !!profile,
        triggerLog: triggersRaw ? JSON.parse(triggersRaw) : [],
        rescueSessions: rescueRaw ? JSON.parse(rescueRaw) : [],
        habits: habitsRaw ? JSON.parse(habitsRaw) : [],
        habitCompletions: completionsRaw ? JSON.parse(completionsRaw) : [],
        loading: false,
      });
    } catch {
      setState((s) => ({ ...s, loading: false }));
    }
  };

  const saveProfile = useCallback(async (profile: UserProfile) => {
    await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
    setState((s) => ({ ...s, profile, isOnboarded: true }));
  }, []);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    setState((s) => {
      if (!s.profile) return s;
      const updated = { ...s.profile, ...updates };
      AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(updated));
      return { ...s, profile: updated };
    });
  }, []);

  const addTriggerEntry = useCallback(async (entry: Omit<TriggerEntry, "id" | "timestamp">) => {
    const newEntry: TriggerEntry = {
      ...entry,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
    };
    setState((s) => {
      const updated = [newEntry, ...s.triggerLog];
      AsyncStorage.setItem(KEYS.TRIGGERS, JSON.stringify(updated));
      return { ...s, triggerLog: updated };
    });
  }, []);

  const addRescueSession = useCallback(async (session: Omit<RescueSession, "id" | "timestamp">) => {
    const newSession: RescueSession = {
      ...session,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
    };
    setState((s) => {
      const updated = [newSession, ...s.rescueSessions];
      AsyncStorage.setItem(KEYS.RESCUE, JSON.stringify(updated));
      return { ...s, rescueSessions: updated };
    });
  }, []);

  const addHabit = useCallback(async (habit: Omit<Habit, "id" | "isCustom" | "createdAt">) => {
    const newHabit: Habit = {
      ...habit,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      isCustom: true,
      createdAt: new Date().toISOString(),
    };
    setState((s) => {
      const updated = [...s.habits, newHabit];
      AsyncStorage.setItem(KEYS.HABITS, JSON.stringify(updated));
      return { ...s, habits: updated };
    });
  }, []);

  const removeHabit = useCallback(async (habitId: string) => {
    setState((s) => {
      const updated = s.habits.filter((h) => h.id !== habitId);
      AsyncStorage.setItem(KEYS.HABITS, JSON.stringify(updated));
      return { ...s, habits: updated };
    });
  }, []);

  const toggleHabitCompletion = useCallback(async (habitId: string) => {
    const today = todayStr();
    setState((s) => {
      const alreadyDone = s.habitCompletions.some(
        (c) => c.habitId === habitId && c.date === today
      );
      const updated = alreadyDone
        ? s.habitCompletions.filter((c) => !(c.habitId === habitId && c.date === today))
        : [...s.habitCompletions, { habitId, date: today, completedAt: new Date().toISOString() }];
      AsyncStorage.setItem(KEYS.HABIT_COMPLETIONS, JSON.stringify(updated));
      return { ...s, habitCompletions: updated };
    });
  }, []);

  const isHabitCompletedToday = useCallback((habitId: string) => {
    return state.habitCompletions.some(
      (c) => c.habitId === habitId && c.date === todayStr()
    );
  }, [state.habitCompletions]);

  const getHabitStreak = useCallback((habitId: string) => {
    const dates = state.habitCompletions
      .filter((c) => c.habitId === habitId)
      .map((c) => c.date);
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      if (dates.includes(dateStr(i))) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  }, [state.habitCompletions]);

  const getWeeklyCompletions = useCallback((habitId: string): boolean[] => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = dateStr(6 - i);
      return state.habitCompletions.some((c) => c.habitId === habitId && c.date === d);
    });
  }, [state.habitCompletions]);

  const getTodayCompletionCount = useCallback(() => {
    return state.habitCompletions.filter((c) => c.date === todayStr()).length;
  }, [state.habitCompletions]);

  const resetData = useCallback(async () => {
    await Promise.all(Object.values(KEYS).map((k) => AsyncStorage.removeItem(k)));
    setState({
      profile: null,
      isOnboarded: false,
      triggerLog: [],
      rescueSessions: [],
      habits: [],
      habitCompletions: [],
      loading: false,
    });
  }, []);

  const getDaysSmokeeFree = useCallback(() => {
    if (!state.profile?.quitDate) return 0;
    return Math.floor((Date.now() - new Date(state.profile.quitDate).getTime()) / 86400000);
  }, [state.profile]);

  const getMoneySaved = useCallback(() => {
    if (!state.profile) return 0;
    return Math.round(getDaysSmokeeFree() * state.profile.dailySpend * 100) / 100;
  }, [state.profile, getDaysSmokeeFree]);

  const getCravingsResisted = useCallback(() => {
    return state.rescueSessions.filter((s) => s.resisted).length +
      state.triggerLog.filter((t) => t.resisted).length;
  }, [state.rescueSessions, state.triggerLog]);

  return (
    <AppContext.Provider value={{
      ...state,
      saveProfile, updateProfile, addTriggerEntry, addRescueSession, resetData,
      getDaysSmokeeFree, getMoneySaved, getCravingsResisted,
      addHabit, removeHabit, toggleHabitCompletion,
      isHabitCompletedToday, getHabitStreak, getTodayCompletionCount, getWeeklyCompletions,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
