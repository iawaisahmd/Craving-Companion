import { useApp } from "@/context/AppContext";
import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { C } from "@/constants/colors";

export default function Index() {
  const { loading, isOnboarded } = useApp();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: C.background, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={C.primary} />
      </View>
    );
  }

  if (!isOnboarded) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}
