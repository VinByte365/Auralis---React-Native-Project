import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { COLORS, FONT, RADIUS, SHADOW, SPACING } from "../../../constants/adminTheme";
import { getAdminOrders } from "../../../redux/thunks/adminThunks";
import AppHeader from "../components/AppHeader";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import PaginationFooter from "../components/PaginationFooter";
import SearchBar from "../components/SearchBar";
import StatusChip from "../components/StatusChip";

const FILTER_OPTIONS = [
  "ALL",
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "COMPLETED",
  "CANCELLED",
  "REFUNDED",
];

function formatCurrency(value) {
  const amount = Number(value || 0);
  return `PHP ${amount.toLocaleString()}`;
}

function formatDate(value) {
  if (!value) return "N/A";
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return String(value);
  }
}

export default function OrderList() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const { list, loading, pagination } = useSelector((state) => state.admin.orders);

  useEffect(() => {
    dispatch(
      getAdminOrders({
        page,
        limit: 20,
        status: activeFilter === "ALL" ? undefined : activeFilter,
        search: search.trim() || undefined,
      }),
    );
  }, [activeFilter, dispatch, page, search]);

  const totalPages = useMemo(() => {
    const total = Number(pagination?.total || 0);
    const limit = Number(pagination?.limit || 20);
    return Math.max(1, Math.ceil(total / limit));
  }, [pagination?.limit, pagination?.total]);

  const renderOrder = ({ item }) => {
    const customerName = item?.user?.name || "Guest";
    const customerEmail = item?.user?.email || "No email";
    const itemCount = Array.isArray(item?.items) ? item.items.length : 0;
    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => navigation.navigate("OrderDetails", { orderId: item?._id })}
        activeOpacity={0.7}
      >
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>{item?._id?.slice(-8) || "Order"}</Text>
          <StatusChip status={item?.status || "PENDING"} />
        </View>
        <View style={styles.orderBody}>
          <View style={styles.customerInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{customerName[0] || "U"}</Text>
            </View>
            <View>
              <Text style={styles.customerName}>{customerName}</Text>
              <Text style={styles.customerEmail}>{customerEmail}</Text>
            </View>
          </View>
          <View style={styles.orderMeta}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Items</Text>
              <Text style={styles.metaValue}>{itemCount}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Total</Text>
              <Text style={styles.metaValueBold}>{formatCurrency(item?.finalAmountPaid)}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.orderDate}>{formatDate(item?.createdAt)}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.root}>
      <AppHeader title="Orders" subtitle={`${pagination?.total || list.length} total orders`} navigation={navigation} />
      <SearchBar placeholder="Search by payment or delivery..." value={search} onChangeText={setSearch} />

      <View style={styles.filterRow}>
        {FILTER_OPTIONS.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
            onPress={() => {
              setPage(1);
              setActiveFilter(filter);
            }}
          >
            <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>
              {filter === "ALL" ? "All" : filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && list.length === 0 ? (
        <LoadingSpinner message="Loading orders..." />
      ) : list.length === 0 ? (
        <EmptyState title="No orders found" description="Try changing filters or search text." />
      ) : (
        <FlashList
          data={list}
          renderItem={renderOrder}
          estimatedItemSize={160}
          keyExtractor={(item) => item?._id}
          contentContainerStyle={{ padding: SPACING.lg }}
          ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
        />
      )}

      <PaginationFooter
        currentPage={page}
        totalPages={totalPages}
        onPrev={() => setPage((current) => Math.max(1, current - 1))}
        onNext={() => setPage((current) => Math.min(totalPages, current + 1))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
    gap: SPACING.xs,
    flexWrap: "wrap",
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    backgroundColor: COLORS.surface,
  },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: FONT.medium },
  filterTextActive: { color: COLORS.textInverse },
  orderCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    ...SHADOW.sm,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  orderId: { fontSize: 15, fontWeight: FONT.bold, color: COLORS.textPrimary },
  orderBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  customerInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight + "40",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm,
  },
  avatarText: { fontSize: 14, fontWeight: FONT.bold, color: COLORS.primary },
  customerName: { fontSize: 14, fontWeight: FONT.semibold, color: COLORS.textPrimary },
  customerEmail: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
  orderMeta: { alignItems: "flex-end" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: SPACING.xs },
  metaLabel: { fontSize: 11, color: COLORS.textMuted },
  metaValue: { fontSize: 13, color: COLORS.textSecondary, fontWeight: FONT.medium },
  metaValueBold: { fontSize: 15, color: COLORS.textPrimary, fontWeight: FONT.bold },
  orderDate: { fontSize: 11, color: COLORS.textMuted, marginTop: SPACING.sm },
});
