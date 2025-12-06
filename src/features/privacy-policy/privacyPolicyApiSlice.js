import { apiSlice } from "../api/apiSlice";

export const privacyPolicyApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // Create privacy policy
        createPrivacyPolicy: builder.mutation({
            query: (body) => ({
                url: "/privecy-policy",
                method: "POST",
                body,
            }),
            invalidatesTags: [{ type: "privacyPolicy", id: "LIST" }],
        }),

        // Get all privacy policies
        getPrivacyPolicies: builder.query({
            query: () => ({ url: "/privecy-policy", method: "GET" }),
            transformResponse: (res) => res?.data ?? [],
            providesTags: [{ type: "privacyPolicy", id: "LIST" }],
        }),

        // Get single privacy policy by id
        getPrivacyPolicy: builder.query({
            query: (id) => ({ url: `/privecy-policy/${id}`, method: "GET" }),
            transformResponse: (res) => res?.data,
            providesTags: (result, error, id) => [{ type: "privacyPolicy", id }],
        }),

        // Update privacy policy by id
        updatePrivacyPolicy: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/privecy-policy/${id}`,
                method: "PATCH",
                body,
                headers: { "Content-Type": "application/json;charset=UTF-8" },
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "privacyPolicy", id },
                { type: "privacyPolicy", id: "LIST" },
            ],
        }),

        // Delete privacy policy by id
        deletePrivacyPolicy: builder.mutation({
            query: (id) => ({
                url: `/privecy-policy/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: [{ type: "privacyPolicy", id: "LIST" }],
        }),
    }),
});

export const {
    useGetPrivacyPoliciesQuery,
    useGetPrivacyPolicyQuery,
    useCreatePrivacyPolicyMutation,
    useUpdatePrivacyPolicyMutation,
    useDeletePrivacyPolicyMutation,
} = privacyPolicyApiSlice;



