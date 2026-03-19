import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { COLORS, FONT, RADIUS, SHADOW, SPACING } from "../../../constants/adminTheme";
import { getAdminProductsData } from "../../../redux/thunks/adminThunks";
import AppHeader from "../components/AppHeader";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import SearchBar from "../components/SearchBar";
import StatusChip from "../components/StatusChip";

const DEFAULT_MIN_STOCK = 10;

export default function Inventory() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");

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

  const lowCount = useMemo(
    () => filtered.filter((product) => Number(product?.stockQuantity || 0) <= DEFAULT_MIN_STOCK).length,
    [filtered],
  );

  const renderItem = ({ item }) => {
    const stock = Number(item?.stockQuantity || 0);
    const isLow = stock <= DEFAULT_MIN_STOCK;
    const stockPercent = Math.min((stock / (DEFAULT_MIN_STOCK * 3)) * 100, 100);
    const barColor = isLow ? COLORS.danger : COLORS.success;

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item?.name || "Product"}</Text>
            <Text style={styles.itemSku}>{item?.sku || "N/A"}</Text>
          </View>
          <StatusChip status={isLow ? "Low" : "OK"} />
        </View>
        <View style={styles.stockRow}>
          <View style={styles.stockInfo}>
            <Text style={[styles.stockCount, isLow && { color: COLORS.danger }]}>{stock}</Text>
            <Text style={styles.stockLabel}> / min: {DEFAULT_MIN_STOCK}</Text>
          </View>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${stockPercent}%`, backgroundColor: barColor }]} />
          </View>
        </View>
        {isLow && (
          <View style={styles.alertRow}>
            <Text style={styles.alertText}>
              {stock === 0 ? "Out of stock. Reorder immediately." : "Below minimum stock level."}
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
        subtitle={`${filtered.length} products | ${lowCount} low stock`}
        navigation={navigation}
      />
      <SearchBar placeholder="Search by product or SKU..." value={search} onChangeText={setSearch} />

      {loading && filtered.length === 0 ? (
        <LoadingSpinner message="Loading inventory..." />
      ) : filtered.length === 0 ? (
        <EmptyState title="No inventory items found" />
      ) : (
        <FlashList
          data={filtered}
          renderItem={renderItem}
          estimatedItemSize={120}
          keyExtractor={(item) => String(item?._id)}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.sm,
  },
  itemInfo: { flex: 1, marginRight: SPACING.md },
  itemName: { fontSize: 15, fontWeight: FONT.semibold, color: COLORS.textPrimary },
  itemSku: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  stockRow: {
    marginTop: SPACING.xs,
  },
  stockInfo: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: SPACING.xs,
  },
  stockCount: { fontSize: 20, fontWeight: FONT.bold, color: COLORS.textPrimary },
  stockLabel: { fontSize: 12, color: COLORS.textMuted },
  barBg: {
    height: 6,
    backgroundColor: COLORS.background,
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 3 },
  alertRow: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  alertText: { fontSize: 12, color: COLORS.danger, fontWeight: FONT.medium },
});
