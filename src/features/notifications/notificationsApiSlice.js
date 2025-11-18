import { apiSlice } from "../api/apiSlice";

export const notificationsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    sendCustomerEmailNotification: builder.mutation({
      query: ({ subject, body, html, customerIds }) => ({
        url: "/notifications/email/customers",
        method: "POST",
        body: {
          subject,
          body,
          ...(html ? { html } : {}),
          ...(customerIds?.length ? { customerIds } : {}),
        },
        headers: { "Content-Type": "application/json;charset=UTF-8" },
      }),
    }),
    sendCustomerSmsNotification: builder.mutation({
      query: ({ message, customerIds }) => ({
        url: "/notifications/sms/customers",
        method: "POST",
        body: {
          message,
          ...(customerIds?.length ? { customerIds } : {}),
        },
        headers: { "Content-Type": "application/json;charset=UTF-8" },
      }),
    }),
  }),
});

export const {
  useSendCustomerEmailNotificationMutation,
  useSendCustomerSmsNotificationMutation,
} = notificationsApiSlice;

