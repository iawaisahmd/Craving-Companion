import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { C } from "@/constants/colors";
import { useApp, BadHabitType, BAD_HABITS, TriggerType } from "@/context/AppContext";
import Animated, { FadeInDown, FadeOut } from "react-native-reanimated";

const TRIGGERS: { label: string; value: TriggerType; icon: string }[] = [
  { label: "Stress",      value: "stress",     icon: "flash" },
  { label: "Boredom",     value: "boredom",    icon: "time" },
  { label: "Social",      value: "social",     icon: "people" },
  { label: "After meals", value: "after-meal", icon: "restaurant" },
  { label: "Alcohol",     value: "alcohol",    icon: "wine" },
  { label: "Habit",       value: "habit",      icon: "repeat" },
  { label: "Other",       value: "other",      icon: "ellipsis-horizontal" },
];

const TOTAL_STEPS = 5;

export default function Onboarding() {
  const insets = useSafeAreaInsets();
  const { saveProfile } = useApp();

  const [step, setStep] = useState(0);
  const [badHabits, setBadHabits] = useState<BadHabitType[]>(["cigarettes"]);
  const [dailySpend, setDailySpend] = useState("");
  const [biggestTrigger, setBiggestTrigger] = useState<TriggerType>("stress");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [quitReason, setQuitReason] = useState("");

  const progress = (step / TOTAL_STEPS) * 100;

  const toggleBadHabit = (h: BadHabitType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setBadHabits((prev) =>
      prev.includes(h)
        ? prev.length > 1 ? prev.filter((x) => x !== h) : prev
        : [...prev, h]
    );
  };

  const goNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep((s) => s + 1);
  };
  const goBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep((s) => Math.max(0, s - 1));
  };

  const finish = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await saveProfile({
      quitType: badHabits[0],
      badHabits,
      dailySpend: parseFloat(dailySpend) || 10,
      biggestTrigger,
      contactName,
      contactPhone,
      quitReason,
      quitDate: new Date().toISOString(),
      hapticsEnabled: true,
      soundEnabled: true,
    });
    router.replace("/(tabs)");
  };

  const canProceed = () => {
    if (step === 0) return badHabits.length > 0;
    if (step === 1) return dailySpend.length > 0;
    if (step === 3) return quitReason.trim().length > 0;
    return true;
  };

  const primaryHabit = BAD_HABITS.find((h) => h.value === badHabits[0]);

  const paddingTop = insets.top + (Platform.OS === "web" ? 67 : 0);

  return (
    <View style={[styles.container, { paddingTop }]}>
      <LinearGradient
        colors={["rgba(47,111,104,0.10)", "transparent"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
        pointerEvents="none"
      />

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        {step > 0 ? (
          <Pressable onPress={goBack} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={C.textMuted} />
          </Pressable>
        ) : (
          <View style={{ width: 40 }} />
        )}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.stepCounter}>{step + 1}/{TOTAL_STEPS + 1}</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 + (Platform.OS === "web" ? 34 : 0) }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Step 0: Bad habits multi-select */}
          {step === 0 && (
            <Animated.View entering={FadeInDown.duration(400)} exiting={FadeOut}>
              <Text style={styles.stepLabel}>Let's start</Text>
              <Text style={styles.heading}>What are you{"\n"}quitting?</Text>
              <Text style={styles.subheading}>Select all that apply. No judgment.</Text>
              <View style={styles.badHabitGrid}>
                {BAD_HABITS.map((h) => {
                  const selected = badHabits.includes(h.value);
                  return (
                    <Pressable
                      key={h.value}
                      onPress={() => toggleBadHabit(h.value)}
                      style={[
                        styles.badHabitCard,
                        selected && { borderColor: h.color, backgroundColor: `${h.color}12` },
                      ]}
                    >
                      {selected && (
                        <View style={[styles.checkBadge, { backgroundColor: h.color }]}>
                          <Ionicons name="checkmark" size={10} color="#fff" />
                        </View>
                      )}
                      <View style={[styles.badHabitIconWrap, { backgroundColor: `${h.color}18` }]}>
                        <Ionicons name={h.icon as any} size={22} color={selected ? h.color : C.textMuted} />
                      </View>
                      <Text style={[styles.badHabitLabel, selected && { color: C.text }]} numberOfLines={2}>
                        {h.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              {badHabits.length > 1 && (
                <Text style={styles.selectedCount}>
                  {badHabits.length} habits selected
                </Text>
              )}
            </Animated.View>
          )}

          {/* Step 1: Daily spend */}
          {step === 1 && (
            <Animated.View entering={FadeInDown.duration(400)} exiting={FadeOut}>
              <Text style={styles.stepLabel}>Step 2 of {TOTAL_STEPS}</Text>
              <Text style={styles.heading}>What do you{"\n"}spend per day?</Text>
              <Text style={styles.subheading}>
                We'll show you exactly what you're saving.
              </Text>
              <View style={styles.inputRow}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.input}
                  value={dailySpend}
                  onChangeText={(v) => setDailySpend(v.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1"))}
                  placeholder="0.00"
                  placeholderTextColor={C.textDim}
                  keyboardType="decimal-pad"
                  autoFocus
                  returnKeyType="done"
                />
              </View>
              <Text style={styles.hint}>
                Across all your habits combined.
              </Text>
            </Animated.View>
          )}

          {/* Step 2: Biggest trigger */}
          {step === 2 && (
            <Animated.View entering={FadeInDown.duration(400)} exiting={FadeOut}>
              <Text style={styles.stepLabel}>Step 3 of {TOTAL_STEPS}</Text>
              <Text style={styles.heading}>What's your{"\n"}biggest trigger?</Text>
              <Text style={styles.subheading}>When do urges usually hit?</Text>
              <View style={styles.triggerGrid}>
                {TRIGGERS.map((t) => (
                  <Pressable
                    key={t.value}
                    onPress={() => {
                      setBiggestTrigger(t.value);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={[
                      styles.triggerChip,
                      biggestTrigger === t.value && styles.triggerChipActive,
                    ]}
                  >
                    <Ionicons
                      name={t.icon as any}
                      size={18}
                      color={biggestTrigger === t.value ? C.primary : C.textMuted}
                    />
                    <Text style={[styles.triggerLabel, biggestTrigger === t.value && { color: C.text }]}>
                      {t.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={[styles.stepLabel, { marginTop: 32 }]}>Emergency contact (optional)</Text>
              <TextInput
                style={styles.fieldInput}
                value={contactName}
                onChangeText={setContactName}
                placeholder="Their name"
                placeholderTextColor={C.textDim}
                returnKeyType="next"
              />
              <TextInput
                style={[styles.fieldInput, { marginTop: 12 }]}
                value={contactPhone}
                onChangeText={setContactPhone}
                placeholder="Their phone number"
                placeholderTextColor={C.textDim}
                keyboardType="phone-pad"
                returnKeyType="done"
              />
            </Animated.View>
          )}

          {/* Step 3: Why quit */}
          {step === 3 && (
            <Animated.View entering={FadeInDown.duration(400)} exiting={FadeOut}>
              <Text style={styles.stepLabel}>Step 4 of {TOTAL_STEPS}</Text>
              <Text style={styles.heading}>Why are you{"\n"}doing this?</Text>
              <Text style={styles.subheading}>We'll remind you when things get hard.</Text>
              <TextInput
                style={styles.textArea}
                value={quitReason}
                onChangeText={setQuitReason}
                placeholder="For my kids. For my health. For myself."
                placeholderTextColor={C.textDim}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                autoFocus
              />
            </Animated.View>
          )}

          {/* Step 4: Bad habit summary */}
          {step === 4 && (
            <Animated.View entering={FadeInDown.duration(400)} exiting={FadeOut}>
              <Text style={styles.stepLabel}>Step 5 of {TOTAL_STEPS}</Text>
              <Text style={styles.heading}>Your{"\n"}commitment.</Text>
              <Text style={styles.subheading}>Here's what you're walking away from.</Text>
              <View style={styles.commitmentList}>
                {badHabits.map((hv) => {
                  const h = BAD_HABITS.find((x) => x.value === hv)!;
                  return (
                    <View key={hv} style={[styles.commitmentRow, { borderColor: `${h.color}30` }]}>
                      <View style={[styles.commitmentIcon, { backgroundColor: `${h.color}20` }]}>
                        <Ionicons name={h.icon as any} size={20} color={h.color} />
                      </View>
                      <Text style={styles.commitmentLabel}>{h.label}</Text>
                      <Ionicons name="close-circle" size={18} color={h.color} />
                    </View>
                  );
                })}
              </View>
              {quitReason ? (
                <View style={styles.reasonPreview}>
                  <Ionicons name="heart" size={16} color={C.accent} />
                  <Text style={styles.reasonPreviewText}>{quitReason}</Text>
                </View>
              ) : null}
            </Animated.View>
          )}

          {/* Step 5: Ready */}
          {step === 5 && (
            <Animated.View entering={FadeInDown.duration(400)} style={styles.readyContainer}>
              <View style={styles.readyGlow}>
                <Ionicons name="checkmark-circle" size={72} color={C.success} />
              </View>
              <Text style={styles.readyHeading}>You're ready.</Text>
              <Text style={styles.readySubheading}>
                When a craving hits, this app gets you through the next 90 seconds.
              </Text>
              {quitReason ? (
                <Text style={[styles.subheading, { marginTop: 16, textAlign: "center" }]}>
                  "{quitReason}"
                </Text>
              ) : null}
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* CTA */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 + (Platform.OS === "web" ? 34 : 0) }]}>
        <Pressable
          onPress={step < 5 ? goNext : finish}
          disabled={!canProceed()}
          style={({ pressed }) => [
            styles.cta,
            pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
            !canProceed() && { opacity: 0.4 },
          ]}
        >
          <LinearGradient
            colors={["#3D8A82", "#2F6F68"]}
            style={styles.ctaGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.ctaText}>{step === 5 ? "Let's go" : "Continue"}</Text>
            <Ionicons name={step === 5 ? "flame" : "arrow-forward"} size={20} color={C.text} />
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 12,
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  progressTrack: { flex: 1, height: 3, backgroundColor: C.border, borderRadius: 99, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: C.primary, borderRadius: 99 },
  stepCounter: { fontFamily: "Inter_400Regular", fontSize: 12, color: C.textDim, width: 32, textAlign: "right" },
  content: { paddingHorizontal: 24, paddingTop: 28 },
  stepLabel: {
    fontFamily: "Inter_500Medium", fontSize: 13, color: C.textMuted,
    letterSpacing: 0.5, marginBottom: 12, textTransform: "uppercase",
  },
  heading: { fontFamily: "Inter_700Bold", fontSize: 36, color: C.text, lineHeight: 44, marginBottom: 12 },
  subheading: { fontFamily: "Inter_400Regular", fontSize: 17, color: C.textMuted, lineHeight: 26, marginBottom: 28 },
  badHabitGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  badHabitCard: {
    width: "30%",
    flexGrow: 1,
    backgroundColor: C.surface,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 10,
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: C.border,
    position: "relative",
  },
  badHabitIconWrap: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  badHabitLabel: {
    fontFamily: "Inter_500Medium", fontSize: 12, color: C.textMuted,
    textAlign: "center", lineHeight: 16,
  },
  checkBadge: {
    position: "absolute", top: 6, right: 6,
    width: 18, height: 18, borderRadius: 9,
    alignItems: "center", justifyContent: "center",
  },
  selectedCount: { fontFamily: "Inter_400Regular", fontSize: 13, color: C.primary, textAlign: "center", marginTop: 16 },
  inputRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: C.surface, borderRadius: 20,
    borderWidth: 1.5, borderColor: C.border,
    paddingHorizontal: 20, marginBottom: 12,
  },
  currencySymbol: { fontFamily: "Inter_600SemiBold", fontSize: 28, color: C.accent, marginRight: 8 },
  input: { flex: 1, fontFamily: "Inter_600SemiBold", fontSize: 36, color: C.text, paddingVertical: 20 },
  hint: { fontFamily: "Inter_400Regular", fontSize: 14, color: C.textDim, textAlign: "center" },
  triggerGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 8 },
  triggerChip: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: C.surface, borderRadius: 99,
    paddingVertical: 10, paddingHorizontal: 16,
    borderWidth: 1.5, borderColor: C.border,
  },
  triggerChipActive: { borderColor: C.primary, backgroundColor: "rgba(47,111,104,0.12)" },
  triggerLabel: { fontFamily: "Inter_500Medium", fontSize: 14, color: C.textMuted },
  fieldInput: {
    backgroundColor: C.surface, borderRadius: 16, borderWidth: 1.5,
    borderColor: C.border, paddingHorizontal: 20, paddingVertical: 16,
    fontFamily: "Inter_400Regular", fontSize: 16, color: C.text,
  },
  textArea: {
    backgroundColor: C.surface, borderRadius: 20, borderWidth: 1.5,
    borderColor: C.border, paddingHorizontal: 20, paddingVertical: 18,
    fontFamily: "Inter_400Regular", fontSize: 18, color: C.text,
    minHeight: 140, lineHeight: 28,
  },
  commitmentList: { gap: 10 },
  commitmentRow: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: C.surface, borderRadius: 18,
    padding: 16, borderWidth: 1,
  },
  commitmentIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  commitmentLabel: { flex: 1, fontFamily: "Inter_600SemiBold", fontSize: 15, color: C.text },
  reasonPreview: {
    flexDirection: "row", gap: 10, alignItems: "flex-start",
    backgroundColor: C.surface, borderRadius: 16,
    padding: 16, marginTop: 16, borderWidth: 1, borderColor: `${C.accent}30`,
  },
  reasonPreviewText: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 14, color: C.textMuted, fontStyle: "italic", lineHeight: 20 },
  readyContainer: { alignItems: "center", paddingTop: 40, gap: 16 },
  readyGlow: { marginBottom: 8 },
  readyHeading: { fontFamily: "Inter_700Bold", fontSize: 44, color: C.text, textAlign: "center" },
  readySubheading: { fontFamily: "Inter_400Regular", fontSize: 20, color: C.textMuted, textAlign: "center", lineHeight: 30, paddingHorizontal: 8 },
  footer: { paddingHorizontal: 24, paddingTop: 12, backgroundColor: C.background },
  cta: { borderRadius: 24, overflow: "hidden" },
  ctaGradient: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 20, gap: 10 },
  ctaText: { fontFamily: "Inter_600SemiBold", fontSize: 18, color: C.text },
});
