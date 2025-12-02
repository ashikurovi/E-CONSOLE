import { createBrowserRouter } from "react-router-dom";

// LAYOUTS
import Layout from "./layout/layout";
import SuperAdminLayout from "./layout/superadmin/layout";

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
import OrdersItemsPage from "./pages/ordersitem";
import FraudPage from "./pages/fraud";
import BannerPage from "./pages/banner";
import PromocodePage from "./pages/promocode";
import HelpPage from "./pages/help";
import SettingsPage from "./pages/settings"; // settings
import ManageUsersPage from "./pages/manageuser"; // manage users
import SuperAdminOverviewPage from "./pages/superadmin"; // super admin overview

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
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
      {
        path: "/order-items",
        element: <OrdersItemsPage />,
      },
      {
        path: "/fraud",
        element: <FraudPage />,
      },
      {
        path: "/banners",
        element: <BannerPage />,
      },
      {
        path: "/promocodes",
        element: <PromocodePage />,
      },
      {
        path: "/help",
        element: <HelpPage />,
      },
      {
        path: "/settings",
        element: <SettingsPage />, // add settings route
      },
      {
        path: "/manage-users",
        element: <ManageUsersPage />, // add manage users route
      },
    ],
  },
  {
    path: "/superadmin",
    element: <SuperAdminLayout />,
    children: [
      {
        path: "/superadmin",
        element: <SuperAdminOverviewPage />,
      },
    ],
  },

  { path: "/sign-in", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/forgot-password", element: <ForgotPasswordRequestPage /> },
  { path: "/reset-password", element: <ResetPasswordPage /> },
  { path: "*", element: <ErrorPage /> },
]);
