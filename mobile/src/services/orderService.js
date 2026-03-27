import axiosInstance from "../helper/axiosInstance";
import { unwrapResult } from "./apiHelpers";

export const fetchOrders = async () => {
  const response = await axiosInstance.get("/api/v1/orders");
  return unwrapResult(response);
};

export const getSpecificOrder = async (orderId) => {
  const response = await axiosInstance.get(`/api/v1/orders/${orderId}`);
  return unwrapResult(response);
};

export const checkoutOrder = async (payload = {}) => {
  const response = await axiosInstance.post("/api/v1/confirmOrder", payload);
  return response.data;
};

export const updateOrderStatus = async (orderId, status) => {
  const response = await axiosInstance.put(`/api/v1/orders/${orderId}/status`, {
    status,
  });

  return unwrapResult(response);
};
