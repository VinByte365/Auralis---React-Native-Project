import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { fetchProductById } from "../../services/productService";

function formatPrice(value) {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount) || amount <= 0) return "N/A";
  return `PHP ${amount.toLocaleString()}`;
}

function formatDate(date) {
  if (!date) return "N/A";
  try {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "N/A";
  }
}

function normalizeParams(rawParams) {
  let normalized = rawParams || {};

  for (let index = 0; index < 3; index += 1) {
    if (!normalized || typeof normalized !== "object") break;

    if (typeof normalized.params === "string") {
      try {
        normalized = JSON.parse(normalized.params);
        continue;
      } catch {
        break;
      }
    }

    if (
      normalized.params &&
      typeof normalized.params === "object" &&
      Object.keys(normalized.params).length > 0
    ) {
      normalized = normalized.params;
      continue;
    }

    break;
  }

  return normalized && typeof normalized === "object" ? normalized : {};
}

export default function NotificationDetailsScreen({ route, navigation }) {
  const params = useMemo(() => normalizeParams(route?.params), [route?.params]);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const inferredType =
    params?.type ||
    (params?.promoId || params?.promoName || params?.code
      ? "promo"
      : "promotion");
  const notificationType = String(inferredType).toLowerCase();
  const isPromoNotification = notificationType === "promo";

  // Order type detection
  const isOrderNotification = Boolean(params?.orderId || params?.orderNumber);

  const title = params?.title || "Notification Details";
  const message = params?.message || "Notification information";
  const productName = product?.name || params?.productName || "N/A";
  const discountPercent = params?.discountPercent || "N/A";
  const oldPrice = params?.oldPrice;
  const newPrice = params?.newPrice;
  const productId = params?.productId;

  const promoName = params?.promoName || "N/A";
  const promoValue = params?.value;
  const promoType = String(params?.promoType || "percentage").toLowerCase();
  const promoCode = params?.code || "N/A";
  const promoScope = params?.scope || "N/A";
  const promoUsageLimit = params?.usageLimit;
  const promoUseCount = params?.useCount;

  // Order details
  const orderId = params?.orderId;
  const orderNumber = params?.orderNumber;
  const orderStatus = params?.status;
  const orderTotal = params?.orderTotal;
  const itemsCount = params?.itemsCount;
  const deliveryAddress = params?.deliveryAddress;
  const paymentMethod = params?.paymentMethod;

  useEffect(() => {
    // Notification details loaded
  }, [
    inferredType,
    isOrderNotification,
    isPromoNotification,
    notificationType,
    params,
    route?.params,
  ]);

  useEffect(() => {
    let active = true;

    async function loadProduct() {
      if (isPromoNotification || isOrderNotification) {
        setProduct(null);
        setLoadError("");
        return;
      }

      if (!productId) {
        setProduct(null);
        setLoadError("");
        return;
      }

      try {
        setLoading(true);
        setLoadError("");
        const result = await fetchProductById(productId);
        if (active) {
          setProduct(result || null);
        }
      } catch (error) {
        if (active) {
          setProduct(null);
          setLoadError(
            error?.message ||
              "Unable to load product details for this notification.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProduct();

    return () => {
      active = false;
    };
  }, [isPromoNotification, isOrderNotification, productId]);

  const resolvedBasePrice =
    Number(product?.price || oldPrice || 0) > 0
      ? Number(product?.price || oldPrice)
      : null;
  const resolvedSalePrice =
    Number(product?.salePrice || newPrice || 0) > 0
      ? Number(product?.salePrice || newPrice)
      : null;
  const resolvedDiscount =
    resolvedBasePrice &&
    resolvedSalePrice &&
    resolvedSalePrice < resolvedBasePrice
      ? Math.round(
          ((resolvedBasePrice - resolvedSalePrice) / resolvedBasePrice) * 100,
        )
      : Number(discountPercent) || 0;

  const details = useMemo(() => {
    if (isOrderNotification) {
      return [
        { label: "Order #", value: orderNumber || "N/A" },
        { label: "Status", value: orderStatus || "PENDING" },
        { label: "Total Amount", value: formatPrice(orderTotal) },
        { label: "Items", value: String(itemsCount || 0) },
        { label: "Payment Method", value: paymentMethod || "N/A" },
        { label: "Delivery Address", value: deliveryAddress || "N/A" },
        {
          label: "Notification ID",
          value: params?.notificationId?.slice(0, 12) || "N/A",
        },
        {
          label: "Sent At",
          value: formatDate(params?.timestamp),
        },
      ];
    }

    if (isPromoNotification) {
      const numericPromoValue = Number(promoValue || 0);
      const promoValueText =
        Number.isFinite(numericPromoValue) && numericPromoValue > 0
          ? promoType === "fixed"
            ? formatPrice(numericPromoValue)
            : `${numericPromoValue}%`
          : "N/A";

      return [
        { label: "Promo", value: promoName },
        { label: "Discount", value: promoValueText },
        { label: "Promo Code", value: promoCode || "N/A" },
        { label: "Scope", value: promoScope || "N/A" },
        {
          label: "Usage",
          value:
            promoUsageLimit !== undefined || promoUseCount !== undefined
              ? `${Number(promoUseCount || 0)} / ${Number(promoUsageLimit || 0)}`
              : "N/A",
        },
        {
          label: "Minimum Purchase",
          value: formatPrice(params?.minPurchase),
        },
        {
          label: "Valid Until",
          value: formatDate(params?.endDate),
        },
      ];
    }

    return [
      { label: "Product", value: productName },
      {
        label: "Discount",
        value: resolvedDiscount > 0 ? `${resolvedDiscount}%` : "N/A",
      },
      {
        label: "Discount Amount",
        value: formatPrice(
          resolvedBasePrice && resolvedSalePrice
            ? resolvedBasePrice - resolvedSalePrice
            : 0,
        ),
      },
      { label: "Original Price", value: formatPrice(resolvedBasePrice) },
      { label: "Sale Price", value: formatPrice(resolvedSalePrice) },
      { label: "Stock Available", value: String(params?.stock || 0) },
    ];
  }, [
    isPromoNotification,
    isOrderNotification,
    productName,
    resolvedBasePrice,
    resolvedDiscount,
    resolvedSalePrice,
    promoCode,
    promoName,
    promoScope,
    promoType,
    promoUsageLimit,
    promoUseCount,
    promoValue,
    orderStatus,
    orderTotal,
    itemsCount,
    deliveryAddress,
    paymentMethod,
    orderNumber,
    params,
  ]);

  const getStatusColor = (status) => {
    if (!status) return "#666";
    const normalizedStatus = String(status).toUpperCase();
    switch (normalizedStatus) {
      case "COMPLETED":
      case "DELIVERED":
        return "#4CAF50";
      case "CANCELLED":
        return "#f44336";
      case "PENDING":
      case "CONFIRMED":
        return "#FF9800";
      case "SHIPPED":
      case "IN_TRANSIT":
        return "#2196F3";
      default:
        return "#666";
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.iconBtn}
        >
          <MaterialCommunityIcons name="arrow-left" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Details</Text>
        <View style={styles.iconSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        <View style={styles.card}>
          {isOrderNotification && (
            <View
              style={[
                styles.statusBadge,
                { borderLeftColor: getStatusColor(orderStatus) },
              ]}
            >
              <Text style={styles.statusLabel}>Order Status</Text>
              <Text
                style={[
                  styles.statusValue,
                  { color: getStatusColor(orderStatus) },
                ]}
              >
                {orderStatus || "PENDING"}
              </Text>
            </View>
          )}

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#111" />
              <Text style={styles.loadingText}>Loading product details...</Text>
            </View>
          ) : null}

          {!loading && loadError ? (
            <Text style={styles.errorText}>{loadError}</Text>
          ) : null}

          <View style={styles.divider} />

          <View style={styles.detailsContainer}>
            {details.map((item, index) => (
              <View key={item.label}>
                <View style={styles.row}>
                  <Text style={styles.label}>{item.label}</Text>
                  <Text style={styles.value}>{item.value}</Text>
                </View>
                {index < details.length - 1 && (
                  <View style={styles.rowDivider} />
                )}
              </View>
            ))}
          </View>
        </View>

        {!isPromoNotification && !isOrderNotification ? (
          <TouchableOpacity
            style={[styles.primaryBtn, !productId && styles.disabledBtn]}
            disabled={!productId}
            onPress={() =>
              navigation.navigate("Home", {
                screen: "Product",
                params: { productId },
              })
            }
          >
            <MaterialCommunityIcons
              name="shopping"
              size={18}
              color="#fff"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.primaryBtnText}>View Product</Text>
          </TouchableOpacity>
        ) : isOrderNotification ? (
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() =>
              navigation.navigate("OrderDetails", {
                orderId,
              })
            }
          >
            <MaterialCommunityIcons
              name="package-variant"
              size={18}
              color="#fff"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.primaryBtnText}>View Order</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 0,
    paddingTop: 0,
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
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  iconSpacer: {
    width: 36,
    height: 36,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111",
  },
  scroll: {
    flex: 1,
  },
  card: {
    margin: 16,
    backgroundColor: "#f8f8f8",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ececec",
  },
  statusBadge: {
    marginBottom: 14,
    paddingLeft: 12,
    paddingVertical: 12,
    paddingRight: 12,
    borderLeftWidth: 4,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginHorizontal: -16,
    marginTop: -16,
    marginBottom: 14,
    paddingHorizontal: 16,
  },
  statusLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
  message: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: "#444",
  },
  loadingRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 12,
    color: "#666",
  },
  errorText: {
    marginTop: 10,
    fontSize: 12,
    color: "#d11a2a",
  },
  divider: {
    marginVertical: 14,
    height: 1,
    backgroundColor: "#e3e3e3",
  },
  detailsContainer: {
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  rowDivider: {
    height: 1,
    backgroundColor: "#e8e8e8",
  },
  label: {
    fontSize: 13,
    color: "#666",
    maxWidth: "60%",
  },
  value: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111",
    maxWidth: "40%",
    textAlign: "right",
  },
  primaryBtn: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#111",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  disabledBtn: {
    opacity: 0.5,
  },
});
