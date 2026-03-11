import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeColors } from "@/context/ThemeContext";
import { useApp, TriggerType } from "@/context/AppContext";
import { ColorTheme } from "@/constants/colors";

const TRIGGER_LABELS: Record<TriggerType, string> = {
  stress: "Stress", boredom: "Boredom", social: "Social",
  "after-meal": "After meal", alcohol: "Alcohol", habit: "Habit", other: "Other",
};

function makeStyles(C: ColorTheme) {
  return StyleSheet.create({
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
    motivationCard: { flexDirection: "row", alignItems: "flex-start", gap: 12, backgroundColor: C.surface, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: `${C.accent}25` },
    motivationText: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 16, color: C.textMuted, lineHeight: 24, fontStyle: "italic" },
    barLabel70: { fontFamily: "Inter_400Regular", fontSize: 13, color: C.textMuted, width: 70 },
    barLabel100: { fontFamily: "Inter_400Regular", fontSize: 13, color: C.textMuted, width: 100 },
  });
}

function HeroStat({ value, label, sublabel, color, icon, styles }: {
  value: string; label: string; sublabel?: string; color: string; icon: string; styles: ReturnType<typeof makeStyles>;
}) {
  return (
    <View style={[styles.heroStat, { borderColor: `${color}25` }]}>
      <LinearGradient colors={[`${color}12`, "transparent"]} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
      <View style={[styles.heroIconWrap, { backgroundColor: `${color}18` }]}><Ionicons name={icon as any} size={24} color={color} /></View>
      <Text style={[styles.heroValue, { color }]}>{value}</Text>
      <Text style={styles.heroLabel}>{label}</Text>
      {sublabel ? <Text style={styles.heroSublabel}>{sublabel}</Text> : null}
    </View>
  );
}

