import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING, FONT } from '../../../constants/adminTheme';

const STATUS_COLORS = {
  pending: { bg: COLORS.warningLight, text: COLORS.warning },
  processing: { bg: COLORS.infoLight, text: COLORS.info },
  completed: { bg: COLORS.successLight, text: COLORS.success },
  shipped: { bg: COLORS.infoLight, text: COLORS.info },
  delivered: { bg: COLORS.successLight, text: COLORS.success },
  cancelled: { bg: COLORS.dangerLight, text: COLORS.danger },
  returned: { bg: COLORS.dangerLight, text: COLORS.danger },
  active: { bg: COLORS.successLight, text: COLORS.success },
  inactive: { bg: COLORS.dangerLight, text: COLORS.danger },
  low: { bg: COLORS.warningLight, text: COLORS.warning },
  ok: { bg: COLORS.successLight, text: COLORS.success },
  admin: { bg: '#EDE9FE', text: '#7C3AED' },
  staff: { bg: COLORS.infoLight, text: COLORS.info },
  customer: { bg: COLORS.successLight, text: COLORS.success },
};

export default function StatusChip({ status, size = 'sm' }) {
  const key = status?.toLowerCase() || 'pending';
  const colors = STATUS_COLORS[key] || STATUS_COLORS.pending;

  return (
    <View style={[styles.chip, { backgroundColor: colors.bg }, size === 'lg' && styles.chipLg]}>
      <View style={[styles.dot, { backgroundColor: colors.text }]} />
      <Text style={[styles.label, { color: colors.text }, size === 'lg' && styles.labelLg]}>
        {status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  chipLg: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: SPACING.xs,
  },
  label: {
    fontSize: 11,
    fontWeight: FONT.semibold,
    textTransform: 'capitalize',
  },
  labelLg: {
    fontSize: 13,
  },
});
