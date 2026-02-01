import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { 
  Plus, 
  Download, 
  Search, 
  Filter, 
  ChevronDown, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  RotateCcw,
  LayoutGrid,
  ListFilter
} from "lucide-react";

import { useGetProductsQuery, useGetDraftProductsQuery, useGetTrashedProductsQuery, useDeleteProductMutation, useToggleProductActiveMutation, useRecoverProductMutation, usePublishDraftMutation, usePermanentDeleteProductMutation } from "@/features/product/productApiSlice";
import { useGetCategoriesQuery } from "@/features/category/categoryApiSlice";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input-otp"; // Using standard input
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TablePaginate from "@/components/table/pagination";

// Modals
import DeleteModal from "@/components/modals/DeleteModal";
import ConfirmModal from "@/components/modals/ConfirmModal";
import RestockModal from "./components/RestockModal";
import { exportProductsToPDF } from "@/utils/pdfExport";

const ProductsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);
  
  // State
  const [activeTab, setActiveTab] = useState("published"); // 'published', 'drafts', 'trash'
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  // API Queries
  const { data: publishedProducts = [], isLoading: isLoadingPublished } = useGetProductsQuery({ companyId: authUser?.companyId });
  const { data: draftProducts = [], isLoading: isLoadingDrafts } = useGetDraftProductsQuery({ companyId: authUser?.companyId });
  const { data: trashedProducts = [], isLoading: isLoadingTrash } = useGetTrashedProductsQuery({ companyId: authUser?.companyId });
  const { data: categories = [] } = useGetCategoriesQuery({ companyId: authUser?.companyId });

  // Mutations
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [toggleActive, { isLoading: isToggling }] = useToggleProductActiveMutation();
  const [recoverProduct, { isLoading: isRecovering }] = useRecoverProductMutation();
  const [publishDraft, { isLoading: isPublishing }] = usePublishDraftMutation();
  const [permanentDeleteProduct, { isLoading: isPermanentlyDeleting }] = usePermanentDeleteProductMutation();

  // Modals Data
  const [modalState, setModalState] = useState({ type: null, product: null });
  const closeModal = () => setModalState({ type: null, product: null });

  // Data Aggregation
  const currentData = useMemo(() => {
    switch(activeTab) {
      case 'drafts': return draftProducts;
      case 'trash': return trashedProducts;
      default: return publishedProducts;
    }
  }, [activeTab, publishedProducts, draftProducts, trashedProducts]);

  const isLoading = activeTab === 'drafts' ? isLoadingDrafts : activeTab === 'trash' ? isLoadingTrash : isLoadingPublished;

  // Filtering & Sorting
  const processedData = useMemo(() => {
    let data = [...currentData];

    // Search
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      data = data.filter(p => 
        p.name?.toLowerCase().includes(lower) || 
        p.sku?.toLowerCase().includes(lower) ||
        p.category?.name?.toLowerCase().includes(lower)
      );
    }

    // Sort
    if (sortConfig.key) {
      data.sort((a, b) => {
        const aVal = a[sortConfig.key] ?? '';
        const bVal = b[sortConfig.key] ?? '';
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [currentData, searchTerm, sortConfig]);

  // Pagination
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentPage, pageSize]);

  // Handlers
  const handleToggleStatus = async (product) => {
    try {
      await toggleActive({ id: product.id, active: !product.isActive }).unwrap();
      toast.success(product.isActive ? t("products.productDeactivated") : t("products.productActivated"));
    } catch (err) {
      toast.error(t("common.failed"));
    }
  };

  const handleAction = async (action, product) => {
    try {
      if (action === 'delete') {
        await deleteProduct(product.id).unwrap();
        toast.success(t("products.productMovedToTrash"));
      } else if (action === 'recover') {
        await recoverProduct(product.id).unwrap();
        toast.success(t("products.productRecovered"));
      } else if (action === 'permanentDelete') {
        await permanentDeleteProduct(product.id).unwrap();
        toast.success(t("products.productPermanentlyDeleted"));
      } else if (action === 'publish') {
         await publishDraft(product.id).unwrap();
         toast.success(t("products.productPublished"));
      }
      closeModal();
    } catch (err) {
      toast.error(t("common.failed"));
    }
  };

  // Render Helpers
  const renderPrice = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

  return (
    <div className="min-h-screen bg-[#f7f8f9] dark:bg-[#0b0f14] p-4 lg:p-8 space-y-6">
      
      {/* --- Header --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("products.title")}</h1>
           <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
              <span className="cursor-pointer hover:text-purple-600" onClick={() => setActiveTab('published')}>Public</span>
              <span>•</span>
              <span className="cursor-pointer hover:text-purple-600" onClick={() => setActiveTab('drafts')}>Drafts</span>
              <span>•</span>
              <span className="cursor-pointer hover:text-purple-600" onClick={() => setActiveTab('trash')}>Trash</span>
           </div>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" onClick={() => exportProductsToPDF(processedData, "Products")} className="bg-white dark:bg-[#1a1f26] border-gray-200 dark:border-gray-800">
              <Download className="w-4 h-4 mr-2" />
              {t("common.export")}
           </Button>
           <Button className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white" onClick={() => navigate("/products/create")}>
              <Plus className="w-4 h-4 mr-2" />
              {t("products.addProduct")}
           </Button>
        </div>
      </div>

      {/* --- Toolbar --- */}
      <div className="bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
         
         {/* Search */}
         <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search product..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
         </div>

         {/* Filters */}
         <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-none border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
               <ListFilter className="w-4 h-4 mr-2" />
               Filter
            </Button>
            <DropdownMenu>
               <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex-1 sm:flex-none border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
                     Sort by: Date
                     <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
                  </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSortConfig({ key: 'createdAt', direction: 'desc' })}>Newest First</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortConfig({ key: 'createdAt', direction: 'asc' })}>Oldest First</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortConfig({ key: 'price', direction: 'desc' })}>Price: High to Low</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortConfig({ key: 'price', direction: 'asc' })}>Price: Low to High</DropdownMenuItem>
               </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
               <LayoutGrid className="w-4 h-4 mr-2" />
               Column
            </Button>
         </div>
      </div>

      {/* --- Table --- */}
      <div className="bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
         <div className="overflow-x-auto">
            <Table>
               <TableHeader className="bg-gray-50/50 dark:bg-white/5">
                  <TableRow>
                     <TableHead className="w-[40px] pl-4"><Checkbox /></TableHead>
                     <TableHead className="font-semibold text-gray-900 dark:text-white">Code</TableHead>
                     <TableHead className="font-semibold text-gray-900 dark:text-white">Product</TableHead>
                     <TableHead className="font-semibold text-gray-900 dark:text-white">Category</TableHead>
                     <TableHead className="font-semibold text-gray-900 dark:text-white">Unit</TableHead>
                     <TableHead className="font-semibold text-gray-900 dark:text-white">Quantity</TableHead>
                     <TableHead className="font-semibold text-gray-900 dark:text-white">Selling Price</TableHead>
                     <TableHead className="font-semibold text-gray-900 dark:text-white">Purchase Price</TableHead>
                     {activeTab === 'published' && <TableHead className="font-semibold text-gray-900 dark:text-white text-center">Status</TableHead>}
                     <TableHead className="text-right font-semibold text-gray-900 dark:text-white pr-4">Action</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {isLoading ? (
                     [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                           <TableCell colSpan={10} className="h-16 animate-pulse bg-gray-50/50 dark:bg-white/5" />
                        </TableRow>
                     ))
                  ) : paginatedData.length === 0 ? (
                     <TableRow>
                        <TableCell colSpan={10} className="h-32 text-center text-gray-500">No products found</TableCell>
                     </TableRow>
                  ) : (
                     paginatedData.map((product) => (
                        <TableRow key={product.id} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                           <TableCell className="pl-4"><Checkbox /></TableCell>
                           <TableCell className="font-medium text-gray-600 dark:text-gray-300">{product.sku || '—'}</TableCell>
                           <TableCell>
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700">
                                    {product.images?.[0] ? (
                                       <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                    ) : (
                                       <span className="text-xs font-bold text-gray-400">IMG</span>
                                    )}
                                 </div>
                                 <span className="font-semibold text-gray-900 dark:text-white text-sm">{product.name}</span>
                              </div>
                           </TableCell>
                           <TableCell className="text-gray-600 dark:text-gray-400">{product.category?.name || '—'}</TableCell>
                           <TableCell className="text-gray-600 dark:text-gray-400">{product.unit || 'Piece'}</TableCell>
                           <TableCell>
                              <span className={`font-semibold ${
                                 (product.stock || 0) <= 5 ? "text-red-600" : "text-gray-900 dark:text-white"
                              }`}>
                                 {product.stock || 0}
                              </span>
                           </TableCell>
                           <TableCell className="font-medium text-gray-900 dark:text-white">{renderPrice(product.price)}</TableCell>
                           <TableCell className="text-gray-600 dark:text-gray-400">{renderPrice(product.costPrice || product.price * 0.8)}</TableCell>
                           
                           {activeTab === 'published' && (
                              <TableCell className="text-center">
                                 <div className="flex justify-center">
                                    <Switch 
                                       checked={product.isActive} 
                                       onCheckedChange={() => handleToggleStatus(product)}
                                       className="data-[state=checked]:bg-emerald-500" 
                                    />
                                 </div>
                              </TableCell>
                           )}

                           <TableCell className="text-right pr-4">
                              <div className="flex items-center justify-end gap-2">
                                 <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100" onClick={() => navigate(`/products/${product.id}/edit`)}>
                                    <Edit className="w-4 h-4" />
                                 </Button>
                                 {activeTab === 'trash' ? (
                                    <>
                                       <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 bg-green-50 dark:bg-green-900/20 hover:bg-green-100" onClick={() => setModalState({ type: 'recover', product })}>
                                          <RotateCcw className="w-4 h-4" />
                                       </Button>
                                       <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100" onClick={() => setModalState({ type: 'permanentDelete', product })}>
                                          <Trash2 className="w-4 h-4" />
                                       </Button>
                                    </>
                                 ) : (
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => setModalState({ type: 'delete', product })}>
                                       <Trash2 className="w-4 h-4" />
                                    </Button>
                                 )}
                              </div>
                           </TableCell>
                        </TableRow>
                     ))
                  )}
               </TableBody>
            </Table>
         </div>

         {/* Pagination */}
         <div className="p-4 border-t border-gray-100 dark:border-gray-800">
            <TablePaginate
               total={processedData.length}
               pageSize={pageSize}
               setPageSize={setPageSize}
               currentPage={currentPage}
               setCurrentPage={setCurrentPage}
            />
         </div>
      </div>

      {/* --- Modals --- */}
      {modalState.type === 'delete' && (
         <DeleteModal
            isOpen={true}
            onClose={closeModal}
            onConfirm={() => handleAction('delete', modalState.product)}
            title={t("products.moveToTrash")}
            description={t("products.moveToTrashDesc")}
            itemName={modalState.product?.name}
            isLoading={isDeleting}
         />
      )}
      {modalState.type === 'recover' && (
         <ConfirmModal
            isOpen={true}
            onClose={closeModal}
            onConfirm={() => handleAction('recover', modalState.product)}
            title={t("products.recoverProduct")}
            description={t("products.recoverProductDesc")}
            itemName={modalState.product?.name}
            isLoading={isRecovering}
            type="success"
            confirmText="Recover"
         />
      )}
      {modalState.type === 'permanentDelete' && (
         <ConfirmModal
            isOpen={true}
            onClose={closeModal}
            onConfirm={() => handleAction('permanentDelete', modalState.product)}
            title="Permanent Delete"
            description="This action cannot be undone."
            itemName={modalState.product?.name}
            isLoading={isPermanentlyDeleting}
            type="danger"
            confirmText="Delete Permanently"
         />
      )}
    </div>
  );
};

export default ProductsPage;