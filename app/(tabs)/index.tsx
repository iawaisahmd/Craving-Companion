import React, { useEffect, useRef } from "react";
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
import { C } from "@/constants/colors";
import { useApp } from "@/context/AppContext";

const { width } = Dimensions.get("window");

function BreathingGlow({ size = 220 }: { size?: number }) {
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
      <Animated.View
        style={[
          {
            position: "absolute",
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: C.primary,
          },
          ring1,
        ]}
      />
      <Animated.View
        style={[
          {
            position: "absolute",
            width: size * 0.82,
            height: size * 0.82,
            borderRadius: (size * 0.82) / 2,
            backgroundColor: C.primary,
          },
          ring2,
        ]}
      />
      <Animated.View
        style={[
          {
            width: size * 0.65,
            height: size * 0.65,
            borderRadius: (size * 0.65) / 2,
            backgroundColor: C.primary,
            alignItems: "center",
            justifyContent: "center",
          },
          ring3,
        ]}
      >
        <Ionicons name="flash" size={44} color={C.text} />
        <Text style={styles.urgeBtnText}>I have an urge</Text>
      </Animated.View>
    </View>
  );
}

function StatCard({
  icon,
  value,
  label,
  color = C.primary,
}: {
  icon: string;
  value: string;
  label: string;
  color?: string;
}) {
  return (
    <View style={[styles.statCard, { borderColor: `${color}30` }]}>
      <View style={[styles.statIconWrap, { backgroundColor: `${color}18` }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function HomeScreen() {
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

  const formatMoney = (n: number) => {
    if (n < 1000) return `$${n.toFixed(0)}`;
    return `$${(n / 1000).toFixed(1)}k`;
  };

  const formatDays = (d: number) => {
    if (d === 0) return "Today";
    if (d === 1) return "1 day";
    return `${d} days`;
  };

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === "web" ? insets.top + 67 : 0 }]}>
      <LinearGradient
        colors={["rgba(47,111,104,0.08)", "transparent"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.4 }}
        pointerEvents="none"
      />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Platform.OS === "web" ? 16 : insets.top + 20,
            paddingBottom: Platform.OS === "web" ? 34 + 84 : 100,
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.name}>
              {days === 0
                ? "Day one. Let's do this."
                : `Day ${days}. Keep going.`}
            </Text>
          </View>
          <Pressable
            onPress={() => router.push("/log-trigger")}
            style={styles.logBtn}
          >
            <Ionicons name="add" size={22} color={C.textMuted} />
          </Pressable>
        </View>

        {/* Panic button */}
        <View style={styles.panicSection}>
          <Pressable onPress={handleUrge} testID="urge-button">
            <BreathingGlow size={220} />
          </Pressable>
          <Text style={styles.panicHint}>
            Craving hit? Tap and stay with me for 90 seconds.
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <StatCard
            icon="cash"
            value={formatMoney(money)}
            label="Saved"
            color={C.success}
          />
          <StatCard
            icon="calendar"
            value={formatDays(days)}
            label="Smoke-free"
            color={C.secondary}
          />
          <StatCard
            icon="shield-checkmark"
            value={`${resisted}`}
            label="Resisted"
            color={C.accent}
          />
        </View>

        {/* Reason card */}
        {profile?.quitReason ? (
          <View style={styles.reasonCard}>
            <Ionicons name="heart" size={18} color={C.accent} />
            <Text style={styles.reasonText}>{profile.quitReason}</Text>
          </View>
        ) : null}

        {/* SOS quick */}
        {profile?.contactName ? (
          <Pressable
            style={styles.sosCard}
            onPress={() => router.push("/rescue")}
          >
            <View style={styles.sosLeft}>
              <View style={styles.sosIconWrap}>
                <Ionicons name="flash" size={20} color={C.warning} />
              </View>
              <View>
                <Text style={styles.sosTitle}>Quick SOS</Text>
                <Text style={styles.sosDesc}>
                  Start rescue · text {profile.contactName}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={C.textMuted} />
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 40,
  },
  greeting: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: C.textMuted,
    marginBottom: 4,
  },
  name: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    color: C.text,
    lineHeight: 30,
  },
  logBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  panicSection: {
    alignItems: "center",
    marginBottom: 44,
    gap: 20,
  },
  urgeBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: C.text,
    marginTop: 4,
    textAlign: "center",
  },
  panicHint: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: C.textMuted,
    textAlign: "center",
    lineHeight: 21,
    paddingHorizontal: 32,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: C.text,
  },
  statLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: C.textMuted,
  },
  reasonCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: `${C.accent}30`,
  },
  reasonText: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: C.textMuted,
    lineHeight: 22,
    fontStyle: "italic",
  },
  sosCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: `${C.warning}25`,
  },
  sosLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  sosIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${C.warning}18`,
    alignItems: "center",
    justifyContent: "center",
  },
  sosTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: C.text,
    marginBottom: 2,
  },
  sosDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: C.textMuted,
  },
});
