import axiosInstance from "../helper/axiosInstance";
import { unwrapResult } from "./apiHelpers";
import { API_URL } from "../constants/config";
import { getToken } from "../utils/token";

function buildProfileFormData(payload = {}) {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (key === "avatar" && value?.uri) {
      formData.append("avatar", {
        uri: value.uri,
        name: value.name || "avatar.jpg",
        type: value.type || "image/jpeg",
      });
      return;
    }

    formData.append(key, String(value));
  });

  return formData;
}

export const fetchProfile = async (userId) => {
  const response = await axiosInstance.get(`/api/v1/user/${userId}`);
  return unwrapResult(response);
};

export const updateProfile = async (userId, payload = {}) => {
  const formData = buildProfileFormData(payload);
  const endpoint = `/api/v1/profile/user/${userId}`;
  const url = `${API_URL}${endpoint}`;

  try {
    console.log("[PROFILE] update request", {
      userId,
      hasAvatar: Boolean(payload?.avatar?.uri),
      apiUrl: endpoint,
    });

    const token = await getToken();
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const text = await response.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }

    if (!response.ok || !data?.success) {
      const message =
        data?.message ||
        data?.error ||
        `Profile update failed (${response.status})`;

      console.log("[PROFILE] update error", {
        userId,
        status: response.status,
        code: "HTTP_ERROR",
        message,
        data,
      });

      const normalizedError = new Error(message);
      normalizedError.status = response.status;
      normalizedError.code = "HTTP_ERROR";
      normalizedError.raw = data;
      throw normalizedError;
    }

    return data.result ?? data;
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error?.message ||
      error?.message ||
      "Failed to update profile";

    console.log("[PROFILE] update error", {
      userId,
      status: error?.response?.status,
      code: error?.code,
      message,
      data: error?.response?.data,
    });

    const normalizedError = new Error(message);
    normalizedError.status = error?.response?.status;
    normalizedError.code = error?.code;
    normalizedError.raw = error;
    throw normalizedError;
  }
};

export const registerPushToken = async (token, platform = "unknown") => {
  const response = await axiosInstance.post("/api/v1/user/push-token", {
    token,
    platform,
  });

  return unwrapResult(response);
};

export const removePushToken = async () => {
  const response = await axiosInstance.delete("/api/v1/user/push-token");

  return unwrapResult(response);
};
