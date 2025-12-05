import { createBrowserRouter } from "react-router-dom";

// LAYOUTS
import Layout from "./layout/layout";
import SuperAdminLayout from "./layout/superadmin/layout";

import ErrorPage from "./pages/common/errorPage";

import LoginPage from "./pages/auth/login";
import SuperAdminLoginPage from "./pages/superadmin/login";

import PrivateRoute from "./hooks/usePrivateRoute";
import SuperAdminPrivateRoute from "./hooks/useSuperAdminPrivateRoute";
import PermissionRoute from "./hooks/PermissionRoute";
import { FeaturePermission } from "./constants/feature-permission";

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
import SuperAdminEarningsPage from "./pages/superadmin/earnings";
import SuperAdminCustomersPage from "./pages/superadmin/customers";
import SuperAdminCustomerDetailPage from "./pages/superadmin/customers-components/customer-detail";
import SuperAdminSupportPage from "./pages/superadmin/support";
import SuperAdminSupportDetailPage from "./pages/superadmin/support-detail";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: (
      <PrivateRoute>
        <Layout />
      </PrivateRoute>
    ),
    children: [
      {
        path: "/",
        element: <DashboardPage />,
      },
      {
        path: "/categories",
        element: (
          <PermissionRoute permission={FeaturePermission.CATEGORY}>
            <CategoriesPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/products",
        element: (
          <PermissionRoute permission={FeaturePermission.PRODUCTS}>
            <ProductsPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/inventory",
        element: (
          <PermissionRoute permission={FeaturePermission.INVENTORY}>
            <InventoryPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/customers",
        element: (
          <PermissionRoute permission={FeaturePermission.CUSTOMERS}>
            <CustomersPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/orders",
        element: (
          <PermissionRoute permission={FeaturePermission.ORDERS}>
            <OrdersPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/order-items",
        element: (
          <PermissionRoute permission={FeaturePermission.ORDERS}>
            <OrdersItemsPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/fraud",
        element: (
          <PermissionRoute permission={FeaturePermission.REPORTS}>
            <FraudPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/banners",
        element: (
          <PermissionRoute permission={FeaturePermission.SETTINGS}>
            <BannerPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/promocodes",
        element: (
          <PermissionRoute permission={FeaturePermission.SETTINGS}>
            <PromocodePage />
          </PermissionRoute>
        ),
      },
      {
        path: "/help",
        element: (
          <PermissionRoute permission={FeaturePermission.SETTINGS}>
            <HelpPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/settings",
        element: (
          <PermissionRoute permission={FeaturePermission.SETTINGS}>
            <SettingsPage />
          </PermissionRoute>
        ), // add settings route
      },
      {
        path: "/manage-users",
        element: (
          <PermissionRoute permission={FeaturePermission.STAFF}>
            <ManageUsersPage />
          </PermissionRoute>
        ), // add manage users route
      },
    ],
  },
  {
    path: "/superadmin",
    element: (
      <SuperAdminPrivateRoute>
        <SuperAdminLayout />
      </SuperAdminPrivateRoute>
    ),
    children: [
      {
        path: "/superadmin",
        element: <SuperAdminPrivateRoute><SuperAdminOverviewPage /></SuperAdminPrivateRoute>,
      },
      {
        path: "/superadmin/earnings",
        element: <SuperAdminPrivateRoute><SuperAdminEarningsPage /></SuperAdminPrivateRoute>,
      },
      {
        path: "/superadmin/customers",
        element: <SuperAdminPrivateRoute><SuperAdminCustomersPage /></SuperAdminPrivateRoute>,
      },
      {
        path: "/superadmin/customers/:id",
        element: <SuperAdminPrivateRoute><SuperAdminCustomerDetailPage /></SuperAdminPrivateRoute>,
      },
      {
        path: "/superadmin/support",
        element: <SuperAdminPrivateRoute><SuperAdminSupportPage /></SuperAdminPrivateRoute>,
      },
      {
        path: "/superadmin/support/:id",
        element: <SuperAdminPrivateRoute><SuperAdminSupportDetailPage /></SuperAdminPrivateRoute>,
      },
    ],
  },

  { path: "/superadmin/login", element: <SuperAdminLoginPage /> },
  { path: "/sign-in", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/forgot-password", element: <ForgotPasswordRequestPage /> },
  { path: "/reset-password", element: <ResetPasswordPage /> },
  { path: "*", element: <ErrorPage /> },
]);
