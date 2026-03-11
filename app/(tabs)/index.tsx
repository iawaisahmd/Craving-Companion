import React, { useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { useThemeColors } from "@/context/ThemeContext";
import { useApp } from "@/context/AppContext";
import { ColorTheme } from "@/constants/colors";

const { width } = Dimensions.get("window");

function BreathingGlow({ size = 220 }: { size?: number }) {
  const C = useThemeColors();
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 4000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
  }, []);

  const ring1 = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.1, 0.25]),
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.15]) }],
  }));
  const ring2 = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.15, 0.35]),
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.08]) }],
  }));
  const ring3 = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.9, 1]),
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.03]) }],
  }));

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Animated.View style={[{ position: "absolute", width: size, height: size, borderRadius: size / 2, backgroundColor: C.primary }, ring1]} />
      <Animated.View style={[{ position: "absolute", width: size * 0.82, height: size * 0.82, borderRadius: (size * 0.82) / 2, backgroundColor: C.primary }, ring2]} />
      <Animated.View style={[{ width: size * 0.65, height: size * 0.65, borderRadius: (size * 0.65) / 2, backgroundColor: C.primary, alignItems: "center", justifyContent: "center" }, ring3]}>
        <Ionicons name="flash" size={44} color="#FFFFFF" />
        <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 15, color: "#FFFFFF", marginTop: 4, textAlign: "center" }}>
          I have an urge
        </Text>
      </Animated.View>
    </View>
  );
}

function makeStyles(C: ColorTheme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.background },
    scrollContent: { paddingHorizontal: 24 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40 },
    greeting: { fontFamily: "Inter_400Regular", fontSize: 15, color: C.textMuted, marginBottom: 4 },
    name: { fontFamily: "Inter_700Bold", fontSize: 24, color: C.text, lineHeight: 30 },
    logBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.surface, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.border },
    panicSection: { alignItems: "center", marginBottom: 44, gap: 20 },
    panicHint: { fontFamily: "Inter_400Regular", fontSize: 14, color: C.textMuted, textAlign: "center", lineHeight: 21, paddingHorizontal: 32 },
    statsGrid: { flexDirection: "row", gap: 12, marginBottom: 20 },
    statCard: { flex: 1, backgroundColor: C.surface, borderRadius: 20, padding: 16, alignItems: "center", gap: 8, borderWidth: 1, borderColor: C.border },
    statIconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
    statValue: { fontFamily: "Inter_700Bold", fontSize: 20, color: C.text },
    statLabel: { fontFamily: "Inter_400Regular", fontSize: 12, color: C.textMuted },
    reasonCard: { flexDirection: "row", alignItems: "flex-start", gap: 12, backgroundColor: C.surface, borderRadius: 20, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: `${C.accent}30` },
    reasonText: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 15, color: C.textMuted, lineHeight: 22, fontStyle: "italic" },
    sosCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: C.surface, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: `${C.warning}25` },
    sosLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
    sosIconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: `${C.warning}18`, alignItems: "center", justifyContent: "center" },
    sosTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: C.text, marginBottom: 2 },
    sosDesc: { fontFamily: "Inter_400Regular", fontSize: 13, color: C.textMuted },
  });
}

export default function HomeScreen() {
  const C = useThemeColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const { profile, getDaysSmokeeFree, getMoneySaved, getCravingsResisted } = useApp();

  const days = getDaysSmokeeFree();
  const money = getMoneySaved();
  const resisted = getCravingsResisted();

  const handleUrge = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    router.push("/rescue");
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning.";
    if (h < 17) return "Good afternoon.";
    return "Good evening.";
  };

  const formatMoney = (n: number) => n < 1000 ? `$${n.toFixed(0)}` : `$${(n / 1000).toFixed(1)}k`;
  const formatDays = (d: number) => d === 0 ? "Today" : d === 1 ? "1 day" : `${d} days`;

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === "web" ? insets.top + 67 : 0 }]}>
      <LinearGradient
        colors={[C.primaryGlow, "transparent"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.4 }}
        pointerEvents="none"
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: Platform.OS === "web" ? 16 : insets.top + 20, paddingBottom: Platform.OS === "web" ? 34 + 84 : 100 }]}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.name}>{days === 0 ? "Day one. Let's do this." : `Day ${days}. Keep going.`}</Text>
          </View>
          <Pressable onPress={() => router.push("/log-trigger")} style={styles.logBtn}>
            <Ionicons name="add" size={22} color={C.textMuted} />
          </Pressable>
        </View>

        <View style={styles.panicSection}>
          <Pressable onPress={handleUrge} testID="urge-button">
            <BreathingGlow size={220} />
          </Pressable>
          <Text style={styles.panicHint}>Craving hit? Tap and stay with me for 90 seconds.</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { borderColor: `${C.success}30` }]}>
            <View style={[styles.statIconWrap, { backgroundColor: `${C.success}18` }]}>
              <Ionicons name="cash" size={20} color={C.success} />
            </View>
            <Text style={styles.statValue}>{formatMoney(money)}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>
          <View style={[styles.statCard, { borderColor: `${C.secondary}30` }]}>
            <View style={[styles.statIconWrap, { backgroundColor: `${C.secondary}18` }]}>
              <Ionicons name="calendar" size={20} color={C.secondary} />
            </View>
            <Text style={styles.statValue}>{formatDays(days)}</Text>
            <Text style={styles.statLabel}>Smoke-free</Text>
          </View>
          <View style={[styles.statCard, { borderColor: `${C.accent}30` }]}>
            <View style={[styles.statIconWrap, { backgroundColor: `${C.accent}18` }]}>
              <Ionicons name="shield-checkmark" size={20} color={C.accent} />
            </View>
            <Text style={styles.statValue}>{`${resisted}`}</Text>
            <Text style={styles.statLabel}>Resisted</Text>
          </View>
        </View>

        {profile?.quitReason ? (
          <View style={styles.reasonCard}>
            <Ionicons name="heart" size={18} color={C.accent} />
            <Text style={styles.reasonText}>{profile.quitReason}</Text>
          </View>
        ) : null}

        {(() => {
          const contacts = profile?.contacts || [];
          const firstName = contacts[0]?.name || profile?.contactName;
          return firstName ? (
            <Pressable style={styles.sosCard} onPress={() => router.push("/rescue")}>
              <View style={styles.sosLeft}>
                <View style={styles.sosIconWrap}>
                  <Ionicons name="flash" size={20} color={C.warning} />
                </View>
                <View>
                  <Text style={styles.sosTitle}>Quick SOS</Text>
                  <Text style={styles.sosDesc}>Start rescue · text {firstName}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={C.textMuted} />
            </Pressable>
          ) : null;
        })()}
      </ScrollView>
    </View>
  );
}
