import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { COLORS, FONT, RADIUS, SHADOW, SPACING } from "../../../constants/adminTheme";
import { updateAdminOrder } from "../../../redux/thunks/adminThunks";
import AppHeader from "../components/AppHeader";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import InfoRow from "../components/InfoRow";
import SectionHeader from "../components/SectionHeader";
import StatusChip from "../components/StatusChip";

const ORDER_FLOW = ["PENDING", "CONFIRMED", "PROCESSING", "COMPLETED"];

function formatCurrency(value) {
  const amount = Number(value || 0);
  return `PHP ${amount.toLocaleString()}`;
}

function formatDate(value) {
  if (!value) return "N/A";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
}

export default function OrderDetails() {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState("");

  const orderId = route.params?.orderId;
  const orders = useSelector((state) => state.admin.orders.list);
  const order = useMemo(
    () => orders.find((item) => item?._id === orderId),
    [orderId, orders],
  );

  const nextStatus = useMemo(() => {
    const current = String(order?.status || "").toUpperCase();
    const index = ORDER_FLOW.indexOf(current);
    if (index < 0 || index === ORDER_FLOW.length - 1) return null;
    return ORDER_FLOW[index + 1];
  }, [order?.status]);

  if (!order) {
    return (
      <View style={styles.root}>
        <AppHeader title="Order Details" onBack={() => navigation.goBack()} />
        <EmptyState title="Order not available" description="Return to the order list and select another order." />
      </View>
    );
  }

  const handleAction = (action) => {
    setConfirmAction(action);
    setShowConfirm(true);
  };

  const onConfirm = () => {
    if (confirmAction === "cancel") {
      dispatch(updateAdminOrder({ orderId: order._id, status: "CANCELLED" }));
    }
    if (confirmAction === "update" && nextStatus) {
      dispatch(updateAdminOrder({ orderId: order._id, status: nextStatus }));
    }
    setShowConfirm(false);
  };

  const customerName = order?.user?.name || "Guest";
  const customerEmail = order?.user?.email || "No email";
  const items = Array.isArray(order?.items) ? order.items : [];

  return (
    <View style={styles.root}>
      <AppHeader
        title={`Order ${order._id?.slice(-8) || ""}`}
        subtitle={formatDate(order.createdAt)}
        onBack={() => navigation.goBack()}
      />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.statusBar}>
          <StatusChip status={order.status || "PENDING"} size="lg" />
        </View>

        <SectionHeader title="Customer Information" />
        <View style={styles.card}>
          <View style={styles.customerHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{customerName[0] || "U"}</Text>
            </View>
            <View>
              <Text style={styles.customerName}>{customerName}</Text>
              <Text style={styles.customerEmail}>{customerEmail}</Text>
            </View>
          </View>
          <InfoRow label="Delivery Address" value={order.deliveryAddress || "N/A"} />
          <InfoRow label="Payment Method" value={String(order.paymentMethod || "cod").toUpperCase()} />
        </View>

        <SectionHeader title="Order Items" />
        <View style={styles.card}>
          {items.map((item, index) => (
            <View
              key={`${item?.product || index}`}
              style={[styles.itemRow, index === items.length - 1 && { borderBottomWidth: 0 }]}
            >
              <View style={styles.itemIcon}>
                <Text style={styles.itemIconText}>PR</Text>
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item?.name || "Product"}</Text>
                <Text style={styles.itemSku}>
                  {(item?.sku || "N/A") + ` | Qty: ${item?.quantity || 0}`}
                </Text>
              </View>
              <Text style={styles.itemPrice}>{formatCurrency(item?.itemTotal)}</Text>
            </View>
          ))}
        </View>

        <SectionHeader title="Payment Details" />
        <View style={styles.card}>
          <InfoRow label="Subtotal" value={formatCurrency(order.baseAmount)} />
          <InfoRow label="Final Amount" value={formatCurrency(order.finalAmountPaid)} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Order Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(order.finalAmountPaid)}</Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => handleAction("cancel")}>
            <Text style={styles.secondaryBtnText}>Cancel Order</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.primaryBtn, !nextStatus && styles.disabledBtn]}
            onPress={() => handleAction("update")}
            disabled={!nextStatus}
          >
            <Text style={styles.primaryBtnText}>
              {nextStatus ? `Move to ${nextStatus}` : "Completed"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <ConfirmDialog
        visible={showConfirm}
        title={confirmAction === "cancel" ? "Cancel Order" : "Update Status"}
        message={
          confirmAction === "cancel"
            ? "Are you sure you want to cancel this order? This cannot be undone."
            : `Move this order to ${nextStatus}?`
        }
        confirmLabel={confirmAction === "cancel" ? "Cancel Order" : "Update"}
        destructive={confirmAction === "cancel"}
        onCancel={() => setShowConfirm(false)}
        onConfirm={onConfirm}
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
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight + "40",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  avatarText: { fontSize: 18, fontWeight: FONT.bold, color: COLORS.primary },
  customerName: { fontSize: 16, fontWeight: FONT.semibold, color: COLORS.textPrimary },
  customerEmail: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  itemIconText: { fontSize: 11, color: COLORS.textSecondary, fontWeight: FONT.semibold },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: FONT.semibold, color: COLORS.textPrimary },
  itemSku: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  itemPrice: { fontSize: 14, fontWeight: FONT.bold, color: COLORS.textPrimary },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: SPACING.md,
    marginTop: SPACING.sm,
    borderTopWidth: 2,
    borderTopColor: COLORS.textPrimary,
  },
  totalLabel: { fontSize: 16, fontWeight: FONT.bold, color: COLORS.textPrimary },
  totalValue: { fontSize: 18, fontWeight: FONT.bold, color: COLORS.primary },
  actionsRow: {
    flexDirection: "row",
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
    alignItems: "center",
  },
  secondaryBtnText: { fontSize: 14, fontWeight: FONT.semibold, color: COLORS.danger },
  primaryBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: "center",
  },
  disabledBtn: {
    opacity: 0.6,
  },
  primaryBtnText: { fontSize: 14, fontWeight: FONT.semibold, color: COLORS.textInverse },
});
