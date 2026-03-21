import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  createAdminPromo,
  createAdminProduct,
  createAdminUser,
  createAdminCategories,
  deleteAdminCategory,
  deleteAdminPromo,
  deleteAdminUser,
  fetchAdminActivityLogs,
  fetchAdminCategories,
  fetchAdminCustomerInsights,
  fetchAdminDashboardSummary,
  fetchAdminInventoryAnalytics,
  fetchAdminOrderAnalytics,
  fetchAdminOrders,
  fetchAdminPromos,
  fetchAdminPredictiveAnalytics,
  fetchAdminProductAnalytics,
  fetchAdminProducts,
  fetchAdminSalesAnalytics,
  fetchAdminStaffPerformance,
  fetchAdminUserAnalytics,
  fetchAdminUsers,
  hardDeleteAdminProduct,
  restoreAdminProduct,
  softDeleteAdminProduct,
  updateAdminCategory,
  updateAdminOrderStatus,
  updateAdminProductStock,
  updateAdminProduct,
  updateAdminPromo,
  updateAdminUser,
  updateAdminUserRole,
} from "../../services/adminService";
import { getErrorMessage } from "../../services/apiHelpers";

export const getAdminDashboardData = createAsyncThunk(
  "admin/getDashboardData",
  async (_, { rejectWithValue }) => {
    try {
      const [summaryResult, activityResult, ordersResult] =
        await Promise.allSettled([
          fetchAdminDashboardSummary(),
          fetchAdminActivityLogs({ limit: 5 }),
          fetchAdminOrders({ page: 1, limit: 5 }),
        ]);

      return {
        summary:
          summaryResult.status === "fulfilled" ? summaryResult.value : null,
        activity:
          activityResult.status === "fulfilled"
            ? activityResult.value || []
            : [],
        recentOrders:
          ordersResult.status === "fulfilled"
            ? ordersResult.value?.orders || []
            : [],
      };
    } catch (error) {
      return rejectWithValue({
        error: getErrorMessage(error, "Failed to load dashboard"),
      });
    }
  },
);

export const getAdminAnalyticsOverview = createAsyncThunk(
  "admin/getAnalyticsOverview",
  async (params = {}, { rejectWithValue }) => {
    try {
      const [sales, orders, predictive] = await Promise.allSettled([
        fetchAdminSalesAnalytics(params),
        fetchAdminOrderAnalytics(params),
        fetchAdminPredictiveAnalytics({ forecastDays: 30 }),
      ]);

      return {
        sales: sales.status === "fulfilled" ? sales.value : null,
        orders: orders.status === "fulfilled" ? orders.value : null,
        predictive: predictive.status === "fulfilled" ? predictive.value : null,
      };
    } catch (error) {
      return rejectWithValue({
        error: getErrorMessage(error, "Failed to load analytics overview"),
      });
    }
  },
);

export const getAdminProductAnalyticsData = createAsyncThunk(
  "admin/getProductAnalyticsData",
  async (params = {}, { rejectWithValue }) => {
    try {
      const [analytics, inventory, products] = await Promise.allSettled([
        fetchAdminProductAnalytics(params),
        fetchAdminInventoryAnalytics(),
        fetchAdminProducts({ q: params?.search || "" }),
      ]);

      return {
        analytics: analytics.status === "fulfilled" ? analytics.value : null,
        inventory: inventory.status === "fulfilled" ? inventory.value : null,
        products:
          products.status === "fulfilled"
            ? products.value?.products || products.value || []
            : [],
      };
    } catch (error) {
      return rejectWithValue({
        error: getErrorMessage(error, "Failed to load product analytics"),
      });
    }
  },
);

export const getAdminUserAnalyticsData = createAsyncThunk(
  "admin/getUserAnalyticsData",
  async (params = {}, { rejectWithValue }) => {
    try {
      const [analytics, insights, users] = await Promise.allSettled([
        fetchAdminUserAnalytics(params),
        fetchAdminCustomerInsights({ limit: 10 }),
        fetchAdminUsers(),
      ]);

      return {
        analytics: analytics.status === "fulfilled" ? analytics.value : null,
        insights: insights.status === "fulfilled" ? insights.value || [] : [],
        users: users.status === "fulfilled" ? users.value || [] : [],
      };
    } catch (error) {
      return rejectWithValue({
        error: getErrorMessage(error, "Failed to load user analytics"),
      });
    }
  },
);

