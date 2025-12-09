import { apiSlice } from "../api/apiSlice";

export const refundPolicyApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Create refund policy
        createRefundPolicy: builder.mutation({
            query: (body) => ({
                url: "/refund-policy",
                method: "POST",
                body,
            }),
            invalidatesTags: [{ type: "refundPolicy", id: "LIST" }],
        }),

        // Get all refund policies
        getRefundPolicies: builder.query({
            query: () => ({ url: "/refund-policy", method: "GET" }),
            transformResponse: (res) => res?.data ?? [],
            providesTags: [{ type: "refundPolicy", id: "LIST" }],
        }),

        // Get single refund policy by id
        getRefundPolicy: builder.query({
            query: (id) => ({ url: `/refund-policy/${id}`, method: "GET" }),
            transformResponse: (res) => res?.data,
            providesTags: (result, error, id) => [{ type: "refundPolicy", id }],
        }),

        // Update refund policy by id
        updateRefundPolicy: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/refund-policy/${id}`,
                method: "PATCH",
                body,
                headers: { "Content-Type": "application/json;charset=UTF-8" },
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "refundPolicy", id },
                { type: "refundPolicy", id: "LIST" },
            ],
        }),

        // Delete refund policy by id
        deleteRefundPolicy: builder.mutation({
            query: (id) => ({
                url: `/refund-policy/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: [{ type: "refundPolicy", id: "LIST" }],
        }),
    }),
});

export const {
    useGetRefundPoliciesQuery,
    useGetRefundPolicyQuery,
    useCreateRefundPolicyMutation,
    useUpdateRefundPolicyMutation,
    useDeleteRefundPolicyMutation,
} = refundPolicyApiSlice;




