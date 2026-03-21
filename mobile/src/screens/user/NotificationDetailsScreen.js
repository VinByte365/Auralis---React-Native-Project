import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
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
  const title = params?.title || "Promotion Details";
  const message = params?.message || "Promotion information";
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

  useEffect(() => {
    console.log("[Push][Details] Route params (raw):", route?.params || {});
    console.log("[Push][Details] Route params (normalized):", params);
    console.log("[Push][Details] Type resolution:", {
      inferredType,
      notificationType,
      isPromoNotification,
    });
  }, [
    inferredType,
    isPromoNotification,
    notificationType,
    params,
    route?.params,
  ]);

  useEffect(() => {
    let active = true;

    async function loadProduct() {
      if (isPromoNotification) {
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
  }, [isPromoNotification, productId]);

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
      ];
    }

    return [
      { label: "Product", value: productName },
      {
        label: "Discount",
        value: resolvedDiscount > 0 ? `${resolvedDiscount}%` : "N/A",
      },
      { label: "Old Price", value: formatPrice(resolvedBasePrice) },
      { label: "New Price", value: formatPrice(resolvedSalePrice) },
    ];
  }, [
    isPromoNotification,
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
  ]);

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

      <View style={styles.card}>
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

        {details.map((item) => (
          <View key={item.label} style={styles.row}>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.value}>{item.value}</Text>
          </View>
        ))}
      </View>

      {!isPromoNotification ? (
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
          <Text style={styles.primaryBtnText}>View Product</Text>
        </TouchableOpacity>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
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
  card: {
    backgroundColor: "#f8f8f8",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ececec",
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  label: {
    fontSize: 13,
    color: "#666",
  },
  value: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111",
  },
  primaryBtn: {
    marginTop: 16,
    backgroundColor: "#111",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
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
