import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { C } from "@/constants/colors";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not found", headerStyle: { backgroundColor: C.background }, headerTintColor: C.text }} />
      <View style={styles.container}>
        <Text style={styles.title}>Nothing here.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go home</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 20,
    color: C.text,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: C.primary,
  },
});
