import { createSlice } from "@reduxjs/toolkit";

import {
  addReview,
  editReview,
  getProductReviews,
  removeReview,
} from "../thunks/reviewThunks";

const initialState = {
  reviews: [],
  summary: {
    averageRating: "0.0",
    totalReviews: 0,
  },
  isLoading: false,
  error: "",
  isAllowedToReview:false
};

const reviewSlice = createSlice({
  name: "review",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getProductReviews.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProductReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = action.payload.reviews || [];
        state.summary = action.payload.summary || initialState.summary;
        state.error = "";
      })
      .addCase(getProductReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || "Failed to fetch reviews";
      })
      .addCase(addReview.fulfilled, (state, action) => {
        state.reviews = [
          action.payload,
          ...state.reviews.filter(
            (review) => review._id !== action.payload._id,
          ),
        ];
      })
      .addCase(editReview.fulfilled, (state, action) => {
        state.reviews = state.reviews.map((review) =>
          review._id === action.payload._id ? action.payload : review,
        );
      })
      .addCase(removeReview.fulfilled, (state, action) => {
        state.reviews = state.reviews.filter(
          (review) => review._id !== action.payload,
        );
      });
  },
});

export default reviewSlice.reducer;
