import React, { useMemo } from "react";
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import {
  addToCart,
  clearCart,
  removeFromCart,
} from "../../redux/thunks/cartThunks";
import { SafeAreaView } from "react-native-safe-area-context";

const productImagePlaceholder = require("../../../assets/home/3.png");

export default function CartScreen({ navigation }) {
  const dispatch = useDispatch();
  const { items, isLoading, error } = useSelector((state) => state.cart);

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + Number(item.price || 0) * Number(item.quantity || 0),
        0,
      ),
    [items],
  );

  const handleIncreaseQty = async (item) => {
    await dispatch(
      addToCart({
        product: {
          _id: item.productId,
          name: item.name,
          price: item.price,
          images: item.image ? [{ url: item.image }] : [],
          saleActive: false,
          salePrice: null,
        },
        quantity: Number(item.quantity || 0) + 1,
      }),
    );
  };

  const handleDecreaseQty = async (item) => {
    const currentQty = Number(item.quantity || 0);
    if (currentQty <= 1) {
      await dispatch(removeFromCart(item.productId));
      return;
    }

    await dispatch(
      addToCart({
        product: {
          _id: item.productId,
          name: item.name,
          price: item.price,
          images: item.image ? [{ url: item.image }] : [],
          saleActive: false,
          salePrice: null,
        },
        quantity: currentQty - 1,
      }),
    );
  };

  const handleCheckout = async () => {
    if (!items.length) return;

    navigation.navigate("Checkout");
  };

  const handleClearCart = async () => {
    if (!items.length) return;

    await dispatch(clearCart());
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
        <Text style={styles.title}>My Cart</Text>
        <TouchableOpacity onPress={handleClearCart} style={styles.clearButton}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {items.length === 0 ? (
        <View style={styles.emptyWrap}>
          <MaterialCommunityIcons name="cart-outline" size={42} color="#888" />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>
            Add items from product details.
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.productId)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.itemCard}>
              <Image
                source={
                  item.image ? { uri: item.image } : productImagePlaceholder
                }
                style={styles.itemImage}
                resizeMode={item.image ? "cover" : "contain"}
              />

              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.itemPrice}>
                  PHP {Number(item.price || 0).toFixed(2)}
                </Text>

                <View style={styles.qtyRow}>
                  <TouchableOpacity
                    style={styles.qtyButton}
                    onPress={() => handleDecreaseQty(item)}
                  >
                    <MaterialCommunityIcons
                      name="minus"
                      size={18}
                      color="#111"
                    />
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.qtyButton}
                    onPress={() => handleIncreaseQty(item)}
                  >
                    <MaterialCommunityIcons
                      name="plus"
                      size={18}
                      color="#111"
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => dispatch(removeFromCart(item.productId))}
                  >
                    <MaterialCommunityIcons
                      name="trash-can-outline"
                      size={18}
                      color="#d11a2a"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      )}

      <View style={styles.footer}>
        <View>
          <Text style={styles.subtotalLabel}>Subtotal</Text>
          <Text style={styles.subtotalValue}>PHP {subtotal.toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.checkoutButton,
            (!items.length || isLoading) && styles.checkoutDisabled,
          ]}
          onPress={handleCheckout}
          disabled={!items.length || isLoading}
        >
          <Text style={styles.checkoutText}>Checkout</Text>
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
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111",
  },
  clearButton: {
    minWidth: 38,
    alignItems: "flex-end",
  },
  clearText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "600",
  },
  errorText: {
    color: "#d11a2a",
    fontSize: 13,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  emptyTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },
  emptySubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#777",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingBottom: 100,
  },
  itemCard: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#f0f0f0",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  itemImage: {
    width: 92,
    height: 92,
    backgroundColor: "#f5f5f5",
  },
  itemInfo: {
    flex: 1,
    padding: 10,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
    marginBottom: 6,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
    marginBottom: 8,
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  qtyButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: {
    fontSize: 14,
    color: "#111",
    fontWeight: "600",
    minWidth: 30,
    textAlign: "center",
  },
  deleteButton: {
    marginLeft: "auto",
    padding: 4,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    borderTopColor: "#efefef",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  subtotalLabel: {
    fontSize: 12,
    color: "#666",
  },
  subtotalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
  checkoutButton: {
    minWidth: 130,
    height: 42,
    borderRadius: 10,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  checkoutDisabled: {
    opacity: 0.5,
  },
  checkoutText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "700",
  },
});
