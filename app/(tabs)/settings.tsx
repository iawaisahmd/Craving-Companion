import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Switch,
  Alert,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors, useTheme } from "@/context/ThemeContext";
import { useApp } from "@/context/AppContext";
import { router } from "expo-router";
import { ColorTheme } from "@/constants/colors";

function makeStyles(C: ColorTheme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.background },
    screenTitle: { fontFamily: "Inter_700Bold", fontSize: 28, color: C.text },
    section: { gap: 2 },
    sectionTitle: { fontFamily: "Inter_500Medium", fontSize: 12, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10, marginLeft: 4 },
    settingRow: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: C.surface, padding: 16, borderRadius: 16, marginBottom: 2, borderWidth: 1, borderColor: C.border },
    settingIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: `${C.primary}18`, alignItems: "center", justifyContent: "center" },
    settingContent: { flex: 1, gap: 2 },
    settingLabel: { fontFamily: "Inter_500Medium", fontSize: 15, color: C.text },
    settingValue: { fontFamily: "Inter_400Regular", fontSize: 13, color: C.textMuted },
    editCard: { backgroundColor: C.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.primary, gap: 12, marginBottom: 2 },
    editInput: { fontFamily: "Inter_400Regular", fontSize: 16, color: C.text, minHeight: 60, textAlignVertical: "top" },
    editInputInline: { flex: 1, fontFamily: "Inter_600SemiBold", fontSize: 24, color: C.text, paddingVertical: 4 },
    inputRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    currencySymbol: { fontFamily: "Inter_600SemiBold", fontSize: 20, color: C.accent },
    editActions: { flexDirection: "row", gap: 10, justifyContent: "flex-end" },
    cancelBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, backgroundColor: C.surfaceElevated },
    cancelBtnText: { fontFamily: "Inter_500Medium", fontSize: 14, color: C.textMuted },
    saveBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 10, backgroundColor: C.primary },
    saveBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: C.onPrimary },
    quitDateCard: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: C.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: `${C.success}25` },
    quitDateText: { fontFamily: "Inter_400Regular", fontSize: 14, color: C.textMuted },
    themeCard: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: C.surface, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: C.border },
    themeIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: `${C.primary}18`, alignItems: "center", justifyContent: "center" },
    themeLabel: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 15, color: C.text },
    themeValue: { fontFamily: "Inter_400Regular", fontSize: 13, color: C.textMuted },
  });
}

