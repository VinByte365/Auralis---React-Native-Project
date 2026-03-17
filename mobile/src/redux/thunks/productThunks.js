import { createAsyncThunk } from "@reduxjs/toolkit";

export const getProducts = createAsyncThunk(
  "product/getProducts",
  async (_, { getState }) => {
    const {priceGTE, priceLTE, searchQuery} = getState().product;
    
  },
);
