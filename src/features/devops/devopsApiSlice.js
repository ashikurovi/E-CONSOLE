import { apiSlice } from "../api/apiSlice";

export const devopsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createTenant: builder.mutation({
      query: (data) => ({
        url: "/devops/tenant",
        method: "POST",
        body: data,
      }),
    }),
    addCustomDomain: builder.mutation({
      query: ({ id, domain }) => ({
        url: `/devops/tenant/${id}/domain`,
        method: "POST",
        body: { domain },
      }),
    }),
  }),
});

export const { useCreateTenantMutation, useAddCustomDomainMutation } = devopsApiSlice;
