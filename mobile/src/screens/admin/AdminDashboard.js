import React from 'react';
import { View, ScrollView, StyleSheet, FlatList, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS, FONT, SHADOW } from '../../constants/adminTheme';
import AppHeader from './components/AppHeader';
import KpiCard from './components/KpiCard';
import ChartCard from './components/ChartCard';
import SectionHeader from './components/SectionHeader';
import StatusChip from './components/StatusChip';

const MOCK_KPI = [
  { icon: '💰', label: 'Total Revenue', value: '₱128,430', trend: 12.5, color: COLORS.success },
  { icon: '📦', label: 'Total Orders', value: '1,284', trend: 8.2, color: COLORS.info },
  { icon: '👥', label: 'Customers', value: '3,421', trend: 5.1, color: COLORS.primary },
  { icon: '🛒', label: 'Products', value: '456', trend: -2.3, color: COLORS.warning },
];

const MOCK_ORDERS = [
  { id: 'ORD-0012', customer: 'Juan Dela Cruz', total: '₱2,450', status: 'Pending' },
  { id: 'ORD-0011', customer: 'Maria Santos', total: '₱1,890', status: 'Completed' },
  { id: 'ORD-0010', customer: 'Pedro Reyes', total: '₱3,120', status: 'Shipped' },
  { id: 'ORD-0009', customer: 'Ana Garcia', total: '₱980', status: 'Processing' },
  { id: 'ORD-0008', customer: 'Luis Ramos', total: '₱4,560', status: 'Delivered' },
];

const MOCK_ACTIVITY = [
  { action: 'New order placed', detail: 'ORD-0012 by Juan Dela Cruz', time: '2 min ago' },
  { action: 'Product updated', detail: 'SKU-1234 stock adjusted', time: '15 min ago' },
  { action: 'User registered', detail: 'maria.santos@email.com', time: '1 hr ago' },
  { action: 'Category added', detail: 'Electronics > Smart Home', time: '3 hr ago' },
];

export default function AdminDashboard() {
  const navigation = useNavigation();

  return (
    <View style={styles.root}>
      <AppHeader title="Dashboard" subtitle="Welcome back, Admin" navigation={navigation} />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* KPI Grid */}
        <View style={styles.kpiGrid}>
          {MOCK_KPI.map((kpi, i) => (
            <View key={i} style={styles.kpiItem}>
              <KpiCard {...kpi} />
            </View>
          ))}
        </View>

        {/* Sales Chart */}
        <ChartCard title="Sales Overview" subtitle="Last 7 days performance" height={180} />

        {/* Product Chart */}
        <ChartCard title="Top Products" subtitle="By revenue this month" height={160} />

        {/* Recent Orders */}
        <SectionHeader title="Recent Orders" actionLabel="View All" onAction={() => navigation.navigate('OrderList')} />
        <View style={styles.ordersCard}>
          {MOCK_ORDERS.map((order) => (
            <TouchableOpacity key={order.id} style={styles.orderRow} activeOpacity={0.7}
              onPress={() => navigation.navigate('OrderDetails')}>
              <View style={styles.orderInfo}>
                <Text style={styles.orderId}>{order.id}</Text>
                <Text style={styles.orderCustomer}>{order.customer}</Text>
              </View>
              <View style={styles.orderRight}>
                <Text style={styles.orderTotal}>{order.total}</Text>
                <StatusChip status={order.status} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Activity Log */}
        <SectionHeader title="Activity Log" actionLabel="See All" />
        <View style={styles.activityCard}>
          {MOCK_ACTIVITY.map((item, i) => (
            <View key={i} style={[styles.activityRow, i === MOCK_ACTIVITY.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={styles.activityDot} />
              <View style={styles.activityInfo}>
                <Text style={styles.activityAction}>{item.action}</Text>
                <Text style={styles.activityDetail}>{item.detail}</Text>
              </View>
              <Text style={styles.activityTime}>{item.time}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  kpiItem: {
    width: '47%',
  },
  ordersCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    overflow: 'hidden',
    ...SHADOW.sm,
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 14,
    fontWeight: FONT.semibold,
    color: COLORS.textPrimary,
  },
  orderCustomer: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  orderRight: {
    alignItems: 'flex-end',
    gap: SPACING.xs,
  },
  orderTotal: {
    fontSize: 14,
    fontWeight: FONT.bold,
    color: COLORS.textPrimary,
  },
  activityCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    padding: SPACING.lg,
    ...SHADOW.sm,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginTop: 5,
    marginRight: SPACING.md,
  },
  activityInfo: {
    flex: 1,
  },
  activityAction: {
    fontSize: 13,
    fontWeight: FONT.semibold,
    color: COLORS.textPrimary,
  },
  activityDetail: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  activityTime: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginLeft: SPACING.sm,
  },
});