import { createSlice, configureStore } from "@reduxjs/toolkit";
import { login, register } from "../thunks/authThunk";

function handlePending(state) {
  state.loading = true;
  return;
}

function handleFulfilled(state, action) {
  state.isLoggedIn = true;
  state.loading = false;
  state.user = action.payload.user;
}

function handleRejected(state, action) {
  state.loading = false;
  state.error =
    action.payload?.error || "Something went wrong, please try again later.";
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
    setError: (state, action) => {
      state.error = [...state.error, action.payload];
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

export const { resetState, setError } = authSlice.actions;
export default authSlice.reducer;
