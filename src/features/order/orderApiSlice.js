import { apiSlice } from "../api/apiSlice";

export const orderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (body) => ({ url: "/orders", method: "POST", body }),
      invalidatesTags: [{ type: "orders", id: "LIST" }],
    }),
    getOrders: builder.query({
      query: () => ({ url: "/orders", method: "GET" }),
      transformResponse: (res) => res?.data ?? [],
      providesTags: [{ type: "orders", id: "LIST" }],
    }),
    getOrder: builder.query({
      query: (id) => ({ url: `/orders/${id}`, method: "GET" }),
      transformResponse: (res) => res?.data,
      providesTags: (result, error, id) => [{ type: "orders", id }],
    }),
    completeOrder: builder.mutation({
      query: ({ id, paymentRef }) => ({
        url: `/orders/${id}/complete`,
        method: "PATCH",
        body: paymentRef ? { paymentRef } : undefined,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "orders", id },
        { type: "orders", id: "LIST" },
      ],
    }),
    deliverOrder: builder.mutation({
      query: (id) => ({ url: `/orders/${id}/deliver`, method: "PATCH" }),
      invalidatesTags: (result, error, id) => [
        { type: "orders", id },
        { type: "orders", id: "LIST" },
      ],
    }),
    shipOrder: builder.mutation({
      query: ({ id, trackingId, provider }) => ({
        url: `/orders/${id}/ship`,
        method: "PATCH",
        body: { trackingId, provider },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "orders", id },
        { type: "orders", id: "LIST" },
      ],
    }),
    cancelOrder: builder.mutation({
      query: (id) => ({ url: `/orders/${id}/cancel`, method: "PATCH" }),
      invalidatesTags: (result, error, id) => [
        { type: "orders", id },
        { type: "orders", id: "LIST" },
      ],
    }),
    refundOrder: builder.mutation({
      query: (id) => ({ url: `/orders/${id}/refund`, method: "PATCH" }),
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
  useDeliverOrderMutation,
  useShipOrderMutation,
  useCancelOrderMutation,
  useRefundOrderMutation,
} = orderApiSlice;