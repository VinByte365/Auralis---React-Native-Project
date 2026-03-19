import { createSlice } from "@reduxjs/toolkit";
import {
  archiveProduct,
  changeProductStock,
  changeUserRole,
  createCategories,
  editCategory,
  getAdminAnalyticsOverview,
  getAdminCategories,
  getAdminDashboardData,
  getAdminOperationsAnalyticsData,
  getAdminOrders,
  getAdminProductAnalyticsData,
  getAdminProductsData,
  getAdminUserAnalyticsData,
  getAdminUsersData,
  permanentlyDeleteProduct,
  removeCategory,
  removeUser,
  restoreProduct,
  updateAdminOrder,
} from "../thunks/adminThunks";

const initialState = {
  dashboard: {
    summary: null,
    recentOrders: [],
    activity: [],
    loading: false,
    error: "",
  },
  analytics: {
    overview: null,
    product: null,
    user: null,
    operations: null,
    customerInsights: [],
    staffPerformance: [],
    loading: false,
    error: "",
  },
  orders: {
    list: [],
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      hasMore: false,
    },
    loading: false,
    updating: false,
    error: "",
  },
  categories: {
    list: [],
    loading: false,
    saving: false,
    error: "",
  },
  products: {
    list: [],
    recycleBin: [],
    loading: false,
    updating: false,
    error: "",
  },
  users: {
    list: [],
    loading: false,
    updating: false,
    error: "",
  },
};

