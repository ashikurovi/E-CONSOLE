import { FileText, Settings, ShieldAlert, User2 } from "lucide-react";

export const navLinks = [
  { id: 1, title: "Dashboard", link: "/" },
  { id: 2, title: "Categories", link: "/categories" },
  { id: 3, title: "Product", link: "/products" },
  { id: 4, title: "Inventory", link: "/inventory" },
  { id: 5, title: "Customers", link: "/customers" },
  { id: 6, title: "Order", link: "/orders" },
  { id: 7, title: "OrderItems", link: "/order-items" },
  { id: 8, title: "Fraud Checker", link: "/fraud" },
  { id: 9, title: "Banners", link: "/banners" },
  { id: 10, title: "Promocodes", link: "/promocodes" },
  // { id: 6, title: "Review", link: "/reviews" },
  // { id: 9, title: "Integration", link: "/integrations" },
  { id: 11, title: "Settings", link: "/settings" },
  { id: 12, title: "Help", link: "/help" },
  { id: 13, title: "Manage Users", link: "/manage-users" },
];

export const DROPDOWN_NAV_ITEMS = [
  { title: "Personal Information", link: "/settings/personal-information", icon: User2 },
  { title: "Settings", link: "/settings/account-security", icon: Settings },
];
