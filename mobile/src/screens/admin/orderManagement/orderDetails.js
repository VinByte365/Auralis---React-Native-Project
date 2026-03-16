import React, { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS, FONT, SHADOW } from '../../../constants/adminTheme';
import AppHeader from '../components/AppHeader';
import SectionHeader from '../components/SectionHeader';
import InfoRow from '../components/InfoRow';
import StatusChip from '../components/StatusChip';
import ConfirmDialog from '../components/ConfirmDialog';

const MOCK_ORDER = {
  id: 'ORD-0024',
  date: 'Mar 15, 2026 • 2:34 PM',
  status: 'Processing',
  customer: {
    name: 'Juan Dela Cruz',
    email: 'juan@email.com',
    phone: '+63 912 345 6789',
    address: '123 Rizal Ave, Makati City, Metro Manila',
  },
  items: [
    { name: 'Wireless Earbuds Pro', qty: 1, price: '₱2,500', sku: 'SKU-1001' },
    { name: 'USB-C Hub 7-in-1', qty: 2, price: '₱1,500', sku: 'SKU-1003' },
    { name: 'Phone Case Premium', qty: 1, price: '₱580', sku: 'SKU-1005' },
  ],
  payment: {
    subtotal: '₱6,080',
    discount: '₱500',
    tax: '₱669',
    shipping: 'Free',
    total: '₱6,249',
    method: 'GCash',
  },
  timeline: [
    { status: 'Order Placed', date: 'Mar 15, 2:34 PM', completed: true },
    { status: 'Payment Confirmed', date: 'Mar 15, 2:35 PM', completed: true },
    { status: 'Processing', date: 'Mar 15, 3:00 PM', completed: true },
    { status: 'Shipped', date: '', completed: false },
    { status: 'Delivered', date: '', completed: false },
  ],
};