export default function ProgressScreen() {
  const C = useThemeColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const { profile, triggerLog, rescueSessions, habits, habitCompletions, getDaysSmokeeFree, getMoneySaved, getCravingsResisted, getHabitStreak, getWeeklyCompletions } = useApp();

  const days = getDaysSmokeeFree();
  const money = getMoneySaved();
  const resisted = getCravingsResisted();

  const formatMoney = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : n >= 100 ? `$${n.toFixed(0)}` : `$${n.toFixed(2)}`;
  const formatDays = (d: number) => { if (d < 1) return "< 1 day"; if (d === 1) return "1 day"; if (d < 7) return `${d} days`; const w = Math.floor(d / 7), r = d % 7; return r === 0 ? `${w}w` : `${w}w ${r}d`; };

  const hourBuckets = Array.from({ length: 24 }, () => 0);
  [...triggerLog, ...rescueSessions].forEach((e) => { hourBuckets[new Date(e.timestamp).getHours()]++; });
  const timeSlots = [
    { label: "Morning", hours: [6,7,8,9,10,11] }, { label: "Afternoon", hours: [12,13,14,15,16,17] },
    { label: "Evening", hours: [18,19,20,21] }, { label: "Night", hours: [22,23,0,1,2,3,4,5] },
  ];
  const slotCounts = timeSlots.map((s) => ({ label: s.label, count: s.hours.reduce((a, h) => a + hourBuckets[h], 0) }));
  const maxSlot = Math.max(...slotCounts.map((s) => s.count), 1);
  const hardestSlot = slotCounts.reduce((b, s) => s.count > b.count ? s : b, slotCounts[0]);

  const triggerCounts: Partial<Record<TriggerType, number>> = {};
  triggerLog.forEach((e) => { triggerCounts[e.trigger] = (triggerCounts[e.trigger] || 0) + 1; });
  const sortedTriggers = Object.entries(triggerCounts).sort(([,a],[,b]) => (b as number) - (a as number)) as [TriggerType, number][];
  const maxTrigger = Math.max(...Object.values(triggerCounts) as number[], 1);
  const totalCravings = triggerLog.length + rescueSessions.length;
  const resistRate = totalCravings > 0 ? Math.round((resisted / totalCravings) * 100) : 0;

  const today = new Date().toISOString().split("T")[0];
  const todayDone = habitCompletions.filter((c) => c.date === today).length;
  const last7Days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d.toISOString().split("T")[0]; });

  const paddingTop = Platform.OS === "web" ? insets.top + 67 : insets.top + 16;

  return (
    <ScrollView style={styles.container} contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop, paddingHorizontal: 24, paddingBottom: Platform.OS === "web" ? 34 + 84 : 100, gap: 24 }}>
      <Text style={styles.screenTitle}>Progress</Text>

      <Text style={styles.sectionTitle}>Breaking bad habits</Text>
      <View style={styles.heroGrid}>
        <HeroStat styles={styles} value={formatMoney(money)} label="Saved" sublabel={`$${profile?.dailySpend ?? 0}/day × ${days}d`} color={C.success} icon="cash" />
        <HeroStat styles={styles} value={formatDays(days)} label="Clean" sublabel={days === 0 ? "Starting today" : "Keep going"} color={C.secondary} icon="calendar" />
      </View>
      <View style={styles.heroGrid}>
        <HeroStat styles={styles} value={`${resisted}`} label="Resisted" color={C.accent} icon="shield-checkmark" />
        <HeroStat styles={styles} value={`${resistRate}%`} label="Resist rate" sublabel={totalCravings > 0 ? `${totalCravings} urges` : undefined} color={C.primary} icon="trending-up" />
      </View>

      {totalCravings > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}><Ionicons name="time" size={18} color={C.textMuted} /><Text style={styles.cardTitle}>Craving patterns</Text></View>
          {slotCounts.map((s) => (
            <View key={s.label} style={styles.barRow}>
              <Text style={styles.barLabel70}>{s.label}</Text>
              <View style={styles.barTrack}><View style={[styles.barFill, { width: `${maxSlot > 0 ? (s.count / maxSlot) * 100 : 0}%`, backgroundColor: s.label === hardestSlot.label ? C.warning : C.primary }]} /></View>
              <Text style={styles.barCount}>{s.count}</Text>
            </View>
          ))}
          {hardestSlot.count > 0 && <View style={styles.insightRow}><Ionicons name="alert-circle" size={16} color={C.warning} /><Text style={styles.insightText}>Hardest time: {hardestSlot.label}</Text></View>}
        </View>
      )}

      {sortedTriggers.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}><Ionicons name="flash" size={18} color={C.textMuted} /><Text style={styles.cardTitle}>Top triggers</Text></View>
          {sortedTriggers.slice(0, 5).map(([trigger, count]) => (
            <View key={trigger} style={styles.barRow}>
              <Text style={styles.barLabel70}>{TRIGGER_LABELS[trigger]}</Text>
              <View style={styles.barTrack}><View style={[styles.barFill, { width: `${maxTrigger > 0 ? (count / maxTrigger) * 100 : 0}%`, backgroundColor: C.primary }]} /></View>
              <Text style={styles.barCount}>{count}</Text>
            </View>
          ))}
        </View>
      )}

      {habits.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Building good habits</Text>
          <View style={styles.heroGrid}>
            <HeroStat styles={styles} value={`${todayDone}/${habits.length}`} label="Done today" color={C.success} icon="leaf" />
            <HeroStat styles={styles} value={`${habits.length > 0 ? Math.max(...habits.map((h) => getHabitStreak(h.id))) : 0}d`} label="Best streak" color={C.warning} icon="flame" />
          </View>
          <View style={styles.card}>
            <View style={styles.cardHeader}><Ionicons name="calendar" size={18} color={C.textMuted} /><Text style={styles.cardTitle}>Last 7 days</Text></View>
            <View style={styles.dayLabelsRow}>
              <View style={{ width: 110 }} />
              {last7Days.map((d, i) => {
                const dayName = new Date(d + "T12:00:00").toLocaleDateString([], { weekday: "short" });
                return <Text key={i} style={[styles.dayLabel, d === today && { color: C.primary }]}>{dayName}</Text>;
              })}
              <View style={{ width: 28 }} />
            </View>
            {habits.map((habit) => {
              const weekDays = getWeeklyCompletions(habit.id);
              const completedCount = weekDays.filter(Boolean).length;
              return (
                <View key={habit.id} style={styles.weekHabitRow}>
                  <View style={[styles.weekDot, { backgroundColor: `${habit.color}25` }]}><Ionicons name={habit.icon as any} size={12} color={habit.color} /></View>
                  <Text style={styles.weekHabitName} numberOfLines={1}>{habit.name}</Text>
                  <View style={styles.weekDots}>
                    {weekDays.map((done, i) => (
                      <View key={i} style={[styles.weekCell, done && { backgroundColor: habit.color }]}>
                        {done && <Ionicons name="checkmark" size={9} color="#fff" />}
                      </View>
                    ))}
                  </View>
                  <Text style={[styles.weekCount, { color: habit.color }]}>{completedCount}/7</Text>
                </View>
              );
            })}
          </View>
          <View style={styles.card}>
            <View style={styles.cardHeader}><Ionicons name="bar-chart" size={18} color={C.textMuted} /><Text style={styles.cardTitle}>Habit streaks</Text></View>
            {habits.map((h) => {
              const streak = getHabitStreak(h.id);
              const maxStreak = Math.max(...habits.map((x) => getHabitStreak(x.id)), 1);
              return (
                <View key={h.id} style={styles.barRow}>
                  <Text style={styles.barLabel100} numberOfLines={1}>{h.name}</Text>
                  <View style={styles.barTrack}><View style={[styles.barFill, { width: `${(streak / maxStreak) * 100}%`, backgroundColor: h.color }]} /></View>
                  <Text style={styles.barCount}>{streak}</Text>
                </View>
              );
            })}
          </View>
        </>
      )}

      <View style={styles.motivationCard}>
        <Ionicons name="heart" size={20} color={C.accent} />
        <Text style={styles.motivationText}>
          {days === 0 ? "Day one is the hardest. You showed up."
            : days < 3 ? "The first 72 hours are the toughest. You're in them."
            : days < 7 ? "Most relapses happen in week one. You're beating the odds."
            : days < 30 ? "Your body is already healing. Keep going."
            : `${days} days. That is not luck. That is you.`}
        </Text>
      </View>
    </ScrollView>
  );
}
