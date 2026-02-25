import { apiSlice } from "../api/apiSlice";

export const resellerApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getResellerSummary: builder.query({
      query: () => ({
        url: "/reseller/summary",
        method: "GET",
      }),
      transformResponse: (res) => res.data || res,
      providesTags: ["reseller-summary"],
    }),

    getResellerPayouts: builder.query({
      query: () => ({
        url: "/reseller/payouts",
        method: "GET",
      }),
      transformResponse: (res) => res.data || res,
      providesTags: ["reseller-payouts"],
    }),

    getPayoutInvoice: builder.query({
      query: (payoutId) => ({
        url: `/reseller/payouts/${payoutId}/invoice`,
        method: "GET",
      }),
      transformResponse: (res) => res.data || res,
    }),

    requestResellerPayout: builder.mutation({
      query: (body) => ({
        url: "/reseller/payouts/request",
        method: "POST",
        body,
      }),
      invalidatesTags: ["reseller-summary", "reseller-payouts"],
    }),

    // Admin: create commission payout request for a reseller
    createAdminResellerPayout: builder.mutation({
      query: ({ resellerId, body }) => ({
        url: `/reseller/admin/resellers/${resellerId}/payouts`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["admin-resellers", "admin-payouts"],
    }),

    // Reseller confirms that a commission payout has been paid to admin
    markResellerPayoutPaid: builder.mutation({
      query: (payoutId) => ({
        url: `/reseller/payouts/${payoutId}/mark-paid`,
        method: "POST",
      }),
      invalidatesTags: ["reseller-summary", "reseller-payouts"],
    }),

    // Admin/Owner: list all resellers with stats and payouts
    getAdminResellers: builder.query({
      query: () => ({
        url: "/reseller/admin/resellers",
        method: "GET",
      }),
      transformResponse: (res) => res.data || res,
      providesTags: ["admin-resellers"],
    }),

    getAdminPayouts: builder.query({
      query: () => ({
        url: "/reseller/admin/payouts",
        method: "GET",
      }),
      transformResponse: (res) => res.data || res,
      providesTags: ["admin-payouts"],
    }),

    getAdminPayoutInvoice: builder.query({
      query: (payoutId) => ({
        url: `/reseller/admin/payouts/${payoutId}/invoice`,
        method: "GET",
      }),
      transformResponse: (res) => res.data || res,
    }),

    markPayoutPaid: builder.mutation({
      query: (payoutId) => ({
        url: `/reseller/admin/payouts/${payoutId}/mark-paid`,
        method: "POST",
      }),
      invalidatesTags: ["admin-resellers", "admin-payouts"],
    }),

    approveReseller: builder.mutation({
      query: (resellerId) => ({
        url: `/reseller/admin/resellers/${resellerId}/approve`,
        method: "POST",
      }),
      invalidatesTags: ["admin-resellers"],
    }),

    deleteReseller: builder.mutation({
      query: (resellerId) => ({
        url: `/reseller/admin/resellers/${resellerId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["admin-resellers"],
    }),
  }),
});

export const {
  useGetResellerSummaryQuery,
  useGetResellerPayoutsQuery,
  useGetPayoutInvoiceQuery,
  useLazyGetPayoutInvoiceQuery,
  useRequestResellerPayoutMutation,
  useCreateAdminResellerPayoutMutation,
  useMarkResellerPayoutPaidMutation,
  useGetAdminResellersQuery,
  useGetAdminPayoutsQuery,
  useGetAdminPayoutInvoiceQuery,
  useLazyGetAdminPayoutInvoiceQuery,
  useMarkPayoutPaidMutation,
  useApproveResellerMutation,
  useDeleteResellerMutation,
} = resellerApiSlice;

