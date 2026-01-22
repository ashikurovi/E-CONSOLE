import { FileText, Settings, ShieldAlert, User2, Truck, Crown, Zap } from "lucide-react";
import { FeaturePermission } from "@/constants/feature-permission";

// Navigation organized by sections and workflow
export const navSections = [
  {
    id: "overview",
    title: "OVERVIEW",
    items: [
      { id: 1, title: "Dashboard", link: "/" }, // always visible
    ],
  },
  {
    id: "catalog",
    title: "CATALOG MANAGEMENT",
    items: [
      { id: 2, title: "Categories", link: "/categories", permission: FeaturePermission.CATEGORY },
      { id: 3, title: "Product", link: "/products", permission: FeaturePermission.PRODUCTS },
      { id: 3.5, title: "Flash Sell", link: "/flash-sell", permission: FeaturePermission.PRODUCTS, icon: Zap },
    ],
  },
  {
    id: "orders",
    title: "ORDERS & FULFILLMENT",
    items: [
      { id: 6, title: "Order", link: "/orders", permission: FeaturePermission.ORDERS },
      { id: 7.5, title: "Steadfast Courier", link: "/steadfast", permission: FeaturePermission.STEADFAST, icon: Truck },
      { id: 7.6, title: "Pathao Courier", link: "/pathao", permission: FeaturePermission.PATHAO, icon: Truck },
    ],
  },
  {
    id: "customers",
    title: "CUSTOMERS",
    items: [
      { id: 5, title: "Customers", link: "/customers", permission: FeaturePermission.CUSTOMERS },
    ],
  },
  {
    id: "marketing",
    title: "MARKETING & PROMOTIONS",
    items: [
      { id: 9, title: "Banners", link: "/banners", permission: FeaturePermission.SETTINGS },
      { id: 10, title: "Promocodes", link: "/promocodes", permission: FeaturePermission.SETTINGS },
    ],
  },
  {
    id: "security",
    title: "SECURITY & COMPLIANCE",
    items: [
      { id: 8, title: "Fraud Checker", link: "/fraud", permission: FeaturePermission.REPORTS },
      { id: 13, title: "Privacy Policy", link: "/privacy-policy", permission: FeaturePermission.PRIVACY_POLICY },
      { id: 14, title: "Terms & Conditions", link: "/terms-conditions", permission: FeaturePermission.TERMS_CONDITIONS },
      { id: 15, title: "Refund Policy", link: "/refund-policy", permission: FeaturePermission.REFUND_POLICY },
    ],
  },
  {
    id: "administration",
    title: "ADMINISTRATION",
    items: [
      { id: 16, title: "Manage Users", link: "/manage-users", permission: FeaturePermission.STAFF },
    ],
  },
  {
    id: "account",
    title: "ACCOUNT",
    items: [
      { id: 10.5, title: "Upgrade Plan", link: "/upgrade-plan", icon: Crown }, // always visible
      { id: 11, title: "Settings", link: "/settings" }, // always visible
      { id: 12, title: "Help", link: "/help" }, // always visible
    ],
  },
];

// Flattened navLinks for backward compatibility
export const navLinks = navSections.flatMap((section) => section.items);

export const DROPDOWN_NAV_ITEMS = [
  { title: "Personal Information", link: "/settings/personal-information", icon: User2 },
  { title: "Settings", link: "/settings/account-security", icon: Settings },
];
