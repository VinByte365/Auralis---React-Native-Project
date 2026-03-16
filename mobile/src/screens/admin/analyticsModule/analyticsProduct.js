import React, { useState, useRef } from 'react';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS, FONT, SHADOW } from '../../../constants/adminTheme';
import AppHeader from '../components/AppHeader';
import SearchBar from '../components/SearchBar';
import ChartCard from '../components/ChartCard';
import SectionHeader from '../components/SectionHeader';
import StatusChip from '../components/StatusChip';

const MOCK_PRODUCTS = [
  { id: 1, name: 'Wireless Earbuds Pro', sku: 'SKU-1001', sales: 342, revenue: '₱85,500', stock: 45, status: 'OK' },
  { id: 2, name: 'Smart Watch X200', sku: 'SKU-1002', sales: 289, revenue: '₱144,500', stock: 12, status: 'Low' },
  { id: 3, name: 'USB-C Hub 7-in-1', sku: 'SKU-1003', sales: 256, revenue: '₱38,400', stock: 88, status: 'OK' },
  { id: 4, name: 'Bluetooth Speaker Mini', sku: 'SKU-1004', sales: 198, revenue: '₱29,700', stock: 5, status: 'Low' },
  { id: 5, name: 'Phone Case Premium', sku: 'SKU-1005', sales: 167, revenue: '₱8,350', stock: 230, status: 'OK' },
  { id: 6, name: 'LED Desk Lamp', sku: 'SKU-1006', sales: 145, revenue: '₱21,750', stock: 67, status: 'OK' },
];

export default function AnalyticsProduct() {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');

  const filtered = MOCK_PRODUCTS.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.root}>
      <AppHeader title="Product Analytics" subtitle="Performance & inventory insights" navigation={navigation} />
      <SearchBar placeholder="Search products..." value={search} onChangeText={setSearch} />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Top Products Chart */}
        <ChartCard title="Top Products by Revenue" subtitle="This month" height={180} />

        {/* Inventory Status */}
        <SectionHeader title="Inventory Status" />
        <View style={styles.inventoryRow}>
          <View style={styles.inventoryStat}>
            <Text style={styles.inventoryValue}>456</Text>
            <Text style={styles.inventoryLabel}>Total SKUs</Text>
          </View>
          <View style={styles.inventoryStat}>
            <Text style={[styles.inventoryValue, { color: COLORS.success }]}>412</Text>
            <Text style={styles.inventoryLabel}>In Stock</Text>
          </View>
          <View style={styles.inventoryStat}>
            <Text style={[styles.inventoryValue, { color: COLORS.warning }]}>32</Text>
            <Text style={styles.inventoryLabel}>Low Stock</Text>
          </View>
          <View style={styles.inventoryStat}>
            <Text style={[styles.inventoryValue, { color: COLORS.danger }]}>12</Text>
            <Text style={styles.inventoryLabel}>Out of Stock</Text>
          </View>
        </View>

        {/* Product List */}
        <SectionHeader title="Product Performance" />
        <View style={styles.listCard}>
          {filtered.map((product, i) => (
            <View key={product.id} style={[styles.productRow, i === filtered.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={styles.productRank}>
                <Text style={styles.rankText}>#{i + 1}</Text>
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productSku}>{product.sku}</Text>
              </View>
              <View style={styles.productStats}>
                <Text style={styles.productRevenue}>{product.revenue}</Text>
                <View style={styles.salesRow}>
                  <Text style={styles.productSales}>{product.sales} sold</Text>
                  <StatusChip status={product.status} />
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
  inventoryRow: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  inventoryStat: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    ...SHADOW.sm,
  },
  inventoryValue: {
    fontSize: 20,
    fontWeight: FONT.bold,
    color: COLORS.textPrimary,
  },
  inventoryLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: FONT.medium,
  },
  listCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    overflow: 'hidden',
    ...SHADOW.sm,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  productRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  rankText: {
    fontSize: 12,
    fontWeight: FONT.bold,
    color: COLORS.primary,
  },
  productInfo: { flex: 1 },
  productName: {
    fontSize: 14,
    fontWeight: FONT.semibold,
    color: COLORS.textPrimary,
  },
  productSku: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  productStats: {
    alignItems: 'flex-end',
  },
  productRevenue: {
    fontSize: 14,
    fontWeight: FONT.bold,
    color: COLORS.textPrimary,
  },
  salesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: 2,
  },
  productSales: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
});
