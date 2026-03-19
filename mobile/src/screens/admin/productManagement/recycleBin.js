import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { COLORS, FONT, RADIUS, SHADOW, SPACING } from "../../../constants/adminTheme";
import {
  permanentlyDeleteProduct,
  restoreProduct,
} from "../../../redux/thunks/adminThunks";
import AppHeader from "../components/AppHeader";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";

function formatDate(value) {
  if (!value) return "Unknown date";
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return String(value);
  }
}

export default function RecycleBin() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [confirmAction, setConfirmAction] = useState(null);

  const items = useSelector((state) => state.admin.products.recycleBin);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>RB</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item?.name || "Product"}</Text>
          <Text style={styles.sku}>{item?.sku || "N/A"}</Text>
          <Text style={styles.meta}>Archived {formatDate(item?.deletedAt)}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.restoreBtn}
          onPress={() => setConfirmAction({ type: "restore", item })}
        >
          <Text style={styles.restoreText}>Restore</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => setConfirmAction({ type: "delete", item })}
        >
          <Text style={styles.deleteText}>Delete Forever</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      <AppHeader title="Recycle Bin" subtitle={`${items.length} archived items`} navigation={navigation} />
      {items.length === 0 ? (
        <EmptyState title="Recycle bin is empty" />
      ) : (
        <FlashList
          data={items}
          renderItem={renderItem}
          estimatedItemSize={140}
          keyExtractor={(item) => String(item?._id)}
          contentContainerStyle={{ padding: SPACING.lg }}
          ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
        />
      )}
      <ConfirmDialog
        visible={!!confirmAction}
        title={confirmAction?.type === "restore" ? "Restore Product" : "Permanently Delete"}
        message={
          confirmAction?.type === "restore"
            ? `Restore "${confirmAction?.item?.name}"?`
            : `Permanently delete "${confirmAction?.item?.name}"? This cannot be undone.`
        }
        confirmLabel={confirmAction?.type === "restore" ? "Restore" : "Delete Forever"}
        destructive={confirmAction?.type === "delete"}
        onCancel={() => setConfirmAction(null)}
        onConfirm={() => {
          if (confirmAction?.item?._id) {
            if (confirmAction.type === "restore") {
              dispatch(restoreProduct(confirmAction.item._id));
            } else {
              dispatch(permanentlyDeleteProduct(confirmAction.item._id));
            }
          }
          setConfirmAction(null);
        }}
      />
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
  cardInfo: { flexDirection: "row", marginBottom: SPACING.md },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.dangerLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  icon: { fontSize: 11, color: COLORS.danger, fontWeight: FONT.semibold },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: FONT.semibold, color: COLORS.textPrimary },
  sku: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  meta: { fontSize: 11, color: COLORS.textMuted, marginTop: SPACING.xs },
  actions: { flexDirection: "row", gap: SPACING.sm },
  restoreBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.successLight,
    alignItems: "center",
  },
  restoreText: { fontSize: 13, fontWeight: FONT.semibold, color: COLORS.success },
  deleteBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.dangerLight,
    alignItems: "center",
  },
  deleteText: { fontSize: 13, fontWeight: FONT.semibold, color: COLORS.danger },
});
