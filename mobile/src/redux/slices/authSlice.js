import { createSlice } from "@reduxjs/toolkit";
import {
  hydrateSession,
  login,
  logout,
  register,
  googleSignIn,
} from "../thunks/authThunk";

function handlePending(state) {
  state.loading = true;
  return;
}

function handleFulfilled(state, action) {
  const nextUser = action.payload?.user || {};
  const hasIdentity = Boolean(nextUser?._id || nextUser?.userId);

  state.isLoggedIn = true;
  state.loading = false;
  state.user = nextUser;
  state.isLoggedIn = hasIdentity || state.isLoggedIn;
  state.error = "";
  state.bootstrapped = true;
}

function handleRejected(state, action) {
  state.loading = false;
  state.bootstrapped = true;
  state.error =
    action.payload?.error || "Something went wrong, please try again later.";
}

const initialState = {
  user: {},
  isLoggedIn: false,
  loading: false,
  error: "",
  bootstrapped: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetState: (state) => {
      state.user = initialState.user;
      state.isLoggedIn = initialState.isLoggedIn;
      state.loading = initialState.loading;
      state.error = initialState.error;
      state.bootstrapped = true;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, handlePending)
      .addCase(login.fulfilled, handleFulfilled)
      .addCase(login.rejected, handleRejected)

      .addCase(register.pending, handlePending)
      .addCase(register.fulfilled, handleFulfilled)
      .addCase(register.rejected, handleRejected)

      .addCase(googleSignIn.pending, handlePending)
      .addCase(googleSignIn.fulfilled, handleFulfilled)
      .addCase(googleSignIn.rejected, handleRejected)

      .addCase(hydrateSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(hydrateSession.fulfilled, handleFulfilled)
      .addCase(hydrateSession.rejected, (state) => {
        state.loading = false;
        state.bootstrapped = true;
        state.isLoggedIn = false;
        state.user = {};
      })

      .addCase(logout.fulfilled, (state) => {
        state.user = {};
        state.isLoggedIn = false;
        state.loading = false;
        state.error = "";
        state.bootstrapped = true;
      });
  },
});

export const { resetState, setError } = authSlice.actions;
export default authSlice.reducer;
