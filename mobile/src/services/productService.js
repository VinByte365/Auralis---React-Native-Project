import axiosInstance from "../helper/axiosInstance";
import { unwrapResult } from "./apiHelpers";

function buildProductFormData(payload = {}) {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (key === "images" && Array.isArray(value)) {
      value.forEach((image, index) => {
        formData.append("images", {
          uri: image.uri,
          name: image.name || `product-${index}.jpg`,
          type: image.type || "image/jpeg",
        });
      });
      return;
    }

    formData.append(key, String(value));
  });

  return formData;
}

export const fetchProducts = async (filters = {}) => {
  const response = await axiosInstance.get("/api/v1/product", {
    params: filters,
    retry:5
  });
  const result = unwrapResult(response);

  if (Array.isArray(result)) {
    return {
      products: result,
      pagination: {
        page: 1,
        limit: result.length,
        total: result.length,
        hasMore: false,
      },
    };
  }

  return result;
};

export const fetchProductById = async (productId) => {
  const response = await axiosInstance.get(`/api/v1/product/${productId}`,{
    retry:5
  });
  return unwrapResult(response);
};

export const fetchCategories = async () => {
  const response = await axiosInstance.get("/api/v1/category",{
    retry:5
  });
  return unwrapResult(response);
};

export const createProduct = async (payload = {}) => {
  const response = await axiosInstance.post(
    "/api/v1/product",
    buildProductFormData(payload),
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return unwrapResult(response);
};

export const updateProduct = async (productId, payload = {}) => {
  const response = await axiosInstance.put(
    `/api/v1/product/${productId}`,
    buildProductFormData(payload),
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return unwrapResult(response);
};

export const deleteProduct = async (productId) => {
  const response = await axiosInstance.delete(`/api/v1/product/${productId}`);
  return unwrapResult(response);
};
