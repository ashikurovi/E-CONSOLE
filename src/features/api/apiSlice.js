import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userLoggedIn, userLoggedOut } from "@/features/auth/authSlice";
import { getTokens } from "@/hooks/useToken";

const BASE_URL = "https://squadcart-backend.up.railway.app/"; // ✅ e.g. https://yourserver.com/api
const MAX_RETRY_COUNT = 3;

// 🔹 Base query with Authorization header
const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers) => {
    const { accessToken } = getTokens();
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
    headers.set("Accept", "application/json");
    return headers;
  },
});

// 🔹 Wrapper for auto reauth (refresh token logic)
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  const { accessToken, refreshToken, rememberMe } = getTokens();
  let retryCount = 0;

  // Try refreshing token if unauthorized (401)
  while (
    (!accessToken || (result.error && result.error.status === 401)) &&
    retryCount < MAX_RETRY_COUNT
  ) {
    retryCount++;
    try {
      if (refreshToken) {
        const refreshResult = await baseQuery(
          {
            url: "/auth/refresh-token",
            method: "POST",
            body: { refreshToken },
            credentials: "include",
          },
          api,
          extraOptions
        );

        if (refreshResult.data?.success) {
          const newAccessToken = refreshResult.data.data?.accessToken;
          const newRefreshToken = refreshResult.data.data?.refreshToken;

          if (newAccessToken) {
            // ✅ Store new tokens
            api.dispatch(
              userLoggedIn({
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
                rememberMe,
              })
            );

            // Retry original request with new token
            result = await baseQuery(args, api, extraOptions);
            break;
          } else {
            console.error("Refresh token response missing accessToken");
            api.dispatch(userLoggedOut());
            break;
          }
        } else {
          api.dispatch(userLoggedOut());
          break;
        }
      } else {
        api.dispatch(userLoggedOut());
        break;
      }
    } catch (error) {
      console.error("Refresh token failed:", error);
      api.dispatch(userLoggedOut());
      break;
    }
  }

  return result;
};

// 🔹 Middleware to clear cache when user changes
const customMiddleware = (api) => (next) => (action) => {
  if (action.type === "auth/userLoggedIn") {
    api.dispatch(apiSlice.util.resetApiState());
  }
  return next(action);
};

// 🔹 The main API slice
export const apiSlice = createApi({
  reducerPath: "apiSlice",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "auth",
    "categories",
    "products",
    "inventory",
    "users",
    "orders",
    "ordersitem",
    "fraudchecker",
    "promocode",
    "settings",
    "help",
    "systemuser",
    "earnings",
    "overview",
    "dashboard",
    "privacyPolicy",
    "termsConditions",
    "refundPolicy",
    "package",
    "invoice"
  ],

  // ✅ Keep cache for 60s (avoid data disappearing)
  keepUnusedDataFor: 60,

  // ✅ Auto refetch on mount/reconnect
  refetchOnMountOrArgChange: true,
  refetchOnReconnect: true,

  endpoints: (builder) => ({}),

  // ✅ Add middleware for auth state changes
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(customMiddleware),
});

// ✅ Utility to reset cache when needed
export const {
  util: { resetApiState },
} = apiSlice;

// 🔹 Optional: setup store listener to clear cache on logout
export const setupApiSlice = (store) => {
  store.subscribe(() => {
    const state = store.getState();
    if (!state.auth.isAuthenticated) {
      store.dispatch(resetApiState());
    }
  });
};
