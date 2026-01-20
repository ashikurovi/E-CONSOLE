import { apiSlice } from "../api/apiSlice";

export const helpApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createHelp: builder.mutation({
      query: ({ body, params }) => ({
        url: "/help",
        method: "POST",
        body,
        params,
      }),
      transformResponse: (res) => res,
      invalidatesTags: [{ type: "help", id: "LIST" }],
    }),
    getHelp: builder.query({
      query: (params) => ({ url: "/help", method: "GET", params }),
      transformResponse: (res) => (Array.isArray(res) ? res : []),
      providesTags: [{ type: "help", id: "LIST" }],
    }),
    updateHelp: builder.mutation({
      query: ({ id, body, params }) => ({
        url: `/help/${id}`,
        method: "PATCH",
        body,
        params,
        headers: { "Content-Type": "application/json;charset=UTF-8" },
      }),
      transformResponse: (res) => res,
      invalidatesTags: (result, error, { id }) => [
        { type: "help", id },
        { type: "help", id: "LIST" },
      ],
    }),
    deleteHelp: builder.mutation({
      query: (id) => ({ url: `/help/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "help", id: "LIST" }],
    }),
  }),
});

export const {
  useGetHelpQuery,
  useCreateHelpMutation,
  useUpdateHelpMutation,
  useDeleteHelpMutation,
} = helpApiSlice;