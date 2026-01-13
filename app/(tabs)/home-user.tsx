import { useThemeColor } from "@/hooks/use-theme-color";
import { getUsername } from "@/src/services/jwt.service";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, Text, View } from "react-native";

export default function HomeUserScreen() {
  const [username, setUsername] = useState("Guest");
  const background = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  useEffect(() => {
    (async () => {
      const name = await getUsername();
      setUsername(name || "Guest");
    })();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: background }]} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: textColor }]}>Hello, {username}</Text>
        <Text style={[styles.subtitle, { color: textColor, opacity: 0.7 }]}>
          Welcome to HelpDeskPro (User)
        </Text>
      </View>
      <View style={styles.content}>
        <Text style={{ color: textColor, opacity: 0.8 }}>User dashboard content goes here.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 10 },
  greeting: { fontSize: 28, fontWeight: "bold", marginBottom: 4 },
  subtitle: { fontSize: 16 },
  content: { flex: 1, padding: 20 },
});