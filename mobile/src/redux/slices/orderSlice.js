import { createSlice } from "@reduxjs/toolkit";

import { changeOrderStatus, getOrders } from "../thunks/orderThunks";

const initialState = {
  orders: [],
  isLoading: false,
  error: "",
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getOrders.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload || [];
        state.error = "";
      })
      .addCase(getOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || "Failed to fetch orders";
      })
      .addCase(changeOrderStatus.fulfilled, (state, action) => {
        state.orders = state.orders.map((order) =>
          order._id === action.payload._id ? action.payload : order,
        );
      });
  },
});

export default orderSlice.reducer;
