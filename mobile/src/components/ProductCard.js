import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import React from "react";

const productImagePlaceholder = require("../../assets/home/3.png");

export default function ProductCard({ products, handleClick }) {
  const renderProduct = ({ item }) => {
    const basePrice = Number(item?.price || 0);
    const salePrice = Number(item?.salePrice || 0);
    const hasDiscount =
      Boolean(item?.saleActive) && salePrice > 0 && salePrice < basePrice;
    const displayPrice = hasDiscount ? salePrice : basePrice;
    const discountPercent =
      hasDiscount && basePrice > 0
        ? Math.round(((basePrice - salePrice) / basePrice) * 100)
        : 0;

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => handleClick?.(item._id)}
      >
        <View style={styles.productImage}>
          {item.images?.[0]?.url ? (
            <Image
              source={{ uri: item.images[0].url }}
              style={styles.productImageAsset}
              resizeMode="cover"
            />
          ) : (
            <Image
              source={productImagePlaceholder}
              style={styles.productImageAsset}
              resizeMode="contain"
            />
          )}
          {hasDiscount ? (
            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeText}>-{discountPercent}%</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          <View style={styles.productMeta}>
            <View>
              <Text style={styles.productPrice}>
                PHP {displayPrice.toFixed(2)}
              </Text>
              {hasDiscount ? (
                <Text style={styles.productPriceOriginal}>
                  PHP {basePrice.toFixed(2)}
                </Text>
              ) : null}
            </View>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>{item.unit || "pc"}</Text>
            </View>
          </View>
          <Text style={styles.soldText}>
            {item.category?.categoryName || "Uncategorized"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={products}
      renderItem={renderProduct}
      numColumns={2}
      keyExtractor={(item) => String(item._id || item.id)}
      contentContainerStyle={styles.container}
      scrollEnabled={false}
      columnWrapperStyle={styles.columnWrapper}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  productCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    marginBottom: 16,
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#fafafa",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    overflow: "hidden",
  },
  productImageAsset: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f5f5f5",
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 6,
    lineHeight: 18,
  },
  productMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  productPriceOriginal: {
    fontSize: 11,
    color: "#999",
    textDecorationLine: "line-through",
    marginTop: 2,
  },
  discountBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#d11a2a",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  discountBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingStar: {
    color: "#FFB800",
    fontSize: 12,
    marginRight: 2,
  },
  ratingText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  soldText: {
    fontSize: 11,
    color: "#999",
    fontWeight: "400",
  },
});
