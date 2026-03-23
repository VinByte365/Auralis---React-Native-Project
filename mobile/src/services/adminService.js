import axiosInstance from "../helper/axiosInstance";
import { API_URL } from "../constants/config";
import { getToken } from "../utils/token";
import { unwrapResult } from "./apiHelpers";

function toQueryParams(params = {}) {
  const query = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    query[key] = value;
  });

  return query;
}

function buildProductFormData(payload = {}, images = []) {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    formData.append(key, String(value));
  });

  images.forEach((image, index) => {
    const uri = image?.uri;
    if (!uri) return;

    const mimeTypeRaw = image?.mimeType || image?.type;
    const mimeType =
      typeof mimeTypeRaw === "string" && mimeTypeRaw.includes("/")
        ? mimeTypeRaw
        : "image/jpeg";

    const extension = mimeType.split("/")[1] || "jpg";
    const fileName =
      image?.fileName ||
      image?.name ||
      `product-image-${Date.now()}-${index}.${extension}`;

    formData.append("images", {
      uri,
      name: fileName,
      type: mimeType,
    });
  });

  return formData;
}

async function uploadAdminProductMultipart({
  method,
  path,
  payload = {},
  images = [],
  timeoutMs = 120000,
}) {
  const token = await getToken();
  const formData = buildProductFormData(payload, images);
  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
      signal: controller.signal,
    });

    const responseData = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        responseData?.message ||
          responseData?.error ||
          `Request failed (${response.status})`,
      );
    }

    if (!responseData?.success) {
      throw new Error(
        responseData?.message || responseData?.error || "Request failed",
      );
    }

    return responseData.result ?? responseData;
  } catch (error) {
    console.log("[PRODUCT][UPLOAD][FETCH_ERROR]", {
      method,
      path,
      message: error?.message,
      name: error?.name,
    });

    if (error?.name === "AbortError") {
      throw new Error("Upload timeout. Please try again.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutHandle);
  }
}

export const fetchAdminDashboardSummary = async () => {
  const response = await axiosInstance.get("/api/v1/admin/dashboard/summary");
  return unwrapResult(response);
};

export const fetchAdminActivityLogs = async (params = {}) => {
  const response = await axiosInstance.get("/api/v1/logs/logs", {
    params: toQueryParams(params),
  });
  return unwrapResult(response);
};

export const fetchAdminSalesAnalytics = async (params = {}) => {
  const response = await axiosInstance.get("/api/v1/admin/analytics/sales", {
    params: toQueryParams(params),
  });
  return unwrapResult(response);
};

export const fetchAdminProductAnalytics = async (params = {}) => {
  const response = await axiosInstance.get("/api/v1/admin/analytics/products", {
    params: toQueryParams(params),
  });
  return unwrapResult(response);
};

export const fetchAdminUserAnalytics = async (params = {}) => {
  const response = await axiosInstance.get("/api/v1/admin/analytics/users", {
    params: toQueryParams(params),
  });
  return unwrapResult(response);
};

export const fetchAdminOrderAnalytics = async (params = {}) => {
  const response = await axiosInstance.get("/api/v1/admin/analytics/orders", {
    params: toQueryParams(params),
  });
  return unwrapResult(response);
};

export const fetchAdminInventoryAnalytics = async () => {
  const response = await axiosInstance.get("/api/v1/admin/analytics/inventory");
  return unwrapResult(response);
};

export const fetchAdminStaffPerformance = async (params = {}) => {
  const response = await axiosInstance.get(
    "/api/v1/admin/analytics/staff-performance",
    {
      params: toQueryParams(params),
    },
  );
  return unwrapResult(response);
};

export const fetchAdminCustomerInsights = async (params = {}) => {
  const response = await axiosInstance.get(
    "/api/v1/admin/analytics/customer-insights",
    {
      params: toQueryParams(params),
    },
  );
  return unwrapResult(response);
};

export const fetchAdminPredictiveAnalytics = async (params = {}) => {
  const response = await axiosInstance.get(
    "/api/v1/admin/analytics/predictive",
    {
      params: toQueryParams(params),
    },
  );
  return unwrapResult(response);
};

export const fetchAdminOrders = async (params = {}) => {
  const response = await axiosInstance.get("/api/v1/admin/orders", {
    params: toQueryParams(params),
  });
  return unwrapResult(response);
};

export const updateAdminOrderStatus = async (orderId, status) => {
  console.log("[ADMIN][ORDER_STATUS] update request", { orderId, status });
  const response = await axiosInstance.put(`/api/v1/orders/${orderId}/status`, {
    status,
  });
  const result = unwrapResult(response);
  console.log("[ADMIN][ORDER_STATUS] update success", {
    orderId: result?._id || orderId,
    status: result?.status || status,
  });
  return result;
};

export const fetchAdminUsers = async () => {
  const response = await axiosInstance.get("/api/v1/user");
  return unwrapResult(response);
};

export const createAdminUser = async (payload = {}) => {
  const response = await axiosInstance.post("/api/v1/user", payload);
  return unwrapResult(response);
};

export const updateAdminUser = async (userId, payload = {}) => {
  const response = await axiosInstance.put(`/api/v1/user/${userId}`, payload);
  return unwrapResult(response);
};

export const updateAdminUserRole = async (userId, payload = {}) => {
  const response = await axiosInstance.put(
    `/api/v1/user/roles/${userId}`,
    payload,
  );
  return unwrapResult(response);
};

export const deleteAdminUser = async (userId) => {
  const response = await axiosInstance.delete(`/api/v1/user/${userId}`);
  return unwrapResult(response);
};

export const fetchAdminCategories = async () => {
  const response = await axiosInstance.get("/api/v1/category");
  return unwrapResult(response);
};

export const createAdminCategories = async (categories = []) => {
  const response = await axiosInstance.post("/api/v1/category", { categories });
  return unwrapResult(response);
};

export const updateAdminCategory = async (categoryId, categoryData = {}) => {
  const response = await axiosInstance.put(`/api/v1/category/${categoryId}`, {
    categoryData,
  });
  return unwrapResult(response);
};

export const deleteAdminCategory = async (categoryId) => {
  const response = await axiosInstance.delete(`/api/v1/category/${categoryId}`);
  return unwrapResult(response);
};

export const fetchAdminProducts = async (params = {}) => {
  const response = await axiosInstance.get("/api/v1/product", {
    params: toQueryParams(params),
  });
  return unwrapResult(response);
};

export const createAdminProduct = async (payload = {}, images = []) => {
  console.log("[PRODUCT][CREATE][REQUEST]", {
    imageCount: Array.isArray(images) ? images.length : 0,
    payload,
  });

  const result = await uploadAdminProductMultipart({
    method: "POST",
    path: "/api/v1/product",
    payload,
    images,
  });

  console.log("[PRODUCT][CREATE][SUCCESS]", {
    imageCount: Array.isArray(images) ? images.length : 0,
  });

  return result;
};

export const updateAdminProduct = async (
  productId,
  payload = {},
  images = [],
) => {
  console.log("[PRODUCT][UPDATE][REQUEST]", {
    productId,
    imageCount: Array.isArray(images) ? images.length : 0,
    payload,
  });

  const result = await uploadAdminProductMultipart({
    method: "PUT",
    path: `/api/v1/product/${productId}`,
    payload,
    images,
  });

  console.log("[PRODUCT][UPDATE][SUCCESS]", {
    productId,
    imageCount: Array.isArray(images) ? images.length : 0,
  });

  return result;
};

export const softDeleteAdminProduct = async (productId) => {
  const response = await axiosInstance.post(`/api/v1/product/${productId}`);
  return unwrapResult(response);
};

export const restoreAdminProduct = async (productId) => {
  const response = await axiosInstance.put(
    `/api/v1/product/restore/${productId}`,
  );
  return unwrapResult(response);
};

export const hardDeleteAdminProduct = async (productId) => {
  const response = await axiosInstance.delete(`/api/v1/product/${productId}`);
  return unwrapResult(response);
};

export const updateAdminProductStock = async (productId, stockQuantity) => {
  const response = await axiosInstance.put(
    `/api/v1/product/stocks/${productId}`,
    {
      stockQuantity,
    },
  );
  return unwrapResult(response);
};

export const fetchAdminPromos = async (params = {}) => {
  const response = await axiosInstance.get("/api/v1/promo", {
    params: toQueryParams(params),
  });

  return unwrapResult(response);
};

export const createAdminPromo = async (payload = {}) => {
  const response = await axiosInstance.post("/api/v1/promo", payload);
  return unwrapResult(response);
};

export const updateAdminPromo = async (promoId, payload = {}) => {
  const response = await axiosInstance.put(`/api/v1/promo/${promoId}`, payload);
  return unwrapResult(response);
};

export const deleteAdminPromo = async (promoId) => {
  const response = await axiosInstance.delete(`/api/v1/promo/${promoId}`);
  return unwrapResult(response);
};
