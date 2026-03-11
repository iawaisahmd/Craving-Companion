import { useApp } from "@/context/AppContext";
import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useThemeColors } from "@/context/ThemeContext";

export default function Index() {
  const C = useThemeColors();
  const { loading, isOnboarded } = useApp();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: C.background, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={C.primary} />
      </View>
    );
  }

  if (!isOnboarded) return <Redirect href="/onboarding" />;
  return <Redirect href="/(tabs)" />;
}