const setError = (target, action, fallback) => {
  target.error = action.payload?.error || fallback;
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAdminDashboardData.pending, (state) => {
        state.dashboard.loading = true;
        state.dashboard.error = "";
      })
      .addCase(getAdminDashboardData.fulfilled, (state, action) => {
        state.dashboard.loading = false;
        state.dashboard.summary = action.payload?.summary || null;
        state.dashboard.activity = action.payload?.activity || [];
        state.dashboard.recentOrders = action.payload?.recentOrders || [];
      })
      .addCase(getAdminDashboardData.rejected, (state, action) => {
        state.dashboard.loading = false;
        setError(state.dashboard, action, "Failed to load dashboard");
      })

      .addCase(getAdminAnalyticsOverview.pending, (state) => {
        state.analytics.loading = true;
        state.analytics.error = "";
      })
      .addCase(getAdminAnalyticsOverview.fulfilled, (state, action) => {
        state.analytics.loading = false;
        state.analytics.overview = action.payload;
      })
      .addCase(getAdminAnalyticsOverview.rejected, (state, action) => {
        state.analytics.loading = false;
        setError(state.analytics, action, "Failed to load analytics");
      })

      .addCase(getAdminProductAnalyticsData.pending, (state) => {
        state.analytics.loading = true;
        state.analytics.error = "";
      })
      .addCase(getAdminProductAnalyticsData.fulfilled, (state, action) => {
        state.analytics.loading = false;
        state.analytics.product = {
          analytics: action.payload?.analytics || null,
          inventory: action.payload?.inventory || null,
        };
        state.products.list = action.payload?.products || [];
      })
      .addCase(getAdminProductAnalyticsData.rejected, (state, action) => {
        state.analytics.loading = false;
        setError(state.analytics, action, "Failed to load product analytics");
      })

      .addCase(getAdminUserAnalyticsData.pending, (state) => {
        state.analytics.loading = true;
        state.analytics.error = "";
      })
      .addCase(getAdminUserAnalyticsData.fulfilled, (state, action) => {
        state.analytics.loading = false;
        state.analytics.user = action.payload?.analytics || null;
        state.analytics.customerInsights = action.payload?.insights || [];
        state.users.list = action.payload?.users || [];
      })
      .addCase(getAdminUserAnalyticsData.rejected, (state, action) => {
        state.analytics.loading = false;
        setError(state.analytics, action, "Failed to load user analytics");
      })

      .addCase(getAdminOperationsAnalyticsData.pending, (state) => {
        state.analytics.loading = true;
        state.analytics.error = "";
      })
      .addCase(getAdminOperationsAnalyticsData.fulfilled, (state, action) => {
        state.analytics.loading = false;
        state.analytics.operations = action.payload?.orders || null;
        state.analytics.staffPerformance = action.payload?.staff || [];
      })
      .addCase(getAdminOperationsAnalyticsData.rejected, (state, action) => {
        state.analytics.loading = false;
        setError(state.analytics, action, "Failed to load operations analytics");
      })

      .addCase(getAdminOrders.pending, (state) => {
        state.orders.loading = true;
        state.orders.error = "";
      })
      .addCase(getAdminOrders.fulfilled, (state, action) => {
        state.orders.loading = false;
        state.orders.list = action.payload?.orders || [];
        state.orders.pagination =
          action.payload?.pagination || state.orders.pagination;
      })
      .addCase(getAdminOrders.rejected, (state, action) => {
        state.orders.loading = false;
        setError(state.orders, action, "Failed to load orders");
      })

      .addCase(updateAdminOrder.pending, (state) => {
        state.orders.updating = true;
        state.orders.error = "";
      })
      .addCase(updateAdminOrder.fulfilled, (state, action) => {
        state.orders.updating = false;
        const updatedOrder = action.payload;
        state.orders.list = state.orders.list.map((order) =>
          order?._id === updatedOrder?._id ? updatedOrder : order,
        );
      })
      .addCase(updateAdminOrder.rejected, (state, action) => {
        state.orders.updating = false;
        setError(state.orders, action, "Failed to update order");
      })

      .addCase(getAdminCategories.pending, (state) => {
        state.categories.loading = true;
        state.categories.error = "";
      })
      .addCase(getAdminCategories.fulfilled, (state, action) => {
        state.categories.loading = false;
        state.categories.list = action.payload || [];
      })
      .addCase(getAdminCategories.rejected, (state, action) => {
        state.categories.loading = false;
        setError(state.categories, action, "Failed to fetch categories");
      })

      .addCase(createCategories.pending, (state) => {
        state.categories.saving = true;
        state.categories.error = "";
      })
      .addCase(createCategories.fulfilled, (state, action) => {
        state.categories.saving = false;
        const created = Array.isArray(action.payload)
          ? action.payload
          : [action.payload];
        state.categories.list = [...created, ...state.categories.list];
      })
      .addCase(createCategories.rejected, (state, action) => {
        state.categories.saving = false;
        setError(state.categories, action, "Failed to create category");
      })

      .addCase(editCategory.pending, (state) => {
        state.categories.saving = true;
      })
      .addCase(editCategory.fulfilled, (state, action) => {
        state.categories.saving = false;
        state.categories.list = state.categories.list.map((item) =>
          item?._id === action.payload?._id ? action.payload : item,
        );
      })
      .addCase(editCategory.rejected, (state, action) => {
        state.categories.saving = false;
        setError(state.categories, action, "Failed to update category");
      })

      .addCase(removeCategory.pending, (state) => {
        state.categories.saving = true;
      })
      .addCase(removeCategory.fulfilled, (state, action) => {
        state.categories.saving = false;
        state.categories.list = state.categories.list.filter(
          (item) => item?._id !== action.payload,
        );
      })
      .addCase(removeCategory.rejected, (state, action) => {
        state.categories.saving = false;
        setError(state.categories, action, "Failed to remove category");
      })

      .addCase(getAdminProductsData.pending, (state) => {
        state.products.loading = true;
        state.products.error = "";
      })
      .addCase(getAdminProductsData.fulfilled, (state, action) => {
        state.products.loading = false;
        state.products.list = action.payload || [];
      })
      .addCase(getAdminProductsData.rejected, (state, action) => {
        state.products.loading = false;
        setError(state.products, action, "Failed to fetch products");
      })

      .addCase(archiveProduct.pending, (state) => {
        state.products.updating = true;
      })
      .addCase(archiveProduct.fulfilled, (state, action) => {
        state.products.updating = false;
        const archived = action.payload;
        state.products.list = state.products.list.filter(
          (item) => item?._id !== archived?._id,
        );
        state.products.recycleBin = [archived, ...state.products.recycleBin];
      })
      .addCase(archiveProduct.rejected, (state, action) => {
        state.products.updating = false;
        setError(state.products, action, "Failed to archive product");
      })

      .addCase(restoreProduct.pending, (state) => {
        state.products.updating = true;
      })
      .addCase(restoreProduct.fulfilled, (state, action) => {
        state.products.updating = false;
        state.products.recycleBin = state.products.recycleBin.filter(
          (item) => item?._id !== action.payload,
        );
      })
      .addCase(restoreProduct.rejected, (state, action) => {
        state.products.updating = false;
        setError(state.products, action, "Failed to restore product");
      })

      .addCase(permanentlyDeleteProduct.pending, (state) => {
        state.products.updating = true;
      })
      .addCase(permanentlyDeleteProduct.fulfilled, (state, action) => {
        state.products.updating = false;
        state.products.recycleBin = state.products.recycleBin.filter(
          (item) => item?._id !== action.payload,
        );
      })
      .addCase(permanentlyDeleteProduct.rejected, (state, action) => {
        state.products.updating = false;
        setError(state.products, action, "Failed to delete product");
      })

      .addCase(changeProductStock.pending, (state) => {
        state.products.updating = true;
      })
      .addCase(changeProductStock.fulfilled, (state, action) => {
        state.products.updating = false;
        const updated = action.payload;
        state.products.list = state.products.list.map((product) =>
          product?._id === updated?._id ? updated : product,
        );
      })
      .addCase(changeProductStock.rejected, (state, action) => {
        state.products.updating = false;
        setError(state.products, action, "Failed to update stock");
      })

      .addCase(getAdminUsersData.pending, (state) => {
        state.users.loading = true;
        state.users.error = "";
      })
      .addCase(getAdminUsersData.fulfilled, (state, action) => {
        state.users.loading = false;
        state.users.list = action.payload || [];
      })
      .addCase(getAdminUsersData.rejected, (state, action) => {
        state.users.loading = false;
        setError(state.users, action, "Failed to fetch users");
      })

      .addCase(changeUserRole.pending, (state) => {
        state.users.updating = true;
      })
      .addCase(changeUserRole.fulfilled, (state, action) => {
        state.users.updating = false;
        state.users.list = state.users.list.map((user) =>
          user?._id === action.payload?._id ? action.payload : user,
        );
      })
      .addCase(changeUserRole.rejected, (state, action) => {
        state.users.updating = false;
        setError(state.users, action, "Failed to update user role");
      })

      .addCase(removeUser.pending, (state) => {
        state.users.updating = true;
      })
      .addCase(removeUser.fulfilled, (state, action) => {
        state.users.updating = false;
        state.users.list = state.users.list.filter(
          (user) => user?._id !== action.payload,
        );
      })
      .addCase(removeUser.rejected, (state, action) => {
        state.users.updating = false;
        setError(state.users, action, "Failed to delete user");
      });
  },
});

export default adminSlice.reducer;
