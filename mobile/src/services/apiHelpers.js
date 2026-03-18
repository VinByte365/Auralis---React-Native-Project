export const unwrapResult = (response) => {
  if (!response?.data?.success) {
    throw new Error(
      response?.data?.message || response?.data?.error || "Request failed",
    );
  }

  return response.data.result ?? response.data;
};

export const getErrorMessage = (error, fallback = "Request failed") => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.response?.data?.result?.error ||
    error?.message ||
    fallback
  );
};
