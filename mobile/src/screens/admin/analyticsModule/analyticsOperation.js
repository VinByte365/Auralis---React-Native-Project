import React, { useState } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS, FONT, SHADOW } from '../../../constants/adminTheme';
import AppHeader from '../components/AppHeader';
import KpiCard from '../components/KpiCard';
import ChartCard from '../components/ChartCard';
import SectionHeader from '../components/SectionHeader';

const DATE_RANGES = ['7 Days', '30 Days', '90 Days'];

const MOCK_STAFF = [
  { name: 'Carlos Mendoza', role: 'Cashier', processed: 145, avgTime: '2.3 min', rating: 4.8 },
  { name: 'Rosa Villanueva', role: 'Cashier', processed: 132, avgTime: '2.5 min', rating: 4.7 },
  { name: 'Miguel Torres', role: 'Staff', processed: 98, avgTime: '3.1 min', rating: 4.5 },
  { name: 'Elena Reyes', role: 'Staff', processed: 87, avgTime: '2.8 min', rating: 4.6 },
];

const MOCK_OPS = [
  { label: 'Avg. Processing Time', value: '2.6 min', icon: '⏱️', trend: -5 },
  { label: 'Queue Wait Time', value: '4.2 min', icon: '⏳', trend: -8 },
  { label: 'Fulfillment Rate', value: '97.3%', icon: '✅', trend: 1.5 },
  { label: 'Customer Satisfaction', value: '4.6/5', icon: '⭐', trend: 2.1 },
];

export default function AnalyticsOperation() {
  const navigation = useNavigation();
  const [selectedRange, setSelectedRange] = useState('30 Days');

  return (
    <View style={styles.root}>
      <AppHeader title="Operations Analytics" subtitle="Orders, returns & staff performance" navigation={navigation} />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Date Range */}
        <View style={styles.dateRow}>
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

        {/* KPIs */}
        <View style={styles.kpiRow}>
          <KpiCard icon="📦" label="Total Orders" value="1,284" trend={8.5} color={COLORS.info} />
          <KpiCard icon="↩️" label="Returns" value="34" trend={-12} color={COLORS.danger} />
        </View>

        {/* Operations Chart */}
        <View style={{ marginTop: SPACING.md }}>
          <ChartCard title="Order Volume" subtitle={`Last ${selectedRange}`} height={180} />
        </View>

        {/* Operation Stats */}
        <SectionHeader title="Operation Metrics" />
        <View style={styles.opsGrid}>
          {MOCK_OPS.map((op, i) => (
            <View key={i} style={styles.opCard}>
              <Text style={styles.opIcon}>{op.icon}</Text>
              <Text style={styles.opValue}>{op.value}</Text>
              <Text style={styles.opLabel}>{op.label}</Text>
              <Text style={[styles.opTrend, { color: op.trend < 0 ? COLORS.success : COLORS.info }]}>
                {op.trend < 0 ? '↓' : '↑'} {Math.abs(op.trend)}%
              </Text>
            </View>
          ))}
        </View>

        {/* Staff Performance */}
        <SectionHeader title="Staff Performance" actionLabel="View All" />
        <View style={styles.staffCard}>
          {MOCK_STAFF.map((staff, i) => (
            <View key={i} style={[styles.staffRow, i === MOCK_STAFF.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={styles.staffAvatar}>
                <Text style={styles.staffAvatarText}>{staff.name[0]}</Text>
              </View>
              <View style={styles.staffInfo}>
                <Text style={styles.staffName}>{staff.name}</Text>
                <Text style={styles.staffRole}>{staff.role}</Text>
              </View>
              <View style={styles.staffStats}>
                <Text style={styles.staffProcessed}>{staff.processed} orders</Text>
                <View style={styles.staffMeta}>
                  <Text style={styles.staffAvgTime}>{staff.avgTime}</Text>
                  <Text style={styles.staffRating}>⭐ {staff.rating}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  dateRow: {
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
  dateChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  dateChipText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: FONT.medium },
  dateChipTextActive: { color: COLORS.textInverse },
  kpiRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  opsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  opCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    ...SHADOW.sm,
  },
  opIcon: { fontSize: 24, marginBottom: SPACING.sm },
  opValue: { fontSize: 18, fontWeight: FONT.bold, color: COLORS.textPrimary },
  opLabel: { fontSize: 11, color: COLORS.textSecondary, textAlign: 'center', marginTop: 2, fontWeight: FONT.medium },
  opTrend: { fontSize: 11, fontWeight: FONT.semibold, marginTop: SPACING.xs },
  staffCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    overflow: 'hidden',
    ...SHADOW.sm,
  },
  staffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  staffAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.infoLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  staffAvatarText: { fontSize: 15, fontWeight: FONT.bold, color: COLORS.info },
  staffInfo: { flex: 1 },
  staffName: { fontSize: 14, fontWeight: FONT.semibold, color: COLORS.textPrimary },
  staffRole: { fontSize: 12, color: COLORS.textMuted, marginTop: 1 },
  staffStats: { alignItems: 'flex-end' },
  staffProcessed: { fontSize: 13, fontWeight: FONT.bold, color: COLORS.textPrimary },
  staffMeta: { flexDirection: 'row', gap: SPACING.sm, marginTop: 2 },
  staffAvgTime: { fontSize: 11, color: COLORS.textSecondary },
  staffRating: { fontSize: 11, color: COLORS.warning },
});