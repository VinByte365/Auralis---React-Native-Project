import { configureStore } from "@reduxjs/toolkit";

import auth from "./slices/authSlice";
import admin from "./slices/adminSlice";
import cart from "./slices/cartSlice";
import order from "./slices/orderSlice";
import product from "./slices/productSlice";
import review from "./slices/reviewSlice";

const store = configureStore({
  reducer: { auth, admin, product, cart, order, review },
});

export default store;
