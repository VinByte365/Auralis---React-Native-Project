import axiosInstance from "../helper/axiosInstance";

export const login = async (credentials) => {
  if (!credentials.email) throw new Error("missing email");
  if (!credentials.password) throw new Error("missing password");

  const response = await axiosInstance.post("/api/v1/login", {
    skipIntercept: true,
  });

  if (!response?.data?.success) {
    return response.data.result.error;
  }

  return response.data.result;
};


