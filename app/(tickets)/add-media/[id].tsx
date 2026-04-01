import { useThemeColor } from "@/hooks/use-theme-color";
import { uploadTicketMedia } from "@/src/api/ticket.api";
import { Colors } from "@/src/colors/colors";
import { PrimaryButton } from "@/src/components/buttons/PrimaryButton";
import { SecondaryButton } from "@/src/components/buttons/SecondaryButton";
import { getUserId } from "@/src/services/jwt.service";
import { Audio } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddMediaScreen() {
  const { id } = useLocalSearchParams();
  const ticketId = Number(id);

  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? Colors.dark : Colors.light;
  const background = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      return Alert.alert(
        "Permission required",
        "Media library permission is needed.",
      );
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"], // Updated: use array instead of MediaTypeOptions
      quality: 0.8,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets?.[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const startRecording = async () => {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        return Alert.alert(
          "Permission required",
          "Microphone permission is needed.",
        );
      }

      // Set audio mode before creating recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );

      setRecording(newRecording);
    } catch (error) {
      console.error("Failed to start recording:", error);
      Alert.alert("Error", "Failed to start recording");
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setAudioUri(uri || null);
      setRecording(null);

      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
    } catch (error) {
      console.error("Failed to stop recording:", error);
      Alert.alert("Error", "Failed to stop recording");
    }
  };

  const uploadOne = async (uri: string, mediaType: string) => {
    const userId = await getUserId();
    if (!userId) {
      Alert.alert("Error", "Unable to get user ID");
      return;
    }
    setUploading(true);
    try {
      const file: any = {
        uri,
        name: uri.split("/").pop() || "upload",
        type: mediaType,
      };

      const res = await uploadTicketMedia(ticketId, file, userId);

      if (res.errorMessage) {
        Alert.alert("Error", res.errorMessage);
      } else {
        Alert.alert("Success", res.successMessage || "Upload successful");
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Upload failed";
      Alert.alert("Error", msg);
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const uploadImage = async () => {
    if (!imageUri)
      return Alert.alert("Select image", "Please pick an image first.");
    await uploadOne(imageUri, "image/jpeg");
  };

  const uploadAudio = async () => {
    if (!audioUri)
      return Alert.alert("Record audio", "Please record audio first.");
    await uploadOne(audioUri, "audio/m4a");
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: background }]}
      edges={["top", "left", "right"]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: textColor }]}>
          Add Media to Ticket #{ticketId}
        </Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Image</Text>
          {imageUri && (
            <Image source={{ uri: imageUri }} style={styles.preview} />
          )}
          <PrimaryButton title="Pick Image" onPress={pickImage} />
          <View style={styles.spacerSmall} />
          <SecondaryButton title="Upload Image" onPress={uploadImage} />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Voice Recording
          </Text>
          <View style={styles.row}>
            <PrimaryButton
              title={recording ? "Stop Recording" : "Start Recording"}
              onPress={recording ? stopRecording : startRecording}
            />
            <View style={styles.rowSpacer} />
            <SecondaryButton title="Upload Audio" onPress={uploadAudio} />
          </View>
          {audioUri && (
            <Text style={[styles.info, { color: textColor }]}>
              Recorded file ready
            </Text>
          )}
        </View>

        <View style={styles.spacerLarge} />
        {uploading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <SecondaryButton
            title="Done"
            onPress={() => router.replace("/(tabs)/home-user")}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 10 },
  preview: { width: "100%", height: 180, borderRadius: 8, marginBottom: 10 },
  row: { flexDirection: "row", alignItems: "center" },
  rowSpacer: { width: 12 },
  spacerSmall: { height: 10 },
  spacerLarge: { height: 24 },
  info: { marginTop: 8 },
});
