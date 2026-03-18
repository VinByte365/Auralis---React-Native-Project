import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

function ReviewCard({ review }) {
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewTopRow}>
        <Text style={styles.reviewUser}>{review?.user?.name || "User"}</Text>
        <Text style={styles.reviewRating}>{Number(review?.rating || 0)} ★</Text>
      </View>
      <Text style={styles.reviewComment}>
        {review?.comment?.trim() || "No comment"}
      </Text>
    </View>
  );
}

export default function ProductReviewSection({
  title = "Reviews",
  summary,
  reviews = [],
  isLoading = false,
  error = "",
  maxItems = 5,
  emptyText = "No reviews yet.",
  loadingText = "Loading reviews...",
  writeReviewLabel = "Write a Review",
  showWriteReview = true,
  onPressWriteReview,
  onPressViewAll,
}) {
  const safeReviews = Array.isArray(reviews) ? reviews : [];
  const visibleReviews = safeReviews.slice(
    0,
    Math.max(Number(maxItems) || 0, 0),
  );

  return (
    <View>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.reviewSummary}>
          {summary?.averageRating || "0.0"} ★ ({summary?.totalReviews || 0})
        </Text>
      </View>

      {showWriteReview ? (
        <TouchableOpacity
          style={styles.writeButton}
          onPress={onPressWriteReview}
          activeOpacity={0.8}
        >
          <Text style={styles.writeButtonText}>{writeReviewLabel}</Text>
        </TouchableOpacity>
      ) : null}

      {isLoading ? <Text style={styles.helperText}>{loadingText}</Text> : null}

      {!isLoading && !!error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}

      {!isLoading && !error && visibleReviews.length === 0 ? (
        <Text style={styles.helperText}>{emptyText}</Text>
      ) : null}

      {!isLoading && !error && visibleReviews.length > 0
        ? visibleReviews.map((review) => (
            <ReviewCard
              key={String(review?._id || Math.random())}
              review={review}
            />
          ))
        : null}

      {!isLoading && !error && safeReviews.length > visibleReviews.length ? (
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={onPressViewAll}
          activeOpacity={0.7}
        >
          <Text style={styles.viewAllText}>View all reviews</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },
  reviewSummary: {
    fontSize: 13,
    color: "#555",
    fontWeight: "600",
  },
  writeButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#111",
    marginBottom: 12,
  },
  writeButtonText: {
    color: "#fff",
    fontSize: 12,
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
  viewAllButton: {
    alignSelf: "flex-start",
    paddingVertical: 4,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111",
  },
});
