import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

import { apiSlice } from "./features/api/apiSlice";
import authReducer from "./features/auth/authSlice";
import superadminAuthReducer from "./features/superadminAuth/superadminAuthSlice";

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
    superadminAuth: superadminAuthReducer,
  },
  devTools: import.meta.env.VITE_ENV !== "PRODUCTION",
  middleware: (gDM) => gDM().concat([apiSlice.middleware]),
});

setupListeners(store.dispatch);
