import React from "react";
import {
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import useProduct from "../../hooks/user/useProduct";
import ProductActionBar from "../../components/ProductActionBar";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/thunks/cartThunks";

const productImagePlaceholder = require("../../../assets/home/3.png");

export default function ProductScreen({ route, navigation }) {
  const productId = route?.params?.productId;
  const dispatch = useDispatch();
  const [isLiked, setIsLiked] = React.useState(false);
  const {
    productDetails,
    isLoading,
    reviews,
    summary,
    reviewLoading,
    reviewError,
    suggestedProducts,
    displayPrice,
  } = useProduct(productId);

  const handleAddToCart = async () => {
    if (!productDetails?._id) return;

    try {
      await dispatch(
        addToCart({ product: productDetails, quantity: 1 }),
      ).unwrap();
      Alert.alert(
        "Added to cart",
        `${productDetails.name} was added to your cart.`,
      );
    } catch (error) {
      Alert.alert(
        "Unable to add",
        error?.error || error?.message || "Please try again.",
      );
    }
  };

  const handleOrderNow = async () => {
    if (!productDetails?._id) return;

    try {
      await dispatch(
        addToCart({ product: productDetails, quantity: 1 }),
      ).unwrap();
      navigation.navigate("Cart");
    } catch (error) {
      Alert.alert(
        "Unable to order",
        error?.error || error?.message || "Please try again.",
      );
    }
  };

  if (!productId) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.centeredState}>
          <Text style={styles.stateText}>No product selected.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialCommunityIcons name="arrow-left" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {isLoading && !productDetails ? (
          <View style={styles.centeredState}>
            <Text style={styles.stateText}>Loading product...</Text>
          </View>
        ) : null}

        {!isLoading && !productDetails ? (
          <View style={styles.centeredState}>
            <Text style={styles.stateText}>Product not found.</Text>
          </View>
        ) : null}

        {productDetails ? (
          <>
            <View style={styles.imageCard}>
              <Image
                source={
                  productDetails?.images?.[0]?.url
                    ? { uri: productDetails.images[0].url }
                    : productImagePlaceholder
                }
                style={styles.productImage}
                resizeMode={
                  productDetails?.images?.[0]?.url ? "cover" : "contain"
                }
              />
            </View>

            <Text style={styles.productName}>{productDetails.name}</Text>
            <Text style={styles.productPrice}>PHP {displayPrice}</Text>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Text style={styles.metaText}>
                  {productDetails.category?.categoryName || "Uncategorized"}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaText}>
                  Stock: {productDetails.stockQuantity ?? 0}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaText}>
                  {productDetails.unit || "pc"}
                </Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>
              {productDetails.description?.trim() ||
                "No description available."}
            </Text>

            <View style={styles.reviewHeaderRow}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              <Text style={styles.reviewSummary}>
                {summary?.averageRating || "0.0"} ★ (
                {summary?.totalReviews || 0})
              </Text>
            </View>

            {reviewLoading ? (
              <Text style={styles.helperText}>Loading reviews...</Text>
            ) : null}

            {!reviewLoading && reviewError ? (
              <Text style={styles.errorText}>{reviewError}</Text>
            ) : null}

            {!reviewLoading && !reviewError && reviews.length === 0 ? (
              <Text style={styles.helperText}>No reviews yet.</Text>
            ) : null}

            {!reviewLoading && !reviewError && reviews.length > 0
              ? reviews.slice(0, 5).map((review) => (
                  <View style={styles.reviewCard} key={review._id}>
                    <View style={styles.reviewTopRow}>
                      <Text style={styles.reviewUser}>
                        {review.user?.name || "User"}
                      </Text>
                      <Text style={styles.reviewRating}>{review.rating} ★</Text>
                    </View>
                    <Text style={styles.reviewComment}>
                      {review.comment?.trim() || "No comment"}
                    </Text>
                  </View>
                ))
              : null}

            <Text style={[styles.sectionTitle, styles.suggestionsTitle]}>
              You may also like
            </Text>

            {suggestedProducts.length === 0 ? (
              <Text style={styles.helperText}>No suggestions available.</Text>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.suggestionsContainer}
              >
                {suggestedProducts.map((item, index) => (
                  <TouchableOpacity
                    key={item._id}
                    style={[
                      styles.suggestionCard,
                      index === suggestedProducts.length - 1 &&
                        styles.lastSuggestionCard,
                    ]}
                    onPress={() =>
                      navigation.push("Product", { productId: item._id })
                    }
                    activeOpacity={0.7}
                  >
                    <View style={styles.suggestionImageContainer}>
                      <Image
                        source={
                          item?.images?.[0]?.url
                            ? { uri: item.images[0].url }
                            : productImagePlaceholder
                        }
                        style={styles.suggestionImage}
                        resizeMode="contain"
                      />
                    </View>
                    <Text style={styles.suggestionName} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Text style={styles.suggestionPrice}>
                      PHP {Number(item.price || 0).toFixed(2)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </>
        ) : null}
      </ScrollView>

      {productDetails ? (
        <ProductActionBar
          price={displayPrice}
          isLiked={isLiked}
          onToggleLike={() => setIsLiked((prev) => !prev)}
          onAddToCart={handleAddToCart}
          onOrderNow={handleOrderNow}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    padding: 16,
    paddingBottom: 96,
  },
  centeredState: {
    flex: 1,
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  stateText: {
    color: "#666",
    fontSize: 14,
  },
  imageCard: {
    width: "100%",
    aspectRatio: 1.15,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    overflow: "hidden",
    backgroundColor: "#fafafa",
    marginBottom: 16,
  },
  productImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f5f5f5",
  },
  productName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000",
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
    marginHorizontal: -4,
  },
  metaItem: {
    margin: 4,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    overflow: "hidden",
  },
  metaText: {
    fontSize: 12,
    color: "#555",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 21,
    marginBottom: 16,
  },
  reviewHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  reviewSummary: {
    fontSize: 13,
    color: "#555",
    fontWeight: "600",
  },
  helperText: {
    fontSize: 13,
    color: "#666",
    marginBottom: 16,
    fontStyle: "italic",
  },
  errorText: {
    fontSize: 13,
    color: "#d11a2a",
    marginBottom: 16,
  },
  reviewCard: {
    borderWidth: 1,
    borderColor: "#efefef",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  reviewTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  reviewUser: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
  },
  reviewRating: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
  },
  reviewComment: {
    fontSize: 13,
    color: "#444",
    lineHeight: 19,
  },
  suggestionsTitle: {
    marginTop: 8,
  },
  suggestionsContainer: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  suggestionCard: {
    width: 140,
    marginRight: 12,
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden", // This ensures nothing spills out
  },
  lastSuggestionCard: {
    marginRight: 0,
  },
  suggestionImageContainer: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    overflow: "hidden", // Critical: This clips the image to the container
    marginBottom: 8,
  },
  suggestionImage: {
    width: "100%",
    height: "100%",
  },
  suggestionName: {
    fontSize: 13,
    color: "#222",
    fontWeight: "500",
    lineHeight: 18,
    marginBottom: 4,
    paddingHorizontal: 2,
  },
  suggestionPrice: {
    fontSize: 13,
    color: "#111",
    fontWeight: "600",
    paddingHorizontal: 2,
    marginBottom: 4,
  },
});
