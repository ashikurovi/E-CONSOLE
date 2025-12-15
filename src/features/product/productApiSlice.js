import { apiSlice } from "../api/apiSlice";

export const productApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Create product
    createProduct: builder.mutation({
      query: ({ body, params }) => ({
        url: "/products",
        method: "POST",
        body,
        params,
      }),
      invalidatesTags: [{ type: "products", id: "LIST" }],
    }),

    // Get all products
    getProducts: builder.query({
      query: () => ({ url: "/products", method: "GET" }),
      transformResponse: (res) => res?.data ?? [],
      providesTags: [{ type: "products", id: "LIST" }],
    }),

    // Get single product by id
    getProduct: builder.query({
      query: (id) => ({ url: `/products/${id}`, method: "GET" }),
      transformResponse: (res) => res?.data,
      providesTags: (result, error, id) => [{ type: "products", id }],
    }),

    // Update product by id
    updateProduct: builder.mutation({
      // expects { id, body, params }
      query: ({ id, body, params }) => ({
        url: `/products/${id}`,
        method: "PATCH",
        body,
        params,
        headers: { "Content-Type": "application/json;charset=UTF-8" },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "products", id },
        { type: "products", id: "LIST" },
      ],
    }),

    // Delete product by id
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "products", id: "LIST" }],
    }),

    // Toggle product active status (optional, if supported by backend)
    toggleProductActive: builder.mutation({
      query: ({ id, active }) => ({
        url: `/products/${id}/toggle-active${active !== undefined ? `?active=${active}` : ""}`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "products", id },
        { type: "products", id: "LIST" },
      ],
    }),

    // Set flash sell for products
    setFlashSell: builder.mutation({
      query: (body) => ({
        url: "/products/flash-sell",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "products", id: "LIST" }],
    }),

    // Remove flash sell from products
    removeFlashSell: builder.mutation({
      query: (body) => ({
        url: "/products/flash-sell",
        method: "DELETE",
        body,
      }),
      invalidatesTags: [{ type: "products", id: "LIST" }],
    }),

    // Get active flash sell products
    getActiveFlashSellProducts: builder.query({
      query: () => ({ url: "/products/flash-sell/active", method: "GET" }),
      transformResponse: (res) => res?.data ?? [],
      providesTags: [{ type: "products", id: "FLASH_SELL" }],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useToggleProductActiveMutation,
  useSetFlashSellMutation,
  useRemoveFlashSellMutation,
  useGetActiveFlashSellProductsQuery,
} = productApiSlice;