export default function OrderDetails() {
  const navigation = useNavigation();
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState('');

  const handleAction = (action) => {
    setConfirmAction(action);
    setShowConfirm(true);
  };

  return (
    <View style={styles.root}>
      <AppHeader
        title={MOCK_ORDER.id}
        subtitle={MOCK_ORDER.date}
        onBack={() => navigation.goBack()}
      />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Status */}
        <View style={styles.statusBar}>
          <StatusChip status={MOCK_ORDER.status} size="lg" />
        </View>

        {/* Customer Info */}
        <SectionHeader title="Customer Information" />
        <View style={styles.card}>
          <View style={styles.customerHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{MOCK_ORDER.customer.name[0]}</Text>
            </View>
            <View>
              <Text style={styles.customerName}>{MOCK_ORDER.customer.name}</Text>
              <Text style={styles.customerEmail}>{MOCK_ORDER.customer.email}</Text>
            </View>
          </View>
          <InfoRow icon="📞" label="Phone" value={MOCK_ORDER.customer.phone} />
          <InfoRow icon="📍" label="Address" value={MOCK_ORDER.customer.address} />
        </View>

        {/* Order Items */}
        <SectionHeader title="Order Items" />
        <View style={styles.card}>
          {MOCK_ORDER.items.map((item, i) => (
            <View key={i} style={[styles.itemRow, i === MOCK_ORDER.items.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={styles.itemIcon}>
                <Text style={styles.itemIconText}>📦</Text>
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemSku}>{item.sku} • Qty: {item.qty}</Text>
              </View>
              <Text style={styles.itemPrice}>{item.price}</Text>
            </View>
          ))}
        </View>

        {/* Payment Info */}
        <SectionHeader title="Payment Details" />
        <View style={styles.card}>
          <InfoRow label="Subtotal" value={MOCK_ORDER.payment.subtotal} />
          <InfoRow label="Discount" value={`-${MOCK_ORDER.payment.discount}`} />
          <InfoRow label="Tax" value={MOCK_ORDER.payment.tax} />
          <InfoRow label="Shipping" value={MOCK_ORDER.payment.shipping} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{MOCK_ORDER.payment.total}</Text>
          </View>
          <View style={styles.methodRow}>
            <Text style={styles.methodLabel}>Payment Method</Text>
            <Text style={styles.methodValue}>{MOCK_ORDER.payment.method}</Text>
          </View>
        </View>

        {/* Timeline */}
        <SectionHeader title="Order Timeline" />
        <View style={styles.card}>
          {MOCK_ORDER.timeline.map((step, i) => (
            <View key={i} style={styles.timelineRow}>
              <View style={styles.timelineLeft}>
                <View style={[styles.timelineDot, step.completed && styles.timelineDotDone]} />
                {i < MOCK_ORDER.timeline.length - 1 && (
                  <View style={[styles.timelineLine, step.completed && styles.timelineLineDone]} />
                )}
              </View>
              <View style={styles.timelineInfo}>
                <Text style={[styles.timelineStatus, step.completed && styles.timelineStatusDone]}>
                  {step.status}
                </Text>
                {step.date ? <Text style={styles.timelineDate}>{step.date}</Text> : null}
              </View>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => handleAction('cancel')}
          >
            <Text style={styles.secondaryBtnText}>Cancel Order</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => handleAction('update')}
          >
            <Text style={styles.primaryBtnText}>Update Status</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <ConfirmDialog
        visible={showConfirm}
        title={confirmAction === 'cancel' ? 'Cancel Order' : 'Update Status'}
        message={confirmAction === 'cancel'
          ? 'Are you sure you want to cancel this order? This cannot be undone.'
          : 'Move this order to the next status?'}
        confirmLabel={confirmAction === 'cancel' ? 'Cancel Order' : 'Update'}
        destructive={confirmAction === 'cancel'}
        onCancel={() => setShowConfirm(false)}
        onConfirm={() => setShowConfirm(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  statusBar: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    marginBottom: SPACING.sm,
    ...SHADOW.sm,
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight + '40',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatarText: { fontSize: 18, fontWeight: FONT.bold, color: COLORS.primary },
  customerName: { fontSize: 16, fontWeight: FONT.semibold, color: COLORS.textPrimary },
  customerEmail: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  itemIconText: { fontSize: 16 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: FONT.semibold, color: COLORS.textPrimary },
  itemSku: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  itemPrice: { fontSize: 14, fontWeight: FONT.bold, color: COLORS.textPrimary },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: SPACING.md,
    marginTop: SPACING.sm,
    borderTopWidth: 2,
    borderTopColor: COLORS.textPrimary,
  },
  totalLabel: { fontSize: 16, fontWeight: FONT.bold, color: COLORS.textPrimary },
  totalValue: { fontSize: 18, fontWeight: FONT.bold, color: COLORS.primary },
  methodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  methodLabel: { fontSize: 13, color: COLORS.textSecondary },
  methodValue: { fontSize: 14, fontWeight: FONT.semibold, color: COLORS.textPrimary },
  timelineRow: {
    flexDirection: 'row',
    minHeight: 50,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 24,
    marginRight: SPACING.md,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.surfaceBorder,
    backgroundColor: COLORS.surface,
  },
  timelineDotDone: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: COLORS.surfaceBorder,
    marginVertical: 2,
  },
  timelineLineDone: { backgroundColor: COLORS.primary },
  timelineInfo: {
    flex: 1,
    paddingBottom: SPACING.md,
  },
  timelineStatus: { fontSize: 14, fontWeight: FONT.medium, color: COLORS.textMuted },
  timelineStatusDone: { color: COLORS.textPrimary, fontWeight: FONT.semibold },
  timelineDate: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    gap: SPACING.md,
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.danger,
    alignItems: 'center',
  },
  secondaryBtnText: { fontSize: 14, fontWeight: FONT.semibold, color: COLORS.danger },
  primaryBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  primaryBtnText: { fontSize: 14, fontWeight: FONT.semibold, color: COLORS.textInverse },
});
