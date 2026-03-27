import React, { useMemo, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
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

export default function useOrder() {
  const navigation = useNavigation();
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

  return {
    navigation,
    orders,
    isLoading,
    error,
    activeFilter,
    setActiveFilter,
    loadOrders,
    filteredOrders,
  };
}
