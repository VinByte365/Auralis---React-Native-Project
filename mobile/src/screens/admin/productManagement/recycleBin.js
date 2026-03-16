import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS, FONT, SHADOW } from '../../../constants/adminTheme';
import AppHeader from '../components/AppHeader';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';

const MOCK_DELETED = [
  { id: 1, name: 'Old Bluetooth Headset', sku: 'SKU-0901', deletedAt: 'Mar 10, 2026', deletedBy: 'Admin' },
  { id: 2, name: 'Discontinued USB Cable', sku: 'SKU-0902', deletedAt: 'Mar 8, 2026', deletedBy: 'Carlos' },
  { id: 3, name: 'Legacy Phone Stand', sku: 'SKU-0903', deletedAt: 'Mar 5, 2026', deletedBy: 'Admin' },
  { id: 4, name: 'Old Model Power Bank', sku: 'SKU-0904', deletedAt: 'Feb 28, 2026', deletedBy: 'Rosa' },
];

export default function RecycleBin() {
  const navigation = useNavigation();
  const [confirmAction, setConfirmAction] = useState(null);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>🗑️</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.sku}>{item.sku}</Text>
          <Text style={styles.meta}>Deleted {item.deletedAt} by {item.deletedBy}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.restoreBtn} onPress={() => setConfirmAction({ type: 'restore', item })}>
          <Text style={styles.restoreText}>↩ Restore</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => setConfirmAction({ type: 'delete', item })}>
          <Text style={styles.deleteText}>Delete Forever</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      <AppHeader title="Recycle Bin" subtitle={`${MOCK_DELETED.length} deleted items`} navigation={navigation} />
      {MOCK_DELETED.length === 0 ? (
        <EmptyState icon="♻️" title="Recycle bin is empty" />
      ) : (
        <FlashList
          data={MOCK_DELETED}
          renderItem={renderItem}
          estimatedItemSize={140}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: SPACING.lg }}
          ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
        />
      )}
      <ConfirmDialog
        visible={!!confirmAction}
        title={confirmAction?.type === 'restore' ? 'Restore Product' : 'Permanently Delete'}
        message={confirmAction?.type === 'restore'
          ? `Restore "${confirmAction?.item?.name}"?`
          : `Permanently delete "${confirmAction?.item?.name}"? This cannot be undone.`}
        confirmLabel={confirmAction?.type === 'restore' ? 'Restore' : 'Delete Forever'}
        destructive={confirmAction?.type === 'delete'}
        onCancel={() => setConfirmAction(null)}
        onConfirm={() => setConfirmAction(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  card: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.surfaceBorder, ...SHADOW.sm,
  },
  cardInfo: { flexDirection: 'row', marginBottom: SPACING.md },
  iconWrap: {
    width: 44, height: 44, borderRadius: RADIUS.md, backgroundColor: COLORS.dangerLight,
    justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md,
  },
  icon: { fontSize: 20 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: FONT.semibold, color: COLORS.textPrimary },
  sku: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  meta: { fontSize: 11, color: COLORS.textMuted, marginTop: SPACING.xs },
  actions: { flexDirection: 'row', gap: SPACING.sm },
  restoreBtn: {
    flex: 1, paddingVertical: SPACING.sm, borderRadius: RADIUS.md,
    backgroundColor: COLORS.successLight, alignItems: 'center',
  },
  restoreText: { fontSize: 13, fontWeight: FONT.semibold, color: COLORS.success },
  deleteBtn: {
    flex: 1, paddingVertical: SPACING.sm, borderRadius: RADIUS.md,
    backgroundColor: COLORS.dangerLight, alignItems: 'center',
  },
  deleteText: { fontSize: 13, fontWeight: FONT.semibold, color: COLORS.danger },
});
