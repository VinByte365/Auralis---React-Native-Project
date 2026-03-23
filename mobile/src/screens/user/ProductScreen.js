import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Carousel from "react-native-reanimated-carousel";
import useProduct from "../../hooks/user/useProduct";
import ProductActionBar from "../../components/ProductActionBar";
import ProductReviewSection from "../../components/ProductReviewSection";
import ProductReviewEditor from "../../components/ProductReviewEditor";
const productImagePlaceholder = require("../../../assets/home/3.png");
const SCREEN_WIDTH = Dimensions.get("window").width;

function resolveImageUri(imageEntry) {
  if (!imageEntry) return null;
  if (typeof imageEntry === "string") return imageEntry;
  if (typeof imageEntry !== "object") return null;

  return (
    imageEntry.uri ||
    imageEntry.url ||
    imageEntry.secure_url ||
    imageEntry.imageUrl ||
    imageEntry.image ||
    null
  );
}

export default function ProductScreen({ route, navigation }) {
  const [imageCarouselIndex, setImageCarouselIndex] = useState(0);
  const productId = route?.params?.productId;
  const {
    userId,
    productDetails,
    isLoading,
    reviews,
    summary,
    reviewLoading,
    reviewError,
    suggestedProducts,
    displayPrice,
    canReview,
    myReview,
    isLiked,
    showReviewEditor,
    reviewEditorMode,
    isSubmittingReview,
    setShowReviewEditor,
    setIsLiked,
    handleAddToCart,
    handleOrderNow,
    handleReviewSubmit,
    handleDeleteReview,
    openAddReviewEditor,
    openEditReviewEditor,
  } = useProduct(productId, navigation);

  const reviewSectionSummary = summary;
  const reviewSectionData = Array.isArray(reviews) ? reviews : [];
  const reviewSectionLoading = reviewLoading;
  const reviewSectionError = reviewError;
  const basePrice = Number(productDetails?.price || 0);
  const salePrice = Number(productDetails?.salePrice || 0);
  const hasDiscount =
    Boolean(productDetails?.saleActive) &&
    salePrice > 0 &&
    salePrice < basePrice;
  const discountPercent =
    hasDiscount && basePrice > 0
      ? Math.round(((basePrice - salePrice) / basePrice) * 100)
      : 0;

  const productImages = useMemo(() => {
    const normalized = Array.isArray(productDetails?.images)
      ? productDetails.images
          .map((item) => ({ uri: resolveImageUri(item) }))
          .filter((item) => Boolean(item?.uri))
      : [];

    return normalized.length > 0 ? normalized : [{ uri: null }];
  }, [productDetails?.images]);

  useEffect(() => {
    setImageCarouselIndex(0);
  }, [productId]);

  const carouselWidth = SCREEN_WIDTH - 32;
  const carouselHeight = carouselWidth / 1.15;

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
              <Carousel
                width={carouselWidth}
                height={carouselHeight}
                data={productImages}
                loop={productImages.length > 1}
                pagingEnabled
                snapEnabled
                onSnapToItem={(index) => setImageCarouselIndex(index)}
                renderItem={({ item }) => {
                  const imageUrl = item?.uri;
                  return (
                    <Image
                      source={
                        imageUrl ? { uri: imageUrl } : productImagePlaceholder
                      }
                      style={styles.productImage}
                      resizeMode={imageUrl ? "cover" : "contain"}
                    />
                  );
                }}
              />

              {productImages.length > 1 ? (
                <View style={styles.carouselDots}>
                  {productImages.map((_, index) => (
                    <View
                      key={`dot-${index}`}
                      style={[
                        styles.carouselDot,
                        imageCarouselIndex === index &&
                          styles.carouselDotActive,
                      ]}
                    />
                  ))}
                </View>
              ) : null}
            </View>

            <Text style={styles.productName}>{productDetails.name}</Text>
            <View style={styles.priceWrap}>
              <Text style={styles.productPrice}>PHP {displayPrice}</Text>
              {hasDiscount ? (
                <>
                  <Text style={styles.productPriceOriginal}>
                    PHP {basePrice.toFixed(2)}
                  </Text>
                  <View style={styles.discountTag}>
                    <Text style={styles.discountTagText}>
                      -{discountPercent}% OFF
                    </Text>
                  </View>
                </>
              ) : null}
            </View>

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

            <ProductReviewSection
              title="Reviews"
              summary={reviewSectionSummary}
              reviews={reviewSectionData}
              isLoading={reviewSectionLoading}
              error={reviewSectionError}
              maxItems={5}
              showWriteReview={canReview}
              currentUserId={userId}
              onPressWriteReview={openAddReviewEditor}
              onPressEditReview={openEditReviewEditor}
              onPressDeleteReview={(review) => {
                Alert.alert(
                  "Delete review",
                  "Are you sure you want to delete your review?",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: () => {
                        if (String(review?._id) === String(myReview?._id)) {
                          handleDeleteReview();
                        }
                      },
                    },
                  ],
                );
              }}
              onPressViewAll={() =>
                Alert.alert(
                  "View all reviews",
                  "Connect your full reviews screen here.",
                )
              }
            />

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
                {suggestedProducts.map((item, index) =>
                  (() => {
                    const suggestedBasePrice = Number(item?.price || 0);
                    const suggestedSalePrice = Number(item?.salePrice || 0);
                    const suggestedHasDiscount =
                      Boolean(item?.saleActive) &&
                      suggestedSalePrice > 0 &&
                      suggestedSalePrice < suggestedBasePrice;
                    const suggestedDiscountPercent =
                      suggestedHasDiscount && suggestedBasePrice > 0
                        ? Math.round(
                            ((suggestedBasePrice - suggestedSalePrice) /
                              suggestedBasePrice) *
                              100,
                          )
                        : 0;

                    return (
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
                          {(() => {
                            const suggestionImageUri = resolveImageUri(
                              item?.images?.[0],
                            );

                            return (
                              <Image
                                source={
                                  suggestionImageUri
                                    ? { uri: suggestionImageUri }
                                    : productImagePlaceholder
                                }
                                style={styles.suggestionImage}
                                resizeMode="contain"
                              />
                            );
                          })()}
                        </View>
                        <Text style={styles.suggestionName} numberOfLines={2}>
                          {item.name}
                        </Text>
                        <Text style={styles.suggestionPrice}>
                          PHP{" "}
                          {Number(
                            suggestedHasDiscount
                              ? suggestedSalePrice
                              : suggestedBasePrice,
                          ).toFixed(2)}
                        </Text>
                        {suggestedHasDiscount ? (
                          <View style={styles.suggestionDiscountRow}>
                            <Text style={styles.suggestionPriceOriginal}>
                              PHP {suggestedBasePrice.toFixed(2)}
                            </Text>
                            <Text style={styles.suggestionDiscountText}>
                              -{suggestedDiscountPercent}%
                            </Text>
                          </View>
                        ) : null}
                      </TouchableOpacity>
                    );
                  })(),
                )}
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

      <Modal
        visible={showReviewEditor}
        animationType="slide"
        transparent
        onRequestClose={() => setShowReviewEditor(false)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={styles.modalCloseArea}
            onPress={() => setShowReviewEditor(false)}
            activeOpacity={1}
          />

          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <ProductReviewEditor
              mode={reviewEditorMode}
              initialRating={
                reviewEditorMode === "update" ? myReview?.rating || 0 : 0
              }
              initialComment={
                reviewEditorMode === "update" ? myReview?.comment || "" : ""
              }
              isSubmitting={isSubmittingReview}
              showDelete={reviewEditorMode === "update"}
              onCancel={() => setShowReviewEditor(false)}
              onDelete={() => {
                Alert.alert(
                  "Delete review",
                  "Are you sure you want to delete your review?",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: handleDeleteReview,
                    },
                  ],
                );
              }}
              onSubmit={handleReviewSubmit}
            />
          </View>
        </View>
      </Modal>
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
  carouselDots: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  carouselDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.7)",
    marginHorizontal: 3,
  },
  carouselDotActive: {
    width: 16,
    backgroundColor: "#fff",
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
    marginBottom: 4,
  },
  priceWrap: {
    marginBottom: 12,
  },
  productPriceOriginal: {
    fontSize: 14,
    color: "#888",
    textDecorationLine: "line-through",
    marginBottom: 6,
  },
  discountTag: {
    alignSelf: "flex-start",
    backgroundColor: "#d11a2a",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  discountTagText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
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
    marginBottom: 2,
  },
  suggestionDiscountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 2,
    marginBottom: 4,
  },
  suggestionPriceOriginal: {
    fontSize: 11,
    color: "#888",
    textDecorationLine: "line-through",
  },
  suggestionDiscountText: {
    fontSize: 11,
    color: "#d11a2a",
    fontWeight: "700",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalCloseArea: {
    flex: 1,
  },
  modalSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 22,
  },
  modalHandle: {
    alignSelf: "center",
    width: 42,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#d7d7d7",
    marginBottom: 10,
  },
});
