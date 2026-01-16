import { useThemeColor } from "@/hooks/use-theme-color";
import { Branch, getBranches } from "@/src/api/branch.api";
import { Department, getDepartments } from "@/src/api/department.api";
import { getSystems, System } from "@/src/api/system.api";
import {
  deleteTicket,
  getTicketById,
  getTicketMedia,
  Ticket,
  TicketMedia,
  updateTicket,
} from "@/src/api/ticket.api";
import { Colors } from "@/src/colors/colors";
import { PrimaryButton } from "@/src/components/buttons/PrimaryButton";
import { SecondaryButton } from "@/src/components/buttons/SecondaryButton";
import { DropDown, DropDownOption } from "@/src/components/inputs/DropDown";
import { InputText } from "@/src/components/inputs/InputText";
import { Label } from "@/src/components/labels/Label";
import { getUserId } from "@/src/services/jwt.service";
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

export default function TicketDetailScreen() {
  const { id } = useLocalSearchParams();
  const ticketId = Number(id);

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [media, setMedia] = useState<TicketMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Dropdown data
  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [systems, setSystems] = useState<System[]>([]);
  const [listsLoading, setListsLoading] = useState(false);

  // Selected values (numeric)
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);
  const [selectedSystemId, setSelectedSystemId] = useState<number | null>(null);

  // Edit form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? Colors.dark : Colors.light;
  const background = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  useEffect(() => {
    loadTicketDetails();
  }, [ticketId]);

  const loadTicketDetails = async () => {
    try {
      setLoading(true);
      const [ticketData, mediaData] = await Promise.all([
        getTicketById(ticketId),
        getTicketMedia(ticketId),
      ]);

      setTicket(ticketData);
      setMedia(mediaData);

      // Initialize edit form
      setTitle(ticketData.title);
      setDescription(ticketData.description);

      // Set selected defaults
      setSelectedBranchId(ticketData.branchId);
      setSelectedDepartmentId(ticketData.departmentId);
      setSelectedSystemId(ticketData.systemId);

      // Load dropdown lists
      await loadDropdownLists();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Failed to load ticket details";
      Alert.alert("Error", errorMessage);
      console.error("Error loading ticket details:", error);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const loadDropdownLists = async () => {
    try {
      setListsLoading(true);
      const [branchRes, deptRes, systemRes] = await Promise.all([
        getBranches(),
        getDepartments(),
        getSystems(),
      ]);
      setBranches(branchRes || []);
      setDepartments(deptRes || []);
      setSystems(systemRes || []);
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to load dropdown data";
      Alert.alert("Error", msg);
      console.error("Dropdown load error:", error);
    } finally {
      setListsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!ticket) return;

    if (!title.trim() || !description.trim()) {
      Alert.alert("Error", "Title and description are required");
      return;
    }
    if (!selectedBranchId || !selectedDepartmentId || !selectedSystemId) {
      Alert.alert("Error", "Please select branch, department, and system");
      return;
    }

    try {
      setUpdating(true);
      const userId = await getUserId();
      if (!userId) {
        Alert.alert("Error", "Unable to get user ID");
        return;
      }

      const payload = {
        ticketId: ticket.ticketId,
        title: title.trim(),
        description: description.trim(),
        branchId: selectedBranchId,
        departmentId: selectedDepartmentId,
        systemId: selectedSystemId,
        priorityId: ticket.priorityId,
        updatedBy: userId,
      };

      const updatedTicket = await updateTicket(payload);
      setTicket(updatedTicket);
      setIsEditing(false);
      Alert.alert("Success", "Ticket updated successfully");
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Failed to update ticket";
      Alert.alert("Error", errorMessage);
      console.error("Error updating ticket:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!ticket) return;

    Alert.alert(
      "Delete Ticket",
      "Are you sure you want to delete this ticket? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const userId = await getUserId();
              if (!userId) {
                Alert.alert("Error", "Unable to get user ID");
                return;
              }

              await deleteTicket(ticket.ticketId, userId);
              Alert.alert("Success", "Ticket deleted successfully");
              router.back();
            } catch (error: any) {
              const errorMessage =
                error?.response?.data?.message || "Failed to delete ticket";
              Alert.alert("Error", errorMessage);
              console.error("Error deleting ticket:", error);
            }
          },
        },
      ]
    );
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
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
    <SafeAreaView style={[styles.container, { backgroundColor: background }]} edges={["top", "left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
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
            <Text style={styles.statusText}>{ticket.status || "Unknown"}</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {isEditing ? (
            // Edit Mode
            <View style={styles.editForm}>
              <Label text="Title" />
              <InputText
                value={title}
                onChangeText={setTitle}
                placeholder="Enter ticket title"
              />
              <View style={styles.spacer} />

              <Label text="Description" />
              <InputText
                value={description}
                onChangeText={setDescription}
                placeholder="Enter ticket description"
              />
              <View style={styles.spacer} />

              <DropDown
                label="Branch"
                options={branches.map(
                  (b) => ({ label: b.branchName, value: b.branchId } as DropDownOption)
                )}
                value={selectedBranchId ?? undefined}
                onSelect={(v) => setSelectedBranchId(v)}
                placeholder="Select branch"
                disabled={listsLoading}
                textColor={textColor}
                borderColor={colors.border}
                cardColor={colors.card}
              />
              <View style={styles.spacer} />

              <DropDown
                label="Department"
                options={departments.map(
                  (d) => ({ label: d.departmentName, value: d.departmentId } as DropDownOption)
                )}
                value={selectedDepartmentId ?? undefined}
                onSelect={(v) => setSelectedDepartmentId(v)}
                placeholder="Select department"
                disabled={listsLoading}
                textColor={textColor}
                borderColor={colors.border}
                cardColor={colors.card}
              />
              <View style={styles.spacer} />

              <DropDown
                label="System"
                options={systems.map(
                  (s) => ({ label: s.systemName, value: s.systemId } as DropDownOption)
                )}
                value={selectedSystemId ?? undefined}
                onSelect={(v) => setSelectedSystemId(v)}
                placeholder="Select system"
                disabled={listsLoading}
                textColor={textColor}
                borderColor={colors.border}
                cardColor={colors.card}
              />

              <View style={styles.spacerLarge} />

              <PrimaryButton title={updating ? "Updating..." : "Save Changes"} onPress={handleUpdate} />
              <View style={styles.spacerSmall} />
              <SecondaryButton
                title="Cancel"
                onPress={() => {
                  setIsEditing(false);
                  if (ticket) {
                    setTitle(ticket.title);
                    setDescription(ticket.description);
                    setSelectedBranchId(ticket.branchId);
                    setSelectedDepartmentId(ticket.departmentId);
                    setSelectedSystemId(ticket.systemId);
                  }
                }}
              />
            </View>
          ) : (
            // View Mode
            <>
              <Text style={[styles.title, { color: textColor }]}>
                {ticket.title}
              </Text>

              <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: textColor, opacity: 0.6 }]}>
                    Description
                  </Text>
                  <Text style={[styles.infoValue, { color: textColor }]}>
                    {ticket.description}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: textColor, opacity: 0.6 }]}>
                    System
                  </Text>
                  <Text style={[styles.infoValue, { color: textColor }]}>
                    {ticket.systemName || `System ID: ${ticket.systemId}`}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: textColor, opacity: 0.6 }]}>
                    Department
                  </Text>
                  <Text style={[styles.infoValue, { color: textColor }]}>
                    {ticket.departmentName || `Department ID: ${ticket.departmentId}`}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: textColor, opacity: 0.6 }]}>
                    Branch
                  </Text>
                  <Text style={[styles.infoValue, { color: textColor }]}>
                    {ticket.branchName || `Branch ID: ${ticket.branchId}`}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: textColor, opacity: 0.6 }]}>
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
                  <Text style={[styles.infoLabel, { color: textColor, opacity: 0.6 }]}>
                    Created
                  </Text>
                  <Text style={[styles.infoValue, { color: textColor }]}>
                    {formatDate(ticket.createdAt)}
                  </Text>
                </View>

                {ticket.updatedAt && (
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: textColor, opacity: 0.6 }]}>
                      Last Updated
                    </Text>
                    <Text style={[styles.infoValue, { color: textColor }]}>
                      {formatDate(ticket.updatedAt)}
                    </Text>
                  </View>
                )}
              </View>

              {/* Media Section */}
              {media.length > 0 && (
                <View style={styles.mediaSection}>
                  <Text style={[styles.sectionTitle, { color: textColor }]}>
                    Attachments ({media.length})
                  </Text>
                  <View style={styles.mediaGrid}>
                    {media.map((item) => {
                      const mime = item.mediaType?.toLowerCase() || "";
                      const uri = typeof item.mediaUrl === "string" ? item.mediaUrl : "";

                      const isImage = mime.startsWith("image") && !!uri;

                      return (
                        <TouchableOpacity
                          key={item.ticketMediaId}
                          style={[styles.mediaItem, { backgroundColor: colors.surface }]}
                        >
                          {isImage ? (
                            <Image
                              source={{ uri }}
                              style={styles.mediaImage}
                              resizeMode="cover"
                            />
                          ) : (
                            <View style={styles.mediaPlaceholder}>
                              <Text style={[styles.mediaText, { color: textColor }]}>
                                {mime || "unknown"}
                              </Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionsContainer}>
                <PrimaryButton
                  title="Edit Ticket"
                  onPress={() => setIsEditing(true)}
                />
                <View style={styles.spacerSmall} />
                <SecondaryButton
                  title="Delete Ticket"
                  onPress={handleDelete}
                />
              </View>
            </>
          )}
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
  mediaPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  mediaText: {
    fontSize: 12,
    textAlign: "center",
  },
  actionsContainer: {
    marginTop: 10,
  },
  editForm: {
    gap: 4,
  },
  spacer: {
    height: 12,
  },
  spacerSmall: {
    height: 10,
  },
  spacerLarge: {
    height: 20,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
  },
});
