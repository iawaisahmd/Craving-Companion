import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { C } from "@/constants/colors";
import { useApp, TriggerEntry, TriggerType } from "@/context/AppContext";

const TRIGGER_LABELS: Record<TriggerType, string> = {
  stress: "Stress",
  boredom: "Boredom",
  social: "Social",
  "after-meal": "After meal",
  alcohol: "Alcohol",
  habit: "Habit",
  other: "Other",
};

const TRIGGER_ICONS: Record<TriggerType, string> = {
  stress: "flash",
  boredom: "time",
  social: "people",
  "after-meal": "restaurant",
  alcohol: "wine",
  habit: "repeat",
  other: "ellipsis-horizontal",
};

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffH = diffMs / (1000 * 60 * 60);
  if (diffH < 1) return `${Math.round(diffMs / 60000)}m ago`;
  if (diffH < 24) return `${Math.round(diffH)}h ago`;
  const days = Math.floor(diffH / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function UrgeBar({ value }: { value: number }) {
  const color = value <= 3 ? C.success : value <= 6 ? C.accent : C.warning;
  return (
    <View style={styles.urgeBar}>
      <View style={[styles.urgeFill, { width: `${value * 10}%`, backgroundColor: color }]} />
    </View>
  );
}

function LogItem({ entry }: { entry: TriggerEntry }) {
  return (
    <View style={styles.logItem}>
      <View style={[styles.logIconWrap, { backgroundColor: entry.resisted ? `${C.success}18` : `${C.warning}18` }]}>
        <Ionicons
          name={TRIGGER_ICONS[entry.trigger] as any}
          size={20}
          color={entry.resisted ? C.success : C.warning}
        />
      </View>
      <View style={styles.logContent}>
        <View style={styles.logRow}>
          <Text style={styles.logTrigger}>{TRIGGER_LABELS[entry.trigger]}</Text>
          <Text style={styles.logTime}>{formatTime(entry.timestamp)}</Text>
        </View>
        <UrgeBar value={entry.urgeStrength} />
        <View style={styles.logRow}>
          <Text style={styles.logUrgeNum}>Urge: {entry.urgeStrength}/10</Text>
          <View style={[styles.badge, entry.resisted ? styles.badgeSuccess : styles.badgeWarning]}>
            <Text style={styles.badgeText}>{entry.resisted ? "Resisted" : "Slipped"}</Text>
          </View>
        </View>
        {entry.note ? <Text style={styles.logNote}>{entry.note}</Text> : null}
      </View>
    </View>
  );
}

export default function LogScreen() {
  const insets = useSafeAreaInsets();
  const { triggerLog, rescueSessions } = useApp();

  const totalToday = triggerLog.filter((e) => {
    const d = new Date(e.timestamp);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;

  const resistedToday = triggerLog.filter((e) => {
    const d = new Date(e.timestamp);
    const now = new Date();
    return d.toDateString() === now.toDateString() && e.resisted;
  }).length;

  const paddingTop = Platform.OS === "web" ? insets.top + 67 : insets.top + 16;

  return (
    <View style={[styles.container]}>
      <FlatList
        data={triggerLog}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        ListHeaderComponent={
          <View style={{ paddingTop, paddingHorizontal: 24, paddingBottom: 8 }}>
            <View style={styles.headerRow}>
              <Text style={styles.screenTitle}>Trigger Log</Text>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push("/log-trigger");
                }}
                style={styles.addBtn}
              >
                <Ionicons name="add" size={22} color={C.text} />
              </Pressable>
            </View>

            {triggerLog.length > 0 && (
              <View style={styles.todaySummary}>
                <View style={styles.todayStat}>
                  <Text style={styles.todayNum}>{totalToday}</Text>
                  <Text style={styles.todayLabel}>Today</Text>
                </View>
                <View style={styles.todayDivider} />
                <View style={styles.todayStat}>
                  <Text style={[styles.todayNum, { color: C.success }]}>{resistedToday}</Text>
                  <Text style={styles.todayLabel}>Resisted</Text>
                </View>
                <View style={styles.todayDivider} />
                <View style={styles.todayStat}>
                  <Text style={[styles.todayNum, { color: C.warning }]}>{totalToday - resistedToday}</Text>
                  <Text style={styles.todayLabel}>Slipped</Text>
                </View>
              </View>
            )}

            {triggerLog.length > 0 && (
              <Text style={styles.sectionLabel}>All entries</Text>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="list-outline" size={48} color={C.textDim} />
            <Text style={styles.emptyTitle}>No entries yet</Text>
            <Text style={styles.emptyDesc}>
              Log a trigger manually or complete a rescue flow.
            </Text>
            <Pressable
              onPress={() => router.push("/log-trigger")}
              style={styles.emptyBtn}
            >
              <Text style={styles.emptyBtnText}>Log one now</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 24 }}>
            <LogItem entry={item} />
          </View>
        )}
        contentContainerStyle={{
          paddingBottom: Platform.OS === "web" ? 34 + 84 : 100,
          gap: 0,
        }}
        scrollEnabled={!!triggerLog.length}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  screenTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    color: C.text,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  todaySummary: {
    flexDirection: "row",
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: C.border,
  },
  todayStat: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  todayNum: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    color: C.text,
  },
  todayLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: C.textMuted,
  },
  todayDivider: {
    width: 1,
    backgroundColor: C.border,
    marginVertical: 4,
  },
  sectionLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  logItem: {
    flexDirection: "row",
    gap: 14,
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  logIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  logContent: {
    flex: 1,
    gap: 8,
  },
  logRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logTrigger: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: C.text,
  },
  logTime: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: C.textMuted,
  },
  urgeBar: {
    height: 4,
    backgroundColor: C.surfaceElevated,
    borderRadius: 2,
    overflow: "hidden",
  },
  urgeFill: {
    height: "100%",
    borderRadius: 2,
  },
  logUrgeNum: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: C.textMuted,
  },
  badge: {
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeSuccess: {
    backgroundColor: `${C.success}22`,
  },
  badgeWarning: {
    backgroundColor: `${C.warning}22`,
  },
  badgeText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: C.text,
  },
  logNote: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: C.textMuted,
    fontStyle: "italic",
    lineHeight: 18,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 20,
    color: C.text,
  },
  emptyDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: C.textMuted,
    textAlign: "center",
    lineHeight: 22,
  },
  emptyBtn: {
    marginTop: 8,
    backgroundColor: C.primary,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: C.text,
  },
});
