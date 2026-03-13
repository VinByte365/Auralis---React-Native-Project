import { createSlice, configureStore } from "@reduxjs/toolkit";
import { login, register } from "../thunks/authThunk";

function handlePending(state) {
  state = { ...state, isLoggedIn: false, loading: true };
  return;
}

function handleFulfilled(state, payload) {
  state = { ...state, isLoggedIn: true, loading: true, user: payload.result };
}

function handleRejected(state, payload) {
  state = { ...state, loading: false, error: payload.result.error };
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
      .addCase(login.pending, handlePending(state))
      .addCase(login.fulfilled, handleFulfilled(state))
      .addCase(login.rejected, handleRejected(state))

      .addCase(register.pending, handlePending(state))
      .addCase(register.fulfilled, handleFulfilled(state))
      .addCase(register.rejected, handleRejected(state));
  },
});

export const {} = authSlice.actions;
export default auth = authSlice.reducer;
