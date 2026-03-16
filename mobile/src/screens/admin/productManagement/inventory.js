import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS, FONT, SHADOW } from '../../../constants/adminTheme';
import AppHeader from '../components/AppHeader';
import SearchBar from '../components/SearchBar';
import StatusChip from '../components/StatusChip';
import EmptyState from '../components/EmptyState';

const MOCK_INVENTORY = [
  { id: 1, name: 'Wireless Earbuds Pro', sku: 'SKU-1001', stock: 45, minStock: 20, status: 'OK' },
  { id: 2, name: 'Smart Watch X200', sku: 'SKU-1002', stock: 12, minStock: 20, status: 'Low' },
  { id: 3, name: 'USB-C Hub 7-in-1', sku: 'SKU-1003', stock: 88, minStock: 15, status: 'OK' },
  { id: 4, name: 'Bluetooth Speaker Mini', sku: 'SKU-1004', stock: 5, minStock: 10, status: 'Low' },
  { id: 5, name: 'Phone Case Premium', sku: 'SKU-1005', stock: 230, minStock: 50, status: 'OK' },
  { id: 6, name: 'LED Desk Lamp', sku: 'SKU-1006', stock: 67, minStock: 15, status: 'OK' },
  { id: 7, name: 'Mechanical Keyboard', sku: 'SKU-1007', stock: 0, minStock: 10, status: 'Low' },
  { id: 8, name: 'Webcam HD 1080p', sku: 'SKU-1008', stock: 34, minStock: 10, status: 'OK' },
  { id: 9, name: 'Portable Charger 20K', sku: 'SKU-1009', stock: 8, minStock: 15, status: 'Low' },
  { id: 10, name: 'Noise Cancelling Headphones', sku: 'SKU-1010', stock: 56, minStock: 10, status: 'OK' },
];

export default function Inventory() {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');

  const filtered = MOCK_INVENTORY.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const lowCount = MOCK_INVENTORY.filter((p) => p.status === 'Low').length;

  const renderItem = ({ item }) => {
    const stockPercent = Math.min((item.stock / (item.minStock * 3)) * 100, 100);
    const barColor = item.status === 'Low' ? COLORS.danger : COLORS.success;

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemSku}>{item.sku}</Text>
          </View>
          <StatusChip status={item.status} />
        </View>
        <View style={styles.stockRow}>
          <View style={styles.stockInfo}>
            <Text style={[styles.stockCount, item.stock <= item.minStock && { color: COLORS.danger }]}>
              {item.stock}
            </Text>
            <Text style={styles.stockLabel}> / min: {item.minStock}</Text>
          </View>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${stockPercent}%`, backgroundColor: barColor }]} />
          </View>
        </View>
        {item.status === 'Low' && (
          <View style={styles.alertRow}>
            <Text style={styles.alertIcon}>⚠️</Text>
            <Text style={styles.alertText}>
              {item.stock === 0 ? 'Out of stock — reorder immediately' : 'Below minimum stock level'}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <AppHeader
        title="Inventory"
        subtitle={`${MOCK_INVENTORY.length} products • ${lowCount} low stock`}
        navigation={navigation}
      />
      <SearchBar placeholder="Search by product or SKU..." value={search} onChangeText={setSearch} />

      {filtered.length === 0 ? (
        <EmptyState icon="📦" title="No inventory items found" />
      ) : (
        <FlashList
          data={filtered}
          renderItem={renderItem}
          estimatedItemSize={120}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: SPACING.lg }}
          ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    ...SHADOW.sm,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  itemInfo: { flex: 1, marginRight: SPACING.md },
  itemName: { fontSize: 15, fontWeight: FONT.semibold, color: COLORS.textPrimary },
  itemSku: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  stockRow: {
    marginTop: SPACING.xs,
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.xs,
  },
  stockCount: { fontSize: 20, fontWeight: FONT.bold, color: COLORS.textPrimary },
  stockLabel: { fontSize: 12, color: COLORS.textMuted },
  barBg: {
    height: 6,
    backgroundColor: COLORS.background,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 3 },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  alertIcon: { fontSize: 14, marginRight: SPACING.xs },
  alertText: { fontSize: 12, color: COLORS.danger, fontWeight: FONT.medium },
});