function SettingRow({
  icon, label, value, onPress, destructive, rightElement, C,
}: {
  icon: string; label: string; value?: string; onPress?: () => void;
  destructive?: boolean; rightElement?: React.ReactNode; C: ColorTheme;
}) {
  const styles = useMemo(() => makeStyles(C), [C]);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.settingRow, pressed && onPress && { opacity: 0.7 }]}
      disabled={!onPress && !rightElement}
    >
      <View style={[styles.settingIconWrap, destructive && { backgroundColor: `${C.warning}18` }]}>
        <Ionicons name={icon as any} size={20} color={destructive ? C.warning : C.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingLabel, destructive && { color: C.warning }]}>{label}</Text>
        {value ? <Text style={styles.settingValue}>{value}</Text> : null}
      </View>
      {rightElement ?? (onPress ? <Ionicons name="chevron-forward" size={16} color={C.textDim} /> : null)}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const C = useThemeColors();
  const { isDark, toggleTheme } = useTheme();
  const styles = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const { profile, updateProfile, resetData } = useApp();
  const [editing, setEditing] = useState<string | null>(null);
  const [tempVal, setTempVal] = useState("");

  const startEdit = (key: string, current: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditing(key);
    setTempVal(current);
  };

  const saveEdit = async (key: string) => {
    if (!profile) return;
    const updates: any = {};
    if (key === "dailySpend") updates.dailySpend = parseFloat(tempVal) || profile.dailySpend;
    else updates[key] = tempVal;
    await updateProfile(updates);
    setEditing(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleReset = () => {
    Alert.alert("Reset all data", "This will delete your progress, trigger log, and profile. This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Reset", style: "destructive", onPress: async () => {
        await resetData();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        router.replace("/onboarding");
      }},
    ]);
  };

  const paddingTop = Platform.OS === "web" ? insets.top + 67 : insets.top + 16;

  if (!profile) return null;

  return (
    <ScrollView
      style={styles.container}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop, paddingHorizontal: 24, paddingBottom: Platform.OS === "web" ? 34 + 84 : 100, gap: 24 }}
    >
      <Text style={styles.screenTitle}>Settings</Text>

      {/* Your quit */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your quit</Text>

        {editing === "quitReason" ? (
          <View style={styles.editCard}>
            <TextInput style={styles.editInput} value={tempVal} onChangeText={setTempVal} multiline autoFocus placeholder="Why you quit..." placeholderTextColor={C.textDim} />
            <View style={styles.editActions}>
              <Pressable onPress={() => setEditing(null)} style={styles.cancelBtn}><Text style={styles.cancelBtnText}>Cancel</Text></Pressable>
              <Pressable onPress={() => saveEdit("quitReason")} style={styles.saveBtn}><Text style={styles.saveBtnText}>Save</Text></Pressable>
            </View>
          </View>
        ) : (
          <SettingRow C={C} icon="heart" label="Why you quit" value={profile.quitReason || "Not set"} onPress={() => startEdit("quitReason", profile.quitReason)} />
        )}

        {editing === "dailySpend" ? (
          <View style={styles.editCard}>
            <View style={styles.inputRow}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput style={styles.editInputInline} value={tempVal} onChangeText={setTempVal} keyboardType="decimal-pad" autoFocus />
            </View>
            <View style={styles.editActions}>
              <Pressable onPress={() => setEditing(null)} style={styles.cancelBtn}><Text style={styles.cancelBtnText}>Cancel</Text></Pressable>
              <Pressable onPress={() => saveEdit("dailySpend")} style={styles.saveBtn}><Text style={styles.saveBtnText}>Save</Text></Pressable>
            </View>
          </View>
        ) : (
          <SettingRow C={C} icon="cash" label="Daily spend" value={`$${profile.dailySpend}/day`} onPress={() => startEdit("dailySpend", profile.dailySpend.toString())} />
        )}
      </View>

      {/* Emergency contact */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emergency contact</Text>
        {editing === "contactName" ? (
          <View style={styles.editCard}>
            <TextInput style={styles.editInput} value={tempVal} onChangeText={setTempVal} autoFocus placeholder="Their name" placeholderTextColor={C.textDim} />
            <View style={styles.editActions}>
              <Pressable onPress={() => setEditing(null)} style={styles.cancelBtn}><Text style={styles.cancelBtnText}>Cancel</Text></Pressable>
              <Pressable onPress={() => saveEdit("contactName")} style={styles.saveBtn}><Text style={styles.saveBtnText}>Save</Text></Pressable>
            </View>
          </View>
        ) : (
          <SettingRow C={C} icon="person" label="Name" value={profile.contactName || "Not set"} onPress={() => startEdit("contactName", profile.contactName)} />
        )}
        {editing === "contactPhone" ? (
          <View style={styles.editCard}>
            <TextInput style={styles.editInput} value={tempVal} onChangeText={setTempVal} autoFocus keyboardType="phone-pad" placeholder="Phone number" placeholderTextColor={C.textDim} />
            <View style={styles.editActions}>
              <Pressable onPress={() => setEditing(null)} style={styles.cancelBtn}><Text style={styles.cancelBtnText}>Cancel</Text></Pressable>
              <Pressable onPress={() => saveEdit("contactPhone")} style={styles.saveBtn}><Text style={styles.saveBtnText}>Save</Text></Pressable>
            </View>
          </View>
        ) : (
          <SettingRow C={C} icon="call" label="Phone" value={profile.contactPhone || "Not set"} onPress={() => startEdit("contactPhone", profile.contactPhone)} />
        )}
      </View>

      {/* Appearance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.themeCard}>
          <View style={styles.themeIconWrap}>
            <Ionicons name={isDark ? "moon" : "sunny"} size={20} color={C.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.themeLabel}>{isDark ? "Dark theme" : "Light theme"}</Text>
            <Text style={styles.themeValue}>{isDark ? "Easy on the eyes at night" : "Bright and calm"}</Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={() => {
              toggleTheme();
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            trackColor={{ false: C.surfaceElevated, true: C.primary }}
            thumbColor={isDark ? C.background : "#FFFFFF"}
          />
        </View>
      </View>

      {/* Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <SettingRow
          C={C}
          icon="phone-portrait"
          label="Haptic feedback"
          rightElement={
            <Switch
              value={profile.hapticsEnabled}
              onValueChange={(v) => {
                updateProfile({ hapticsEnabled: v });
                if (v) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
              trackColor={{ false: C.surfaceElevated, true: C.primary }}
              thumbColor={profile.hapticsEnabled ? C.background : "#FFFFFF"}
            />
          }
        />
      </View>

      {/* Danger zone */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: C.warning }]}>Danger zone</Text>
        <SettingRow C={C} icon="trash" label="Reset all data" onPress={handleReset} destructive />
      </View>

      <View style={styles.quitDateCard}>
        <Ionicons name="flag" size={18} color={C.success} />
        <Text style={styles.quitDateText}>
          Quit date:{" "}
          {profile.quitDate
            ? new Date(profile.quitDate).toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" })
            : "Not set"}
        </Text>
      </View>
    </ScrollView>
  );
}
