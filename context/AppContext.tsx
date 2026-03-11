import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type QuitType = "cigarettes" | "vaping";

export type TriggerType =
  | "stress"
  | "boredom"
  | "social"
  | "after-meal"
  | "alcohol"
  | "habit"
  | "other";

export interface UserProfile {
  quitType: QuitType;
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

interface AppState {
  profile: UserProfile | null;
  isOnboarded: boolean;
  triggerLog: TriggerEntry[];
  rescueSessions: RescueSession[];
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
}

const AppContext = createContext<AppContextValue | null>(null);

const KEYS = {
  PROFILE: "@craveaway_profile",
  TRIGGERS: "@craveaway_triggers",
  RESCUE: "@craveaway_rescue",
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    profile: null,
    isOnboarded: false,
    triggerLog: [],
    rescueSessions: [],
    loading: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profileRaw, triggersRaw, rescueRaw] = await Promise.all([
        AsyncStorage.getItem(KEYS.PROFILE),
        AsyncStorage.getItem(KEYS.TRIGGERS),
        AsyncStorage.getItem(KEYS.RESCUE),
      ]);
      const profile = profileRaw ? JSON.parse(profileRaw) : null;
      const triggerLog = triggersRaw ? JSON.parse(triggersRaw) : [];
      const rescueSessions = rescueRaw ? JSON.parse(rescueRaw) : [];
      setState({
        profile,
        isOnboarded: !!profile,
        triggerLog,
        rescueSessions,
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

  const addTriggerEntry = useCallback(
    async (entry: Omit<TriggerEntry, "id" | "timestamp">) => {
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
    },
    []
  );

  const addRescueSession = useCallback(
    async (session: Omit<RescueSession, "id" | "timestamp">) => {
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
    },
    []
  );

  const resetData = useCallback(async () => {
    await Promise.all([
      AsyncStorage.removeItem(KEYS.PROFILE),
      AsyncStorage.removeItem(KEYS.TRIGGERS),
      AsyncStorage.removeItem(KEYS.RESCUE),
    ]);
    setState({
      profile: null,
      isOnboarded: false,
      triggerLog: [],
      rescueSessions: [],
      loading: false,
    });
  }, []);

  const getDaysSmokeeFree = useCallback(() => {
    if (!state.profile?.quitDate) return 0;
    const start = new Date(state.profile.quitDate).getTime();
    const now = Date.now();
    return Math.floor((now - start) / (1000 * 60 * 60 * 24));
  }, [state.profile]);

  const getMoneySaved = useCallback(() => {
    if (!state.profile) return 0;
    const days = getDaysSmokeeFree();
    return Math.round(days * state.profile.dailySpend * 100) / 100;
  }, [state.profile, getDaysSmokeeFree]);

  const getCravingsResisted = useCallback(() => {
    return state.rescueSessions.filter((s) => s.resisted).length +
      state.triggerLog.filter((t) => t.resisted).length;
  }, [state.rescueSessions, state.triggerLog]);

  return (
    <AppContext.Provider
      value={{
        ...state,
        saveProfile,
        updateProfile,
        addTriggerEntry,
        addRescueSession,
        resetData,
        getDaysSmokeeFree,
        getMoneySaved,
        getCravingsResisted,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
