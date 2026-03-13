import axios from "axios";
import { API_URL } from "../constants/config";
import { storeToken, getToken } from "../utils/token";

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 1000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(async (config) => {
  if (config?.skipIntercept) return config;

  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  return config;
});

export default axiosInstance;
