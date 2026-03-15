import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "../../constants/config";
import * as authService from "../../services/authService";
import { useState } from "react";

export const login = createAsyncThunk(
  "auth/login",
  async (credentials, thunkAPI) => {
    const userState = thunkAPI.getState().auth;
    if (userState.isLoggedIn) return;
    if (!credentials) throw new Error("missing credentials");
    return await authService.login(credentials);
  },
);

export const register = createAsyncThunk("auth/register", async(formData,{getState})=>{
  const userState = getState().auth
  if(userState.isLoggedIn) return
  return await authService.register(formData)
})
