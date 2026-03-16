import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, FONT, SHADOW } from '../../../constants/adminTheme';

export default function PaginationFooter({ currentPage = 1, totalPages = 1, onPrev, onNext }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.btn, currentPage <= 1 && styles.btnDisabled]}
        onPress={onPrev}
        disabled={currentPage <= 1}
      >
        <Text style={[styles.btnText, currentPage <= 1 && styles.btnTextDisabled]}>← Prev</Text>
      </TouchableOpacity>

      <View style={styles.pageInfo}>
        <Text style={styles.pageCurrent}>{currentPage}</Text>
        <Text style={styles.pageDivider}> / </Text>
        <Text style={styles.pageTotal}>{totalPages}</Text>
      </View>

      <TouchableOpacity
        style={[styles.btn, currentPage >= totalPages && styles.btnDisabled]}
        onPress={onNext}
        disabled={currentPage >= totalPages}
      >
        <Text style={[styles.btnText, currentPage >= totalPages && styles.btnTextDisabled]}>Next →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  btn: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
  },
  btnDisabled: {
    backgroundColor: COLORS.surfaceBorder,
  },
  btnText: {
    color: COLORS.textInverse,
    fontSize: 13,
    fontWeight: FONT.semibold,
  },
  btnTextDisabled: {
    color: COLORS.textMuted,
  },
  pageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pageCurrent: {
    fontSize: 15,
    fontWeight: FONT.bold,
    color: COLORS.primary,
  },
  pageDivider: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  pageTotal: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});
