import { createAsyncThunk } from "@reduxjs/toolkit";

import {
  createReview,
  deleteReview,
  fetchProductReviews,
  updateReview,
} from "../../services/reviewService";
import { getErrorMessage } from "../../services/apiHelpers";

export const getProductReviews = createAsyncThunk(
  "review/getProductReviews",
  async (productId, { rejectWithValue }) => {
    try {
      return await fetchProductReviews(productId);
    } catch (error) {
      return rejectWithValue({
        error: getErrorMessage(error, "Failed to fetch reviews"),
      });
    }
  },
);

export const addReview = createAsyncThunk(
  "review/add",
  async (payload, { rejectWithValue }) => {
    try {
      return await createReview(payload);
    } catch (error) {
      return rejectWithValue({
        error: getErrorMessage(error, "Failed to save review"),
      });
    }
  },
);

export const editReview = createAsyncThunk(
  "review/edit",
  async ({ reviewId, payload }, { rejectWithValue }) => {
    try {
      return await updateReview(reviewId, payload);
    } catch (error) {
      return rejectWithValue({
        error: getErrorMessage(error, "Failed to update review"),
      });
    }
  },
);

export const removeReview = createAsyncThunk(
  "review/remove",
  async (reviewId, { rejectWithValue }) => {
    try {
      await deleteReview(reviewId);
      return reviewId;
    } catch (error) {
      return rejectWithValue({
        error: getErrorMessage(error, "Failed to delete review"),
      });
    }
  },
);
