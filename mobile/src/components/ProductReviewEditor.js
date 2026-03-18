import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

function StarRating({ value = 0, onChange, disabled = false }) {
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= Number(value || 0);

        return (
          <TouchableOpacity
            key={star}
            onPress={() => onChange?.(star)}
            activeOpacity={0.8}
            disabled={disabled}
            style={styles.starButton}
          >
            <Text style={[styles.starText, active && styles.starTextActive]}>
              ★
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function ProductReviewEditor({
  mode = "add",
  initialRating = 0,
  initialComment = "",
  isSubmitting = false,
  error = "",
  minCommentLength = 3,
  maxCommentLength = 400,
  submitLabel,
  cancelLabel = "Cancel",
  showCancel = true,
  showDelete = false,
  deleteLabel = "Delete review",
  onSubmit,
  onCancel,
  onDelete,
}) {
  const [rating, setRating] = useState(Number(initialRating) || 0);
  const [comment, setComment] = useState(initialComment || "");

  useEffect(() => {
    setRating(Number(initialRating) || 0);
  }, [initialRating]);

  useEffect(() => {
    setComment(initialComment || "");
  }, [initialComment]);

  const normalizedComment = comment.trim();
  const isValid =
    rating >= 1 &&
    normalizedComment.length >= minCommentLength &&
    normalizedComment.length <= maxCommentLength;

  const resolvedTitle = mode === "update" ? "Update Review" : "Write a Review";
  const resolvedSubmitLabel =
    submitLabel || (mode === "update" ? "Update Review" : "Submit Review");

  const helperText = useMemo(() => {
    if (rating < 1) return "Please select a rating.";
    if (normalizedComment.length < minCommentLength) {
      return `Comment must be at least ${minCommentLength} characters.`;
    }
    if (normalizedComment.length > maxCommentLength) {
      return `Comment must be at most ${maxCommentLength} characters.`;
    }
    return "";
  }, [rating, normalizedComment.length, minCommentLength, maxCommentLength]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{resolvedTitle}</Text>

      <Text style={styles.label}>Rating</Text>
      <StarRating value={rating} onChange={setRating} disabled={isSubmitting} />

      <Text style={styles.label}>Comment</Text>
      <TextInput
        style={styles.commentInput}
        value={comment}
        onChangeText={setComment}
        editable={!isSubmitting}
        multiline
        placeholder="Share your experience with this product..."
        textAlignVertical="top"
        maxLength={maxCommentLength + 20}
      />

      <View style={styles.footerRow}>
        <Text style={styles.counterText}>
          {normalizedComment.length}/{maxCommentLength}
        </Text>
      </View>

      {!!error ? <Text style={styles.errorText}>{error}</Text> : null}
      {!error && !!helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}

      <View style={styles.actionsRow}>
        {showCancel ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={onCancel}
            activeOpacity={0.8}
            disabled={isSubmitting}
          >
            <Text style={styles.secondaryButtonText}>{cancelLabel}</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.primaryButton,
            (!isValid || isSubmitting) && styles.primaryButtonDisabled,
          ]}
          onPress={() =>
            onSubmit?.({
              rating,
              comment: normalizedComment,
            })
          }
          activeOpacity={0.8}
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>{resolvedSubmitLabel}</Text>
          )}
        </TouchableOpacity>
      </View>

      {showDelete && mode === "update" ? (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={onDelete}
          activeOpacity={0.8}
          disabled={isSubmitting}
        >
          <Text style={styles.deleteButtonText}>{deleteLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: "#efefef",
    borderRadius: 14,
    padding: 14,
    backgroundColor: "#fff",
    marginTop: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#222",
    marginBottom: 8,
  },
  starsRow: {
    flexDirection: "row",
    marginBottom: 14,
  },
  starButton: {
    marginRight: 8,
  },
  starText: {
    fontSize: 28,
    color: "#d7d7d7",
  },
  starTextActive: {
    color: "#f4b400",
  },
  commentInput: {
    minHeight: 104,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#222",
    backgroundColor: "#fff",
  },
  footerRow: {
    marginTop: 8,
    alignItems: "flex-end",
  },
  counterText: {
    fontSize: 11,
    color: "#777",
  },
  helperText: {
    marginTop: 8,
    fontSize: 12,
    color: "#666",
  },
  errorText: {
    marginTop: 8,
    fontSize: 12,
    color: "#d11a2a",
  },
  actionsRow: {
    marginTop: 14,
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    flex: 1,
    borderRadius: 10,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: "#111",
  },
  primaryButtonDisabled: {
    backgroundColor: "#b8b8b8",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#d9d9d9",
    backgroundColor: "#fff",
  },
  secondaryButtonText: {
    color: "#333",
    fontSize: 13,
    fontWeight: "600",
  },
  deleteButton: {
    marginTop: 12,
    alignSelf: "flex-start",
  },
  deleteButtonText: {
    color: "#d11a2a",
    fontSize: 13,
    fontWeight: "600",
  },
});
