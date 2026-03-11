import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Platform,
  Alert,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { C } from "@/constants/colors";
import {
  useApp,
  SUGGESTED_HABITS,
  Habit,
} from "@/context/AppContext";

const HABIT_ICONS = [
  "leaf", "water", "footsteps", "moon", "pencil", "body",
  "nutrition", "call", "barbell", "book", "heart", "bicycle",
  "musical-notes", "brush", "camera", "flower",
];

const HABIT_COLORS = [
  "#5FCB8B", "#2D8CFF", "#FF751F", "#9B80FF",
  "#C8A96B", "#F08A5D", "#FF6B9D", "#00C9B1",
];

function CheckAnimation({ done }: { done: boolean }) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  React.useEffect(() => {
    if (done) {
      scale.value = withSequence(
        withSpring(1.3, { damping: 4 }),
        withSpring(1, { damping: 8 })
      );
    }
  }, [done]);
  return <Animated.View style={style}>{null}</Animated.View>;
}

function HabitCard({
  habit,
  completed,
  streak,
  onToggle,
  onRemove,
}: {
  habit: Habit | typeof SUGGESTED_HABITS[0];
  completed: boolean;
  streak: number;
  onToggle: () => void;
  onRemove?: () => void;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.95, { duration: 80 }),
      withSpring(1, { damping: 6 })
    );
    Haptics.impactAsync(
      completed
        ? Haptics.ImpactFeedbackStyle.Light
        : Haptics.ImpactFeedbackStyle.Medium
    );
    onToggle();
  };

  return (
    <Pressable onPress={handlePress} onLongPress={onRemove}>
      <Animated.View
        style={[
          styles.habitCard,
          completed && { borderColor: `${habit.color}50`, backgroundColor: `${habit.color}08` },
          animStyle,
        ]}
      >
        <View style={[styles.habitIconWrap, { backgroundColor: `${habit.color}20` }]}>
          <Ionicons name={habit.icon as any} size={24} color={habit.color} />
        </View>

        <View style={styles.habitContent}>
          <Text style={[styles.habitName, completed && { color: C.textMuted }]}>
            {habit.name}
          </Text>
          <Text style={styles.habitDesc}>{habit.description}</Text>
          {streak > 1 && (
            <View style={styles.streakRow}>
              <Ionicons name="flame" size={12} color={C.warning} />
              <Text style={styles.streakText}>{streak} day streak</Text>
            </View>
          )}
        </View>

        <View
          style={[
            styles.checkCircle,
            completed && { backgroundColor: habit.color, borderColor: habit.color },
          ]}
        >
          {completed && (
            <Ionicons name="checkmark" size={16} color={C.text} />
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
}

function AddHabitModal({
  visible,
  onClose,
  onAdd,
}: {
  visible: boolean;
  onClose: () => void;
  onAdd: (h: { name: string; description: string; icon: string; color: string }) => void;
}) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("leaf");
  const [selectedColor, setSelectedColor] = useState("#5FCB8B");

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd({ name: name.trim(), description: description.trim(), icon: selectedIcon, color: selectedColor });
    setName("");
    setDescription("");
    setSelectedIcon("leaf");
    setSelectedColor("#5FCB8B");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet" onRequestClose={onClose}>
      <View style={[styles.modalContainer, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 + (Platform.OS === "web" ? 34 : 0) }]}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>New habit</Text>
          <Pressable onPress={onClose} style={styles.modalClose}>
            <Ionicons name="close" size={22} color={C.textMuted} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 24, paddingHorizontal: 24, paddingBottom: 24 }}>
          <View>
            <Text style={styles.modalLabel}>Name</Text>
            <TextInput
              style={styles.modalInput}
              value={name}
              onChangeText={setName}
              placeholder="Morning run, drink water..."
              placeholderTextColor={C.textDim}
              autoFocus
              returnKeyType="next"
            />
          </View>

          <View>
            <Text style={styles.modalLabel}>Description (optional)</Text>
            <TextInput
              style={styles.modalInput}
              value={description}
              onChangeText={setDescription}
              placeholder="A short reminder of what to do"
              placeholderTextColor={C.textDim}
              returnKeyType="done"
            />
          </View>

          <View>
            <Text style={styles.modalLabel}>Icon</Text>
            <View style={styles.iconGrid}>
              {HABIT_ICONS.map((icon) => (
                <Pressable
                  key={icon}
                  onPress={() => setSelectedIcon(icon)}
                  style={[
                    styles.iconOption,
                    selectedIcon === icon && { backgroundColor: `${selectedColor}30`, borderColor: selectedColor },
                  ]}
                >
                  <Ionicons name={icon as any} size={22} color={selectedIcon === icon ? selectedColor : C.textMuted} />
                </Pressable>
              ))}
            </View>
          </View>

          <View>
            <Text style={styles.modalLabel}>Color</Text>
            <View style={styles.colorRow}>
              {HABIT_COLORS.map((color) => (
                <Pressable
                  key={color}
                  onPress={() => setSelectedColor(color)}
                  style={[
                    styles.colorDot,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorDotSelected,
                  ]}
                >
                  {selectedColor === color && (
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={{ paddingHorizontal: 24 }}>
          <Pressable
            onPress={handleAdd}
            disabled={!name.trim()}
            style={({ pressed }) => [
              styles.addBtn,
              pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
              !name.trim() && { opacity: 0.4 },
            ]}
          >
            <LinearGradient
              colors={["#FF9048", "#FF751F"]}
              style={styles.addBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.addBtnText}>Add habit</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export default function HabitsScreen() {
  const insets = useSafeAreaInsets();
  const {
    habits,
    habitCompletions,
    addHabit,
    removeHabit,
    toggleHabitCompletion,
    isHabitCompletedToday,
    getHabitStreak,
    getTodayCompletionCount,
  } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuggested, setShowSuggested] = useState(false);

  const todayCount = getTodayCompletionCount();

  // Merge suggested habits that user has added
  const addedSuggestedIds = habits.filter((h) => !h.isCustom).map((h) => h.id);
  const availableSuggested = SUGGESTED_HABITS.filter(
    (s) => !addedSuggestedIds.includes(s.id)
  );

  // All active habits (both suggested/added and custom)
  const allHabits = habits;

  const handleAddSuggested = (suggested: typeof SUGGESTED_HABITS[0]) => {
    const habit: Habit = {
      ...suggested,
      isCustom: false,
      createdAt: new Date().toISOString(),
    };
    // Add directly without isCustom/createdAt being in the Omit
    addHabit({ name: habit.name, description: habit.description, icon: habit.icon, color: habit.color });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleRemove = (habitId: string, habitName: string) => {
    Alert.alert(
      `Remove "${habitName}"?`,
      "This will remove the habit and its history.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            removeHabit(habitId);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
        },
      ]
    );
  };

  const paddingTop = Platform.OS === "web" ? insets.top + 67 : insets.top + 16;

  const completedToday = allHabits.filter((h) => isHabitCompletedToday(h.id)).length;
  const totalHabits = allHabits.length;
  const progressPct = totalHabits > 0 ? completedToday / totalHabits : 0;

  return (
    <View style={styles.container}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop,
          paddingHorizontal: 24,
          paddingBottom: Platform.OS === "web" ? 34 + 84 : 100,
          gap: 24,
        }}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.screenTitle}>Habits</Text>
            <Text style={styles.screenSubtitle}>Replace the old with the new.</Text>
          </View>
          <Pressable
            onPress={() => setShowAddModal(true)}
            style={styles.addIconBtn}
          >
            <Ionicons name="add" size={22} color={C.text} />
          </Pressable>
        </View>

        {/* Today's progress */}
        {totalHabits > 0 && (
          <View style={styles.progressCard}>
            <LinearGradient
              colors={["rgba(255,117,31,0.1)", "transparent"]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={styles.progressTop}>
              <View>
                <Text style={styles.progressHeading}>Today</Text>
                <Text style={styles.progressCount}>
                  {completedToday} of {totalHabits} done
                </Text>
              </View>
              <Text style={styles.progressPct}>
                {Math.round(progressPct * 100)}%
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progressPct * 100}%` },
                ]}
              />
            </View>
            {completedToday === totalHabits && totalHabits > 0 && (
              <Text style={styles.allDoneText}>
                All done. You're building something real.
              </Text>
            )}
          </View>
        )}

        {/* Active habits */}
        {allHabits.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Your habits</Text>
            <View style={styles.habitList}>
              {allHabits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  completed={isHabitCompletedToday(habit.id)}
                  streak={getHabitStreak(habit.id)}
                  onToggle={() => toggleHabitCompletion(habit.id)}
                  onRemove={() => handleRemove(habit.id, habit.name)}
                />
              ))}
            </View>
            <Text style={styles.longPressHint}>Long-press a habit to remove it</Text>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="leaf" size={40} color={C.success} />
            </View>
            <Text style={styles.emptyTitle}>No habits yet</Text>
            <Text style={styles.emptyDesc}>
              Add a healthy habit to replace the urge. Small swaps build momentum.
            </Text>
          </View>
        )}

        {/* Suggested habits */}
        {availableSuggested.length > 0 && (
          <View style={styles.section}>
            <Pressable
              onPress={() => setShowSuggested((v) => !v)}
              style={styles.suggestedToggle}
            >
              <Text style={styles.sectionLabel}>Suggested habits</Text>
              <Ionicons
                name={showSuggested ? "chevron-up" : "chevron-down"}
                size={16}
                color={C.textMuted}
              />
            </Pressable>

            {showSuggested && (
              <View style={styles.suggestedGrid}>
                {availableSuggested.map((s) => (
                  <Pressable
                    key={s.id}
                    onPress={() => handleAddSuggested(s)}
                    style={({ pressed }) => [
                      styles.suggestedChip,
                      pressed && { opacity: 0.75 },
                    ]}
                  >
                    <View style={[styles.suggestedIconWrap, { backgroundColor: `${s.color}20` }]}>
                      <Ionicons name={s.icon as any} size={18} color={s.color} />
                    </View>
                    <View style={styles.suggestedContent}>
                      <Text style={styles.suggestedName}>{s.name}</Text>
                      <Text style={styles.suggestedDesc}>{s.description}</Text>
                    </View>
                    <View style={styles.suggestedAdd}>
                      <Ionicons name="add" size={18} color={C.primary} />
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Custom habit CTA */}
        <Pressable
          onPress={() => setShowAddModal(true)}
          style={({ pressed }) => [
            styles.customCta,
            pressed && { opacity: 0.8 },
          ]}
        >
          <Ionicons name="add-circle-outline" size={20} color={C.primary} />
          <Text style={styles.customCtaText}>Create a custom habit</Text>
        </Pressable>
      </ScrollView>

      <AddHabitModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addHabit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  screenTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    color: C.text,
  },
  screenSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: C.textMuted,
    marginTop: 2,
  },
  addIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  progressCard: {
    backgroundColor: C.surface,
    borderRadius: 24,
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: `${C.primary}30`,
    overflow: "hidden",
  },
  progressTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  progressHeading: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: C.text,
    marginBottom: 2,
  },
  progressCount: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: C.textMuted,
  },
  progressPct: {
    fontFamily: "Inter_700Bold",
    fontSize: 32,
    color: C.primary,
    lineHeight: 36,
  },
  progressTrack: {
    height: 6,
    backgroundColor: C.surfaceElevated,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: C.primary,
    borderRadius: 3,
    minWidth: 6,
  },
  allDoneText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: C.success,
    fontStyle: "italic",
  },
  section: {
    gap: 12,
  },
  sectionLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  habitList: {
    gap: 10,
  },
  habitCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  habitIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  habitContent: {
    flex: 1,
    gap: 3,
  },
  habitName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: C.text,
  },
  habitDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: C.textMuted,
    lineHeight: 18,
  },
  streakRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  streakText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: C.warning,
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  longPressHint: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: C.textDim,
    textAlign: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 12,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${C.success}15`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 20,
    color: C.text,
  },
  emptyDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    color: C.textMuted,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 280,
  },
  suggestedToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  suggestedGrid: {
    gap: 8,
  },
  suggestedChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  suggestedIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  suggestedContent: {
    flex: 1,
    gap: 2,
  },
  suggestedName: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: C.text,
  },
  suggestedDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: C.textMuted,
  },
  suggestedAdd: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${C.primary}18`,
    alignItems: "center",
    justifyContent: "center",
  },
  customCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: `${C.primary}30`,
    borderStyle: "dashed",
  },
  customCtaText: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: C.primary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: C.background,
    gap: 0,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  modalTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    color: C.text,
  },
  modalClose: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  modalLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  modalInput: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: C.text,
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: C.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: C.border,
  },
  colorRow: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  colorDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: C.text,
  },
  addBtn: {
    borderRadius: 20,
    overflow: "hidden",
  },
  addBtnGradient: {
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 17,
    color: C.text,
  },
});
