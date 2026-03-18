import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import PriceRangeFilter from "./PriceRangeFilter";

const ratingOptions = [5, 4, 3, 2, 1];

export default function FilterBottomSheet({
  visible,
  onClose,
  selectedRating,
  onSelectRating,
  minPrice,
  maxPrice,
  onChangeMinPrice,
  onChangeMaxPrice,
  onClearPrice,
  onClearAll,
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              <View style={styles.handle} />

              <View style={styles.headerRow}>
                <Text style={styles.title}>Filters</Text>
                <TouchableOpacity onPress={onClearAll}>
                  <Text style={styles.clearText}>Clear all</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Ratings</Text>
                <View style={styles.ratingRow}>
                  {ratingOptions.map((rating) => {
                    const isActive = selectedRating === rating;

                    return (
                      <TouchableOpacity
                        key={rating}
                        style={[
                          styles.ratingChip,
                          isActive && styles.ratingChipActive,
                        ]}
                        onPress={() => onSelectRating(rating)}
                      >
                        <Text
                          style={[
                            styles.ratingText,
                            isActive && styles.ratingTextActive,
                          ]}
                        >
                          {rating}★ & up
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.section}>
                <PriceRangeFilter
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  onChangeMinPrice={onChangeMinPrice}
                  onChangeMaxPrice={onChangeMaxPrice}
                  onClear={onClearPrice}
                />
              </View>

              <TouchableOpacity style={styles.applyButton} onPress={onClose}>
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
  },
  handle: {
    alignSelf: "center",
    width: 42,
    height: 4,
    borderRadius: 4,
    backgroundColor: "#ddd",
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
  clearText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  section: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
    marginBottom: 10,
  },
  ratingRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  ratingChip: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 18,
    paddingVertical: 7,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  ratingChipActive: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  ratingText: {
    fontSize: 13,
    color: "#333",
    fontWeight: "500",
  },
  ratingTextActive: {
    color: "#fff",
  },
  applyButton: {
    marginTop: 18,
    backgroundColor: "#000",
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
