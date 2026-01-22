import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useGetCurrentUserQuery } from "@/features/auth/authApiSlice";

import { AlignLeft } from "lucide-react";
import { navSections } from "./data";
import { hasPermission } from "@/constants/feature-permission";

const SidebarMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef(null);
  // Fetch user data from API instead of Redux
  const { data: user, isLoading: isLoadingUser } = useGetCurrentUserQuery();

  const handleSideMenu = () => {
    setIsOpen((prev) => !prev);
  };

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const visibleNavSections = navSections
    .map((section) => ({
      ...section,
      items: section.items
        .filter((item) => hasPermission(user, item.permission))
        .map((item) => ({
          ...item,
          children: item?.children?.filter((child) =>
            hasPermission(user, child.permission)
          ),
        })),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <div>
      <button
        onClick={handleSideMenu}
        className="h-12 w-12 rounded-full bg-bg50 center"
      >
        <AlignLeft className="h-5" />
      </button>

      <div
        className={`fixed bg-black/50 backdrop-blur-sm tr ${isOpen ? "z-40 opacity-100 inset-0" : "z-[-10] opacity-0"
          }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`h-screen w-[300px] bg-white dark:bg-[#202020] z-50 fixed top-0 left-0 tr overflow-hidden p-8 ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex flex-col gap-6">
          {visibleNavSections?.map((section, sectionIndex) => (
            <div key={section.id} className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {section.title}
              </h3>
              <ul className="flex flex-col gap-3">
                {section.items.map((item, itemIndex) => (
                  <li key={item.id || itemIndex}>
                    <Link
                      onClick={() => setIsOpen(false)}
                      to={item?.link}
                      className="w-fit hover:text-primary tr block"
                    >
                      {item.title}
                    </Link>
                    {item?.children && item.children.length > 0 && (
                      <div className="flex flex-col gap-2 mt-2">
                        {item.children.map((subitem, subIndex) => (
                          <Link
                            to={subitem.link}
                            key={subIndex}
                            onClick={() => setIsOpen(false)}
                            className="text-sm ml-4 w-fit hover:text-primary tr"
                          >
                            {subitem.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SidebarMenu;
