import { useThemeColor } from "@/hooks/use-theme-color";
import { Ticket, getTicketsByUserId } from "@/src/api/ticket.api";
import { Colors } from "@/src/colors/colors";
import { getUserId } from "@/src/services/jwt.service";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MyTicketsScreen() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? Colors.dark : Colors.light;

  const background = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  useEffect(() => {
    loadMyTickets();
  }, []);

  const loadMyTickets = async () => {
    try {
      setLoading(true);
      const userId = await getUserId();

      if (!userId) {
        Alert.alert("Error", "Unable to load user ID");
        return;
      }

      const myTickets = await getTicketsByUserId(userId);
      setTickets(myTickets);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Failed to load tickets";
      Alert.alert("Error", errorMessage);
      console.error("Error loading tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMyTickets();
    setRefreshing(false);
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

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleTicketPress = (ticketId: number) => {
    // router.push(`/(tickets)/ticket-detail/${ticketId}`);
  };

  const renderTicketCard = ({ item }: { item: Ticket }) => (
    <TouchableOpacity
      style={[styles.ticketCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => handleTicketPress(item.ticketId)}
      activeOpacity={0.7}
    >
      {/* Ticket Header with ID and Status */}
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.ticketId, { color: textColor, opacity: 0.6 }]}>
            Ticket #{item.ticketId}
          </Text>
          <Text
            style={[styles.ticketTitle, { color: textColor }]}
            numberOfLines={2}
          >
            {item.title}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.statusId) },
          ]}
        >
          <Text style={styles.statusText}>{item.status || "Unknown"}</Text>
        </View>
      </View>

      {/* Ticket Description */}
      <Text
        style={[styles.ticketDescription, { color: textColor, opacity: 0.7 }]}
        numberOfLines={2}
      >
        {item.description}
      </Text>

      {/* System and Department Info */}
      <View style={styles.infoRow}>
        <Text style={[styles.infoLabel, { color: textColor, opacity: 0.6 }]}>
          {item.systemName || "System"} • {item.departmentName || "Department"}
        </Text>
      </View>

      {/* Ticket Footer with Priority and Date */}
      <View style={styles.cardFooter}>
        <View
          style={[
            styles.priorityBadge,
            { backgroundColor: getStatusColor(item.priorityId) },
          ]}
        >
          <Text style={styles.priorityLabel}>
            {item.priority || `P${item.priorityId}`}
          </Text>
        </View>
        <Text style={[styles.createdDate, { color: textColor, opacity: 0.5 }]}>
          {formatDate(item.createdAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: textColor }]}>
        No tickets found
      </Text>
      <Text style={[styles.emptySubText, { color: textColor, opacity: 0.6 }]}>
        Create a new ticket to get started
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: background }]}
      edges={["top", "left", "right"]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: textColor }]}>
          My Tickets
        </Text>
        <Text style={[styles.headerSubtitle, { color: textColor, opacity: 0.6 }]}>
          {tickets.length} total
        </Text>
      </View>

      {/* Tickets List */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={tickets}
          renderItem={renderTicketCard}
          keyExtractor={(item) => item.ticketId.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          onRefresh={onRefresh}
          refreshing={refreshing}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexGrow: 1,
  },
  ticketCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  ticketId: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginLeft: 8,
  },
  statusText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  ticketDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  infoRow: {
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  priorityLabel: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "600",
  },
  createdDate: {
    fontSize: 12,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    textAlign: "center",
  },
});