export const getAdminOperationsAnalyticsData = createAsyncThunk(
  "admin/getOperationsAnalyticsData",
  async (params = {}, { rejectWithValue }) => {
    try {
      const [orders, staff] = await Promise.allSettled([
        fetchAdminOrderAnalytics(params),
        fetchAdminStaffPerformance(params),
      ]);

      return {
        orders: orders.status === "fulfilled" ? orders.value : null,
        staff: staff.status === "fulfilled" ? staff.value || [] : [],
      };
    } catch (error) {
      return rejectWithValue({
        error: getErrorMessage(error, "Failed to load operations analytics"),
      });
    }
  },
);

export const getAdminOrders = createAsyncThunk(
  "admin/getOrders",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await fetchAdminOrders(params);
    } catch (error) {
      return rejectWithValue({
        error: getErrorMessage(error, "Failed to fetch orders"),
      });
    }
  },
);

export const updateAdminOrder = createAsyncThunk(
  "admin/updateOrder",
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      return await updateAdminOrderStatus(orderId, status);
    } catch (error) {
      return rejectWithValue({
        error: getErrorMessage(error, "Failed to update order status"),
      });
    }
  },
);

export const getAdminCategories = createAsyncThunk(
  "admin/getCategories",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchAdminCategories();
    } catch (error) {
      return rejectWithValue({
        error: getErrorMessage(error, "Failed to fetch categories"),
      });
    }
  },
);

export const createCategories = createAsyncThunk(
  "admin/createCategories",
  async (categories = [], { rejectWithValue }) => {
    try {
      return await createAdminCategories(categories);
    } catch (error) {
      return rejectWithValue({
        error: getErrorMessage(error, "Failed to create category"),
      });
    }
  },
);

export const editCategory = createAsyncThunk(
  "admin/editCategory",
  async ({ categoryId, categoryData }, { rejectWithValue }) => {
    try {
      return await updateAdminCategory(categoryId, categoryData);
    } catch (error) {
      return rejectWithValue({
        error: getErrorMessage(error, "Failed to update category"),
      });
    }
  },
);

export const removeCategory = createAsyncThunk(
  "admin/removeCategory",
  async (categoryId, { rejectWithValue }) => {
    try {
      await deleteAdminCategory(categoryId);
      return categoryId;
    } catch (error) {
      return rejectWithValue({
        error: getErrorMessage(error, "Failed to delete category"),
      });
    }
  },
);

export const getAdminProductsData = createAsyncThunk(
  "admin/getProductsData",
  async (params = {}, { rejectWithValue }) => {
    try {
      const products = await fetchAdminProducts(params);
      return products?.products || products || [];
    } catch (error) {
      return rejectWithValue({
        error: getErrorMessage(error, "Failed to fetch products"),
      });
    }
  },
);

export const createProduct = createAsyncThunk(
  "admin/createProduct",
  async ({ payload = {}, images = [] }, { rejectWithValue }) => {
    try {
      return await createAdminProduct(payload, images);
    } catch (error) {
      return rejectWithValue({
        error: getErrorMessage(error, "Failed to create product"),
      });
    }
  },
);

export const editProduct = createAsyncThunk(
  "admin/editProduct",
  async ({ productId, payload = {}, images = [] }, { rejectWithValue }) => {
    try {
      return await updateAdminProduct(productId, payload, images);
    } catch (error) {
      return rejectWithValue({
        error: getErrorMessage(error, "Failed to update product"),
      });
    }
  },
);

export const archiveProduct = createAsyncThunk(
  "admin/archiveProduct",
  async (productId, { rejectWithValue }) => {
    try {
      return await softDeleteAdminProduct(productId);
    } catch (error) {
      return rejectWithValue({
        error: getErrorMessage(error, "Failed to archive product"),
      });
    }
  },
);

