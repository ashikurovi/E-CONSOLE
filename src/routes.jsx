import { createBrowserRouter } from "react-router-dom";

// LAYOUTS
import Layout from "./layout/layout";
import SuperAdminLayout from "./layout/superadmin/layout";

import ErrorPage from "./pages/common/errorPage";

import LoginPage from "./pages/auth/login";
import AdminLoginPage from "./pages/auth/admin-login";
import SuperAdminLoginPage from "./pages/superadmin/login";
import UnifiedLoginPage from "./pages/auth/unified-login";

import PrivateRoute from "./hooks/usePrivateRoute";
import SuperAdminPrivateRoute from "./hooks/useSuperAdminPrivateRoute";
import PermissionRoute from "./hooks/PermissionRoute";
import { FeaturePermission } from "./constants/feature-permission";

import ForgotPasswordRequestPage from "./pages/auth/forgot-password/password-request";
import ResetPasswordPage from "./pages/auth/forgot-password/reset-password";
import CheckResetPasswordEmailPage from "./pages/auth/forgot-password/check-email";
import RegisterPage from "./pages/auth/register";
import DashboardPage from "./pages/dashboard";
import AiReportPage from "./pages/ai-report";
import AiLiveFeedPage from "./pages/ai-live-feed";
import AiSalesDirectionPage from "./pages/ai-sales-direction";
import CategoriesPage from "./pages/categories";
import CreateCategoryPage from "./pages/categories/create";
import CategoryEditPage from "./pages/categories/_id/edit";
import ProductsPage from "./pages/products";
import CreateProductPage from "./pages/products/create";
import BulkUploadPage from "./pages/products/bulk-upload";
import ProductViewPage from "./pages/products/_id";
import ProductEditPage from "./pages/products/_id/edit";
import InventoryPage from "./pages/inventory";
import FlashSellPage from "./pages/flash-sell";
import CustomersPage from "./pages/customers";
import CreateCustomerPage from "./pages/customers/create";
import OrdersPage from "./pages/orders";
import CreateOrderPage from "./pages/orders/create";
import OrderTrackPage from "./pages/orders/track";
import OrderViewPage from "./pages/orders/_id";
import OrderEditPage from "./pages/orders/_id/edit";
import FraudPage from "./pages/fraud";
import BannerPage from "./pages/banner";
import CreateBannerPage from "./pages/banner/create";
import BannerEditPage from "./pages/banner/_id/edit";
import PromocodePage from "./pages/promocode";
import CreatePromocodePage from "./pages/promocode/create";
import PromocodeEditPage from "./pages/promocode/_id/edit";
import HelpPage from "./pages/help";
import CreateHelpPage from "./pages/help/create";
import HelpDetailPage from "./pages/help/_id";
import ReviewsPage from "./pages/reviews";
import ReviewDetailPage from "./pages/reviews/_id";
import SettingsPage from "./pages/settings"; // settings
import ManageUsersPage from "./pages/manageuser"; // manage users
import CreateUserPage from "./pages/manageuser/create";
import EditUserPage from "./pages/manageuser/edit";
import PermissionManagerPage from "./pages/manageuser/permissions";
import ActivityLogsPage from "./pages/manageuser/activity-logs";
import SuperAdminOverviewPage from "./pages/superadmin"; // super admin overview
import SuperAdminEarningsPage from "./pages/superadmin/earnings";
import SuperAdminCustomersPage from "./pages/superadmin/customers";
import SuperAdminCustomerDetailPage from "./pages/superadmin/customers-components/customer-detail";
import SuperAdminSupportPage from "./pages/superadmin/support";
import SuperAdminSupportDetailPage from "./pages/superadmin/support-detail";
import PackageManagementPage from "./pages/superadmin/packagemanagement";
import ThemeManagementPage from "./pages/superadmin/thememanagement";
import InvoiceManagementPage from "./pages/superadmin/invoice";
import SuperAdminSuperadminsPage from "./pages/superadmin/superadmins";
import SuperAdminSuperadminDetailPage from "./pages/superadmin/superadmin-components/superadmin-detail";
import SuperAdminProfilePage from "./pages/superadmin/profile";
import PrivacyPolicyPage from "./pages/privacy-policy";
import CreatePrivacyPolicyPage from "./pages/privacy-policy/create";
import EditPrivacyPolicyPage from "./pages/privacy-policy/edit";
import TermsConditionsPage from "./pages/terms-conditions";
import CreateTermsConditionsPage from "./pages/terms-conditions/create";
import EditTermsConditionsPage from "./pages/terms-conditions/edit";
import RefundPolicyPage from "./pages/refund-policy";
import CreateRefundPolicyPage from "./pages/refund-policy/create";
import EditRefundPolicyPage from "./pages/refund-policy/edit";
import SteadfastPage from "./pages/steadfast";
import PathaoPage from "./pages/pathao";
import RedXPage from "./pages/redx";
import UpgradePlanPage from "./pages/upgrade-plan";
import NotificationsPage from "./pages/notifications";

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
        path: "/ai-report",
        element: <AiReportPage />,
      },
      {
        path: "/ai-live-feed",
        element: <AiLiveFeedPage />,
      },
      {
        path: "/ai-sales-direction",
        element: <AiSalesDirectionPage />,
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
        path: "/categories/create",
        element: (
          <PermissionRoute permission={FeaturePermission.CATEGORY}>
            <CreateCategoryPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/categories/:id/edit",
        element: (
          <PermissionRoute permission={FeaturePermission.CATEGORY}>
            <CategoryEditPage />
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
        path: "/products/create",
        element: (
          <PermissionRoute permission={FeaturePermission.PRODUCTS}>
            <CreateProductPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/products/bulk-upload",
        element: (
          <PermissionRoute permission={FeaturePermission.PRODUCTS}>
            <BulkUploadPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/products/:id",
        element: (
          <PermissionRoute permission={FeaturePermission.PRODUCTS}>
            <ProductViewPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/products/:id/edit",
        element: (
          <PermissionRoute permission={FeaturePermission.PRODUCTS}>
            <ProductEditPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/inventory",
        element: (
          <PermissionRoute permission={FeaturePermission.PRODUCTS}>
            <InventoryPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/flash-sell",
        element: (
          <PermissionRoute permission={FeaturePermission.PRODUCTS}>
            <FlashSellPage />
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
        path: "/customers/create",
        element: (
          <PermissionRoute permission={FeaturePermission.CUSTOMERS}>
            <CreateCustomerPage />
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
        path: "/orders/create",
        element: (
          <PermissionRoute permission={FeaturePermission.ORDERS}>
            <CreateOrderPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/orders/track",
        element: (
          <PermissionRoute permission={FeaturePermission.ORDERS}>
            <OrderTrackPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/orders/:id",
        element: (
          <PermissionRoute permission={FeaturePermission.ORDERS}>
            <OrderViewPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/orders/:id/edit",
        element: (
          <PermissionRoute permission={FeaturePermission.ORDERS}>
            <OrderEditPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/fraud",
        element: (
          <PermissionRoute permission={FeaturePermission.FRAUD_CHECKER}>
            <FraudPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/banners",
        element: (
          <PermissionRoute permission={FeaturePermission.BANNERS}>
            <BannerPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/banners/create",
        element: (
          <PermissionRoute permission={FeaturePermission.BANNERS}>
            <CreateBannerPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/banners/:id/edit",
        element: (
          <PermissionRoute permission={FeaturePermission.BANNERS}>
            <BannerEditPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/promocodes",
        element: (
          <PermissionRoute permission={FeaturePermission.PROMOCODES}>
            <PromocodePage />
          </PermissionRoute>
        ),
      },
      {
        path: "/promocodes/create",
        element: (
          <PermissionRoute permission={FeaturePermission.PROMOCODES}>
            <CreatePromocodePage />
          </PermissionRoute>
        ),
      },
      {
        path: "/promocodes/:id/edit",
        element: (
          <PermissionRoute permission={FeaturePermission.PROMOCODES}>
            <PromocodeEditPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/help",
        element: (
          <PermissionRoute permission={FeaturePermission.HELP}>
            <HelpPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/help/create",
        element: (
          <PermissionRoute permission={FeaturePermission.HELP}>
            <CreateHelpPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/help/:id",
        element: (
          <PermissionRoute permission={FeaturePermission.HELP}>
            <HelpDetailPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/reviews",
        element: (
          <PermissionRoute permission={FeaturePermission.CUSTOMERS}>
            <ReviewsPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/reviews/:id",
        element: (
          <PermissionRoute permission={FeaturePermission.CUSTOMERS}>
            <ReviewDetailPage />
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
      {
        path: "/manage-users/create",
        element: (
          <PermissionRoute permission={FeaturePermission.STAFF}>
            <CreateUserPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/manage-users/edit/:id",
        element: (
          <PermissionRoute permission={FeaturePermission.STAFF}>
            <EditUserPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/manage-users/permissions/:id",
        element: (
          <PermissionRoute permission={FeaturePermission.STAFF}>
            <PermissionManagerPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/manage-users/activity-logs",
        element: (
          <PermissionRoute permission={FeaturePermission.LOG_ACTIVITY}>
            <ActivityLogsPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/privacy-policy",
        element: (
          <PermissionRoute permission={FeaturePermission.PRIVACY_POLICY}>
            <PrivacyPolicyPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/privacy-policy/create",
        element: (
          <PermissionRoute permission={FeaturePermission.PRIVACY_POLICY}>
            <CreatePrivacyPolicyPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/privacy-policy/edit",
        element: (
          <PermissionRoute permission={FeaturePermission.PRIVACY_POLICY}>
            <EditPrivacyPolicyPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/terms-conditions",
        element: (
          <PermissionRoute permission={FeaturePermission.TERMS_CONDITIONS}>
            <TermsConditionsPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/terms-conditions/create",
        element: (
          <PermissionRoute permission={FeaturePermission.TERMS_CONDITIONS}>
            <CreateTermsConditionsPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/terms-conditions/edit",
        element: (
          <PermissionRoute permission={FeaturePermission.TERMS_CONDITIONS}>
            <EditTermsConditionsPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/refund-policy",
        element: (
          <PermissionRoute permission={FeaturePermission.REFUND_POLICY}>
            <RefundPolicyPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/refund-policy/create",
        element: (
          <PermissionRoute permission={FeaturePermission.REFUND_POLICY}>
            <CreateRefundPolicyPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/refund-policy/edit",
        element: (
          <PermissionRoute permission={FeaturePermission.REFUND_POLICY}>
            <EditRefundPolicyPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/steadfast",
        element: (
          <PermissionRoute permission={FeaturePermission.STEADFAST}>
            <SteadfastPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/pathao",
        element: (
          <PermissionRoute permission={FeaturePermission.PATHAO}>
            <PathaoPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/redx",
        element: (
          <PermissionRoute permission={FeaturePermission.REDX}>
            <RedXPage />
          </PermissionRoute>
        ),
      },
      {
        path: "/notifications",
        element: <NotificationsPage />,
      },
      {
        path: "/upgrade-plan",
        element: <UpgradePlanPage />, // always accessible
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
      {
        path: "/superadmin/packages",
        element: <SuperAdminPrivateRoute><PackageManagementPage /></SuperAdminPrivateRoute>,
      },
      {
        path: "/superadmin/themes",
        element: <SuperAdminPrivateRoute><ThemeManagementPage /></SuperAdminPrivateRoute>,
      },
      {
        path: "/superadmin/invoices",
        element: <SuperAdminPrivateRoute><InvoiceManagementPage /></SuperAdminPrivateRoute>,
      },
      {
        path: "/superadmin/superadmins",
        element: <SuperAdminPrivateRoute><SuperAdminSuperadminsPage /></SuperAdminPrivateRoute>,
      },
      {
        path: "/superadmin/superadmins/:id",
        element: <SuperAdminPrivateRoute><SuperAdminSuperadminDetailPage /></SuperAdminPrivateRoute>,
      },
      {
        path: "/superadmin/profile",
        element: <SuperAdminPrivateRoute><SuperAdminProfilePage /></SuperAdminPrivateRoute>,
      },
    ],
  },

  // { path: "/superadmin/login", element: <SuperAdminLoginPage /> },
  { path: "/login", element: <AdminLoginPage /> },
  // { path: "/sign-in", element: <LoginPage /> },
  // { path: "/login", element: <UnifiedLoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/forgot-password", element: <ForgotPasswordRequestPage /> },
  { path: "/forgot-password/check-email", element: <CheckResetPasswordEmailPage /> },
  { path: "/reset-password", element: <ResetPasswordPage /> },
  { path: "*", element: <ErrorPage /> },
]);
