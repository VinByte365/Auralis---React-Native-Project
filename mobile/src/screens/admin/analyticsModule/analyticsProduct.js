import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { COLORS, FONT, RADIUS, SHADOW, SPACING } from "../../../constants/adminTheme";
import { getAdminProductAnalyticsData } from "../../../redux/thunks/adminThunks";
import AppHeader from "../components/AppHeader";
import ChartCard from "../components/ChartCard";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import SearchBar from "../components/SearchBar";
import SectionHeader from "../components/SectionHeader";
import StatusChip from "../components/StatusChip";

function formatCurrency(value) {
  const amount = Number(value || 0);
  return `PHP ${amount.toLocaleString()}`;
}

export default function AnalyticsProduct() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");

  const products = useSelector((state) => state.admin.products.list);
  const { loading } = useSelector((state) => state.admin.analytics);

  useEffect(() => {
    dispatch(getAdminProductAnalyticsData({ search }));
  }, [dispatch, search]);

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return products.filter((product) =>
      String(product?.name || "").toLowerCase().includes(query),
    );
  }, [products, search]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const low = filtered.filter((item) => Number(item?.stockQuantity || 0) <= 10).length;
    const out = filtered.filter((item) => Number(item?.stockQuantity || 0) === 0).length;
    return { total, low, out, inStock: total - out };
  }, [filtered]);

  return (
    <View style={styles.root}>
      <AppHeader title="Product Analytics" subtitle="Performance and inventory insights" navigation={navigation} />
      <SearchBar placeholder="Search products..." value={search} onChangeText={setSearch} />

      {loading && products.length === 0 ? (
        <LoadingSpinner message="Loading product analytics..." />
      ) : (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <ChartCard title="Top Products by Revenue" subtitle="Current catalog" height={180} />

          <SectionHeader title="Inventory Status" />
          <View style={styles.inventoryRow}>
            <View style={styles.inventoryStat}>
              <Text style={styles.inventoryValue}>{stats.total}</Text>
              <Text style={styles.inventoryLabel}>Total SKUs</Text>
            </View>
            <View style={styles.inventoryStat}>
              <Text style={[styles.inventoryValue, { color: COLORS.success }]}>{stats.inStock}</Text>
              <Text style={styles.inventoryLabel}>In Stock</Text>
            </View>
            <View style={styles.inventoryStat}>
              <Text style={[styles.inventoryValue, { color: COLORS.warning }]}>{stats.low}</Text>
              <Text style={styles.inventoryLabel}>Low Stock</Text>
            </View>
            <View style={styles.inventoryStat}>
              <Text style={[styles.inventoryValue, { color: COLORS.danger }]}>{stats.out}</Text>
              <Text style={styles.inventoryLabel}>Out of Stock</Text>
            </View>
          </View>

          <SectionHeader title="Product Performance" />
          {filtered.length === 0 ? (
            <EmptyState title="No products found" description="Try another search keyword." />
          ) : (
            <View style={styles.listCard}>
              {filtered.slice(0, 20).map((product, index) => {
                const lowStatus = Number(product?.stockQuantity || 0) <= 10;
                return (
                  <View
                    key={product?._id}
                    style={[styles.productRow, index === filtered.length - 1 && { borderBottomWidth: 0 }]}
                  >
                    <View style={styles.productRank}>
                      <Text style={styles.rankText}>#{index + 1}</Text>
                    </View>
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>{product?.name || "Product"}</Text>
                      <Text style={styles.productSku}>{product?.sku || "N/A"}</Text>
                    </View>
                    <View style={styles.productStats}>
                      <Text style={styles.productRevenue}>{formatCurrency(product?.price)}</Text>
                      <View style={styles.salesRow}>
                        <Text style={styles.productSales}>
                          {Number(product?.stockQuantity || 0)} in stock
                        </Text>
                        <StatusChip status={lowStatus ? "Low" : "OK"} />
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  inventoryRow: {
    flexDirection: "row",
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
    flexWrap: "wrap",
  },
  inventoryStat: {
    flex: 1,
    minWidth: "22%",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: "center",
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
    overflow: "hidden",
    ...SHADOW.sm,
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
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
    justifyContent: "center",
    alignItems: "center",
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
    alignItems: "flex-end",
  },
  productRevenue: {
    fontSize: 14,
    fontWeight: FONT.bold,
    color: COLORS.textPrimary,
  },
  salesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    marginTop: 2,
  },
  productSales: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
});
