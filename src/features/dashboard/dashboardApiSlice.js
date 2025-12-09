import { apiSlice } from "../api/apiSlice";

export const dashboardApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboard: builder.query({
      query: () => ({ url: "/dashboard", method: "GET" }),
      transformResponse: (res) => res?.data ?? {},
      providesTags: [{ type: "dashboard", id: "DATA" }],
    }),
  }),
});

export const { useGetDashboardQuery } = dashboardApiSlice;





