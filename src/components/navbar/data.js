import { FileText, Settings, ShieldAlert, User2 } from "lucide-react";

export const navLinks = [
  {
    id: 1,
    title: "Dashboard",
    link: "/",
  },
  // {
  //   id: 3,
  //   title: "Accounts",
  //   link: "/accounts",
  // },
  {
    id: 4,
    title: "Profile",
    link: "/profile",
    children: [
      {
        title: "B",
        link: "/B",
      },
      {
        title: "C",
        link: "/c",
      },
    ],
  },
  {
    id: 4,
    title: "Profile",
    link: "/profile",
    children: [
      {
        title: "B",
        link: "/B",
      },
      {
        title: "C",
        link: "/c",
      },
    ],
  },
  {
    id: 4,
    title: "Profile",
    link: "/profile",
    children: [
      {
        title: "B",
        link: "/B",
      },
      {
        title: "C",
        link: "/c",
      },
    ],
  },
];

export const DROPDOWN_NAV_ITEMS = [
  {
    title: "Personal Information",
    link: "/settings/personal-information",
    icon: User2,
  },
  {
    title: "Settings",
    link: "/settings/account-security",
    icon: Settings,
  },
];
