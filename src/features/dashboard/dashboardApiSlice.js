import { apiSlice } from "../api/apiSlice";

export const dashboardApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboard: builder.query({
      query: (params) => ({ url: "/dashboard", method: "GET", params }),
      transformResponse: (res) => res?.data ?? {},
      providesTags: [{ type: "dashboard", id: "DATA" }],
    }),
  }),
});

export const { useGetDashboardQuery } = dashboardApiSlice;





