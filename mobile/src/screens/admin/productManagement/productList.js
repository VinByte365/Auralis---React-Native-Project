import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { COLORS, FONT, RADIUS, SHADOW, SPACING } from "../../../constants/adminTheme";
import { archiveProduct, getAdminProductsData } from "../../../redux/thunks/adminThunks";
import AppHeader from "../components/AppHeader";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import SearchBar from "../components/SearchBar";
import StatusChip from "../components/StatusChip";

function formatCurrency(value) {
  const amount = Number(value || 0);
  return `PHP ${amount.toLocaleString()}`;
}

export default function ProductList() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");
  const [archiveTarget, setArchiveTarget] = useState(null);

  const { list, loading } = useSelector((state) => state.admin.products);

  useEffect(() => {
    dispatch(getAdminProductsData({ q: search.trim() || undefined }));
  }, [dispatch, search]);

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return list.filter((product) => {
      const name = String(product?.name || "").toLowerCase();
      const sku = String(product?.sku || "").toLowerCase();
      return name.includes(query) || sku.includes(query);
    });
  }, [list, search]);

  const renderProduct = ({ item }) => {
    const isLowStock = Number(item?.stockQuantity || 0) <= 10;
    return (
      <View style={styles.productCard}>
        <View style={styles.imgPlaceholder}>
          <Text style={styles.imgText}>IMG</Text>
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={1}>
            {item?.name || "Product"}
          </Text>
          <Text style={styles.productSku}>
            {(item?.sku || "N/A") + " | " + (item?.category?.categoryName || "Uncategorized")}
          </Text>
          <View style={styles.productMeta}>
            <Text style={styles.productPrice}>{formatCurrency(item?.price)}</Text>
            <View style={styles.stockBadge}>
              <Text style={[styles.stockText, isLowStock && { color: COLORS.danger }]}>
                {Number(item?.stockQuantity || 0)} in stock
              </Text>
            </View>
            <StatusChip status={isLowStock ? "Low" : "Active"} />
          </View>
          <TouchableOpacity
            style={styles.archiveBtn}
            onPress={() => setArchiveTarget(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.archiveBtnText}>Move to Recycle Bin</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <AppHeader title="Products" subtitle={`${list.length} products`} navigation={navigation} />
      <SearchBar placeholder="Search products..." value={search} onChangeText={setSearch} />

      {loading && list.length === 0 ? (
        <LoadingSpinner message="Loading products..." />
      ) : filtered.length === 0 ? (
        <EmptyState title="No products found" description="Try a different search term." />
      ) : (
        <FlashList
          data={filtered}
          renderItem={renderProduct}
          estimatedItemSize={130}
          keyExtractor={(item) => String(item?._id)}
          contentContainerStyle={{ padding: SPACING.lg }}
          ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
        />
      )}

      <ConfirmDialog
        visible={!!archiveTarget}
        title="Archive Product"
        message={`Move "${archiveTarget?.name}" to recycle bin?`}
        confirmLabel="Archive"
        onCancel={() => setArchiveTarget(null)}
        onConfirm={() => {
          if (archiveTarget?._id) {
            dispatch(archiveProduct(archiveTarget._id));
          }
          setArchiveTarget(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  productCard: {
    flexDirection: "row",
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
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  imgText: { fontSize: 11, color: COLORS.textMuted, fontWeight: FONT.semibold },
  productInfo: { flex: 1, justifyContent: "center" },
  productName: { fontSize: 15, fontWeight: FONT.semibold, color: COLORS.textPrimary },
  productSku: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  productMeta: {
    flexDirection: "row",
    alignItems: "center",
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
  archiveBtn: {
    marginTop: SPACING.sm,
    alignSelf: "flex-start",
    backgroundColor: COLORS.warningLight,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  archiveBtnText: {
    fontSize: 12,
    fontWeight: FONT.semibold,
    color: COLORS.warning,
  },
});
