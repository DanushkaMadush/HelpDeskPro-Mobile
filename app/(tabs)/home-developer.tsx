import { useThemeColor } from "@/hooks/use-theme-color";
import { getSystemsByUser, SystemByUser } from "@/src/api/system.api";
import { Colors } from "@/src/colors/colors";
import { getUserId, getUsername } from "@/src/services/jwt.service";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeDeveloperScreen() {
  const [username, setUsername] = useState("Guest");
  const [systems, setSystems] = useState<SystemByUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? Colors.dark : Colors.light;

  const background = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  useEffect(() => {
    (async () => {
      try {
        const name = await getUsername();
        setUsername(name || "Guest");

        const userId = await getUserId();
        if (!userId) {
          setError("User ID not found.");
          return;
        }

        const data = await getSystemsByUser(userId);
        setSystems(data);
      } catch (e) {
        console.error("Error loading developer home data:", e);
        setError("Failed to load systems.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: background }]}
      edges={["top", "left", "right"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: textColor }]}>
            Hello, {username}!
          </Text>
          <Text style={[styles.subtitle, { color: textColor }]}>
            Welcome to HelpDeskPro
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Assigned Systems
          </Text>

          {loading && (
            <Text style={{ color: textColor, opacity: 0.7 }}>Loading...</Text>
          )}

          {!loading && error && (
            <Text style={{ color: colors.error }}>{error}</Text>
          )}

          {!loading && !error && systems.length === 0 && (
            <Text style={{ color: textColor, opacity: 0.7 }}>
              No systems assigned.
            </Text>
          )}

          {!loading &&
            !error &&
            systems.map((sys) => (
              <TouchableOpacity
                key={sys.sysDevId}
                style={[
                  styles.systemCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                activeOpacity={0.7}
                onPress={() => router.push(`/(systems)/${sys.systemId}` as any)}
              >
                <Text style={[styles.systemName, { color: textColor }]}>
                  {sys.systemName}
                </Text>
                <Text style={{ color: textColor, opacity: 0.7 }}>
                  System ID: {sys.systemId}
                </Text>
              </TouchableOpacity>
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  header: {
    paddingHorizontal: 20,
    marginBottom: 30,
    alignItems: "center",
  },
  greeting: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    opacity: 0.7,
  },
  section: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  systemCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  systemName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
});
