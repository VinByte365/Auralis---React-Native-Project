import { createSlice } from "@reduxjs/toolkit";
import { getProducts } from "../thunks/productThunks";

const initialState = {
  products: [],
  count: 0,
  isLoading: false,
  error: "",
  priceGTE: 0,
  priceLTE: 0,
  searchQuery: "",
};

const handlePending = (state) => {
  state.isLoading = true;
  state.error = "";
};

const handleFulfilled = (state, action) => {
  state.isLoading = false;
  state.error = "";
  state.products = action.payload?.products;
  state.count = action.payload?.products.length;
};

const handleRejected = (state, action) => {
  state.isLoading = false;
  state.error =
    action.payload?.error ||
    "Failed to fetch the product, please try again later";
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    clearFilters: (state) => {
      state = { ...initialState };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProducts.pending, handlePending)
      .addCase(getProducts.fulfilled, handleFulfilled)
      .addCase(getProducts.rejected, handleRejected);
  },
});

export const { clearFilters } = productSlice.actions;
export default productSlice.reducer
