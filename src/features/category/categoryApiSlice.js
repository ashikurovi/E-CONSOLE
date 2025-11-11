import { apiSlice } from "../api/apiSlice";

export const categoryApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
      
    // createCategory 
    createCategory: builder.mutation({
   query: (body) => ({
    url: "/categories",
    method: "POST",
    body,
   }),
  invalidatesTags: [{ type: "categories", id: "LIST" }],
    }),
        
    getCategories: builder.query({
      query: () => ({ url: "/categories", method: "GET" }),
      transformResponse: (res) => res?.data ?? [], // ✅ safe response
      providesTags: [{ type: "categories", id: "LIST" }],
    }),

    getCategory: builder.query({
      query: (id) => ({ url: `/categories/${id}`, method: "GET" }),
      transformResponse: (res) => res?.data,
      providesTags: (result, error, id) => [{ type: "categories", id }],
    }),

    updateCategory: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/categories/${id}`,
        method: "PATCH",
        body,
        headers: { "Content-Type": "application/json;charset=UTF-8" },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "categories", id },
        { type: "categories", id: "LIST" },
      ],
    }),

    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "categories", id: "LIST" }],
    }),

    toggleCategoryActive: builder.mutation({
      query: ({ id, active }) => ({
        url: `/categories/${id}/toggle-active${
          active !== undefined ? `?active=${active}` : ""
        }`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "categories", id },
        { type: "categories", id: "LIST" },
      ],
    }),
    }),
    

});

export const {
  useGetCategoriesQuery,
  useGetCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useToggleCategoryActiveMutation,
} = categoryApiSlice;
