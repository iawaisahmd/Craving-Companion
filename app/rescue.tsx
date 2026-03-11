import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Linking,
  Alert,
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
  runOnJS,
} from "react-native-reanimated";
import { C } from "@/constants/colors";
import { useApp } from "@/context/AppContext";

const { width, height } = Dimensions.get("window");
const TOTAL_SECONDS = 90;

type Phase = "rate-before" | "rescue" | "rate-after" | "done";
type Intervention = "breathe" | "distract" | "text";

const DISTRACTIONS = [
  "Count every blue object in the room.",
  "Do 10 jumping jacks right now.",
  "Text a friend — not about this.",
  "Drink a full glass of cold water.",
  "Name 5 things you can see.",
  "Take a 60-second walk.",
  "Squeeze your hands tight, then release.",
];

function IntensitySelector({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  return (
    <View style={styles.intensityWrap}>
      <Text style={styles.intensityLabel}>{label}</Text>
      <View style={styles.intensityRow}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <Pressable
            key={n}
            onPress={() => {
              onChange(n);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={[
              styles.dot,
              n <= value && {
                backgroundColor:
                  value <= 3 ? C.success : value <= 6 ? C.accent : C.warning,
              },
            ]}
          />
        ))}
      </View>
      <Text style={styles.intensityNum}>{value}/10</Text>
    </View>
  );
}

function BreathingCircle({ phase }: { phase: "inhale" | "hold" | "exhale" }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    if (phase === "inhale") {
      scale.value = withTiming(1.4, { duration: 4000, easing: Easing.inOut(Easing.ease) });
      opacity.value = withTiming(1, { duration: 4000 });
    } else if (phase === "hold") {
      scale.value = withTiming(1.4, { duration: 1500 });
      opacity.value = withTiming(0.9, { duration: 1500 });
    } else {
      scale.value = withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) });
      opacity.value = withTiming(0.5, { duration: 4000 });
    }
  }, [phase]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.breathCircleOuter}>
      <Animated.View style={[styles.breathCircle, animStyle]}>
        <LinearGradient
          colors={["#9B80FF", "#6E56CF"]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>
      <Text style={styles.breathPhaseText}>
        {phase === "inhale" ? "Breathe in" : phase === "hold" ? "Hold" : "Breathe out"}
      </Text>
    </View>
  );
}

