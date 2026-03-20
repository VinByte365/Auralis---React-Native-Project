import { createAsyncThunk } from "@reduxjs/toolkit";
import * as authService from "../../services/authService";
import { getErrorMessage } from "../../services/apiHelpers";
import { removeToken, storeToken } from "../../utils/token";
import { removePushToken } from "../../services/userService";

export const login = createAsyncThunk(
  "auth/login",
  async (credentials, thunkAPI) => {
    if (!credentials) throw new Error("missing credentials");

    try {
      const result = await authService.login(credentials);
      await storeToken(result.token);
      return result;
    } catch (error) {
      return thunkAPI.rejectWithValue({
        error: getErrorMessage(error, "Login failed"),
      });
    }
  },
);

export const register = createAsyncThunk(
  "auth/register",
  async (formData, thunkAPI) => {
    try {
      const result = await authService.register(formData);
      await storeToken(result.token);
      return result;
    } catch (error) {
      return thunkAPI.rejectWithValue({
        error: getErrorMessage(error, "Registration failed"),
      });
    }
  },
);

export const hydrateSession = createAsyncThunk(
  "auth/hydrateSession",
  async (_, thunkAPI) => {
    try {
      return await authService.getCurrentUser();
    } catch (error) {
      await removeToken();
      return thunkAPI.rejectWithValue({
        error: getErrorMessage(error, "Session expired"),
      });
    }
  },
);

export const logout = createAsyncThunk("auth/logout", async (_, thunkAPI) => {
  try {
    await removePushToken();
    await authService.logout();
  } catch {
  } finally {
    await removeToken();
  }

  return true;
});
