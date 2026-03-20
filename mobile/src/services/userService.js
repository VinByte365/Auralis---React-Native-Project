import axiosInstance from "../helper/axiosInstance";
import { unwrapResult } from "./apiHelpers";

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
  const response = await axiosInstance.put(
    `/api/v1/profile/user/${userId}`,
    buildProfileFormData(payload),
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return unwrapResult(response);
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
