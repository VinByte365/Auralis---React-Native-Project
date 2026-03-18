import { createSlice } from "@reduxjs/toolkit";
import {
  getCategories,
  getProductDetails,
  getProducts,
} from "../thunks/productThunks";

const initialState = {
  products: [],
  categories: [],
  productDetails: null,
  count: 0,
  isLoading: false,
  error: "",
  priceGTE: 0,
  priceLTE: 0,
  searchQuery: "",
  selectedCategory: null,
  selectedRating: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    hasMore: false,
  },
};

const handlePending = (state) => {
  state.isLoading = true;
  state.error = "";
};

const handleFulfilled = (state, action) => {
  state.isLoading = false;
  state.error = "";
  state.products = action.payload?.products || [];
  state.count = action.payload?.products?.length || 0;
  state.pagination = action.payload?.pagination || state.pagination;
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
      state.priceGTE = initialState.priceGTE;
      state.priceLTE = initialState.priceLTE;
      state.searchQuery = initialState.searchQuery;
      state.selectedCategory = initialState.selectedCategory;
      state.selectedRating = initialState.selectedRating;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setPriceRange: (state, action) => {
      state.priceGTE = action.payload?.priceGTE ?? state.priceGTE;
      state.priceLTE = action.payload?.priceLTE ?? state.priceLTE;
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    setSelectedRating: (state, action) => {
      state.selectedRating = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProducts.pending, handlePending)
      .addCase(getProducts.fulfilled, handleFulfilled)
      .addCase(getProducts.rejected, handleRejected)

      .addCase(getCategories.pending, handlePending)
      .addCase(getCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload || [];
      })
      .addCase(getCategories.rejected, handleRejected)

      .addCase(getProductDetails.pending, handlePending)
      .addCase(getProductDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = "";
        state.productDetails = action.payload;
      })
      .addCase(getProductDetails.rejected, handleRejected);
  },
});

export const {
  clearFilters,
  setPriceRange,
  setSearchQuery,
  setSelectedCategory,
  setSelectedRating,
} = productSlice.actions;
export default productSlice.reducer;
