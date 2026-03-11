import React, { useMemo, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  TextInput, Switch, Alert, Platform, Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeColors, useTheme } from "@/context/ThemeContext";
import { useApp, EmergencyContact } from "@/context/AppContext";
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
    contactCard: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: C.surface, padding: 16, borderRadius: 16, marginBottom: 2, borderWidth: 1, borderColor: C.border },
    contactIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: `${C.primary}18`, alignItems: "center", justifyContent: "center" },
    contactContent: { flex: 1, gap: 2 },
    contactName: { fontFamily: "Inter_500Medium", fontSize: 15, color: C.text },
    contactPhone: { fontFamily: "Inter_400Regular", fontSize: 13, color: C.textMuted },
    contactRemoveBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: `${C.warning}15`, alignItems: "center", justifyContent: "center" },
    addContactBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: C.surface, borderRadius: 16, paddingVertical: 14, borderWidth: 1.5, borderColor: `${C.primary}40`, borderStyle: "dashed" },
    addContactBtnText: { fontFamily: "Inter_500Medium", fontSize: 15, color: C.primary },
    modalContainer: { flex: 1, backgroundColor: C.background },
    modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 24, paddingBottom: 24 },
    modalTitle: { fontFamily: "Inter_700Bold", fontSize: 22, color: C.text },
    modalClose: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.surface, alignItems: "center", justifyContent: "center" },
    modalLabel: { fontFamily: "Inter_500Medium", fontSize: 13, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 },
    modalInput: { backgroundColor: C.surface, borderRadius: 16, borderWidth: 1.5, borderColor: C.border, paddingHorizontal: 18, paddingVertical: 14, fontFamily: "Inter_400Regular", fontSize: 16, color: C.text },
    modalSaveBtn: { borderRadius: 20, overflow: "hidden" },
    modalSaveBtnGradient: { paddingVertical: 18, alignItems: "center", justifyContent: "center" },
    modalSaveBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 17, color: C.onPrimary },
    emptyContactText: { fontFamily: "Inter_400Regular", fontSize: 14, color: C.textDim, textAlign: "center", paddingVertical: 8 },
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
    <Pressable onPress={onPress} style={({ pressed }) => [styles.settingRow, pressed && onPress && { opacity: 0.7 }]} disabled={!onPress && !rightElement}>
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

function AddContactModal({ visible, onClose, onSave }: {
  visible: boolean; onClose: () => void;
  onSave: (name: string, phone: string) => void;
}) {
  const C = useThemeColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleSave = () => {
    if (!name.trim()) return;
    onSave(name.trim(), phone.trim());
    setName("");
    setPhone("");
    onClose();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet" onRequestClose={onClose}>
      <View style={[styles.modalContainer, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 + (Platform.OS === "web" ? 34 : 0) }]}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Add contact</Text>
          <Pressable onPress={onClose} style={styles.modalClose}>
            <Ionicons name="close" size={22} color={C.textMuted} />
          </Pressable>
        </View>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 20, paddingHorizontal: 24, paddingBottom: 24 }}>
          <View>
            <Text style={styles.modalLabel}>Name</Text>
            <TextInput style={styles.modalInput} value={name} onChangeText={setName} placeholder="Their name" placeholderTextColor={C.textDim} autoFocus returnKeyType="next" />
          </View>
          <View>
            <Text style={styles.modalLabel}>Phone number</Text>
            <TextInput style={styles.modalInput} value={phone} onChangeText={setPhone} placeholder="+1 555 000 0000" placeholderTextColor={C.textDim} keyboardType="phone-pad" returnKeyType="done" />
          </View>
        </ScrollView>
        <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
          <Pressable onPress={handleSave} disabled={!name.trim()} style={({ pressed }) => [styles.modalSaveBtn, pressed && { opacity: 0.85 }, !name.trim() && { opacity: 0.4 }]}>
            <LinearGradient colors={[C.gradStart, C.gradEnd]} style={styles.modalSaveBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={styles.modalSaveBtnText}>Add contact</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </Modal>
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
  const [showAddContact, setShowAddContact] = useState(false);

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

  const handleAddContact = (name: string, phone: string) => {
    if (!profile) return;
    const newContact: EmergencyContact = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name,
      phone,
    };
    const contacts = [...(profile.contacts || []), newContact];
    updateProfile({ contacts });
  };

  const handleRemoveContact = (id: string, name: string) => {
    Alert.alert(`Remove "${name}"?`, "This contact will be removed from your emergency list.", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => {
        if (!profile) return;
        const contacts = (profile.contacts || []).filter((c) => c.id !== id);
        updateProfile({ contacts });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }},
    ]);
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

  const contacts = profile.contacts || [];

  return (
    <ScrollView style={styles.container} contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop, paddingHorizontal: 24, paddingBottom: Platform.OS === "web" ? 34 + 84 : 100, gap: 24 }}>
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

      {/* Emergency contacts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emergency contacts</Text>
        {contacts.length === 0 && (
          <Text style={styles.emptyContactText}>No contacts yet. Add someone you trust.</Text>
        )}
        {contacts.map((contact) => (
          <View key={contact.id} style={styles.contactCard}>
            <View style={styles.contactIconWrap}>
              <Ionicons name="person" size={20} color={C.primary} />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactName}>{contact.name}</Text>
              {contact.phone ? <Text style={styles.contactPhone}>{contact.phone}</Text> : null}
            </View>
            <Pressable onPress={() => handleRemoveContact(contact.id, contact.name)} style={styles.contactRemoveBtn}>
              <Ionicons name="close" size={16} color={C.warning} />
            </Pressable>
          </View>
        ))}
        <Pressable onPress={() => { setShowAddContact(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }} style={({ pressed }) => [styles.addContactBtn, pressed && { opacity: 0.75 }]}>
          <Ionicons name="person-add" size={18} color={C.primary} />
          <Text style={styles.addContactBtnText}>Add contact</Text>
        </Pressable>
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
            onValueChange={() => { toggleTheme(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
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
              onValueChange={(v) => { updateProfile({ hapticsEnabled: v }); if (v) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}
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

      <AddContactModal visible={showAddContact} onClose={() => setShowAddContact(false)} onSave={handleAddContact} />
    </ScrollView>
  );
}
