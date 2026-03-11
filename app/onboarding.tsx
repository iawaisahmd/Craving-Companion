import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { C } from "@/constants/colors";
import { useApp, QuitType, TriggerType } from "@/context/AppContext";
import Animated, {
  FadeInDown,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

const TRIGGERS: { label: string; value: TriggerType; icon: string }[] = [
  { label: "Stress", value: "stress", icon: "flash" },
  { label: "Boredom", value: "boredom", icon: "time" },
  { label: "Social", value: "social", icon: "people" },
  { label: "After meals", value: "after-meal", icon: "restaurant" },
  { label: "Alcohol", value: "alcohol", icon: "wine" },
  { label: "Habit", value: "habit", icon: "repeat" },
  { label: "Other", value: "other", icon: "ellipsis-horizontal" },
];

export default function Onboarding() {
  const insets = useSafeAreaInsets();
  const { saveProfile } = useApp();

  const [step, setStep] = useState(0);
  const [quitType, setQuitType] = useState<QuitType>("cigarettes");
  const [dailySpend, setDailySpend] = useState("");
  const [biggestTrigger, setBiggestTrigger] = useState<TriggerType>("stress");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [quitReason, setQuitReason] = useState("");

  const progress = (step / 4) * 100;

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
      quitType,
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
    if (step === 1) return dailySpend.length > 0;
    if (step === 3) return quitReason.trim().length > 0;
    return true;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) }]}>
      <LinearGradient
        colors={["rgba(110,86,207,0.15)", "transparent"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
      />

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        {step > 0 && (
          <Pressable onPress={goBack} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={C.textMuted} />
          </Pressable>
        )}
        <View style={styles.progressTrack}>
          <Animated.View
            style={[styles.progressFill, { width: `${progress}%` }]}
          />
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 32 + (Platform.OS === "web" ? 34 : 0) },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {step === 0 && (
            <Animated.View entering={FadeInDown.duration(400)} exiting={FadeOut}>
              <Text style={styles.stepLabel}>Let's start</Text>
              <Text style={styles.heading}>What are you{"\n"}quitting?</Text>
              <Text style={styles.subheading}>
                No judgment. Just here to help.
              </Text>
              <View style={styles.choiceRow}>
                {(["cigarettes", "vaping"] as QuitType[]).map((t) => (
                  <Pressable
                    key={t}
                    onPress={() => {
                      setQuitType(t);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={[
                      styles.choiceCard,
                      quitType === t && styles.choiceCardActive,
                    ]}
                  >
                    <Ionicons
                      name={t === "cigarettes" ? "flame" : "cloud"}
                      size={32}
                      color={quitType === t ? C.primary : C.textMuted}
                    />
                    <Text
                      style={[
                        styles.choiceLabel,
                        quitType === t && { color: C.text },
                      ]}
                    >
                      {t === "cigarettes" ? "Cigarettes" : "Vaping"}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </Animated.View>
          )}

          {step === 1 && (
            <Animated.View entering={FadeInDown.duration(400)} exiting={FadeOut}>
              <Text style={styles.stepLabel}>Step 2 of 4</Text>
              <Text style={styles.heading}>How much do you{"\n"}spend per day?</Text>
              <Text style={styles.subheading}>
                We'll show you exactly what you're saving.
              </Text>
              <View style={styles.inputRow}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.input}
                  value={dailySpend}
                  onChangeText={setDailySpend}
                  placeholder="0.00"
                  placeholderTextColor={C.textDim}
                  keyboardType="decimal-pad"
                  autoFocus
                  returnKeyType="done"
                />
              </View>
              <Text style={styles.hint}>
                Average pack costs about $10–$15 a day.
              </Text>
            </Animated.View>
          )}

          {step === 2 && (
            <Animated.View entering={FadeInDown.duration(400)} exiting={FadeOut}>
              <Text style={styles.stepLabel}>Step 3 of 4</Text>
              <Text style={styles.heading}>What's your{"\n"}biggest trigger?</Text>
              <Text style={styles.subheading}>
                Knowing this helps us prepare you.
              </Text>
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
                    <Text
                      style={[
                        styles.triggerLabel,
                        biggestTrigger === t.value && { color: C.text },
                      ]}
                    >
                      {t.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={[styles.stepLabel, { marginTop: 32 }]}>
                Emergency contact (optional)
              </Text>
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

          {step === 3 && (
            <Animated.View entering={FadeInDown.duration(400)} exiting={FadeOut}>
              <Text style={styles.stepLabel}>Step 4 of 4</Text>
              <Text style={styles.heading}>Why are you{"\n"}doing this?</Text>
              <Text style={styles.subheading}>
                We'll remind you when things get hard.
              </Text>
              <TextInput
                style={styles.textArea}
                value={quitReason}
                onChangeText={setQuitReason}
                placeholder="For my kids. For my lungs. For myself."
                placeholderTextColor={C.textDim}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                autoFocus
              />
            </Animated.View>
          )}

          {step === 4 && (
            <Animated.View
              entering={FadeInDown.duration(400)}
              style={styles.readyContainer}
            >
              <View style={styles.readyGlow}>
                <Ionicons name="checkmark-circle" size={72} color={C.success} />
              </View>
              <Text style={styles.readyHeading}>You're ready.</Text>
              <Text style={styles.readySubheading}>
                When a craving hits, this app gets you through the next 90 seconds.
              </Text>
              <Text style={[styles.subheading, { marginTop: 16 }]}>
                {quitReason}
              </Text>
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom CTA */}
      <View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom + 20 + (Platform.OS === "web" ? 34 : 0) },
        ]}
      >
        <Pressable
          onPress={step < 4 ? goNext : finish}
          disabled={!canProceed()}
          style={({ pressed }) => [
            styles.cta,
            pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
            !canProceed() && { opacity: 0.4 },
          ]}
        >
          <LinearGradient
            colors={["#FF9048", "#FF751F"]}
            style={styles.ctaGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.ctaText}>
              {step === 4 ? "Let's go" : "Continue"}
            </Text>
            <Ionicons
              name={step === 4 ? "flame" : "arrow-forward"}
              size={20}
              color={C.text}
            />
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  progressTrack: {
    flex: 1,
    height: 3,
    backgroundColor: C.border,
    borderRadius: 99,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: C.primary,
    borderRadius: 99,
  },
  content: {
    paddingHorizontal: 28,
    paddingTop: 32,
  },
  stepLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: C.textMuted,
    letterSpacing: 0.5,
    marginBottom: 12,
    textTransform: "uppercase",
  },
  heading: {
    fontFamily: "Inter_700Bold",
    fontSize: 36,
    color: C.text,
    lineHeight: 44,
    marginBottom: 12,
  },
  subheading: {
    fontFamily: "Inter_400Regular",
    fontSize: 17,
    color: C.textMuted,
    lineHeight: 26,
    marginBottom: 32,
  },
  choiceRow: {
    flexDirection: "row",
    gap: 16,
  },
  choiceCard: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    gap: 12,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  choiceCardActive: {
    borderColor: C.primary,
    backgroundColor: "rgba(110,86,207,0.12)",
  },
  choiceLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: C.textMuted,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  currencySymbol: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 28,
    color: C.accent,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontFamily: "Inter_600SemiBold",
    fontSize: 36,
    color: C.text,
    paddingVertical: 20,
  },
  hint: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: C.textDim,
    textAlign: "center",
  },
  triggerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 8,
  },
  triggerChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.surface,
    borderRadius: 99,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  triggerChipActive: {
    borderColor: C.primary,
    backgroundColor: "rgba(110,86,207,0.12)",
  },
  triggerLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: C.textMuted,
  },
  fieldInput: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: C.text,
  },
  textArea: {
    backgroundColor: C.surface,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontFamily: "Inter_400Regular",
    fontSize: 18,
    color: C.text,
    minHeight: 140,
    lineHeight: 28,
  },
  readyContainer: {
    alignItems: "center",
    paddingTop: 40,
    gap: 16,
  },
  readyGlow: {
    shadowColor: C.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    marginBottom: 8,
  },
  readyHeading: {
    fontFamily: "Inter_700Bold",
    fontSize: 44,
    color: C.text,
    textAlign: "center",
  },
  readySubheading: {
    fontFamily: "Inter_400Regular",
    fontSize: 20,
    color: C.textMuted,
    textAlign: "center",
    lineHeight: 30,
    paddingHorizontal: 8,
  },
  footer: {
    paddingHorizontal: 28,
    paddingTop: 12,
    backgroundColor: C.background,
  },
  cta: {
    borderRadius: 24,
    overflow: "hidden",
  },
  ctaGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    gap: 10,
  },
  ctaText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: C.text,
  },
});
