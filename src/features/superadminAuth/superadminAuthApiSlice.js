import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSuperadminTokens } from "./superadminAuthSlice";
import { API_BASE_URL } from "@/config/api";

const BASE_URL = API_BASE_URL;

// Base query with superadmin Authorization header
const superadminBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers) => {
    const { accessToken } = getSuperadminTokens();
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
    headers.set("Accept", "application/json");
    return headers;
  },
});

export const superadminAuthApiSlice = createApi({
  reducerPath: "superadminAuthApi",
  baseQuery: superadminBaseQuery,
  tagTypes: ["auth"],
  endpoints: (builder) => ({
    superadminLogin: builder.mutation({
      query: (data) => {
        return {
          url: `/auth/superadmin/login`,
          method: "POST",
          headers: {
            "Content-Type": "application/json;charset=UTF-8",
          },  
          body: {
            email: data.email || data.name,
            password: data.password,
          },
          credentials: "omit",
        };
      },
      invalidatesTags: ["auth"],
      transformResponse: (response, meta, arg) => {
        // Backend returns { accessToken, refreshToken, user } directly
        // RTK Query's fetchBaseQuery returns the response body directly
        // Ensure we return the response as-is
        console.log("superadminLogin transformResponse:", response);
        
        // If response is already the object we need, return it
        if (response && (response.accessToken || response.data?.accessToken)) {
          return response;
        }
        
        // If response is wrapped, unwrap it
        if (response?.data) {
          return response.data;
        }
        
        // Return response as-is
        return response;
      },
      transformErrorResponse: (response, meta, arg) => {
        // Transform error response for better error handling
        console.log("superadminLogin transformErrorResponse:", response);
        return response;
      },
    }),

    // Get current superadmin user profile data
    getCurrentSuperadmin: builder.query({
      query: () => ({
        url: `/auth/me`,
        method: "GET",
        credentials: "omit",
      }),
      providesTags: ["auth"],
      transformResponse: (response) => {
        // Return the user data directly
        return response?.data || response;
      },
    }),
  }),
});

export const {
  useSuperadminLoginMutation,
  useGetCurrentSuperadminQuery,
} = superadminAuthApiSlice;
