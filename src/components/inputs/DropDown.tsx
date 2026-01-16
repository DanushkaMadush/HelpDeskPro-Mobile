import React, { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Label } from "../labels/Label";

export type DropDownOption = { label: string; value: number };

interface DropDownProps {
  label: string;
  options: DropDownOption[];
  value?: number;
  onSelect: (v: number) => void;
  placeholder?: string;
  disabled?: boolean;
  textColor: string;
  borderColor: string;
  cardColor: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const DropDown: React.FC<DropDownProps> = ({
  label,
  options,
  value,
  onSelect,
  placeholder = "Select",
  disabled,
  textColor,
  borderColor,
  cardColor,
  style,
  textStyle,
}) => {
  const [visible, setVisible] = useState(false);
  const selectedLabel = options.find((o) => o.value === value)?.label;

  return (
    <View style={style}>
      <Label text={label} />
      <Pressable
        disabled={disabled}
        onPress={() => setVisible(true)}
        style={[
          styles.dropdownButton,
          { borderColor, backgroundColor: cardColor, opacity: disabled ? 0.6 : 1 },
        ]}
      >
        <Text style={[styles.dropdownText, { color: textColor }, textStyle]}>
          {selectedLabel || placeholder}
        </Text>
        <Text style={[styles.dropdownCaret, { color: textColor }]}>▼</Text>
      </Pressable>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setVisible(false)}>
          <View style={[styles.modalCard, { backgroundColor: cardColor }]}>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value.toString()}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.modalItem}
                  onPress={() => {
                    onSelect(item.value);
                    setVisible(false);
                  }}
                >
                  <Text style={[styles.modalItemText, { color: textColor }]}>{item.label}</Text>
                </Pressable>
              )}
              ListEmptyComponent={
                <Text style={[styles.modalItemText, { color: textColor, textAlign: "center" }]}>
                  No options
                </Text>
              }
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
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