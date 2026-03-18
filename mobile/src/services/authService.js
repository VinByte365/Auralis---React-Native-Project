import axiosInstance from "../helper/axiosInstance";
import { unwrapResult } from "./apiHelpers";

export const login = async (credentials) => {
  if (!credentials.email) throw new Error("missing email");
  if (!credentials.password) throw new Error("missing password");

  const response = await axiosInstance.post("/api/v1/login", credentials, {
    skipIntercept: true,
  });

  const result = unwrapResult(response);

  return {
    user: result.user,
    token: result.token,
  };
};

export const register = async (formData = {}) => {
  const response = await axiosInstance.post("/api/v1/register", formData, {
    skipIntercept: true,
  });

  const result = unwrapResult(response);

  return {
    user: {
      userId: result.userId,
      name: result.name,
      email: result.email,
      role: result.role,
      status: result.status,
    },
    token: result.token,
  };
};

export const getCurrentUser = async () => {
  const response = await axiosInstance.post("/api/v1/me");
  const result = unwrapResult(response);

  return {
    user: result.user,
  };
};

export const logout = async () => {
  const response = await axiosInstance.post("/api/v1/logout");
  return unwrapResult(response);
};
