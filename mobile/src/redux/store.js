import { configureStore } from "@reduxjs/toolkit";

import auth from "./slices/authSlice";
import product from "./slices/productSlice";

const store = configureStore({
  reducer: { auth, product },
});

export default store;
