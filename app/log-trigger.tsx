import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { C } from "@/constants/colors";
import { useApp, TriggerType } from "@/context/AppContext";

const TRIGGERS: { label: string; value: TriggerType; icon: string }[] = [
  { label: "Stress", value: "stress", icon: "flash" },
  { label: "Boredom", value: "boredom", icon: "time" },
  { label: "Social", value: "social", icon: "people" },
  { label: "After meal", value: "after-meal", icon: "restaurant" },
  { label: "Alcohol", value: "alcohol", icon: "wine" },
  { label: "Habit", value: "habit", icon: "repeat" },
  { label: "Other", value: "other", icon: "ellipsis-horizontal" },
];

export default function LogTriggerScreen() {
  const insets = useSafeAreaInsets();
  const { addTriggerEntry } = useApp();

  const [trigger, setTrigger] = useState<TriggerType>("stress");
  const [urgeStrength, setUrgeStrength] = useState(5);
  const [resisted, setResisted] = useState<boolean | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const canSave = resisted !== null;

  const handleSave = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await addTriggerEntry({ trigger, urgeStrength, resisted: resisted!, note });
    router.back();
  };

  const paddingTop = Platform.OS === "web" ? insets.top + 67 : insets.top + 20;

  return (
    <View style={[styles.container, { paddingTop }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Log a trigger</Text>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color={C.textMuted} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: insets.bottom + 100 + (Platform.OS === "web" ? 34 : 0),
          paddingHorizontal: 24,
          gap: 28,
        }}
      >
        {/* Trigger type */}
        <View>
          <Text style={styles.sectionLabel}>What triggered it?</Text>
          <View style={styles.triggerGrid}>
            {TRIGGERS.map((t) => (
              <Pressable
                key={t.value}
                onPress={() => {
                  setTrigger(t.value);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={[
                  styles.triggerChip,
                  trigger === t.value && styles.triggerChipActive,
                ]}
              >
                <Ionicons
                  name={t.icon as any}
                  size={18}
                  color={trigger === t.value ? C.primary : C.textMuted}
                />
                <Text
                  style={[
                    styles.triggerLabel,
                    trigger === t.value && { color: C.text },
                  ]}
                >
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Urge strength */}
        <View>
          <Text style={styles.sectionLabel}>Urge strength: {urgeStrength}/10</Text>
          <View style={styles.dotsRow}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => {
              const color = n <= 3 ? C.success : n <= 6 ? C.accent : C.warning;
              return (
                <Pressable
                  key={n}
                  onPress={() => {
                    setUrgeStrength(n);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={[
                    styles.dot,
                    n <= urgeStrength && { backgroundColor: color },
                  ]}
                />
              );
            })}
          </View>
        </View>

        {/* Did you resist? */}
        <View>
          <Text style={styles.sectionLabel}>Did you resist?</Text>
          <View style={styles.resistRow}>
            <Pressable
              onPress={() => {
                setResisted(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
              style={[
                styles.resistBtn,
                resisted === true && { borderColor: C.success, backgroundColor: `${C.success}15` },
              ]}
            >
              <Ionicons name="shield-checkmark" size={24} color={resisted === true ? C.success : C.textMuted} />
              <Text style={[styles.resistBtnText, resisted === true && { color: C.success }]}>
                Yes
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setResisted(false);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
              style={[
                styles.resistBtn,
                resisted === false && { borderColor: C.warning, backgroundColor: `${C.warning}15` },
              ]}
            >
              <Ionicons name="refresh" size={24} color={resisted === false ? C.warning : C.textMuted} />
              <Text style={[styles.resistBtnText, resisted === false && { color: C.warning }]}>
                No
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Note */}
        <View>
          <Text style={styles.sectionLabel}>Note (optional)</Text>
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="What was happening?"
            placeholderTextColor={C.textDim}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom + 16 + (Platform.OS === "web" ? 34 : 0) },
        ]}
      >
        <Pressable
          onPress={handleSave}
          disabled={!canSave || saving}
          style={({ pressed }) => [
            styles.saveBtn,
            pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
            (!canSave || saving) && { opacity: 0.4 },
          ]}
        >
          <LinearGradient
            colors={["#FF9048", "#FF751F"]}
            style={styles.saveBtnGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.saveBtnText}>Save entry</Text>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    color: C.text,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 14,
  },
  triggerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
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
  dotsRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.surfaceElevated,
    borderWidth: 1,
    borderColor: C.border,
  },
  resistRow: {
    flexDirection: "row",
    gap: 12,
  },
  resistBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: C.surface,
    borderRadius: 20,
    paddingVertical: 18,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  resistBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: C.textMuted,
  },
  noteInput: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: C.text,
    minHeight: 100,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: C.background,
  },
  saveBtn: {
    borderRadius: 20,
    overflow: "hidden",
  },
  saveBtnGradient: {
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 17,
    color: C.text,
  },
});
