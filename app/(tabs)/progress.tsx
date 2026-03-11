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
  stress: "Stress", boredom: "Boredom", social: "Social",
  "after-meal": "After meal", alcohol: "Alcohol", habit: "Habit", other: "Other",
};

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function HeroStat({ value, label, sublabel, color, icon }: {
  value: string; label: string; sublabel?: string; color: string; icon: string;
}) {
  return (
    <View style={[styles.heroStat, { borderColor: `${color}25` }]}>
      <LinearGradient colors={[`${color}12`, "transparent"]} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
      <View style={[styles.heroIconWrap, { backgroundColor: `${color}18` }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <Text style={[styles.heroValue, { color }]}>{value}</Text>
      <Text style={styles.heroLabel}>{label}</Text>
      {sublabel ? <Text style={styles.heroSublabel}>{sublabel}</Text> : null}
    </View>
  );
}

function Bar({ label, count, max, color, width = 70 }: {
  label: string; count: number; max: number; color: string; width?: number;
}) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <View style={styles.barRow}>
      <Text style={[styles.barLabel, { width }]}>{label}</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.barCount}>{count}</Text>
    </View>
  );
}

function WeekGrid({ habitId, habitName, color, getWeekly }: {
  habitId: string; habitName: string; color: string; getWeekly: (id: string) => boolean[];
}) {
  const days = getWeekly(habitId);
  const completedCount = days.filter(Boolean).length;
  return (
    <View style={styles.weekHabitRow}>
      <View style={[styles.weekDot, { backgroundColor: `${color}25` }]}>
        <Ionicons name="leaf" size={12} color={color} />
      </View>
      <Text style={styles.weekHabitName} numberOfLines={1}>{habitName}</Text>
      <View style={styles.weekDots}>
        {days.map((done, i) => (
          <View key={i} style={[styles.weekCell, done && { backgroundColor: color }]}>
            {done && <Ionicons name="checkmark" size={9} color="#fff" />}
          </View>
        ))}
      </View>
      <Text style={[styles.weekCount, { color }]}>{completedCount}/7</Text>
    </View>
  );
}

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const {
    profile, triggerLog, rescueSessions, habits, habitCompletions,
    getDaysSmokeeFree, getMoneySaved, getCravingsResisted,
    getHabitStreak, getWeeklyCompletions,
  } = useApp();

  const days = getDaysSmokeeFree();
  const money = getMoneySaved();
  const resisted = getCravingsResisted();

  const formatMoney = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : n >= 100 ? `$${n.toFixed(0)}` : `$${n.toFixed(2)}`;
  const formatDays = (d: number) => {
    if (d < 1) return "< 1 day";
    if (d === 1) return "1 day";
    if (d < 7) return `${d} days`;
    const w = Math.floor(d / 7), r = d % 7;
    return r === 0 ? `${w}w` : `${w}w ${r}d`;
  };

  // Craving time-of-day
  const hourBuckets = Array.from({ length: 24 }, () => 0);
  [...triggerLog, ...rescueSessions].forEach((e) => { hourBuckets[new Date(e.timestamp).getHours()]++; });
  const timeSlots = [
    { label: "Morning",   hours: [6,7,8,9,10,11] },
    { label: "Afternoon", hours: [12,13,14,15,16,17] },
    { label: "Evening",   hours: [18,19,20,21] },
    { label: "Night",     hours: [22,23,0,1,2,3,4,5] },
  ];
  const slotCounts = timeSlots.map((s) => ({ label: s.label, count: s.hours.reduce((a, h) => a + hourBuckets[h], 0) }));
  const maxSlot = Math.max(...slotCounts.map((s) => s.count), 1);
  const hardestSlot = slotCounts.reduce((b, s) => s.count > b.count ? s : b, slotCounts[0]);

  // Trigger breakdown
  const triggerCounts: Partial<Record<TriggerType, number>> = {};
  triggerLog.forEach((e) => { triggerCounts[e.trigger] = (triggerCounts[e.trigger] || 0) + 1; });
  const sortedTriggers = Object.entries(triggerCounts).sort(([,a],[,b]) => (b as number) - (a as number)) as [TriggerType, number][];
  const maxTrigger = Math.max(...Object.values(triggerCounts) as number[], 1);

  const totalCravings = triggerLog.length + rescueSessions.length;
  const resistRate = totalCravings > 0 ? Math.round((resisted / totalCravings) * 100) : 0;

  // Habits stats
  const today = new Date().toISOString().split("T")[0];
  const todayDone = habitCompletions.filter((c) => c.date === today).length;
  const totalHabits = habits.length;
  const bestStreak = habits.length > 0
    ? Math.max(...habits.map((h) => getHabitStreak(h.id)))
    : 0;
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });
  const weeklyTotals = last7Days.map((date) => habitCompletions.filter((c) => c.date === date).length);
  const maxWeekly = Math.max(...weeklyTotals, 1);

  const paddingTop = Platform.OS === "web" ? insets.top + 67 : insets.top + 16;

  return (
    <ScrollView
      style={styles.container}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop, paddingHorizontal: 24, paddingBottom: Platform.OS === "web" ? 34 + 84 : 100, gap: 24 }}
    >
      <Text style={styles.screenTitle}>Progress</Text>

      {/* Craving stats */}
      <Text style={styles.sectionTitle}>Breaking bad habits</Text>
      <View style={styles.heroGrid}>
        <HeroStat value={formatMoney(money)} label="Saved" sublabel={`$${profile?.dailySpend ?? 0}/day × ${days}d`} color={C.success} icon="cash" />
        <HeroStat value={formatDays(days)} label="Clean" sublabel={days === 0 ? "Starting today" : "Keep going"} color={C.secondary} icon="calendar" />
      </View>
      <View style={styles.heroGrid}>
        <HeroStat value={`${resisted}`} label="Resisted" color={C.accent} icon="shield-checkmark" />
        <HeroStat value={`${resistRate}%`} label="Resist rate" sublabel={totalCravings > 0 ? `${totalCravings} urges` : undefined} color={C.primary} icon="trending-up" />
      </View>

      {/* Craving patterns */}
      {totalCravings > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="time" size={18} color={C.textMuted} />
            <Text style={styles.cardTitle}>Craving patterns</Text>
          </View>
          {slotCounts.map((s) => (
            <Bar key={s.label} label={s.label} count={s.count} max={maxSlot} color={s.label === hardestSlot.label ? C.warning : C.primary} />
          ))}
          {hardestSlot.count > 0 && (
            <View style={styles.insightRow}>
              <Ionicons name="alert-circle" size={16} color={C.warning} />
              <Text style={styles.insightText}>Hardest time: {hardestSlot.label}</Text>
            </View>
          )}
        </View>
      )}

      {/* Top triggers */}
      {sortedTriggers.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="flash" size={18} color={C.textMuted} />
            <Text style={styles.cardTitle}>Top triggers</Text>
          </View>
          {sortedTriggers.slice(0, 5).map(([trigger, count]) => (
            <Bar key={trigger} label={TRIGGER_LABELS[trigger]} count={count} max={maxTrigger} color={C.primary} />
          ))}
        </View>
      )}

      {/* Habits section */}
      {habits.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Building good habits</Text>

          {/* Habit hero stats */}
          <View style={styles.heroGrid}>
            <HeroStat value={`${todayDone}/${totalHabits}`} label="Done today" color={C.success} icon="leaf" />
            <HeroStat value={`${bestStreak}d`} label="Best streak" sublabel={bestStreak > 0 ? "Keep the fire going" : undefined} color={C.warning} icon="flame" />
          </View>

          {/* Weekly habit grid */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="calendar" size={18} color={C.textMuted} />
              <Text style={styles.cardTitle}>Last 7 days</Text>
            </View>

            {/* Day labels */}
            <View style={styles.dayLabelsRow}>
              <View style={{ width: 110 }} />
              {last7Days.map((d, i) => {
                const dayName = new Date(d + "T12:00:00").toLocaleDateString([], { weekday: "short" });
                const isToday = d === today;
                return (
                  <Text key={i} style={[styles.dayLabel, isToday && { color: C.primary }]}>{dayName}</Text>
                );
              })}
              <View style={{ width: 28 }} />
            </View>

            {habits.map((habit) => (
              <WeekGrid
                key={habit.id}
                habitId={habit.id}
                habitName={habit.name}
                color={habit.color}
                getWeekly={getWeeklyCompletions}
              />
            ))}
          </View>

          {/* Per-habit completion bars */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="bar-chart" size={18} color={C.textMuted} />
              <Text style={styles.cardTitle}>Habit streaks</Text>
            </View>
            {habits.map((h) => {
              const streak = getHabitStreak(h.id);
              return (
                <Bar key={h.id} label={h.name} count={streak} max={Math.max(...habits.map((x) => getHabitStreak(x.id)), 1)} color={h.color} width={100} />
              );
            })}
          </View>
        </>
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
            ? "Your body is already healing. Keep going."
            : `${days} days. That is not luck. That is you.`}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  screenTitle: { fontFamily: "Inter_700Bold", fontSize: 28, color: C.text, marginBottom: 4 },
  sectionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.5 },
  heroGrid: { flexDirection: "row", gap: 12 },
  heroStat: { flex: 1, backgroundColor: C.surface, borderRadius: 24, padding: 20, gap: 8, borderWidth: 1, overflow: "hidden", alignItems: "flex-start" },
  heroIconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  heroValue: { fontFamily: "Inter_700Bold", fontSize: 26, lineHeight: 32 },
  heroLabel: { fontFamily: "Inter_500Medium", fontSize: 13, color: C.text },
  heroSublabel: { fontFamily: "Inter_400Regular", fontSize: 12, color: C.textMuted, lineHeight: 17 },
  card: { backgroundColor: C.surface, borderRadius: 24, padding: 20, gap: 12, borderWidth: 1, borderColor: C.border },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  cardTitle: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: C.text },
  barRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  barLabel: { fontFamily: "Inter_400Regular", fontSize: 13, color: C.textMuted, width: 70 },
  barTrack: { flex: 1, height: 8, backgroundColor: C.surfaceElevated, borderRadius: 4, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 4, minWidth: 4 },
  barCount: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: C.text, width: 24, textAlign: "right" },
  insightRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingTop: 4 },
  insightText: { fontFamily: "Inter_400Regular", fontSize: 13, color: C.textMuted },
  dayLabelsRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  dayLabel: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 10, color: C.textDim, textAlign: "center" },
  weekHabitRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  weekDot: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  weekHabitName: { fontFamily: "Inter_400Regular", fontSize: 12, color: C.textMuted, width: 80 },
  weekDots: { flex: 1, flexDirection: "row", gap: 4 },
  weekCell: { flex: 1, height: 24, borderRadius: 6, backgroundColor: C.surfaceElevated, alignItems: "center", justifyContent: "center" },
  weekCount: { fontFamily: "Inter_600SemiBold", fontSize: 12, width: 28, textAlign: "right" },
  motivationCard: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    backgroundColor: C.surface, borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: `${C.accent}25`,
  },
  motivationText: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 16, color: C.textMuted, lineHeight: 24, fontStyle: "italic" },
});
