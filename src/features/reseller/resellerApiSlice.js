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
      query: () => ({
        url: "/reseller/payouts/request",
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

    markPayoutPaid: builder.mutation({
      query: (payoutId) => ({
        url: `/reseller/admin/payouts/${payoutId}/mark-paid`,
        method: "POST",
      }),
      invalidatesTags: ["admin-resellers", "admin-payouts"],
    }),
  }),
});

export const {
  useGetResellerSummaryQuery,
  useGetResellerPayoutsQuery,
  useGetPayoutInvoiceQuery,
  useLazyGetPayoutInvoiceQuery,
  useRequestResellerPayoutMutation,
  useGetAdminResellersQuery,
  useGetAdminPayoutsQuery,
  useMarkPayoutPaidMutation,
} = resellerApiSlice;

