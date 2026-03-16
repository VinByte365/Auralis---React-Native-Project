import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, FONT, SHADOW } from '../../../constants/adminTheme';

export default function ChartCard({ title, subtitle, children, height = 200 }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <View style={[styles.chartArea, { height }]}>
        {children || <ChartPlaceholder height={height} />}
      </View>
    </View>
  );
}

function ChartPlaceholder({ height }) {
  const barCount = 7;
  const barHeights = [0.4, 0.65, 0.5, 0.8, 0.6, 0.9, 0.7];

  return (
    <View style={[styles.placeholder, { height: height - 20 }]}>
      {barHeights.map((h, i) => (
        <View
          key={i}
          style={[
            styles.bar,
            {
              height: `${h * 100}%`,
              backgroundColor: i === 5 ? COLORS.primary : COLORS.primaryLight + '60',
              borderRadius: RADIUS.xs,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    ...SHADOW.sm,
  },
  header: {
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 15,
    fontWeight: FONT.semibold,
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  chartArea: {
    width: '100%',
  },
  placeholder: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.sm,
  },
  bar: {
    width: 24,
    minHeight: 8,
  },
});
