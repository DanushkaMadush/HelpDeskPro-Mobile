import { useThemeColor } from "@/hooks/use-theme-color";
import { signup } from "@/src/api/auth.api";
import { PrimaryButton } from "@/src/components/buttons/PrimaryButton";
import { SecondaryButton } from "@/src/components/buttons/SecondaryButton";
import { InputPassword } from "@/src/components/inputs/InputPassword";
import { InputText } from "@/src/components/inputs/InputText";
import { Label } from "@/src/components/labels/Label";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";

export default function SignupScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [plant, setPlant] = useState("");
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const background = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  const handleSignup = async () => {
    // Validation
    if (!firstName || !lastName || !email || !contactNo || !plant || !department || !designation || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      const response = await signup({
        firstName,
        lastName,
        email,
        contactNo,
        plant,
        department,
        designation,
        password,
      });
      
      Alert.alert("Success", "Account created successfully! Please login.", [
        { text: "OK", onPress: () => router.push("/(auth)/login") }
      ]);
      console.log("Signup success", response);
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Signup Failed";
      Alert.alert("Error", message);
      console.error("Signup failed", message);
    }
  };

  const handleBackToLogin = () => {
    router.push("/(auth)/login");
  };

  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: textColor }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: textColor, opacity: 0.7 }]}>
            Sign up to get started with HelpDeskPro
          </Text>
        </View>

        <View style={styles.form}>
          <Label text="First Name" />
          <InputText
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter your first name"
          />

          <View style={styles.spacer} />

          <Label text="Last Name" />
          <InputText
            value={lastName}
            onChangeText={setLastName}
            placeholder="Enter your last name"
          />

          <View style={styles.spacer} />

          <Label text="Email" />
          <InputText
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
          />

          <View style={styles.spacer} />

          <Label text="Contact Number" />
          <InputText
            value={contactNo}
            onChangeText={setContactNo}
            placeholder="Enter your contact number"
          />

          <View style={styles.spacer} />

          <Label text="Plant" />
          <InputText
            value={plant}
            onChangeText={setPlant}
            placeholder="Enter your plant"
          />

          <View style={styles.spacer} />

          <Label text="Department" />
          <InputText
            value={department}
            onChangeText={setDepartment}
            placeholder="Enter your department"
          />

          <View style={styles.spacer} />

          <Label text="Designation" />
          <InputText
            value={designation}
            onChangeText={setDesignation}
            placeholder="Enter your designation"
          />

          <View style={styles.spacer} />

          <Label text="Password" />
          <InputPassword
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
          />

          <View style={styles.spacer} />

          <Label text="Confirm Password" />
          <InputPassword
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm your password"
          />

          <View style={styles.spacerLarge} />

          <PrimaryButton title="Sign Up" onPress={handleSignup} />

          <View style={styles.spacerSmall} />

          <SecondaryButton title="Back to Login" onPress={handleBackToLogin} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  form: {
    gap: 4,
  },
  spacer: {
    height: 12,
  },
  spacerLarge: {
    height: 30,
  },
  spacerSmall: {
    height: 10,
  },
});
