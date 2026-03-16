import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS, FONT, SHADOW } from '../../../constants/adminTheme';
import AppHeader from '../components/AppHeader';
import SearchBar from '../components/SearchBar';
import StatusChip from '../components/StatusChip';
import PaginationFooter from '../components/PaginationFooter';
import EmptyState from '../components/EmptyState';

const MOCK_ORDERS = [
  { id: 'ORD-0024', customer: 'Juan Dela Cruz', email: 'juan@email.com', total: '₱4,580', status: 'Pending', date: 'Mar 15, 2026', items: 3 },
  { id: 'ORD-0023', customer: 'Maria Santos', email: 'maria@email.com', total: '₱2,190', status: 'Processing', date: 'Mar 15, 2026', items: 2 },
  { id: 'ORD-0022', customer: 'Pedro Reyes', email: 'pedro@email.com', total: '₱6,340', status: 'Shipped', date: 'Mar 14, 2026', items: 5 },
  { id: 'ORD-0021', customer: 'Ana Garcia', email: 'ana@email.com', total: '₱1,290', status: 'Delivered', date: 'Mar 14, 2026', items: 1 },
  { id: 'ORD-0020', customer: 'Luis Ramos', email: 'luis@email.com', total: '₱3,780', status: 'Completed', date: 'Mar 13, 2026', items: 4 },
  { id: 'ORD-0019', customer: 'Rosa Villanueva', email: 'rosa@email.com', total: '₱890', status: 'Cancelled', date: 'Mar 13, 2026', items: 1 },
  { id: 'ORD-0018', customer: 'Carlos Mendoza', email: 'carlos@email.com', total: '₱5,120', status: 'Pending', date: 'Mar 12, 2026', items: 3 },
  { id: 'ORD-0017', customer: 'Elena Torres', email: 'elena@email.com', total: '₱2,670', status: 'Completed', date: 'Mar 12, 2026', items: 2 },
];

const FILTER_OPTIONS = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Completed', 'Cancelled'];

export default function OrderList() {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [page, setPage] = useState(1);

  const filtered = MOCK_ORDERS.filter((o) => {
    const matchSearch = o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase());
    const matchFilter = activeFilter === 'All' || o.status === activeFilter;
    return matchSearch && matchFilter;
  });

  const renderOrder = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => navigation.navigate('OrderDetails')}
      activeOpacity={0.7}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>{item.id}</Text>
        <StatusChip status={item.status} />
      </View>
      <View style={styles.orderBody}>
        <View style={styles.customerInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.customer[0]}</Text>
          </View>
          <View>
            <Text style={styles.customerName}>{item.customer}</Text>
            <Text style={styles.customerEmail}>{item.email}</Text>
          </View>
        </View>
        <View style={styles.orderMeta}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Items</Text>
            <Text style={styles.metaValue}>{item.items}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Total</Text>
            <Text style={styles.metaValueBold}>{item.total}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.orderDate}>{item.date}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.root}>
      <AppHeader title="Orders" subtitle={`${MOCK_ORDERS.length} total orders`} navigation={navigation} />
      <SearchBar placeholder="Search by order ID or customer..." value={search} onChangeText={setSearch} />

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        {FILTER_OPTIONS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {filtered.length === 0 ? (
        <EmptyState icon="📦" title="No orders found" description="Try changing the filters or search." />
      ) : (
        <FlashList
          data={filtered}
          renderItem={renderOrder}
          estimatedItemSize={160}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: SPACING.lg }}
          ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
        />
      )}

      <PaginationFooter currentPage={page} totalPages={3} onPrev={() => setPage(Math.max(1, page - 1))} onNext={() => setPage(Math.min(3, page + 1))} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
    gap: SPACING.xs,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    backgroundColor: COLORS.surface,
  },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: FONT.medium },
  filterTextActive: { color: COLORS.textInverse },
  orderCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    ...SHADOW.sm,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  orderId: { fontSize: 15, fontWeight: FONT.bold, color: COLORS.textPrimary },
  orderBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customerInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight + '40',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  avatarText: { fontSize: 14, fontWeight: FONT.bold, color: COLORS.primary },
  customerName: { fontSize: 14, fontWeight: FONT.semibold, color: COLORS.textPrimary },
  customerEmail: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
  orderMeta: { alignItems: 'flex-end' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  metaLabel: { fontSize: 11, color: COLORS.textMuted },
  metaValue: { fontSize: 13, color: COLORS.textSecondary, fontWeight: FONT.medium },
  metaValueBold: { fontSize: 15, color: COLORS.textPrimary, fontWeight: FONT.bold },
  orderDate: { fontSize: 11, color: COLORS.textMuted, marginTop: SPACING.sm },
});
