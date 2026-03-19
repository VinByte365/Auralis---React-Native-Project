import { createAsyncThunk } from "@reduxjs/toolkit";

import { fetchOrders, updateOrderStatus } from "../../services/orderService";
import { getErrorMessage } from "../../services/apiHelpers";

export const getOrders = createAsyncThunk(
  "order/getOrders",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchOrders();
    } catch (error) {
      return rejectWithValue({
        error: getErrorMessage(error, "Failed to fetch orders"),
      });
    }
  },
);

export const changeOrderStatus = createAsyncThunk(
  "order/changeStatus",
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      return await updateOrderStatus(orderId, status);
    } catch (error) {
      return rejectWithValue({
        error: getErrorMessage(error, "Failed to update order"),
      });
    }
  },
);
