import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import { AlignLeft } from "lucide-react";
import { navLinks } from "./data";
import { hasPermission } from "@/constants/feature-permission";

const SidebarMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef(null);
  const { user } = useSelector((state) => state.auth);

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

  const visibleNavLinks = navLinks
    .filter((item) => hasPermission(user, item.permission))
    .map((item) => ({
      ...item,
      children: item?.children?.filter((child) =>
        hasPermission(user, child.permission)
      ),
    }));

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
        <ul className="flex flex-col gap-4">
          {visibleNavLinks?.map((item, index) => (
            <li key={index}>
              <Link
                onClick={() => setIsOpen(false)}
                to={item?.link}
                className="w-fit hover:text-primary tr"
              >
                {item.title}
              </Link>
              {item?.children && item.children.length > 0 && (
                <div className="flex flex-col gap-3 mt-3">
                  {item.children.map((subitem, jndex) => (
                    <Link
                      to={subitem.link}
                      key={jndex}
                      onClick={() => setIsOpen(false)}
                      className="text-sm ml-3 w-fit hover:text-primary tr"
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
    </div>
  );
};

export default SidebarMenu;
