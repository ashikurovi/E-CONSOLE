import { apiSlice } from "../api/apiSlice";

export const inventoryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Create inventory
    createInventory: builder.mutation({
      query: (body) => ({
        url: "/inventory",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "inventory", id: "LIST" }],
    }),

    // Get all inventory
    getInventory: builder.query({
      query: () => ({ url: "/inventory", method: "GET" }),
      transformResponse: (res) => res?.data ?? [],
      providesTags: [{ type: "inventory", id: "LIST" }],
    }),

    // Get single inventory
    getInventoryItem: builder.query({
      query: (id) => ({ url: `/inventory/${id}`, method: "GET" }),
      transformResponse: (res) => res?.data,
      providesTags: (result, error, id) => [{ type: "inventory", id }],
    }),

    // Update inventory
    updateInventory: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/inventory/${id}`,
        method: "PATCH",
        body,
        headers: { "Content-Type": "application/json;charset=UTF-8" },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "inventory", id },
        { type: "inventory", id: "LIST" },
      ],
    }),

    // Delete inventory
    deleteInventory: builder.mutation({
      query: (id) => ({
        url: `/inventory/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "inventory", id: "LIST" }],
    }),
  }),
});

export const {
  useGetInventoryQuery,
  useGetInventoryItemQuery,
  useCreateInventoryMutation,
  useUpdateInventoryMutation,
  useDeleteInventoryMutation,
} = inventoryApiSlice;