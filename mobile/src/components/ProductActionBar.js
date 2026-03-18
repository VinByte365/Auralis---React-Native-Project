import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function ProductActionBar({
  price = "0.00",
  isLiked = false,
  onToggleLike,
  onAddToCart,
  onOrderNow,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.priceWrap}>
        <Text style={styles.priceLabel}>Price</Text>
        <Text style={styles.priceValue}>PHP {price}</Text>
      </View>

      <TouchableOpacity
        style={styles.likeButton}
        onPress={onToggleLike}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons
          name={isLiked ? "heart" : "heart-outline"}
          size={20}
          color={isLiked ? "#d11a2a" : "#333"}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.addButton}
        onPress={onAddToCart}
        activeOpacity={0.85}
      >
        <Text style={styles.addButtonText}>Add to Cart</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.orderButton}
        onPress={onOrderNow}
        activeOpacity={0.85}
      >
        <Text style={styles.orderButtonText}>Order Now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: "#efefef",
    backgroundColor: "#fff",
  },
  priceWrap: {
    marginRight: 10,
  },
  priceLabel: {
    fontSize: 11,
    color: "#666",
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
  },
  likeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
    marginRight: 8,
  },
  addButton: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  addButtonText: {
    fontSize: 13,
    color: "#111",
    fontWeight: "600",
  },
  orderButton: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },
  orderButtonText: {
    fontSize: 13,
    color: "#fff",
    fontWeight: "600",
  },
});