export const restoreProduct = createAsyncThunk(
  "admin/restoreProduct",
  async (productId, { rejectWithValue }) => {
    try {
      await restoreAdminProduct(productId);
      return productId;
    } catch (error) {
      return rejectWithValue({
        error: getErrorMessage(error, "Failed to restore product"),
      });
    }
  },
);

export const permanentlyDeleteProduct = createAsyncThunk(
  "admin/permanentlyDeleteProduct",
  async (productId, { rejectWithValue }) => {
    try {
      await hardDeleteAdminProduct(productId);
      return productId;
    } catch (error) {
      return rejectWithValue({
        error: getErrorMessage(error, "Failed to delete product"),
      });
    }
  },
);

export const changeProductStock = createAsyncThunk(
  "admin/changeProductStock",
  async ({ productId, stockQuantity }, { rejectWithValue }) => {
    try {
      return await updateAdminProductStock(productId, stockQuantity);
    } catch (error) {
      return rejectWithValue({
        error: getErrorMessage(error, "Failed to update stock"),
      });
    }
  },
);

export const getAdminUsersData = createAsyncThunk(
  "admin/getUsersData",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchAdminUsers();
    } catch (error) {
      return rejectWithValue({
        error: getErrorMessage(error, "Failed to fetch users"),
      });
    }
  },
);

export const createUser = createAsyncThunk(
  "admin/createUser",
  async (payload = {}, { rejectWithValue }) => {
    try {
      return await createAdminUser(payload);
    } catch (error) {
      return rejectWithValue({
        error: getErrorMessage(error, "Failed to create user"),
      });
    }
  },
);

export const editUser = createAsyncThunk(
  "admin/editUser",
  async ({ userId, payload }, { rejectWithValue }) => {
    try {
      return await updateAdminUser(userId, payload);
    } catch (error) {
      return rejectWithValue({
        error: getErrorMessage(error, "Failed to update user"),
      });
    }
  },
);

export const changeUserRole = createAsyncThunk(
  "admin/changeUserRole",
  async ({ userId, role }, { rejectWithValue }) => {
    try {
      return await updateAdminUserRole(userId, { role });
    } catch (error) {
      return rejectWithValue({
        error: getErrorMessage(error, "Failed to update user role"),
      });
    }
  },
);

export const removeUser = createAsyncThunk(
  "admin/removeUser",
  async (userId, { rejectWithValue }) => {
    try {
      await deleteAdminUser(userId);
      return userId;
    } catch (error) {
      return rejectWithValue({
        error: getErrorMessage(error, "Failed to delete user"),
      });
    }
  },
);

export const getAdminPromosData = createAsyncThunk(
  "admin/getPromosData",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await fetchAdminPromos(params);
    } catch (error) {
      return rejectWithValue({
        error: getErrorMessage(error, "Failed to fetch promotions"),
      });
    }
  },
);

export const createPromoEntry = createAsyncThunk(
  "admin/createPromoEntry",
  async (payload = {}, { rejectWithValue }) => {
    try {
      return await createAdminPromo(payload);
    } catch (error) {
      return rejectWithValue({
        error: getErrorMessage(error, "Failed to create promotion"),
      });
    }
  },
);

export const editPromoEntry = createAsyncThunk(
  "admin/editPromoEntry",
  async ({ promoId, payload = {} }, { rejectWithValue }) => {
    try {
      return await updateAdminPromo(promoId, payload);
    } catch (error) {
      return rejectWithValue({
        error: getErrorMessage(error, "Failed to update promotion"),
      });
    }
  },
);

export const removePromoEntry = createAsyncThunk(
  "admin/removePromoEntry",
  async (promoId, { rejectWithValue }) => {
    try {
      await deleteAdminPromo(promoId);
      return promoId;
    } catch (error) {
      return rejectWithValue({
        error: getErrorMessage(error, "Failed to delete promotion"),
      });
    }
  },
);
