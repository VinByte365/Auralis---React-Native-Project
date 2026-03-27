import React, { useMemo, useState, useCallback, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { getOrders } from "../../redux/thunks/orderThunks";
import { getSpecificOrder } from "../../services/orderService";

const FILTERS = [
  { key: "ALL", label: "All" },
  { key: "PENDING", label: "Pending" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "PROCESSING", label: "Processing" },
  { key: "COMPLETED", label: "Completed" },
  { key: "CANCELLED", label: "Cancelled" },
  { key: "REFUNDED", label: "Refunded" },
];

export default function useOrder() {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const {
    orders,
    isLoading,
    error: orderError,
  } = useSelector((state) => state.order);
  const [fetchedOrder, setFetchedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [orderInfo, setOrderInfo] = useState(null);
  const passedOrder = orderInfo?.order;
  const orderId = orderInfo?.orderId;

  const reduxOrder =
    passedOrder ||
    (orderId ? orders.find((o) => String(o._id) === String(orderId)) : null);

  const order = reduxOrder || fetchedOrder;

  // Fetch order from API if not found in Redux
  useEffect(() => {
    let active = true;

    const fetchOrder = async () => {
      if (!orderId || reduxOrder) return; // Order already found or no orderId

      try {
        setLoading(true);
        setError("");
        if (!active) return;
        const fetched = await getSpecificOrder(orderId);
        setFetchedOrder(fetched);
      } catch (err) {
        if (active) {
          const errorMessage =
            err?.response?.data?.message ||
            err?.response?.data?.error?.message ||
            err?.message ||
            "Failed to load order";
          setError(errorMessage);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchOrder();

    return () => {
      active = false;
    };
  }, [orderId, reduxOrder]);

  const items = Array.isArray(order?.items) ? order.items : [];
  const itemCount = items.reduce(
    (sum, orderItem) => sum + Number(orderItem?.quantity || 0),
    0,
  );

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

  return {
    navigation,
    orders,
    isLoading,
    error,
    orderError,
    activeFilter,
    setActiveFilter,
    loadOrders,
    filteredOrders,

    items,
    itemCount,
    fetchedOrder,
    orderId,
    order,
    error,
    loading,
    setOrderInfo,
  };
}
