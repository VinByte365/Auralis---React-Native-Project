import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, FONT, SHADOW } from '../../../constants/adminTheme';

export default function KpiCard({ icon, label, value, trend, trendLabel, color = COLORS.primary }) {
  const isPositive = trend > 0;
  const trendColor = isPositive ? COLORS.success : trend < 0 ? COLORS.danger : COLORS.textMuted;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: color + '15' }]}>
          <Text style={[styles.icon, { color }]}>{icon}</Text>
        </View>
        {trend !== undefined && (
          <View style={[styles.trendBadge, { backgroundColor: trendColor + '15' }]}>
            <Text style={[styles.trendText, { color: trendColor }]}>
              {isPositive ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend)}%
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {trendLabel && <Text style={[styles.trendLabel, { color: trendColor }]}>{trendLabel}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    minWidth: 140,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    ...SHADOW.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 18,
  },
  trendBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  trendText: {
    fontSize: 11,
    fontWeight: FONT.semibold,
  },
  value: {
    fontSize: 22,
    fontWeight: FONT.bold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  label: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: FONT.medium,
  },
  trendLabel: {
    fontSize: 11,
    marginTop: SPACING.xs,
    fontWeight: FONT.medium,
  },
});
