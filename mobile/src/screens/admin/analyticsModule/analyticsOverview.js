import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS, FONT, SHADOW } from '../../../constants/adminTheme';
import AppHeader from '../components/AppHeader';
import KpiCard from '../components/KpiCard';
import ChartCard from '../components/ChartCard';
import SectionHeader from '../components/SectionHeader';

const DATE_RANGES = ['7 Days', '30 Days', '90 Days', 'Year'];

const MOCK_KPI = [
  { icon: '💰', label: 'Total Revenue', value: '₱528,430', trend: 14.2, color: COLORS.success },
  { icon: '📊', label: 'Avg. Order Value', value: '₱1,245', trend: 3.8, color: COLORS.primary },
  { icon: '📦', label: 'Total Orders', value: '4,284', trend: 8.5, color: COLORS.info },
  { icon: '↩️', label: 'Return Rate', value: '2.3%', trend: -1.2, color: COLORS.warning },
];

export default function AnalyticsOverview() {
  const navigation = useNavigation();
  const [selectedRange, setSelectedRange] = useState('30 Days');

  return (
    <View style={styles.root}>
      <AppHeader title="Analytics Overview" subtitle="Business insights & trends" navigation={navigation} />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Date Range Picker */}
        <View style={styles.dateRangeWrap}>
          {DATE_RANGES.map((range) => (
            <TouchableOpacity
              key={range}
              style={[styles.dateChip, selectedRange === range && styles.dateChipActive]}
              onPress={() => setSelectedRange(range)}
            >
              <Text style={[styles.dateChipText, selectedRange === range && styles.dateChipTextActive]}>
                {range}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* KPI Cards */}
        <View style={styles.kpiGrid}>
          {MOCK_KPI.map((kpi, i) => (
            <View key={i} style={styles.kpiItem}>
              <KpiCard {...kpi} />
            </View>
          ))}
        </View>

        {/* Sales Chart */}
        <ChartCard title="Sales Trend" subtitle={`Last ${selectedRange}`} height={200} />

        {/* Revenue Chart */}
        <ChartCard title="Revenue Distribution" subtitle="By category" height={180} />

        {/* Predictive Insights */}
        <SectionHeader title="Predictive Insights" />
        <View style={styles.insightsCard}>
          <View style={styles.insightRow}>
            <Text style={styles.insightIcon}>🔮</Text>
            <View style={styles.insightInfo}>
              <Text style={styles.insightTitle}>Projected Revenue (Next 30 days)</Text>
              <Text style={styles.insightValue}>₱645,000 — ₱720,000</Text>
            </View>
          </View>
          <View style={styles.insightDivider} />
          <View style={styles.insightRow}>
            <Text style={styles.insightIcon}>📈</Text>
            <View style={styles.insightInfo}>
              <Text style={styles.insightTitle}>Expected Order Growth</Text>
              <Text style={styles.insightValue}>+12% increase in transactions</Text>
            </View>
          </View>
          <View style={styles.insightDivider} />
          <View style={styles.insightRow}>
            <Text style={styles.insightIcon}>⚠️</Text>
            <View style={styles.insightInfo}>
              <Text style={styles.insightTitle}>Stock Alert</Text>
              <Text style={styles.insightValue}>5 products may run out within 2 weeks</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  dateRangeWrap: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  dateChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    backgroundColor: COLORS.surface,
  },
  dateChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dateChipText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: FONT.medium,
  },
  dateChipTextActive: {
    color: COLORS.textInverse,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  kpiItem: { width: '47%' },
  insightsCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    ...SHADOW.sm,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  insightIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  insightInfo: { flex: 1 },
  insightTitle: {
    fontSize: 13,
    fontWeight: FONT.semibold,
    color: COLORS.textPrimary,
  },
  insightValue: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  insightDivider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.xs,
  },
});
