import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addToCart,
  clearCart,
  removeFromCart,
} from "../../redux/thunks/cartThunks";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function useCart() {
  const dispatch = useDispatch();
  const { items, isLoading, error } = useSelector((state) => state.cart);
  const navigation = useNavigation();
  const route = useRoute();
  
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
    console.log(items.length);

    navigation.navigate("Checkout");
  };

  const handleClearCart = async () => {
    if (!items.length) return;

    await dispatch(clearCart());
  };

  return {
    items,
    isLoading,
    error,
    subtotal,
    handleCheckout,
    handleClearCart,
    handleDecreaseQty,
    handleIncreaseQty,
  };
}
