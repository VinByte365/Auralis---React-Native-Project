import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { checkoutCart } from "../../redux/thunks/cartThunks";

const PAYMENT_OPTIONS = [
  { key: "cod", label: "Cash on Delivery" },
  { key: "gcash", label: "GCash" },
  { key: "card", label: "Card" },
];

export default function CheckoutScreen({ navigation }) {
  const dispatch = useDispatch();
  const { items, isLoading } = useSelector((state) => state.cart);
  const user = useSelector((state) => state.auth.user);
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + Number(item.price || 0) * Number(item.quantity || 0),
        0,
      ),
    [items],
  );

  const shippingFee = 0;
  const total = subtotal + shippingFee;

  const addressText = useMemo(() => {
    const segments = [
      user?.address,
      user?.street,
      user?.city,
      user?.state,
      user?.country,
      user?.zipCode,
    ].filter(Boolean);

    return segments.length
      ? segments.join(", ")
      : "No delivery address on file.";
  }, [user]);

  const handlePlaceOrder = async () => {
    if (!items.length) {
      Alert.alert("No items", "Your cart is empty.");
      return;
    }

    try {
      await dispatch(
        checkoutCart({
          paymentMethod,
          deliveryAddress: addressText,
        }),
      ).unwrap();

      Alert.alert("Order placed", "Your order has been placed successfully.");
      navigation.navigate("HomeMain");
    } catch (error) {
      Alert.alert(
        "Checkout failed",
        error?.error || error?.message || "Please try again.",
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.title}>Checkout</Text>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.productId)}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <Text style={styles.sectionTitle}>Order Summary</Text>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.summaryRow}>
            <View style={styles.summaryLeft}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.itemMeta}>Qty: {item.quantity}</Text>
            </View>
            <Text style={styles.itemPrice}>
              PHP{" "}
              {(Number(item.price || 0) * Number(item.quantity || 0)).toFixed(
                2,
              )}
            </Text>
          </View>
        )}
        ListFooterComponent={
          <>
            <Text style={styles.sectionTitle}>User Info</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>{user?.name || "-"}</Text>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email || "-"}</Text>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue}>{addressText}</Text>
            </View>

            <Text style={styles.sectionTitle}>Payment Options</Text>
            <View style={styles.infoCard}>
              {PAYMENT_OPTIONS.map((option) => {
                const isSelected = paymentMethod === option.key;
                return (
                  <TouchableOpacity
                    key={option.key}
                    style={styles.paymentRow}
                    onPress={() => setPaymentMethod(option.key)}
                  >
                    <MaterialCommunityIcons
                      name={isSelected ? "radiobox-marked" : "radiobox-blank"}
                      size={20}
                      color={isSelected ? "#111" : "#666"}
                    />
                    <Text style={styles.paymentLabel}>{option.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.sectionTitle}>Payment Details</Text>
            <View style={styles.infoCard}>
              <View style={styles.amountRow}>
                <Text style={styles.amountLabel}>Subtotal</Text>
                <Text style={styles.amountValue}>
                  PHP {subtotal.toFixed(2)}
                </Text>
              </View>
              <View style={styles.amountRow}>
                <Text style={styles.amountLabel}>Shipping</Text>
                <Text style={styles.amountValue}>
                  PHP {shippingFee.toFixed(2)}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>PHP {total.toFixed(2)}</Text>
              </View>
              <Text style={styles.methodText}>
                Selected Method:{" "}
                {PAYMENT_OPTIONS.find((p) => p.key === paymentMethod)?.label}
              </Text>
            </View>
          </>
        }
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.placeOrderButton,
            (!items.length || isLoading) && styles.placeOrderDisabled,
          ]}
          onPress={handlePlaceOrder}
          disabled={!items.length || isLoading}
        >
          <Text style={styles.placeOrderText}>
            {isLoading ? "Placing order..." : "Place Order"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
  },
  headerSpacer: {
    width: 38,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111",
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
    marginTop: 16,
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f3f3",
  },
  summaryLeft: {
    flex: 1,
    paddingRight: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
  },
  itemMeta: {
    fontSize: 12,
    color: "#666",
    marginTop: 3,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
  },
  infoCard: {
    borderWidth: 1,
    borderColor: "#efefef",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#fff",
  },
  infoLabel: {
    fontSize: 12,
    color: "#777",
    marginTop: 2,
  },
  infoValue: {
    fontSize: 14,
    color: "#222",
    marginBottom: 8,
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: "#222",
    marginLeft: 10,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  amountLabel: {
    fontSize: 13,
    color: "#666",
  },
  amountValue: {
    fontSize: 13,
    color: "#222",
    fontWeight: "600",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#efefef",
    paddingTop: 10,
    marginTop: 2,
  },
  totalLabel: {
    fontSize: 15,
    color: "#111",
    fontWeight: "700",
  },
  totalValue: {
    fontSize: 15,
    color: "#111",
    fontWeight: "700",
  },
  methodText: {
    marginTop: 10,
    fontSize: 12,
    color: "#555",
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#efefef",
  },
  placeOrderButton: {
    height: 44,
    borderRadius: 10,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },
  placeOrderDisabled: {
    opacity: 0.55,
  },
  placeOrderText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "700",
  },
});
