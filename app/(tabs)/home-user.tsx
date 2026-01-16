import { useThemeColor } from "@/hooks/use-theme-color";
import { Colors } from "@/src/colors/colors";
import { PrimaryButton } from "@/src/components/buttons/PrimaryButton";
import { SecondaryButton } from "@/src/components/buttons/SecondaryButton";
import { getUsername } from "@/src/services/jwt.service";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeUserScreen() {
  const [username, setUsername] = useState("Guest");
  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? Colors.dark : Colors.light;

  const background = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const name = await getUsername();
      setUsername(name || "Guest");
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const handleCreateTicket = () => {
    router.push("/(tickets)/create-ticket");
  };

  const handleViewTickets = () => {
    router.push("/(tickets)/my-tickets");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: background }]} edges={["top", "left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: textColor }]}>Hello, {username}!</Text>
          <Text style={[styles.subtitle, { color: textColor }]}>
            Welcome to HelpDeskPro
          </Text>
        </View>

        {/* Action Buttons Container */}
        <View style={styles.actionsContainer}>
          <PrimaryButton 
            title="+ Create Ticket" 
            onPress={handleCreateTicket}
          />
          <View style={styles.buttonSpacer} />
          <SecondaryButton 
            title="View My All Tickets" 
            onPress={handleViewTickets}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 50,
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
  actionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  buttonSpacer: {
    height: 14,
  },
});