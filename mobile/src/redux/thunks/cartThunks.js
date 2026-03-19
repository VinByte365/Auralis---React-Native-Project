import { createAsyncThunk } from "@reduxjs/toolkit";

import {
  clearStoredCart,
  getStoredCart,
  removeStoredCartItem,
  upsertCartItem,
} from "../../services/cartService";
import { checkoutOrder } from "../../services/orderService";
import { getErrorMessage } from "../../services/apiHelpers";

export const hydrateCart = createAsyncThunk(
  "cart/hydrate",
  async (_, { rejectWithValue }) => {
    try {
      return await getStoredCart();
    } catch (error) {
      return rejectWithValue({
        error: getErrorMessage(error, "Failed to load cart"),
      });
    }
  },
);

export const addToCart = createAsyncThunk(
  "cart/add",
  async ({ product, quantity = 1 }, { rejectWithValue }) => {
    try {
      return await upsertCartItem(product, quantity);
    } catch (error) {
      return rejectWithValue({
        error: getErrorMessage(error, "Failed to update cart"),
      });
    }
  },
);

export const removeFromCart = createAsyncThunk(
  "cart/remove",
  async (productId, { rejectWithValue }) => {
    try {
      return await removeStoredCartItem(productId);
    } catch (error) {
      return rejectWithValue({
        error: getErrorMessage(error, "Failed to remove item"),
      });
    }
  },
);

export const clearCart = createAsyncThunk(
  "cart/clear",
  async (_, { rejectWithValue }) => {
    try {
      await clearStoredCart();
      return [];
    } catch (error) {
      return rejectWithValue({
        error: getErrorMessage(error, "Failed to clear cart"),
      });
    }
  },
);

export const checkoutCart = createAsyncThunk(
  "cart/checkout",
  async (payload = {}, { getState, dispatch, rejectWithValue }) => {
    try {
      const items = getState().cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      const result = await checkoutOrder({
        items,
        discounts: payload.discounts || {},
        paymentMethod: payload.paymentMethod || "cod",
        deliveryAddress: payload.deliveryAddress || "",
        paymentDetails: payload.paymentDetails || {},
      });

      await dispatch(clearCart()).unwrap();
      return result;
    } catch (error) {
      return rejectWithValue({
        error: getErrorMessage(error, "Checkout failed"),
      });
    }
  },
);
