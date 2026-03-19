import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { COLORS, FONT, SPACING } from "../../../constants/adminTheme";

export default function EmptyState({
  icon,
  title = "No data found",
  description = "There are no items to display right now.",
}) {
  return (
    <View style={styles.container}>
      {icon ? <Text style={styles.icon}>{icon}</Text> : <View style={styles.placeholderIcon} />}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.xxxl,
    paddingVertical: 60,
  },
  icon: {
    fontSize: 24,
    marginBottom: SPACING.lg,
    color: COLORS.textMuted,
  },
  placeholderIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceBorder,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: FONT.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
});
