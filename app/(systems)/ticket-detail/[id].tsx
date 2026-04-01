import { useThemeColor } from "@/hooks/use-theme-color";
import {
    getTicketById,
    getTicketMedia,
    Ticket,
    TicketMediaResponse,
    updateTicketStatus,
} from "@/src/api/ticket.api";
import { Colors } from "@/src/colors/colors";
import { getUserId } from "@/src/services/jwt.service";
import { Audio } from "expo-av";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DeveloperTicketDetailScreen() {
  const { id } = useLocalSearchParams();
  const ticketId = Number(id);

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [media, setMedia] = useState<TicketMediaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<Audio.Sound | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? Colors.dark : Colors.light;
  const background = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  useEffect(() => {
    loadTicketDetails();
  }, [ticketId]);

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  }, []);

  const loadTicketDetails = async () => {
    try {
      setLoading(true);
      const [ticketData, mediaData] = await Promise.all([
        getTicketById(ticketId),
        getTicketMedia(ticketId),
      ]);

      setTicket(ticketData);
      setMedia(mediaData || []);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Failed to load ticket details";
      Alert.alert("Error", errorMessage);
      console.error("Error loading ticket details:", error);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (statusId: number) => {
    if (!ticket) return;

    try {
      setUpdatingStatus(true);
      const userId = await getUserId();
      if (!userId) {
        Alert.alert("Error", "Unable to get user ID");
        return;
      }

      await updateTicketStatus({
        ticketId: ticket.ticketId,
        statusId,
        updatedBy: userId,
      });

      await loadTicketDetails();
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Failed to update status";
      Alert.alert("Error", message);
      console.error("Error updating status:", error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (statusId: number): string => {
    switch (statusId) {
      case 1:
        return colors.statusOpen;
      case 2:
        return colors.statusInProgress;
      case 3:
        return colors.statusResolved;
      case 4:
        return colors.statusClosed;
      default:
        return colors.statusClosed;
    }
  };

  const getStatusLabel = (statusId: number): string => {
    switch (statusId) {
      case 1:
        return "Pending";
      case 2:
        return "Ongoing";
      case 3:
        return "Completed";
      default:
        return "Unknown";
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const playAudio = async (uri: string) => {
    try {
      if (playingAudio) {
        await playingAudio.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync({ uri });
      setPlayingAudio(sound);
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
          setPlayingAudio(null);
        }
      });
    } catch (error) {
      console.error("Error playing audio:", error);
      Alert.alert("Error", "Failed to play audio");
    }
  };

  const stopAudio = async () => {
    if (playingAudio) {
      await playingAudio.stopAsync();
      await playingAudio.unloadAsync();
      setPlayingAudio(null);
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: background }]}
        edges={["top", "left", "right"]}
      >
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!ticket) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: background }]}
        edges={["top", "left", "right"]}
      >
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: textColor }]}>
            Ticket not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: background }]}
      edges={["top", "left", "right"]}
    >
      {previewImage && (
        <View style={styles.previewContainer}>
          <TouchableOpacity
            style={styles.previewOverlay}
            onPress={() => setPreviewImage(null)}
          >
            <Image
              source={{ uri: previewImage }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      )}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.ticketId, { color: textColor, opacity: 0.6 }]}>
            Ticket #{ticket.ticketId}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(ticket.statusId) },
            ]}
          >
            <Text style={styles.statusText}>
              {ticket.status || getStatusLabel(ticket.statusId)}
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, { color: textColor }]}>
            {ticket.title}
          </Text>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text
                style={[styles.infoLabel, { color: textColor, opacity: 0.6 }]}
              >
                Description
              </Text>
              <Text style={[styles.infoValue, { color: textColor }]}>
                {ticket.description}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text
                style={[styles.infoLabel, { color: textColor, opacity: 0.6 }]}
              >
                System
              </Text>
              <Text style={[styles.infoValue, { color: textColor }]}>
                {ticket.systemName || `System ID: ${ticket.systemId}`}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text
                style={[styles.infoLabel, { color: textColor, opacity: 0.6 }]}
              >
                Department
              </Text>
              <Text style={[styles.infoValue, { color: textColor }]}>
                {ticket.departmentName ||
                  `Department ID: ${ticket.departmentId}`}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text
                style={[styles.infoLabel, { color: textColor, opacity: 0.6 }]}
              >
                Branch
              </Text>
              <Text style={[styles.infoValue, { color: textColor }]}>
                {ticket.branchName || `Branch ID: ${ticket.branchId}`}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text
                style={[styles.infoLabel, { color: textColor, opacity: 0.6 }]}
              >
                Priority
              </Text>
              <View
                style={[
                  styles.priorityBadge,
                  { backgroundColor: getStatusColor(ticket.priorityId) },
                ]}
              >
                <Text style={styles.priorityText}>
                  {ticket.priority || `Priority ${ticket.priorityId}`}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text
                style={[styles.infoLabel, { color: textColor, opacity: 0.6 }]}
              >
                Created
              </Text>
              <Text style={[styles.infoValue, { color: textColor }]}>
                {formatDate(ticket.createdAt)}
              </Text>
            </View>

            {ticket.updatedAt && (
              <View style={styles.infoRow}>
                <Text
                  style={[styles.infoLabel, { color: textColor, opacity: 0.6 }]}
                >
                  Last Updated
                </Text>
                <Text style={[styles.infoValue, { color: textColor }]}>
                  {formatDate(ticket.updatedAt)}
                </Text>
              </View>
            )}
          </View>

          {media.length > 0 && (
            <View style={styles.mediaSection}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Attachments ({media.length})
              </Text>
              <View style={styles.mediaGrid}>
                {media.map((item) => {
                  const mime = item.mimeType?.toLowerCase() || "";
                  const uri = item.filePath;
                  const isImage = mime.includes("image");
                  const isAudio = mime.includes("audio");

                  return (
                    <View
                      key={item.ticketMediaId}
                      style={styles.mediaItemWrapper}
                    >
                      {isImage ? (
                        <TouchableOpacity
                          style={[
                            styles.mediaItem,
                            { backgroundColor: colors.card },
                          ]}
                          onPress={() => setPreviewImage(uri)}
                        >
                          <Image
                            source={{ uri }}
                            style={styles.mediaImage}
                            resizeMode="cover"
                          />
                        </TouchableOpacity>
                      ) : isAudio ? (
                        <TouchableOpacity
                          style={[
                            styles.mediaItem,
                            styles.audioItem,
                            {
                              backgroundColor: colors.card,
                              borderColor: colors.border,
                            },
                          ]}
                          onPress={() =>
                            playingAudio ? stopAudio() : playAudio(uri)
                          }
                        >
                          <Text
                            style={[
                              styles.audioIcon,
                              { color: colors.primary },
                            ]}
                          >
                            {playingAudio ? "⏸" : "▶"}
                          </Text>
                          <Text
                            style={[styles.mediaText, { color: textColor }]}
                          >
                            Audio
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <View
                          style={[
                            styles.mediaItem,
                            styles.fileItem,
                            {
                              backgroundColor: colors.card,
                              borderColor: colors.border,
                            },
                          ]}
                        >
                          <Text style={[styles.fileIcon, { color: textColor }]}>
                            FILE
                          </Text>
                          <Text
                            style={[styles.mediaText, { color: textColor }]}
                            numberOfLines={2}
                          >
                            {mime || "File"}
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          <View style={styles.statusSection}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Change Status
            </Text>
            <View style={styles.statusActions}>
              {[1, 2, 3].map((statusId) => {
                const isActive = ticket.statusId === statusId;
                return (
                  <TouchableOpacity
                    key={statusId}
                    style={[
                      styles.statusButton,
                      isActive && {
                        backgroundColor: getStatusColor(statusId),
                        borderColor: getStatusColor(statusId),
                      },
                    ]}
                    onPress={() => handleStatusChange(statusId)}
                    disabled={updatingStatus}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.statusButtonText,
                        {
                          color: isActive ? "#FFF" : textColor,
                          opacity: updatingStatus ? 0.6 : 1,
                        },
                      ]}
                    >
                      {getStatusLabel(statusId)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingBottom: 10,
  },
  ticketId: {
    fontSize: 14,
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  content: {
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  infoSection: {
    gap: 16,
    marginBottom: 24,
  },
  infoRow: {
    gap: 6,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 15,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  priorityText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  mediaSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  mediaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  mediaItemWrapper: {
    marginBottom: 10,
  },
  mediaItem: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: "hidden",
  },
  mediaImage: {
    width: "100%",
    height: "100%",
  },
  audioItem: {
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  audioIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  fileItem: {
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  fileIcon: {
    fontSize: 12,
    marginBottom: 6,
  },
  mediaText: {
    fontSize: 11,
    textAlign: "center",
  },
  statusSection: {
    marginBottom: 20,
  },
  statusActions: {
    flexDirection: "row",
    gap: 8,
  },
  statusButton: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  previewContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  previewOverlay: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
});
