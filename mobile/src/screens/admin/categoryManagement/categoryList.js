import React, { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS, FONT, SHADOW } from '../../../constants/adminTheme';
import AppHeader from '../components/AppHeader';
import SearchBar from '../components/SearchBar';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';

const MOCK_CATEGORIES = [
  { id: 1, name: 'Electronics', products: 124, icon: '🔌' },
  { id: 2, name: 'Clothing & Apparel', products: 89, icon: '👕' },
  { id: 3, name: 'Home & Kitchen', products: 67, icon: '🏠' },
  { id: 4, name: 'Sports & Outdoors', products: 45, icon: '⚽' },
  { id: 5, name: 'Beauty & Personal Care', products: 56, icon: '💄' },
  { id: 6, name: 'Books & Stationery', products: 34, icon: '📚' },
  { id: 7, name: 'Toys & Games', products: 23, icon: '🎮' },
  { id: 8, name: 'Food & Beverages', products: 78, icon: '🍔' },
];

export default function CategoryList() {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = MOCK_CATEGORIES.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.root}>
      <AppHeader title="Categories" subtitle={`${MOCK_CATEGORIES.length} categories`} navigation={navigation} />
      <SearchBar placeholder="Search categories..." value={search} onChangeText={setSearch} />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <EmptyState icon="🗂️" title="No categories found" description="Try adjusting your search." />
        ) : (
          <View style={styles.list}>
            {filtered.map((cat, i) => (
              <View key={cat.id} style={[styles.card, i === filtered.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={styles.iconWrap}>
                  <Text style={styles.catIcon}>{cat.icon}</Text>
                </View>
                <View style={styles.catInfo}>
                  <Text style={styles.catName}>{cat.name}</Text>
                  <Text style={styles.catCount}>{cat.products} products</Text>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity style={styles.editBtn}>
                    <Text style={styles.editText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => setDeleteTarget(cat)}>
                    <Text style={styles.deleteText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Confirm Delete */}
      <ConfirmDialog
        visible={!!deleteTarget}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => setDeleteTarget(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  list: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    overflow: 'hidden',
    ...SHADOW.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  catIcon: { fontSize: 20 },
  catInfo: { flex: 1 },
  catName: { fontSize: 15, fontWeight: FONT.semibold, color: COLORS.textPrimary },
  catCount: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  editBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primaryLight + '30',
  },
  editText: { fontSize: 12, fontWeight: FONT.semibold, color: COLORS.primary },
  deleteBtn: { padding: SPACING.xs },
  deleteText: { fontSize: 16 },
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
