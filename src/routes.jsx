import { createBrowserRouter } from "react-router-dom";

// LAYOUTS
import Layout from "./layout/layout";

import ErrorPage from "./pages/common/errorPage";

import LoginPage from "./pages/auth/login";

import PrivateRoute from "./hooks/usePrivateRoute";

import ForgotPasswordRequestPage from "./pages/auth/forgot-password/password-request";
import ResetPasswordPage from "./pages/auth/forgot-password/reset-password";
import RegisterPage from "./pages/auth/register";
import DashboardPage from "./pages/dashboard";
import CategoriesPage from "./pages/categories";
import ProductsPage from "./pages/products";
import InventoryPage from "./pages/inventory";
import CustomersPage from "./pages/customers";
import OrdersPage from "./pages/orders";

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
        element: <DashboardPage />,
      },
      {
        path: "/categories",
        element: <CategoriesPage />,
      },
      {
        path: "/products",
        element: <ProductsPage />,
      },
      {
        path: "/inventory",
        element: <InventoryPage />,
      },
      {
        path: "/customers",
        element: <CustomersPage />,
      },
      {
        path: "/orders",
        element: <OrdersPage />,
      },
    ],
  },

  { path: "/sign-in", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/forgot-password", element: <ForgotPasswordRequestPage /> },
  { path: "/reset-password", element: <ResetPasswordPage /> },
  { path: "*", element: <ErrorPage /> },
]);
