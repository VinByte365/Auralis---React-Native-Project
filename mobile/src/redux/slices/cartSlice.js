import { createSlice } from "@reduxjs/toolkit";

import {
  addToCart,
  checkoutCart,
  clearCart,
  hydrateCart,
  removeFromCart,
} from "../thunks/cartThunks";

const initialState = {
  items: [],
  isLoading: false,
  error: "",
  lastCheckout: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(hydrateCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(hydrateCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload || [];
      })
      .addCase(hydrateCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || "Failed to load cart";
      })

      .addCase(addToCart.fulfilled, (state, action) => {
        state.items = action.payload || [];
        state.error = "";
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = action.payload || [];
        state.error = "";
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        state.items = action.payload || [];
        state.error = "";
      })
      .addCase(checkoutCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkoutCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lastCheckout = action.payload;
        state.error = "";
      })
      .addCase(checkoutCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || "Checkout failed";
      });
  },
});

export default cartSlice.reducer;
