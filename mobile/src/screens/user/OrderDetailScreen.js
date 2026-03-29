import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatDate, formatMoney } from "../../utils/format";
import { useRoute } from "@react-navigation/native";
import useOrder from "../../hooks/user/useOrder";

export default function OrderDetailScreen() {
  const { items, itemCount, order, error, loading, setOrderInfo, navigation } = useOrder();
  const route = useRoute();

  React.useEffect(() => {
    setOrderInfo(route.params);
  }, [route.params,setOrderInfo]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={[styles.emptyWrap, { justifyContent: "center" }]}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={[styles.emptyText, { marginTop: 16 }]}>
            Loading order details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>Error Loading Order</Text>
          <Text style={styles.emptyText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order?._id) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>Order not found</Text>
          <Text style={styles.emptyText}>
            Please go back and open an order again.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={styles.headerSpacer} />
      </View> */}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.orderId}>
            Order #{String(order._id).slice(-8)}
          </Text>
          <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status</Text>
            <Text style={styles.infoValue}>{order.status || "-"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payment</Text>
            <Text style={styles.infoValue}>
              {order.paymentMethod === "cod"
                ? "Cash on Delivery"
                : order.paymentMethod || "COD"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Items</Text>
            <Text style={styles.infoValue}>{itemCount}</Text>
          </View>
          <View style={[styles.infoRow, styles.infoRowLast]}>
            <Text style={styles.infoLabel}>Delivery Address</Text>
            <Text style={styles.infoValueText}>
              {order.deliveryAddress || "N/A"}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Products</Text>
          <FlatList
            data={items}
            keyExtractor={(item, index) =>
              String(item?._id || item?.product || index)
            }
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item?.name || "Product"}</Text>
                  <Text style={styles.itemMeta}>
                    Qty: {Number(item?.quantity || 0)}
                  </Text>
                </View>
                <Text style={styles.itemPrice}>
                  ₱ {formatMoney(item?.itemTotal || item?.price)}
                </Text>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyProductsText}>
                No items for this order.
              </Text>
            }
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Amount Summary</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Subtotal</Text>
            <Text style={styles.infoValue}>
              ₱ {formatMoney(order.baseAmount || order.totalPrice)}
            </Text>
          </View>
          <View style={[styles.infoRow, styles.infoRowLast]}>
            <Text style={styles.totalLabel}>Total Paid</Text>
            <Text style={styles.totalValue}>
              ₱ {formatMoney(order.finalAmountPaid || order.totalPrice)}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backText: {
    fontSize: 14,
    color: "#111",
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 17,
    color: "#111",
    fontWeight: "700",
  },
  headerSpacer: {
    width: 36,
  },
  card: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    borderRadius: 14,
    padding: 14,
    backgroundColor: "#fff",
  },
  orderId: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111",
  },
  orderDate: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f4f4f4",
    gap: 10,
  },
  infoRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 2,
  },
  infoLabel: {
    fontSize: 13,
    color: "#666",
  },
  infoValue: {
    fontSize: 13,
    color: "#111",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  infoValueText: {
    flex: 1,
    textAlign: "right",
    fontSize: 13,
    color: "#111",
    fontWeight: "600",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f4f4f4",
  },
  itemInfo: {
    flex: 1,
    paddingRight: 10,
  },
  itemName: {
    fontSize: 14,
    color: "#111",
    fontWeight: "600",
  },
  itemMeta: {
    fontSize: 12,
    color: "#777",
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    color: "#111",
    fontWeight: "700",
  },
  totalLabel: {
    fontSize: 14,
    color: "#111",
    fontWeight: "700",
  },
  totalValue: {
    fontSize: 16,
    color: "#111",
    fontWeight: "700",
  },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  emptyProductsText: {
    fontSize: 13,
    color: "#666",
    paddingVertical: 8,
  },
});
