import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchCategories,
  fetchProductById,
  fetchProducts,
} from "../../services/productService";
import { getErrorMessage } from "../../services/apiHelpers";

export const getProducts = createAsyncThunk(
  "product/getProducts",
  async (_, { getState, rejectWithValue }) => {
    const { priceGTE, priceLTE, searchQuery, selectedRating } =
      getState().product;

    const normalizedPriceGTE =
      priceGTE === "" || priceGTE === null || Number(priceGTE) <= 0
        ? undefined
        : priceGTE;

    const normalizedPriceLTE =
      priceLTE === "" || priceLTE === null || Number(priceLTE) <= 0
        ? undefined
        : priceLTE;

    try {
      return await fetchProducts({
        q: searchQuery,
        priceGTE: normalizedPriceGTE,
        priceLTE: normalizedPriceLTE,
        minRating: selectedRating || undefined,
      });
    } catch (error) {
      return rejectWithValue({
        error: getErrorMessage(error, "Failed to fetch products"),
      });
    }
  },
);

export const getCategories = createAsyncThunk(
  "product/getCategories",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchCategories();
    } catch (error) {
      return rejectWithValue({
        error: getErrorMessage(error, "Failed to fetch categories"),
      });
    }
  },
);

export const getProductDetails = createAsyncThunk(
  "product/getProductDetails",
  async (productId, { rejectWithValue }) => {
    try {
      return await fetchProductById(productId);
    } catch (error) {
      return rejectWithValue({
        error: getErrorMessage(error, "Failed to fetch product details"),
      });
    }
  },
);
