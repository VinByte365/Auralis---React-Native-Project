import { createSlice, configureStore } from "@reduxjs/toolkit";
import { login, register } from "../thunks/authThunk";

function handlePending(state) {
  state.loading = true;
  return;
}

function handleFulfilled(state, payload) {
  state.isLoggedIn = true;
  state.loading = false;
  state.user = payload.result;
}

function handleRejected(state, payload) {
  state.loading = false;
  state.error = payload.result.error;
}

const initialState = {
  user: {},
  isLoggedIn: false,
  loading: false,
  error: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetState: (state, action) => {
      state = { ...initialState };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, handlePending)
      .addCase(login.fulfilled, handleFulfilled)
      .addCase(login.rejected, handleRejected)

      .addCase(register.pending, handlePending)
      .addCase(register.fulfilled, handleFulfilled)
      .addCase(register.rejected, handleRejected);
  },
});

export const {} = authSlice.actions;
export default authSlice.reducer;
