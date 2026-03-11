import { createSlice, configureStore } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  intialState: {
    user: {},
    isLogin: false,
    loading: false,
    error: "",
  },
  reducers: {},
  extraReducers: {},
});

export const {} = authSlice.actions;
export default  auth = authSlice.reducer;
