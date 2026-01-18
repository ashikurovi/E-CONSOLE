import { FileText, Settings, ShieldAlert, User2, Truck } from "lucide-react";
import { FeaturePermission } from "@/constants/feature-permission";

// Map each nav item to the same permission used in routes
export const navLinks = [
  { id: 1, title: "Dashboard", link: "/" }, // always visible
  { id: 2, title: "Categories", link: "/categories", permission: FeaturePermission.CATEGORY },
  { id: 3, title: "Product", link: "/products", permission: FeaturePermission.PRODUCTS },
  { id: 4, title: "Inventory", link: "/inventory", permission: FeaturePermission.INVENTORY },
  { id: 5, title: "Customers", link: "/customers", permission: FeaturePermission.CUSTOMERS },
  { id: 6, title: "Order", link: "/orders", permission: FeaturePermission.ORDERS },
  { id: 7, title: "OrderItems", link: "/order-items", permission: FeaturePermission.ORDERS },
  { id: 7.5, title: "Steadfast Courier", link: "/steadfast", permission: FeaturePermission.STEADFAST, icon: Truck },
  { id: 7.6, title: "Pathao Courier", link: "/pathao", permission: FeaturePermission.PATHAO, icon: Truck },
  { id: 8, title: "Fraud Checker", link: "/fraud", permission: FeaturePermission.REPORTS },
  { id: 9, title: "Banners", link: "/banners", permission: FeaturePermission.SETTINGS },
  { id: 10, title: "Promocodes", link: "/promocodes", permission: FeaturePermission.SETTINGS },
  // { id: 6, title: "Review", link: "/reviews" },
  // { id: 9, title: "Integration", link: "/integrations" },
  { id: 11, title: "Settings", link: "/settings", permission: FeaturePermission.SETTINGS },
  { id: 12, title: "Help", link: "/help", permission: FeaturePermission.SETTINGS },
  { id: 13, title: "Privacy Policy", link: "/privacy-policy", permission: FeaturePermission.PRIVACY_POLICY },
  { id: 14, title: "Terms & Conditions", link: "/terms-conditions", permission: FeaturePermission.TERMS_CONDITIONS },
  { id: 15, title: "Refund Policy", link: "/refund-policy", permission: FeaturePermission.REFUND_POLICY },
  // { id: 16, title: "Manage Users", link: "/manage-users", permission: FeaturePermission.STAFF },
];

export const DROPDOWN_NAV_ITEMS = [
  { title: "Personal Information", link: "/settings/personal-information", icon: User2 },
  { title: "Settings", link: "/settings/account-security", icon: Settings },
];
