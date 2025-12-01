import { apiSlice } from "../api/apiSlice";

export const systemuserApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // List system users
    getSystemusers: builder.query({
      query: () => ({ url: "/systemuser", method: "GET" }),
      transformResponse: (res) => res,
      providesTags: [{ type: "systemuser", id: "LIST" }],
    }),

    // Get single system user
    getSystemuser: builder.query({
      query: (id) => ({ url: `/systemuser/${id}`, method: "GET" }),
      transformResponse: (res) => res,
      providesTags: (result, error, id) => [{ type: "systemuser", id }],
    }),

    // Create system user
    createSystemuser: builder.mutation({
      query: (body) => ({
        url: "/systemuser",
        method: "POST",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        body,
      }),
      invalidatesTags: [{ type: "systemuser", id: "LIST" }],
    }),

    // Update system user
    updateSystemuser: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/systemuser/${id}`,
        method: "PATCH",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "systemuser", id },
        { type: "systemuser", id: "LIST" },
      ],
    }),

    // Delete system user
    deleteSystemuser: builder.mutation({
      query: (id) => ({ url: `/systemuser/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "systemuser", id: "LIST" }],
    }),

    // Optional: login endpoint if needed
    loginSystemuser: builder.mutation({
      query: (body) => ({
        url: "/systemuser/login",
        method: "POST",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        body,
      }),
    }),
  }),
});

export const {
  useGetSystemusersQuery,
  useGetSystemuserQuery,
  useCreateSystemuserMutation,
  useUpdateSystemuserMutation,
  useDeleteSystemuserMutation,
  useLoginSystemuserMutation,
} = systemuserApiSlice;