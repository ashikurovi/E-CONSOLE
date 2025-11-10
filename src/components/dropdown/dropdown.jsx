import { svgArrowDown, svgArrowDownWhite } from "@/assets/icons/svgIcons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import React from "react";

const Dropdown = ({
  children,
  name = "options",
  options,
  setSelectedOption,
  primary = false,
  className,
}) => {
  return (
    <DropdownMenu className={(e) => e.stopPropagation()}>
      <DropdownMenuTrigger
        className="outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`py-1.5 pl-4 pr-2.5 rounded-full text-sm border flbx gap-2 select-none  ${
            primary
              ? "border-white/75 text-white"
              : "border-black/15 dark:border-white/20 text-black dark:text-white/75"
          } ${className}`}
        >
          {children}
          <span className="hidden dark:block">{svgArrowDownWhite}</span>
          <span className="dark:hidden">{primary ? svgArrowDownWhite : svgArrowDown}</span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel className="font-medium">
          Select {name}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options?.map((option, index) => (
          <DropdownMenuItem
            className={option?.icon && "gap-1.5"}
            key={index}
            onClick={() => setSelectedOption(option)}
          >
            <span className="scale-[0.85]">{option?.icon}</span>
            {option?.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Dropdown;
