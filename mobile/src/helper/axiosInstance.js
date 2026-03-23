import axios from "axios";
import { API_URL } from "../constants/config";
import { getToken } from "../utils/token";

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

axiosInstance.interceptors.request.use(async (config) => {
  if (config?.skipIntercept) return config;

  const isFormData =
    typeof FormData !== "undefined" && config?.data instanceof FormData;
  if (isFormData && config?.headers) {
    if (typeof config.headers.setContentType === "function") {
      config.headers.setContentType(undefined);
    } else {
      delete config.headers["Content-Type"];
    }

    console.log("[API][UPLOAD][REQUEST]", {
      method: config?.method,
      url: `${config?.baseURL || ""}${config?.url || ""}`,
      timeout: config?.timeout,
    });
  }

  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosInstance.interceptors.response.use(
  function onFulfilled(response) {
    return response;
  },
  function onRejected(error) {
    const config = error?.config || {};
    const method = String(config?.method || "GET").toUpperCase();
    const url = `${config?.baseURL || ""}${config?.url || ""}`;
    const status = error?.response?.status;
    const responseData = error?.response?.data;
    const errorCode = error?.code;
    const errorMessage = error?.message;

    console.log("[API][ERROR]", {
      method,
      url,
      status,
      code: errorCode,
      message: errorMessage,
      timeout: config?.timeout,
      hasResponse: Boolean(error?.response),
      responseData,
    });

    return Promise.reject(error);
  },
);

export default axiosInstance;
