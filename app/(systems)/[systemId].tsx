import { useThemeColor } from "@/hooks/use-theme-color";
import {
    getTicketMedia,
    getTicketsBySystemId,
    Ticket,
    TicketMediaResponse,
} from "@/src/api/ticket.api";
import { Colors } from "@/src/colors/colors";
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

export default function SystemTicketsScreen() {
  const { systemId } = useLocalSearchParams<{ systemId: string }>();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mediaByTicketId, setMediaByTicketId] = useState<
    Record<number, TicketMediaResponse[]>
  >({});
  const [expandedTicketId, setExpandedTicketId] = useState<number | null>(null);
  const [mediaLoadingId, setMediaLoadingId] = useState<number | null>(null);
  const [playingAudio, setPlayingAudio] = useState<Audio.Sound | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? Colors.dark : Colors.light;

  const background = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  useEffect(() => {
    (async () => {
      try {
        if (!systemId) return;
        const data = await getTicketsBySystemId(Number(systemId));
        setTickets(data);
      } catch (e) {
        console.error("Error loading system tickets:", e);
        setError("Failed to load tickets.");
      } finally {
        setLoading(false);
      }
    })();
  }, [systemId]);

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  }, []);

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

  const getPriorityColor = (priorityId: number): string => {
    switch (priorityId) {
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

  const handleOpenTicket = (ticketId: number) => {
    router.push(`/(systems)/ticket-detail/${ticketId}` as any);
  };

  const handleToggleMedia = async (ticketId: number) => {
    if (expandedTicketId === ticketId) {
      setExpandedTicketId(null);
      return;
    }

    setExpandedTicketId(ticketId);

    if (mediaByTicketId[ticketId]) return;

    try {
      setMediaLoadingId(ticketId);
      const media = await getTicketMedia(ticketId);
      setMediaByTicketId((prev) => ({ ...prev, [ticketId]: media || [] }));
    } catch (e) {
      Alert.alert("Error", "Failed to load ticket media");
      console.error("Error loading ticket media:", e);
    } finally {
      setMediaLoadingId(null);
    }
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
    } catch (e) {
      console.error("Error playing audio:", e);
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: background }]}>
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
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: textColor }]}>
            System Tickets
          </Text>
          <Text style={[styles.subtitle, { color: textColor, opacity: 0.6 }]}>
            System ID: {systemId}
          </Text>
        </View>

        {loading && (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}

        {!loading && error && (
          <Text style={{ color: colors.error }}>{error}</Text>
        )}

        {!loading && !error && tickets.length === 0 && (
          <Text style={{ color: textColor, opacity: 0.7 }}>
            No tickets found.
          </Text>
        )}

        {!loading &&
          !error &&
          tickets.map((ticket) => (
            <TouchableOpacity
              key={ticket.ticketId}
              style={[
                styles.card,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              activeOpacity={0.8}
              onPress={() => handleOpenTicket(ticket.ticketId)}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleBlock}>
                  <Text
                    style={[styles.cardTitle, { color: textColor }]}
                    numberOfLines={2}
                  >
                    {ticket.title}
                  </Text>
                  <Text style={{ color: textColor, opacity: 0.6 }}>
                    Ticket #{ticket.ticketId}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(ticket.statusId) },
                  ]}
                >
                  <Text style={styles.badgeText}>
                    {ticket.status || getStatusLabel(ticket.statusId)}
                  </Text>
                </View>
              </View>

              <Text
                style={[styles.description, { color: textColor, opacity: 0.7 }]}
                numberOfLines={3}
              >
                {ticket.description}
              </Text>

              <View style={styles.cardFooter}>
                <View
                  style={[
                    styles.priorityBadge,
                    { backgroundColor: getPriorityColor(ticket.priorityId) },
                  ]}
                >
                  <Text style={styles.badgeText}>
                    {ticket.priority || `P${ticket.priorityId}`}
                  </Text>
                </View>
                <Text style={{ color: textColor, opacity: 0.5 }}>
                  {ticket.systemName || "System"}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.mediaToggle}
                onPress={() => handleToggleMedia(ticket.ticketId)}
                activeOpacity={0.7}
              >
                <Text style={[styles.mediaToggleText, { color: textColor }]}>
                  {expandedTicketId === ticket.ticketId
                    ? "Hide Media"
                    : "Show Media"}
                </Text>
              </TouchableOpacity>

              {expandedTicketId === ticket.ticketId && (
                <View style={styles.mediaSection}>
                  {mediaLoadingId === ticket.ticketId ? (
                    <View style={styles.mediaLoader}>
                      <ActivityIndicator size="small" color={colors.primary} />
                    </View>
                  ) : (mediaByTicketId[ticket.ticketId] || []).length === 0 ? (
                    <Text style={{ color: textColor, opacity: 0.6 }}>
                      No attachments
                    </Text>
                  ) : (
                    <View style={styles.mediaGrid}>
                      {(mediaByTicketId[ticket.ticketId] || []).map((item) => {
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
                                  style={[
                                    styles.mediaText,
                                    { color: textColor },
                                  ]}
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
                                <Text
                                  style={[
                                    styles.fileIcon,
                                    { color: textColor },
                                  ]}
                                >
                                  📄
                                </Text>
                                <Text
                                  style={[
                                    styles.mediaText,
                                    { color: textColor },
                                  ]}
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
                  )}
                </View>
              )}
            </TouchableOpacity>
          ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  header: { marginBottom: 16 },
  title: { fontSize: 22, fontWeight: "bold" },
  subtitle: { fontSize: 14, marginTop: 2 },
  loader: { paddingVertical: 30, alignItems: "center" },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  cardTitleBlock: { flex: 1, marginRight: 10 },
  cardTitle: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  description: { fontSize: 13, lineHeight: 18, marginBottom: 10 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  badgeText: { color: "#FFF", fontSize: 12, fontWeight: "600" },
  mediaToggle: {
    marginTop: 10,
  },
  mediaToggleText: {
    fontSize: 12,
    fontWeight: "600",
  },
  mediaSection: {
    marginTop: 10,
  },
  mediaLoader: {
    paddingVertical: 10,
    alignItems: "center",
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
    fontSize: 24,
    marginBottom: 4,
  },
  mediaText: {
    fontSize: 11,
    textAlign: "center",
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
