import { useThemeColor } from "@/hooks/use-theme-color";
import { Branch, getBranches } from "@/src/api/branch.api";
import { Department, getDepartments } from "@/src/api/department.api";
import { getSystems, System } from "@/src/api/system.api";
import { createTicket, CreateTicketRequest } from "@/src/api/ticket.api";
import { Colors } from "@/src/colors/colors";
import { PrimaryButton } from "@/src/components/buttons/PrimaryButton";
import { SecondaryButton } from "@/src/components/buttons/SecondaryButton";
import { DropDown, DropDownOption } from "@/src/components/inputs/DropDown";
import { InputText } from "@/src/components/inputs/InputText";
import { Label } from "@/src/components/labels/Label";
import { getUserId } from "@/src/services/jwt.service";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    useColorScheme,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateTicketScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [branchId, setBranchId] = useState<number | undefined>(undefined);
  const [departmentId, setDepartmentId] = useState<number | undefined>(undefined);
  const [systemId, setSystemId] = useState<number | undefined>(undefined);
  const [priorityId, setPriorityId] = useState<number>(1); // 1=High,2=Medium,3=Low
  const [loading, setLoading] = useState(false);
  const [listsLoading, setListsLoading] = useState(false);

  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [systems, setSystems] = useState<System[]>([]);

  const colorScheme = useColorScheme();
  const colors = colorScheme === "dark" ? Colors.dark : Colors.light;
  const background = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  useEffect(() => {
    loadDropdowns();
  }, []);

  const loadDropdowns = async () => {
    try {
      setListsLoading(true);
      const [b, d, s] = await Promise.all([getBranches(), getDepartments(), getSystems()]);
      setBranches(b || []);
      setDepartments(d || []);
      setSystems(s || []);
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to load dropdown data";
      Alert.alert("Error", msg);
      console.error("Dropdown load error:", error);
    } finally {
      setListsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert("Error", "Title and description are required");
      return;
    }
    if (!branchId || !departmentId || !systemId) {
      Alert.alert("Error", "Please select branch, department, and system");
      return;
    }

    try {
      setLoading(true);
      const userId = await getUserId();
      if (!userId) {
        Alert.alert("Error", "Unable to get user ID");
        return;
      }

      const payload: CreateTicketRequest = {
        title: title.trim(),
        description: description.trim(),
        branchId,
        departmentId,
        systemId,
        statusId: 1, // default
        priorityId,
        createdBy: userId,
      };

      const res = await createTicket(payload);
      const newId = res?.ticket?.ticketId;
      Alert.alert("Success", res?.successMessage || "Ticket created");

      if (newId) {
        router.replace({ pathname: "/(tickets)/ticket-detail/[id]", params: { id: newId } });
      } else {
        router.back();
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to create ticket";
      Alert.alert("Error", msg);
      console.error("Create ticket error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: background }]} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: textColor }]}>Create Ticket</Text>

        <Label text="Title" />
        <InputText value={title} onChangeText={setTitle} placeholder="Enter ticket title" />
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
          options={branches.map((b) => ({ label: b.branchName, value: b.branchId } as DropDownOption))}
          value={branchId}
          onSelect={setBranchId}
          placeholder="Select branch"
          disabled={listsLoading}
          textColor={textColor}
          borderColor={colors.border}
          cardColor={colors.card}
        />
        <View style={styles.spacer} />

        <DropDown
          label="Department"
          options={departments.map((d) => ({ label: d.departmentName, value: d.departmentId } as DropDownOption))}
          value={departmentId}
          onSelect={setDepartmentId}
          placeholder="Select department"
          disabled={listsLoading}
          textColor={textColor}
          borderColor={colors.border}
          cardColor={colors.card}
        />
        <View style={styles.spacer} />

        <DropDown
          label="System"
          options={systems.map((s) => ({ label: s.systemName, value: s.systemId } as DropDownOption))}
          value={systemId}
          onSelect={setSystemId}
          placeholder="Select system"
          disabled={listsLoading}
          textColor={textColor}
          borderColor={colors.border}
          cardColor={colors.card}
        />
        <View style={styles.spacer} />

        <DropDown
          label="Priority"
          options={[
            { label: "High", value: 1 },
            { label: "Medium", value: 2 },
            { label: "Low", value: 3 },
          ]}
          value={priorityId}
          onSelect={setPriorityId}
          placeholder="Select priority"
          textColor={textColor}
          borderColor={colors.border}
          cardColor={colors.card}
        />

        <View style={styles.spacerLarge} />

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <>
            <PrimaryButton title="Create Ticket" onPress={handleSubmit} />
            <View style={styles.spacerSmall} />
            <SecondaryButton title="Cancel" onPress={() => router.back()} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  spacer: { height: 12 },
  spacerSmall: { height: 10 },
  spacerLarge: { height: 24 },

  dropdownButton: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownText: {
    fontSize: 14,
  },
  dropdownCaret: {
    fontSize: 12,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    borderRadius: 10,
    maxHeight: "60%",
    paddingVertical: 8,
  },
  modalItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modalItemText: {
    fontSize: 14,
  },
});