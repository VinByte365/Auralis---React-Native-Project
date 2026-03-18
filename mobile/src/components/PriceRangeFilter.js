import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function PriceRangeFilter({
  minPrice,
  maxPrice,
  onChangeMinPrice,
  onChangeMaxPrice,
  onClear,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>Price Range</Text>
        <TouchableOpacity onPress={onClear}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputsRow}>
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Min</Text>
          <TextInput
            value={minPrice}
            onChangeText={onChangeMinPrice}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#999"
            style={styles.input}
          />
        </View>

        <View style={styles.separator} />

        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Max</Text>
          <TextInput
            value={maxPrice}
            onChangeText={onChangeMaxPrice}
            keyboardType="numeric"
            placeholder="5000"
            placeholderTextColor="#999"
            style={styles.input}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ececec",
    borderRadius: 14,
    backgroundColor: "#fafafa",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
  },
  clearText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },
  inputsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputWrapper: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    color: "#111",
    fontSize: 14,
  },
  separator: {
    width: 12,
  },
});
