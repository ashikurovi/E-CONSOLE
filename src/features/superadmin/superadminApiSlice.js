import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSuperadminTokens } from "@/features/superadminAuth/superadminAuthSlice";

const BASE_URL = "http://localhost:8000";

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

export const superadminApiSlice = createApi({
  reducerPath: "superadminApi",
  baseQuery: superadminBaseQuery,
  tagTypes: ["superadmin"],
  endpoints: (builder) => ({
    // List all superadmins
    getSuperadmins: builder.query({
      query: () => ({ url: "/superadmin", method: "GET" }),
      transformResponse: (res) => res || [],
      providesTags: [{ type: "superadmin", id: "LIST" }],
    }),

    // Get single superadmin
    getSuperadmin: builder.query({
      query: (id) => ({ url: `/superadmin/${id}`, method: "GET" }),
      transformResponse: (res) => res,
      providesTags: (result, error, id) => [{ type: "superadmin", id }],
    }),

    // Create superadmin
    createSuperadmin: builder.mutation({
      query: (body) => ({
        url: "/superadmin",
        method: "POST",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        body,
      }),
      invalidatesTags: [{ type: "superadmin", id: "LIST" }],
    }),

    // Update superadmin
    updateSuperadmin: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/superadmin/${id}`,
        method: "PATCH",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "superadmin", id },
        { type: "superadmin", id: "LIST" },
      ],
    }),

    // Delete superadmin
    deleteSuperadmin: builder.mutation({
      query: (id) => ({ url: `/superadmin/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "superadmin", id: "LIST" }],
    }),
  }),
});

export const {
  useGetSuperadminsQuery,
  useGetSuperadminQuery,
  useCreateSuperadminMutation,
  useUpdateSuperadminMutation,
  useDeleteSuperadminMutation,
} = superadminApiSlice;
