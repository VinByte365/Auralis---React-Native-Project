import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getOrders } from "../../redux/thunks/orderThunks";
import { SafeAreaView } from "react-native-safe-area-context";

const FILTERS = [
  { key: "ALL", label: "All" },
  { key: "PENDING", label: "Pending" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "PROCESSING", label: "Processing" },
  { key: "COMPLETED", label: "Completed" },
  { key: "CANCELLED", label: "Cancelled" },
  { key: "REFUNDED", label: "Refunded" },
];

function formatMoney(value) {
  return Number(value || 0).toFixed(2);
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OrderScreen() {
  const dispatch = useDispatch();
  const { orders, isLoading, error } = useSelector((state) => state.order);
  const [activeFilter, setActiveFilter] = useState("ALL");

  const loadOrders = useCallback(async () => {
    await dispatch(getOrders());
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders]),
  );

  const filteredOrders = useMemo(() => {
    if (activeFilter === "ALL") return orders;
    return orders.filter((order) => order.status === activeFilter);
  }, [orders, activeFilter]);

  const renderOrder = ({ item }) => {
    const itemCount = Array.isArray(item.items)
      ? item.items.reduce(
          (sum, orderItem) => sum + Number(orderItem.quantity || 0),
          0,
        )
      : 0;

    // Determine status badge color based on status
    const getStatusBadgeStyle = (status) => {
      switch (status) {
        case "COMPLETED":
          return { backgroundColor: "#e6f7e6" };
        case "PENDING":
          return { backgroundColor: "#fff3e0" };
        case "CONFIRMED":
          return { backgroundColor: "#e3f2fd" };
        case "PROCESSING":
          return { backgroundColor: "#ede7f6" };
        case "CANCELLED":
        case "REFUNDED":
          return { backgroundColor: "#ffebee" };
        default:
          return { backgroundColor: "#f1f1f1" };
      }
    };

    const getStatusTextStyle = (status) => {
      switch (status) {
        case "COMPLETED":
          return { color: "#2e7d32" };
        case "PENDING":
          return { color: "#ed6c02" };
        case "CONFIRMED":
          return { color: "#0288d1" };
        case "PROCESSING":
          return { color: "#5e35b1" };
        case "CANCELLED":
        case "REFUNDED":
          return { color: "#d32f2f" };
        default:
          return { color: "#333" };
      }
    };

    return (
      <View style={styles.orderCard}>
        <View style={styles.orderTopRow}>
          <Text style={styles.orderId}>
            Order #{String(item._id).slice(-6)}
          </Text>
          <View style={[styles.statusBadge, getStatusBadgeStyle(item.status)]}>
            <Text style={[styles.statusText, getStatusTextStyle(item.status)]}>
              {item.status || "-"}
            </Text>
          </View>
        </View>

        <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>

        <View style={styles.orderMetaRow}>
          <Text style={styles.orderMeta}>Items: {itemCount}</Text>
          <Text style={styles.orderMeta}>
            Payment:{" "}
            {item.paymentMethod === "cod"
              ? "Cash on Delivery"
              : item.paymentMethod || "COD"}
          </Text>
        </View>

        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Total Amount</Text>
          <Text style={styles.amountValue}>
            ₱ {formatMoney(item.finalAmountPaid)}
          </Text>
        </View>
      </View>
    );
  };

  const renderFilterItem = ({ item, index }) => {
    const active = activeFilter === item.key;
    return (
      <TouchableOpacity
        style={[
          styles.filterChip,
          active && styles.filterChipActive,
          index === 0 && styles.firstFilterChip,
          index === FILTERS.length - 1 && styles.lastFilterChip,
        ]}
        onPress={() => setActiveFilter(item.key)}
      >
        <Text style={[styles.filterText, active && styles.filterTextActive]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
        <Text style={styles.subtitle}>Track and manage your orders</Text>
      </View>

      <View style={styles.filtersWrapper}>
        <FlatList
          data={FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.filtersContainer}
          renderItem={renderFilterItem}
        />
      </View>

      {isLoading && !orders.length ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#111" />
          <Text style={styles.loadingText}>Loading your orders...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item._id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={loadOrders}
              colors={["#111"]}
              tintColor="#111"
            />
          }
          renderItem={renderOrder}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No orders found</Text>
              <Text style={styles.emptySubtext}>
                {activeFilter === "ALL"
                  ? "You haven't placed any orders yet."
                  : `No ${activeFilter.toLowerCase()} orders at the moment.`}
              </Text>
              {!!error && <Text style={styles.errorText}>{error}</Text>}
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
  filtersWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    marginRight: 8,
  },
  firstFilterChip: {
    marginLeft: 0,
  },
  lastFilterChip: {
    marginRight: 0,
  },
  filterChipActive: {
    backgroundColor: "#111",
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
  },
  filterTextActive: {
    color: "#fff",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    flexGrow: 1,
  },
  orderCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#f0f0f0",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  orderTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  orderDate: {
    fontSize: 13,
    color: "#666",
    marginBottom: 12,
  },
  orderMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  orderMeta: {
    fontSize: 13,
    color: "#555",
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  amountLabel: {
    fontSize: 14,
    color: "#444",
    fontWeight: "600",
  },
  amountValue: {
    fontSize: 18,
    color: "#111",
    fontWeight: "800",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 13,
    color: "#d32f2f",
    textAlign: "center",
    backgroundColor: "#ffebee",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    overflow: "hidden",
  },
});
