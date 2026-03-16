import React, { useState } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS, FONT, SHADOW } from '../../../constants/adminTheme';
import AppHeader from '../components/AppHeader';
import KpiCard from '../components/KpiCard';
import ChartCard from '../components/ChartCard';
import SectionHeader from '../components/SectionHeader';

const DATE_RANGES = ['7 Days', '30 Days', '90 Days'];

const MOCK_CUSTOMERS = [
  { name: 'Juan Dela Cruz', email: 'juan@email.com', orders: 24, spent: '₱45,200' },
  { name: 'Maria Santos', email: 'maria@email.com', orders: 19, spent: '₱38,900' },
  { name: 'Pedro Reyes', email: 'pedro@email.com', orders: 15, spent: '₱28,450' },
  { name: 'Ana Garcia', email: 'ana@email.com', orders: 12, spent: '₱22,100' },
  { name: 'Luis Ramos', email: 'luis@email.com', orders: 10, spent: '₱18,750' },
];

export default function AnalyticsUser() {
  const navigation = useNavigation();
  const [selectedRange, setSelectedRange] = useState('30 Days');

  return (
    <View style={styles.root}>
      <AppHeader title="User Analytics" subtitle="Customer growth & behavior" navigation={navigation} />
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
          <KpiCard icon="👥" label="New Users" value="284" trend={15.3} color={COLORS.primary} />
          <KpiCard icon="🟢" label="Active Users" value="1,892" trend={4.7} color={COLORS.success} />
        </View>
        <View style={[styles.kpiRow, { marginTop: SPACING.md }]}>
          <KpiCard icon="🔄" label="Retention Rate" value="68%" trend={2.1} color={COLORS.info} />
          <KpiCard icon="💳" label="Avg. Spend" value="₱1,450" trend={6.8} color={COLORS.warning} />
        </View>

        {/* User Growth Chart */}
        <View style={{ marginTop: SPACING.md }}>
          <ChartCard title="User Growth" subtitle={`Last ${selectedRange}`} height={200} />
        </View>

        {/* User Insights */}
        <SectionHeader title="User Insights" />
        <View style={styles.insightCard}>
          <View style={styles.insightItem}>
            <Text style={styles.insightEmoji}>📱</Text>
            <View style={styles.insightInfo}>
              <Text style={styles.insightLabel}>Mobile Users</Text>
              <View style={styles.barBg}>
                <View style={[styles.barFill, { width: '78%', backgroundColor: COLORS.primary }]} />
              </View>
            </View>
            <Text style={styles.insightPercent}>78%</Text>
          </View>
          <View style={styles.insightItem}>
            <Text style={styles.insightEmoji}>🖥️</Text>
            <View style={styles.insightInfo}>
              <Text style={styles.insightLabel}>Web Users</Text>
              <View style={styles.barBg}>
                <View style={[styles.barFill, { width: '22%', backgroundColor: COLORS.info }]} />
              </View>
            </View>
            <Text style={styles.insightPercent}>22%</Text>
          </View>
        </View>

        {/* Top Customers */}
        <SectionHeader title="Top Customers" actionLabel="View All" />
        <View style={styles.listCard}>
          {MOCK_CUSTOMERS.map((customer, i) => (
            <View key={i} style={[styles.customerRow, i === MOCK_CUSTOMERS.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{customer.name[0]}</Text>
              </View>
              <View style={styles.customerInfo}>
                <Text style={styles.customerName}>{customer.name}</Text>
                <Text style={styles.customerEmail}>{customer.email}</Text>
              </View>
              <View style={styles.customerStats}>
                <Text style={styles.customerSpent}>{customer.spent}</Text>
                <Text style={styles.customerOrders}>{customer.orders} orders</Text>
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
  insightCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    gap: SPACING.lg,
    ...SHADOW.sm,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightEmoji: { fontSize: 24, marginRight: SPACING.md },
  insightInfo: { flex: 1 },
  insightLabel: { fontSize: 13, fontWeight: FONT.medium, color: COLORS.textSecondary, marginBottom: SPACING.xs },
  barBg: {
    height: 6,
    backgroundColor: COLORS.background,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 3 },
  insightPercent: { fontSize: 15, fontWeight: FONT.bold, color: COLORS.textPrimary, marginLeft: SPACING.md },
  listCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    overflow: 'hidden',
    ...SHADOW.sm,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primaryLight + '40',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatarText: { fontSize: 15, fontWeight: FONT.bold, color: COLORS.primary },
  customerInfo: { flex: 1 },
  customerName: { fontSize: 14, fontWeight: FONT.semibold, color: COLORS.textPrimary },
  customerEmail: { fontSize: 12, color: COLORS.textMuted, marginTop: 1 },
  customerStats: { alignItems: 'flex-end' },
  customerSpent: { fontSize: 14, fontWeight: FONT.bold, color: COLORS.textPrimary },
  customerOrders: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
});
