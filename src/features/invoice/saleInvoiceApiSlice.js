import { apiSlice } from "../api/apiSlice";

export const saleInvoiceApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // List all sale invoices
    getSaleInvoices: builder.query({
      query: (params) => ({ url: "/sale-invoices", method: "GET", params }),
      transformResponse: (res) => res?.data || res,
      providesTags: [{ type: "saleInvoice", id: "LIST" }],
    }),

    // Get single sale invoice
    getSaleInvoice: builder.query({
      query: ({ id, ...params }) => ({ url: `/sale-invoices/${id}`, method: "GET", params }),
      transformResponse: (res) => res?.data || res,
      providesTags: (result, error, { id }) => [{ type: "saleInvoice", id }],
    }),

    // Create sale invoice
    createSaleInvoice: builder.mutation({
      query: ({ companyId, ...body }) => ({
        url: "/sale-invoices",
        method: "POST",
        params: { companyId },
        body,
      }),
      invalidatesTags: [{ type: "saleInvoice", id: "LIST" }],
    }),

    // Delete sale invoice
    deleteSaleInvoice: builder.mutation({
      query: (id) => ({ url: `/sale-invoices/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "saleInvoice", id: "LIST" }],
    }),
  }),
});

export const {
  useGetSaleInvoicesQuery,
  useGetSaleInvoiceQuery,
  useCreateSaleInvoiceMutation,
  useDeleteSaleInvoiceMutation,
} = saleInvoiceApiSlice;
