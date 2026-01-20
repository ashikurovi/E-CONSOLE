import { apiSlice } from "../api/apiSlice";

export const orderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      // expects { body, params }
      query: ({ body, params }) => ({
        url: "/orders",
        method: "POST",
        body,
        params,
      }),
      invalidatesTags: [{ type: "orders", id: "LIST" }],
    }),
    getOrders: builder.query({
      query: (params) => ({ url: "/orders", method: "GET", params }),
      transformResponse: (res) => res?.data ?? [],
      providesTags: [{ type: "orders", id: "LIST" }],
    }),
    getOrder: builder.query({
      query: (id) => ({ url: `/orders/${id}`, method: "GET" }),
      transformResponse: (res) => res?.data,
      providesTags: (result, error, id) => [{ type: "orders", id }],
    }),
    completeOrder: builder.mutation({
      // expects { id, body, params }
      query: ({ id, body, params }) => ({
        url: `/orders/${id}/complete`,
        method: "PATCH",
        body,
        params,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "orders", id },
        { type: "orders", id: "LIST" },
      ],
    }),
    processOrder: builder.mutation({
      query: ({ id, params }) => ({ url: `/orders/${id}/process`, method: "PATCH", params }),
      invalidatesTags: (result, error, id) => [
        { type: "orders", id },
        { type: "orders", id: "LIST" },
      ],
    }),
    deliverOrder: builder.mutation({
      query: ({ id, params }) => ({ url: `/orders/${id}/deliver`, method: "PATCH", params }),
      invalidatesTags: (result, error, id) => [
        { type: "orders", id },
        { type: "orders", id: "LIST" },
      ],
    }),
    shipOrder: builder.mutation({
      // expects { id, body, params }
      query: ({ id, body, params }) => ({
        url: `/orders/${id}/ship`,
        method: "PATCH",
        body,
        params,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "orders", id },
        { type: "orders", id: "LIST" },
      ],
    }),
    cancelOrder: builder.mutation({
      query: ({ id, params }) => ({ url: `/orders/${id}/cancel`, method: "PATCH", params }),
      invalidatesTags: (result, error, id) => [
        { type: "orders", id },
        { type: "orders", id: "LIST" },
      ],
    }),
    refundOrder: builder.mutation({
      query: ({ id, params }) => ({ url: `/orders/${id}/refund`, method: "PATCH", params }),
      invalidatesTags: (result, error, id) => [
        { type: "orders", id },
        { type: "orders", id: "LIST" },
      ],
    }),
    deleteOrder: builder.mutation({
      query: ({ id, params }) => ({ url: `/orders/${id}`, method: "DELETE", params }),
      invalidatesTags: (result, error, id) => [
        { type: "orders", id },
        { type: "orders", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderQuery,
  useCreateOrderMutation,
  useCompleteOrderMutation,
  useProcessOrderMutation,
  useDeliverOrderMutation,
  useShipOrderMutation,
  useCancelOrderMutation,
  useRefundOrderMutation,
  useDeleteOrderMutation,
} = orderApiSlice;