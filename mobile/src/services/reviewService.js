import axiosInstance from "../helper/axiosInstance";
import { unwrapResult } from "./apiHelpers";

export const fetchProductReviews = async (productId) => {
  const response = await axiosInstance.get(
    `/api/v1/reviews/product/${productId}`,{
      retry:5
    }
  );
  // console.log(response.data)
  return unwrapResult(response);
};

export const createReview = async (payload) => {
  const response = await axiosInstance.post("/api/v1/reviews", payload);
  return unwrapResult(response);
};

export const updateReview = async (reviewId, payload) => {
  const response = await axiosInstance.put(
    `/api/v1/reviews/${reviewId}`,
    payload,
  );
  return unwrapResult(response);
};

export const deleteReview = async (reviewId) => {
  const response = await axiosInstance.delete(`/api/v1/reviews/${reviewId}`);
  return unwrapResult(response);
};
