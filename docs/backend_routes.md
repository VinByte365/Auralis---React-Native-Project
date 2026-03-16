# Auralis Backend Routes Documentation

This document categorizes all backend API routes based on their target user base: **Admin** and **User (Customer/Public)**. All routes are prefixed with `/api/v1` unless specified otherwise.

## 🛡️ Admin Routes
These routes are primarily for administrators, management, and staff. They typically require authentication and a specific role (e.g., `admin`).

### Admin Dashboard & Analytics (Base: `/api/v1/admin`)
*Middleware used: `verifyToken`, `roleAccess("admin")`*

- `GET /dashboard/summary` - Main dashboard summary
- `GET /analytics/sales` - Sales analytics (Query: `startDate`, `endDate`, `groupBy`)
- `GET /analytics/products` - Product analytics (Query: `limit`, `sortBy`)
- `GET /analytics/categories` - Category analytics
- `GET /analytics/users` - User analytics (Query: `startDate`, `endDate`)
- `GET /analytics/orders` - Order analytics (Query: `startDate`, `endDate`)
- `GET /analytics/inventory` - Inventory analytics
- `GET /analytics/promotions` - Promotion analytics
- `GET /analytics/returns` - Returns analytics (Query: `startDate`, `endDate`)
- `GET /analytics/checkout-queue` - Checkout queue analytics
- `GET /analytics/staff-performance` - Staff performance analytics (Query: `startDate`, `endDate`, `limit`)
- `GET /analytics/customer-insights` - Customer insights (Query: `limit`)
- `GET /analytics/product-performance` - Product performance analytics (Query: `startDate`, `endDate`, `limit`)
- `GET /analytics/financial-reports` - Financial reports (Query: `startDate`, `endDate`)
- `GET /analytics/predictive` - Predictive analytics (Query: `forecastDays`)
- `GET /orders` - Get all orders with filtering (Query: `status`, `customerType`, `startDate`, `endDate`, `search`, `page`, `limit`, `sortBy`, `sortOrder`)
- `GET /logs/activity` - Activity logs (Query: `limit`, `page`, `userId`, `action`, `status`)

### Store Settings (Base: `/api/v1/admin/settings`)
*Middleware used: `verifyToken`, `roleAccess("admin")`*

- `GET /` - Get store settings
- `PUT /` - Update all store settings
- `PUT /business-hours` - Update store business hours
- `PUT /receipt` - Update receipt settings
- `PUT /tax` - Update tax settings

### Activity Logs (Base: `/api/v1/logs`)
- `GET /logs` - Fetch system activity logs

### Product Management (Admin/Staff Actions) (Base: `/api/v1`)
*Middleware used: `verifyToken`*

- `POST /product` - Create a product (with image upload)
- `PUT /product/:productId` - Update a product (with image upload)
- `POST /product/:productId` - Move product to recycle bin (Temporary Delete)
- `DELETE /product/:productId` - Delete a product permanently
- `PUT /product/restore/:productId` - Restore a deleted product
- `POST /product/removeImg/:productId` - Remove an image from a product
- `PUT /product/stocks/:productId` - Update product stock
- `GET /scan/merchandiser` - Merchandiser-specific scan endpoint

### User & Role Management (Base: `/api/v1`)
*Middleware used: `verifyToken`*

- `GET /user` - Get all users
- `POST /user` - Create a new user (with avatar upload)
- `DELETE /user/:userId` - Delete a user
- `PUT /user/roles/:userId` - Update user permissions/roles

### Category Management (Base: `/api/v1`)
*Middleware used: `verifyToken`*

- `POST /category` - Add newly category
- `PUT /category/:categoryId` - Update category details
- `DELETE /category/:categoryId` - Delete category

---

## 👤 User (Customer & Public) Routes
These routes are available to the general public or authenticated customers.

### Authentication (Base: `/api/v1`)
- `POST /register` - Register a new user
- `POST /signIn` - User sign-in
- `POST /login` - User log-in
- `POST /me` - Verify user token *(Requires `verifyToken` middleware)*
- `POST /logout` - Logout user *(Requires `verifyToken` middleware)*

### Product Catalog & Browsing (Base: `/api/v1`)
- `GET /product` - Get all products
- `GET /product/search` - Search products
- `GET /product/:productId` - Get specific product by ID
- `GET /catalog` - Fetch product catalog
- `GET /catalog/version` - Get catalog version
- `GET /scan/product` - Customer product scan endpoint

### User Profile & Customer Actions (Base: `/api/v1`)
*Middleware used: `verifyToken`*

- `GET /customer/home` - Retrieve customer home dashboard data
- `GET /user/:userId` - Get specific user profile details
- `PUT /profile/user/:userId` - Update user profile and avatar (with image upload)

### Categories (Base: `/api/v1`)
- `GET /category` - Get list of categories

### Orders (Base: `/api/v1`)
*Middleware used: `verifyToken`*

- `GET /orders` - Fetch list of user's orders
- `POST /confirmOrder` - Place and confirm a new order
