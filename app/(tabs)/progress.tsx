import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { C } from "@/constants/colors";
import { useApp, TriggerType } from "@/context/AppContext";

const TRIGGER_LABELS: Record<TriggerType, string> = {
  stress: "Stress",
  boredom: "Boredom",
  social: "Social",
  "after-meal": "After meal",
  alcohol: "Alcohol",
  habit: "Habit",
  other: "Other",
};

function HeroStat({
  value,
  label,
  sublabel,
  color,
  icon,
}: {
  value: string;
  label: string;
  sublabel?: string;
  color: string;
  icon: string;
}) {
  return (
    <View style={[styles.heroStat, { borderColor: `${color}25` }]}>
      <LinearGradient
        colors={[`${color}12`, "transparent"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={[styles.heroIconWrap, { backgroundColor: `${color}18` }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <Text style={[styles.heroValue, { color }]}>{value}</Text>
      <Text style={styles.heroLabel}>{label}</Text>
      {sublabel ? <Text style={styles.heroSublabel}>{sublabel}</Text> : null}
    </View>
  );
}

function TimeBar({
  label,
  count,
  max,
  color,
}: {
  label: string;
  count: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <View style={styles.timeBarRow}>
      <Text style={styles.timeBarLabel}>{label}</Text>
      <View style={styles.timeBarTrack}>
        <View
          style={[
            styles.timeBarFill,
            { width: `${pct}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={styles.timeBarCount}>{count}</Text>
    </View>
  );
}

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const {
    profile,
    triggerLog,
    rescueSessions,
    getDaysSmokeeFree,
    getMoneySaved,
    getCravingsResisted,
  } = useApp();

  const days = getDaysSmokeeFree();
  const money = getMoneySaved();
  const resisted = getCravingsResisted();

  const formatMoney = (n: number) => {
    if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
    if (n >= 100) return `$${n.toFixed(0)}`;
    return `$${n.toFixed(2)}`;
  };

  const formatDays = (d: number) => {
    if (d < 1) return "< 1 day";
    if (d === 1) return "1 day";
    if (d < 7) return `${d} days`;
    const weeks = Math.floor(d / 7);
    const rem = d % 7;
    if (weeks === 1 && rem === 0) return "1 week";
    if (rem === 0) return `${weeks} weeks`;
    return `${weeks}w ${rem}d`;
  };

  // Time-of-day buckets
  const hourBuckets = Array.from({ length: 24 }, () => 0);
  [...triggerLog, ...rescueSessions].forEach((e) => {
    const h = new Date(e.timestamp).getHours();
    hourBuckets[h]++;
  });

  const timeSlots = [
    { label: "Morning", hours: [6, 7, 8, 9, 10, 11] },
    { label: "Afternoon", hours: [12, 13, 14, 15, 16, 17] },
    { label: "Evening", hours: [18, 19, 20, 21] },
    { label: "Night", hours: [22, 23, 0, 1, 2, 3, 4, 5] },
  ];

  const slotCounts = timeSlots.map((s) => ({
    label: s.label,
    count: s.hours.reduce((acc, h) => acc + hourBuckets[h], 0),
  }));

  const maxSlotCount = Math.max(...slotCounts.map((s) => s.count), 1);

  const hardestSlot = slotCounts.reduce(
    (best, s) => (s.count > best.count ? s : best),
    slotCounts[0]
  );

  // Trigger breakdown
  const triggerCounts: Partial<Record<TriggerType, number>> = {};
  triggerLog.forEach((e) => {
    triggerCounts[e.trigger] = (triggerCounts[e.trigger] || 0) + 1;
  });

  const sortedTriggers = Object.entries(triggerCounts).sort(
    ([, a], [, b]) => (b as number) - (a as number)
  ) as [TriggerType, number][];

  const maxTriggerCount = Math.max(...Object.values(triggerCounts) as number[], 1);

  const totalCravings = triggerLog.length + rescueSessions.length;
  const resistRate =
    totalCravings > 0 ? Math.round((resisted / totalCravings) * 100) : 0;

  const paddingTop = Platform.OS === "web" ? insets.top + 67 : insets.top + 16;

  return (
    <ScrollView
      style={styles.container}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingTop,
        paddingHorizontal: 24,
        paddingBottom: Platform.OS === "web" ? 34 + 84 : 100,
        gap: 24,
      }}
    >
      <Text style={styles.screenTitle}>Progress</Text>

      {/* Hero stats */}
      <View style={styles.heroGrid}>
        <HeroStat
          value={formatMoney(money)}
          label="Saved"
          sublabel={`$${profile?.dailySpend ?? 0}/day × ${days} days`}
          color={C.success}
          icon="cash"
        />
        <HeroStat
          value={formatDays(days)}
          label="Smoke-free"
          sublabel={days === 0 ? "Starting today" : "Keep it up"}
          color={C.secondary}
          icon="calendar"
        />
      </View>
      <View style={styles.heroGrid}>
        <HeroStat
          value={`${resisted}`}
          label="Cravings resisted"
          color={C.accent}
          icon="shield-checkmark"
        />
        <HeroStat
          value={`${resistRate}%`}
          label="Resist rate"
          sublabel={totalCravings > 0 ? `${totalCravings} total urges` : undefined}
          color={C.primary}
          icon="trending-up"
        />
      </View>

      {/* Time of day */}
      {totalCravings > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="time" size={18} color={C.textMuted} />
            <Text style={styles.cardTitle}>Craving patterns</Text>
          </View>
          {slotCounts.map((s) => (
            <TimeBar
              key={s.label}
              label={s.label}
              count={s.count}
              max={maxSlotCount}
              color={
                s.label === hardestSlot.label ? C.warning : C.primary
              }
            />
          ))}
          {hardestSlot.count > 0 && (
            <View style={styles.insightRow}>
              <Ionicons name="alert-circle" size={16} color={C.warning} />
              <Text style={styles.insightText}>
                Hardest time: {hardestSlot.label}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Trigger breakdown */}
      {sortedTriggers.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="flash" size={18} color={C.textMuted} />
            <Text style={styles.cardTitle}>Top triggers</Text>
          </View>
          {sortedTriggers.slice(0, 5).map(([trigger, count]) => (
            <TimeBar
              key={trigger}
              label={TRIGGER_LABELS[trigger]}
              count={count}
              max={maxTriggerCount}
              color={C.primary}
            />
          ))}
        </View>
      )}

      {/* Motivational message */}
      <View style={styles.motivationCard}>
        <Ionicons name="heart" size={20} color={C.accent} />
        <Text style={styles.motivationText}>
          {days === 0
            ? "Day one is the hardest. You showed up."
            : days < 3
            ? "The first 72 hours are the toughest. You're in them."
            : days < 7
            ? "Most relapses happen in week one. You're beating the odds."
            : days < 30
            ? "Your lungs are already healing. Keep going."
            : `${days} days. That is not luck. That is you.`}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  screenTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    color: C.text,
    marginBottom: 4,
  },
  heroGrid: {
    flexDirection: "row",
    gap: 12,
  },
  heroStat: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 24,
    padding: 20,
    gap: 8,
    borderWidth: 1,
    overflow: "hidden",
    alignItems: "flex-start",
  },
  heroIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  heroValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    lineHeight: 34,
  },
  heroLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: C.text,
  },
  heroSublabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: C.textMuted,
    lineHeight: 17,
  },
  card: {
    backgroundColor: C.surface,
    borderRadius: 24,
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  cardTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: C.text,
  },
  timeBarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  timeBarLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: C.textMuted,
    width: 70,
  },
  timeBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: C.surfaceElevated,
    borderRadius: 4,
    overflow: "hidden",
  },
  timeBarFill: {
    height: "100%",
    borderRadius: 4,
    minWidth: 4,
  },
  timeBarCount: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: C.text,
    width: 20,
    textAlign: "right",
  },
  insightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 4,
  },
  insightText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: C.textMuted,
  },
  motivationCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: `${C.accent}25`,
  },
  motivationText: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: C.textMuted,
    lineHeight: 24,
    fontStyle: "italic",
  },
});
