import React from "react";
import { Search, Plus, Filter, LayoutGrid, LayoutList, ChevronDown, Check } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";

/**
 * Media Library header with search, view toggle, filters, and upload button
 */
export default function MediaHeader({
  searchInput,
  setSearchInput,
  setSearchQuery,
  viewMode,
  setViewMode,
  sortBy,
  setSortBy,
  imagesCount,
  total,
  onUploadClick,
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#0b0f14]/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800 px-6 lg:px-10 py-5 transition-all duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            Media Library
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center bg-white dark:bg-white/5 rounded-full px-4 py-2.5 border border-gray-200 dark:border-gray-800 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500/50 transition-all w-64">
            <Search className="w-4 h-4 text-gray-400 mr-2.5" />
            <input
              type="text"
              placeholder="Search media..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setSearchQuery(searchInput.trim())}
              className="bg-transparent border-none outline-none text-sm font-medium w-full text-gray-700 dark:text-gray-200 placeholder-gray-400"
            />
          </div>

          <div className="flex items-center p-1 bg-gray-100/80 dark:bg-white/5 rounded-full border border-gray-200/50 dark:border-gray-800">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-full transition-all duration-200 ${viewMode === "grid" ? "bg-white dark:bg-gray-800 text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-full transition-all duration-200 ${viewMode === "list" ? "bg-white dark:bg-gray-800 text-indigo-600 shadow-sm" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"}`}
            >
              <LayoutList className="w-4 h-4" />
            </button>
          </div>

          <Button
            onClick={onUploadClick}
            className="bg-[#5347CE] hover:bg-[#463cb8] text-white rounded-full px-6 py-5 shadow-lg shadow-indigo-500/25 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4 mr-2" />
            Upload Media
          </Button>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex rounded-full border-gray-200 dark:border-gray-800 dark:bg-transparent dark:text-gray-300 dark:hover:bg-white/5"
          >
            <Filter className="w-4 h-4 mr-2 text-gray-500" />
            All Formats
          </Button>
          <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Showing <span className="text-gray-900 dark:text-white">{imagesCount}</span> of{" "}
            <span className="text-gray-900 dark:text-white">{total}</span> items
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Sort by:{" "}
              <span className="text-indigo-600 dark:text-indigo-400">
                {sortBy === "newest" ? "Newest First" : sortBy === "name" ? "Name" : "Size"}
              </span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Sort Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setSortBy("newest")}>
              Newest First
              {sortBy === "newest" && <Check className="w-3.5 h-3.5 ml-auto text-indigo-600" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("name")}>
              Name (A-Z)
              {sortBy === "name" && <Check className="w-3.5 h-3.5 ml-auto text-indigo-600" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("size")}>
              Size
              {sortBy === "size" && <Check className="w-3.5 h-3.5 ml-auto text-indigo-600" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