export default function RescueScreen() {
  const insets = useSafeAreaInsets();
  const { profile, addRescueSession } = useApp();

  const [phase, setPhase] = useState<Phase>("rate-before");
  const [intensityBefore, setIntensityBefore] = useState(7);
  const [intensityAfter, setIntensityAfter] = useState(3);
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [intervention, setIntervention] = useState<Intervention>("breathe");
  const [breathPhase, setBreathPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [distraction] = useState(
    DISTRACTIONS[Math.floor(Math.random() * DISTRACTIONS.length)]
  );
  const [resisted, setResisted] = useState(true);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const breathRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const progress = useSharedValue(1);

  const startTimer = useCallback(() => {
    progress.value = withTiming(0, {
      duration: TOTAL_SECONDS * 1000,
      easing: Easing.linear,
    });
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setPhase("rate-after");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, []);

  const runBreathCycle = useCallback(() => {
    setBreathPhase("inhale");
    breathRef.current = setTimeout(() => {
      setBreathPhase("hold");
      breathRef.current = setTimeout(() => {
        setBreathPhase("exhale");
        breathRef.current = setTimeout(() => {
          runBreathCycle();
        }, 4000);
      }, 1500);
    }, 4000);
  }, []);

  useEffect(() => {
    if (phase === "rescue") {
      startTimer();
      if (intervention === "breathe") runBreathCycle();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (breathRef.current) clearTimeout(breathRef.current);
    };
  }, [phase, intervention]);

  const timerBarStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const handleTextContact = () => {
    if (!profile?.contactPhone) {
      Alert.alert("No contact set", "Add an emergency contact in Settings.");
      return;
    }
    const msg = encodeURIComponent(
      `Hey ${profile.contactName} — I'm having a craving moment. Just need someone to know. I'm okay.`
    );
    Linking.openURL(
      Platform.OS === "ios"
        ? `sms:${profile.contactPhone}&body=${msg}`
        : `sms:${profile.contactPhone}?body=${msg}`
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleDone = async (didResist: boolean) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await addRescueSession({
      intensityBefore,
      intensityAfter: didResist ? intensityAfter : intensityBefore,
      interventionUsed: intervention,
      resisted: didResist,
    });
    setResisted(didResist);
    setPhase("done");
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const paddingTop = Platform.OS === "web" ? insets.top + 67 : insets.top + 16;
  const paddingBottom = Platform.OS === "web" ? insets.bottom + 34 + 20 : insets.bottom + 20;

  if (phase === "rate-before") {
    return (
      <View style={[styles.container, { paddingTop, paddingBottom }]}>
        <LinearGradient
          colors={["rgba(240,138,93,0.12)", "transparent"]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.5 }}
          pointerEvents="none"
        />
        <Pressable onPress={() => router.back()} style={[styles.closeBtn, { top: paddingTop }]}>
          <Ionicons name="close" size={24} color={C.textMuted} />
        </Pressable>

        <View style={styles.center}>
          <Text style={styles.bigLabel}>Craving hit?</Text>
          <Text style={styles.bigHeading}>Stay with me{"\n"}for 90 seconds.</Text>
          <Text style={styles.bodyText}>
            Rate your urge right now.
          </Text>
          <IntensitySelector
            value={intensityBefore}
            onChange={setIntensityBefore}
            label="How strong is the urge?"
          />
        </View>

        <View style={styles.interventionPicker}>
          <Text style={styles.sectionLabel}>What should we do?</Text>
          <View style={styles.interventionRow}>
            {(["breathe", "distract", "text"] as Intervention[]).map((i) => (
              <Pressable
                key={i}
                onPress={() => {
                  setIntervention(i);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={[
                  styles.interventionChip,
                  intervention === i && styles.interventionChipActive,
                ]}
              >
                <Ionicons
                  name={
                    i === "breathe"
                      ? "leaf"
                      : i === "distract"
                      ? "game-controller"
                      : "chatbubble"
                  }
                  size={20}
                  color={intervention === i ? C.primary : C.textMuted}
                />
                <Text
                  style={[
                    styles.interventionLabel,
                    intervention === i && { color: C.text },
                  ]}
                >
                  {i === "breathe" ? "Breathe" : i === "distract" ? "Distract" : "Text someone"}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable
          onPress={() => setPhase("rescue")}
          style={({ pressed }) => [
            styles.startBtn,
            pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
          ]}
        >
          <LinearGradient
            colors={["#7B66D9", "#6E56CF"]}
            style={styles.startBtnGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.startBtnText}>Start rescue</Text>
            <Ionicons name="arrow-forward" size={20} color={C.text} />
          </LinearGradient>
        </Pressable>
      </View>
    );
  }

  if (phase === "rescue") {
    return (
      <View style={[styles.container, { paddingTop, paddingBottom }]}>
        <LinearGradient
          colors={["rgba(110,86,207,0.15)", "transparent"]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.5 }}
          pointerEvents="none"
        />

        {/* Timer bar */}
        <View style={styles.timerBar}>
          <Animated.View style={[styles.timerFill, timerBarStyle]} />
        </View>

        <Text style={styles.timerDisplay}>{formatTime(secondsLeft)}</Text>
        <Text style={styles.timerHint}>You do not need to win the whole week. Just this moment.</Text>

        <View style={styles.rescueContent}>
          {intervention === "breathe" && (
            <BreathingCircle phase={breathPhase} />
          )}

          {intervention === "distract" && (
            <View style={styles.distractCard}>
              <Ionicons name="bulb" size={36} color={C.accent} />
              <Text style={styles.distractText}>{distraction}</Text>
            </View>
          )}

          {intervention === "text" && (
            <View style={styles.textCard}>
              <Text style={styles.textCardTitle}>
                {profile?.contactName
                  ? `Text ${profile.contactName}`
                  : "Text someone you trust"}
              </Text>
              <Text style={styles.textCardBody}>
                Let them know you're having a moment. You don't have to explain.
              </Text>
              <Pressable onPress={handleTextContact} style={styles.textBtn}>
                <Ionicons name="chatbubble" size={20} color={C.text} />
                <Text style={styles.textBtnLabel}>
                  {profile?.contactName ? `Message ${profile.contactName}` : "Open Messages"}
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        <Text style={styles.breathLabel}>
          {intervention === "breathe" &&
            (breathPhase === "inhale"
              ? "4 seconds in"
              : breathPhase === "hold"
              ? "Hold it"
              : "4 seconds out")}
        </Text>
      </View>
    );
  }

  if (phase === "rate-after") {
    return (
      <View style={[styles.container, { paddingTop, paddingBottom }]}>
        <LinearGradient
          colors={["rgba(95,203,139,0.12)", "transparent"]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.5 }}
          pointerEvents="none"
        />

        <View style={styles.center}>
          <Ionicons name="checkmark-circle" size={56} color={C.success} style={{ marginBottom: 12 }} />
          <Text style={styles.bigLabel}>That wave passed.</Text>
          <Text style={styles.bigHeading}>How do you{"\n"}feel now?</Text>
          <IntensitySelector
            value={intensityAfter}
            onChange={setIntensityAfter}
            label="Urge strength now"
          />
        </View>

        <View style={styles.afterButtons}>
          <Pressable
            onPress={() => handleDone(true)}
            style={({ pressed }) => [
              styles.afterBtn,
              styles.afterBtnSuccess,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Ionicons name="shield-checkmark" size={22} color={C.text} />
            <Text style={styles.afterBtnText}>I resisted</Text>
          </Pressable>
          <Pressable
            onPress={() => handleDone(false)}
            style={({ pressed }) => [
              styles.afterBtn,
              styles.afterBtnNeutral,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Ionicons name="refresh" size={22} color={C.textMuted} />
            <Text style={[styles.afterBtnText, { color: C.textMuted }]}>
              I slipped
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // done
  return (
    <View style={[styles.container, { paddingTop, paddingBottom }]}>
      <LinearGradient
        colors={
          resisted
            ? ["rgba(95,203,139,0.15)", "transparent"]
            : ["rgba(240,138,93,0.12)", "transparent"]
        }
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
        pointerEvents="none"
      />

      <View style={styles.center}>
        <Ionicons
          name={resisted ? "trophy" : "heart"}
          size={72}
          color={resisted ? C.accent : C.warning}
          style={{ marginBottom: 16 }}
        />
        <Text style={styles.bigHeading}>
          {resisted ? "Good." : "You are not starting over."}
        </Text>
        <Text style={styles.bodyText}>
          {resisted
            ? "That wave passed. You proved something to yourself today."
            : "You are continuing. Every moment is a new chance."}
        </Text>

        {intensityBefore > intensityAfter && (
          <View style={styles.diffCard}>
            <Text style={styles.diffText}>
              Urge dropped from{" "}
              <Text style={{ color: C.warning }}>{intensityBefore}</Text> to{" "}
              <Text style={{ color: C.success }}>{intensityAfter}</Text>
            </Text>
          </View>
        )}
      </View>

      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [
          styles.startBtn,
          pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
        ]}
      >
        <LinearGradient
          colors={resisted ? ["#5FCB8B", "#3eaa6f"] : ["#7B66D9", "#6E56CF"]}
          style={styles.startBtnGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.startBtnText}>Back home</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
    paddingHorizontal: 28,
    justifyContent: "space-between",
  },
  closeBtn: {
    position: "absolute",
    right: 24,
    zIndex: 10,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.surface,
    borderRadius: 22,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  bigLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    color: C.textMuted,
    textAlign: "center",
  },
  bigHeading: {
    fontFamily: "Inter_700Bold",
    fontSize: 38,
    color: C.text,
    textAlign: "center",
    lineHeight: 46,
  },
  bodyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 17,
    color: C.textMuted,
    textAlign: "center",
    lineHeight: 26,
    marginTop: 4,
    maxWidth: 300,
  },
  intensityWrap: {
    width: "100%",
    alignItems: "center",
    gap: 16,
    marginTop: 20,
  },
  intensityLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  intensityRow: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.surfaceElevated,
    borderWidth: 1,
    borderColor: C.border,
  },
  intensityNum: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    color: C.text,
  },
  interventionPicker: {
    gap: 14,
  },
  sectionLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  interventionRow: {
    flexDirection: "row",
    gap: 10,
  },
  interventionChip: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    paddingVertical: 16,
    backgroundColor: C.surface,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  interventionChipActive: {
    borderColor: C.primary,
    backgroundColor: "rgba(110,86,207,0.12)",
  },
  interventionLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: C.textMuted,
    textAlign: "center",
  },
  startBtn: {
    borderRadius: 24,
    overflow: "hidden",
  },
  startBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    gap: 10,
  },
  startBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: C.text,
  },
  timerBar: {
    height: 4,
    backgroundColor: C.surface,
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 24,
  },
  timerFill: {
    height: "100%",
    backgroundColor: C.primary,
    borderRadius: 2,
  },
  timerDisplay: {
    fontFamily: "Inter_700Bold",
    fontSize: 64,
    color: C.text,
    textAlign: "center",
    letterSpacing: -2,
  },
  timerHint: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: C.textMuted,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  rescueContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  breathCircleOuter: {
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  breathCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    overflow: "hidden",
  },
  breathPhaseText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 22,
    color: C.text,
    textAlign: "center",
  },
  breathLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: C.textMuted,
    textAlign: "center",
    minHeight: 24,
    marginBottom: 8,
  },
  distractCard: {
    backgroundColor: C.surface,
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    gap: 20,
    borderWidth: 1,
    borderColor: `${C.accent}30`,
    maxWidth: 320,
  },
  distractText: {
    fontFamily: "Inter_500Medium",
    fontSize: 22,
    color: C.text,
    textAlign: "center",
    lineHeight: 32,
  },
  textCard: {
    backgroundColor: C.surface,
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    gap: 16,
    borderWidth: 1,
    borderColor: `${C.secondary}30`,
    maxWidth: 320,
  },
  textCardTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: C.text,
    textAlign: "center",
  },
  textCardBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: C.textMuted,
    textAlign: "center",
    lineHeight: 24,
  },
  textBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: C.secondary,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 14,
    marginTop: 8,
  },
  textBtnLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: C.text,
  },
  afterButtons: {
    flexDirection: "row",
    gap: 12,
  },
  afterBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
    borderRadius: 24,
  },
  afterBtnSuccess: {
    backgroundColor: C.success,
  },
  afterBtnNeutral: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  afterBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: C.text,
  },
  diffCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: `${C.success}30`,
  },
  diffText: {
    fontFamily: "Inter_500Medium",
    fontSize: 17,
    color: C.text,
    textAlign: "center",
  },
});
