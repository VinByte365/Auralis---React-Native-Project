import axiosInstance from "../helper/axiosInstance";
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
  const response = await axiosInstance.put(`/api/v1/orders/${orderId}/status`, {
    status,
  });
  return unwrapResult(response);
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
  const response = await axiosInstance.post(
    "/api/v1/product",
    buildProductFormData(payload, images),
  );

  return unwrapResult(response);
};

export const updateAdminProduct = async (
  productId,
  payload = {},
  images = [],
) => {
  const response = await axiosInstance.put(
    `/api/v1/product/${productId}`,
    buildProductFormData(payload, images),
  );

  return unwrapResult(response);
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
