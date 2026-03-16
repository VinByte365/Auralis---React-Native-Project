import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS, FONT, SHADOW } from '../../../constants/adminTheme';
import AppHeader from '../components/AppHeader';
import SearchBar from '../components/SearchBar';
import StatusChip from '../components/StatusChip';
import EmptyState from '../components/EmptyState';

const MOCK_PRODUCTS = [
  { id: 1, name: 'Wireless Earbuds Pro', price: '₱2,500', stock: 45, status: 'Active', sku: 'SKU-1001', category: 'Electronics' },
  { id: 2, name: 'Smart Watch X200', price: '₱5,000', stock: 12, status: 'Active', sku: 'SKU-1002', category: 'Electronics' },
  { id: 3, name: 'USB-C Hub 7-in-1', price: '₱1,500', stock: 88, status: 'Active', sku: 'SKU-1003', category: 'Electronics' },
  { id: 4, name: 'Bluetooth Speaker Mini', price: '₱1,500', stock: 5, status: 'Active', sku: 'SKU-1004', category: 'Electronics' },
  { id: 5, name: 'Phone Case Premium', price: '₱580', stock: 230, status: 'Active', sku: 'SKU-1005', category: 'Accessories' },
  { id: 6, name: 'LED Desk Lamp', price: '₱1,500', stock: 67, status: 'Active', sku: 'SKU-1006', category: 'Home' },
  { id: 7, name: 'Mechanical Keyboard', price: '₱3,200', stock: 0, status: 'Inactive', sku: 'SKU-1007', category: 'Electronics' },
  { id: 8, name: 'Webcam HD 1080p', price: '₱2,100', stock: 34, status: 'Active', sku: 'SKU-1008', category: 'Electronics' },
];

export default function ProductList() {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');

  const filtered = MOCK_PRODUCTS.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const renderProduct = ({ item }) => (
    <View style={styles.productCard}>
      <View style={styles.imgPlaceholder}>
        <Text style={styles.imgText}>📷</Text>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.productSku}>{item.sku} • {item.category}</Text>
        <View style={styles.productMeta}>
          <Text style={styles.productPrice}>{item.price}</Text>
          <View style={styles.stockBadge}>
            <Text style={[styles.stockText, item.stock <= 10 && { color: COLORS.danger }]}>
              {item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}
            </Text>
          </View>
          <StatusChip status={item.status} />
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      <AppHeader title="Products" subtitle={`${MOCK_PRODUCTS.length} products`} navigation={navigation} />
      <SearchBar placeholder="Search products..." value={search} onChangeText={setSearch} />

      {filtered.length === 0 ? (
        <EmptyState icon="🛒" title="No products found" description="Try a different search term." />
      ) : (
        <FlashList
          data={filtered}
          renderItem={renderProduct}
          estimatedItemSize={110}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: SPACING.lg }}
          ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  productCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    ...SHADOW.sm,
  },
  imgPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  imgText: { fontSize: 28 },
  productInfo: { flex: 1, justifyContent: 'center' },
  productName: { fontSize: 15, fontWeight: FONT.semibold, color: COLORS.textPrimary },
  productSku: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  productPrice: { fontSize: 15, fontWeight: FONT.bold, color: COLORS.textPrimary },
  stockBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.background,
  },
  stockText: { fontSize: 11, fontWeight: FONT.medium, color: COLORS.success },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW.lg,
  },
  fabIcon: { fontSize: 28, color: COLORS.textInverse, fontWeight: FONT.light, marginTop: -2 },
});
