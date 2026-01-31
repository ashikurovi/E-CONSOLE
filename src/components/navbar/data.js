import { FileText, Settings, ShieldAlert, User2, Truck, Crown, Zap } from "lucide-react";
import { FeaturePermission } from "@/constants/feature-permission";

// Navigation organized by sections and workflow
// title: used for iconMap lookup; tKey: translation key for i18n
export const navSections = [
  {
    id: "overview",
    title: "OVERVIEW",
    tKey: "nav.overview",
    items: [
      { id: 1, title: "Dashboard", tKey: "nav.dashboard", link: "/" },
    ],
  },
  {
    id: "orders",
    title: "ORDERS & FULFILLMENT",
    tKey: "nav.ordersFulfillment",
    items: [
      { id: 6, title: "Order", tKey: "nav.order", link: "/orders", permission: FeaturePermission.ORDERS },
      { id: 5, title: "Customers", tKey: "nav.customers", link: "/customers", permission: FeaturePermission.CUSTOMERS },
      { id: 7.5, title: "Steadfast Courier", tKey: "nav.steadfastCourier", link: "/steadfast", permission: FeaturePermission.STEADFAST, icon: Truck },
      { id: 7.6, title: "Pathao Courier", tKey: "nav.pathaoCourier", link: "/pathao", permission: FeaturePermission.PATHAO, icon: Truck },
    ],
  },
  {
    id: "catalog",
    title: "CATALOG",
    tKey: "nav.catalogManagement",
    items: [
      { id: 3, title: "Product", tKey: "nav.product", link: "/products", permission: FeaturePermission.PRODUCTS },
      { id: 2, title: "Categories", tKey: "nav.categories", link: "/categories", permission: FeaturePermission.CATEGORY },
      { id: 4, title: "Inventory", tKey: "nav.inventory", link: "/inventory", permission: FeaturePermission.INVENTORY }, // Assuming inventory link/perm exists or reusing categories perm as fallback? Added Inventory based on SideNav iconMap
      { id: 3.5, title: "Flash Sell", tKey: "nav.flashSell", link: "/flash-sell", permission: FeaturePermission.PRODUCTS, icon: Zap },
    ],
  },
  {
    id: "marketing",
    title: "MARKETING",
    tKey: "nav.marketingPromotions",
    items: [
      { id: 9, title: "Banners", tKey: "nav.banners", link: "/banners", permission: FeaturePermission.SETTINGS },
      { id: 10, title: "Promocodes", tKey: "nav.promocodes", link: "/promocodes", permission: FeaturePermission.SETTINGS },
    ],
  },
  {
    id: "administration",
    title: "SYSTEM",
    tKey: "nav.administration",
    items: [
      { id: 16, title: "Manage Users", tKey: "nav.manageUsers", link: "/manage-users", permission: FeaturePermission.STAFF },
      { id: 11, title: "Settings", tKey: "nav.settings", link: "/settings" },
      { id: 8, title: "Fraud Checker", tKey: "nav.fraudChecker", link: "/fraud", permission: FeaturePermission.REPORTS },
    ],
  },
  {
    id: "account",
    title: "ACCOUNT",
    tKey: "nav.account",
    items: [
      { id: 10.5, title: "Upgrade Plan", tKey: "nav.upgradePlan", link: "/upgrade-plan", icon: Crown },
      { id: 12, title: "Help", tKey: "nav.help", link: "/help" },
      // Policies moved here to reduce clutter
      { id: 13, title: "Privacy Policy", tKey: "nav.privacyPolicy", link: "/privacy-policy", permission: FeaturePermission.PRIVACY_POLICY },
      { id: 14, title: "Refund Policy", tKey: "nav.refundPolicy", link: "/refund-policy", permission: FeaturePermission.REFUND_POLICY },
    ],
  },
];

// Flattened navLinks for backward compatibility
export const navLinks = navSections.flatMap((section) => section.items);

export const DROPDOWN_NAV_ITEMS = [
  { title: "Personal Information", link: "/settings/personal-information", icon: User2 },
  { title: "Settings", link: "/settings/account-security", icon: Settings },
];
