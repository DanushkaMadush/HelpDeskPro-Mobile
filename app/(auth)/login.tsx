import { useThemeColor } from "@/hooks/use-theme-color";
import { login } from "@/src/api/auth.api";
import { PrimaryButton } from "@/src/components/buttons/PrimaryButton";
import { SecondaryButton } from "@/src/components/buttons/SecondaryButton";
import { TertiaryButton } from "@/src/components/buttons/TertiaryButton";
import { InputPassword } from "@/src/components/inputs/InputPassword";
import { InputText } from "@/src/components/inputs/InputText";
import { Label } from "@/src/components/labels/Label";
import { saveToken } from "@/src/utils/tokenStorage";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const background = useThemeColor({}, "background");

  const handleLogin = async () => {
    try {
      const response = await login({ email, password, });
      await saveToken(response.token);
      console.log("Login success");
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Login Failed";
      console.error("Login failed", message);
    }
  };

  const handleSignUp = () => {
    router.push("/(auth)/signup");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: background }]} edges={['top', 'left', 'right']}>
      <View style={styles.form}>
        <Label text="Email" />
        <InputText
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
        />

        <View style={styles.spacer} />

        <Label text="Password" />
        <InputPassword
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
        />

        <View style={styles.spacerLarge} />

        <PrimaryButton title="Login" onPress={handleLogin} />

        <View style={styles.spacerSmall} />

        <SecondaryButton title="Signup" onPress={handleSignUp} />

        <View style={styles.spacerSmall} />

        <TertiaryButton
          title="Forgot password?"
          onPress={() => console.log("Forgot password")}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
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
