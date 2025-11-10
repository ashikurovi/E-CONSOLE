import { createBrowserRouter } from "react-router-dom";

// LAYOUTS
import Layout from "./layout/layout";

import ErrorPage from "./pages/common/errorPage";

import LoginPage from "./pages/auth/login";

import PrivateRoute from "./hooks/usePrivateRoute";

import ForgotPasswordRequestPage from "./pages/auth/forgot-password/password-request";
import ResetPasswordPage from "./pages/auth/forgot-password/reset-password";
import RegisterPage from "./pages/auth/register";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: (
      // <PrivateRoute>
      <Layout />
      // </PrivateRoute>
    ),
    children: [
      {
        path: "/",
        element: <></>,
      },
    ],
  },

  { path: "/sign-in", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/forgot-password", element: <ForgotPasswordRequestPage /> },
  { path: "/reset-password", element: <ResetPasswordPage /> },
  { path: "*", element: <ErrorPage /> },
]);
