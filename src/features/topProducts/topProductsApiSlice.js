import { apiSlice } from "../api/apiSlice";

export const topProductsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTopProducts: builder.query({
      query: () => ({ url: "/top-products", method: "GET" }),
      transformResponse: (res) => res?.data,
      providesTags: [{ type: "topProducts", id: "SECTION" }],
    }),

    updateTopProductsSection: builder.mutation({
      query: (body) => ({
        url: "/top-products/section",
        method: "PATCH",
        body,
        headers: { "Content-Type": "application/json;charset=UTF-8" },
      }),
      invalidatesTags: [{ type: "topProducts", id: "SECTION" }],
    }),

    createTopProductsItem: builder.mutation({
      query: (body) => ({
        url: "/top-products/items",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "topProducts", id: "SECTION" }],
    }),

    updateTopProductsItem: builder.mutation({
      query: ({ id, body }) => ({
        url: `/top-products/items/${id}`,
        method: "PATCH",
        body,
        headers: { "Content-Type": "application/json;charset=UTF-8" },
      }),
      invalidatesTags: [{ type: "topProducts", id: "SECTION" }],
    }),

    deleteTopProductsItem: builder.mutation({
      query: (id) => ({
        url: `/top-products/items/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "topProducts", id: "SECTION" }],
    }),
  }),
});

export const {
  useGetTopProductsQuery,
  useUpdateTopProductsSectionMutation,
  useCreateTopProductsItemMutation,
  useUpdateTopProductsItemMutation,
  useDeleteTopProductsItemMutation,
} = topProductsApiSlice;

