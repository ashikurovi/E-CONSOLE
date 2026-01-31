import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import ReusableTable from "@/components/table/reusable-table";
import { Button } from "@/components/ui/button";
import { Power, Trash2, X, Download, Eye, Pencil, Upload, RotateCcw, Send, Package } from "lucide-react";
import {
  useGetProductsQuery,
  useGetDraftProductsQuery,
  useGetTrashedProductsQuery,
  useDeleteProductMutation,
  useToggleProductActiveMutation,
  useRecoverProductMutation,
  usePublishDraftMutation,
  usePermanentDeleteProductMutation,
} from "@/features/product/productApiSlice";
import { useGetCategoriesQuery } from "@/features/category/categoryApiSlice";
import { useNavigate } from "react-router-dom";
import FlashSell from "./components/FlashSell";
import DeleteModal from "@/components/modals/DeleteModal";
import ConfirmModal from "@/components/modals/ConfirmModal";
import RestockModal from "./components/RestockModal";
import Dropdown from "@/components/dropdown/dropdown";
import { exportProductsToPDF } from "@/utils/pdfExport";
import { useSelector } from "react-redux";

const ProductsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);
  const [activeTab, setActiveTab] = useState("published"); // published, drafts, trash
  
  // Always fetch all queries so tab counts update in real-time
  // RTK Query will cache the results, so this is efficient
  const { data: publishedProducts = [], isLoading: isLoadingPublished } = useGetProductsQuery(
    { companyId: authUser?.companyId }
  );
  const { data: draftProducts = [], isLoading: isLoadingDrafts } = useGetDraftProductsQuery(
    { companyId: authUser?.companyId }
  );
  const { data: trashedProducts = [], isLoading: isLoadingTrash } = useGetTrashedProductsQuery(
    { companyId: authUser?.companyId }
  );
  
  const { data: categories = [] } = useGetCategoriesQuery({ companyId: authUser?.companyId });
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [toggleActive, { isLoading: isToggling }] = useToggleProductActiveMutation();
  const [recoverProduct, { isLoading: isRecovering }] = useRecoverProductMutation();
  const [publishDraft, { isLoading: isPublishing }] = usePublishDraftMutation();
  const [permanentDeleteProduct, { isLoading: isPermanentlyDeleting }] = usePermanentDeleteProductMutation();
  
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, product: null });
  const [toggleModal, setToggleModal] = useState({ isOpen: false, product: null });
  const [recoverModal, setRecoverModal] = useState({ isOpen: false, product: null });
  const [publishModal, setPublishModal] = useState({ isOpen: false, product: null });
  const [permanentDeleteModal, setPermanentDeleteModal] = useState({ isOpen: false, product: null });
  const [restockModal, setRestockModal] = useState({ isOpen: false, product: null });
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedStockFilter, setSelectedStockFilter] = useState(null); // null | 'all' | 'low' | 'out' | 'in'

  // Get products based on active tab
  const products = useMemo(() => {
    if (activeTab === "drafts") return draftProducts;
    if (activeTab === "trash") return trashedProducts;
    return publishedProducts;
  }, [activeTab, publishedProducts, draftProducts, trashedProducts]);

  const isLoading = useMemo(() => {
    if (activeTab === "drafts") return isLoadingDrafts;
    if (activeTab === "trash") return isLoadingTrash;
    return isLoadingPublished;
  }, [activeTab, isLoadingPublished, isLoadingDrafts, isLoadingTrash]);

  const headers = useMemo(
    () => [
      { header: t("common.name"), field: "name" },
      { header: t("products.sku"), field: "sku" },
      { header: t("products.category"), field: "categoryName" },
      { header: t("products.price"), field: "price" },
      { header: t("products.stock"), field: "stock" },
      { header: t("common.status"), field: "status" },
      { header: t("common.actions"), field: "actions" },
    ],
    [t]
  );

  const categoryOptions = useMemo(
    () =>
      categories.map((cat) => ({
        label: cat.name,
        value: cat.id,
      })),
    [categories]
  );

  // Add "All Categories" option to filter dropdown
  const filterCategoryOptions = useMemo(
    () => [
      { label: t("products.allCategories"), value: null },
      ...categoryOptions,
    ],
    [categoryOptions, t]
  );

  // Stock filter options
  const stockFilterOptions = useMemo(
    () => [
      { label: t("products.allStock"), value: null },
      { label: t("products.lowStock"), value: "low" },
      { label: t("products.outOfStock"), value: "out" },
      { label: t("products.inStock"), value: "in" },
    ],
    [t]
  );

  // Filter products by selected category and stock
  const filteredProducts = useMemo(() => {
    let result = products;
    // Category filter
    if (selectedCategory?.value) {
      result = result.filter((p) => {
        const categoryId = p.category?.id ?? p.categoryId;
        return categoryId === selectedCategory.value;
      });
    }
    // Stock filter
    if (selectedStockFilter?.value) {
      const stock = (p) => p.stock ?? 0;
      switch (selectedStockFilter.value) {
        case "low":
          result = result.filter((p) => stock(p) > 0 && stock(p) <= 5);
          break;
        case "out":
          result = result.filter((p) => stock(p) === 0);
          break;
        case "in":
          result = result.filter((p) => stock(p) > 0);
          break;
        default:
          break;
      }
    }
    return result;
  }, [products, selectedCategory, selectedStockFilter]);

  const tableData = useMemo(
    () =>
      filteredProducts.map((p) => ({
        name: p.name ?? p.title ?? "-",
        sku: p.sku ?? "-",
        categoryName: p.category?.name ?? "-",
        price:
          typeof p.price === "number"
            ? `$${p.price.toFixed(2)}`
            : p.price ?? "-",
        stock: (
          <span className={`font-semibold ${
            (p.stock ?? 0) <= 5 
              ? "text-red-600 dark:text-red-400" 
              : "text-black dark:text-white"
          }`}>
            {p.stock ?? 0}
            {(p.stock ?? 0) <= 5 && (
              <span className="ml-1 text-xs">⚠️</span>
            )}
          </span>
        ),
        status: activeTab === "trash" 
          ? t("products.trashed") 
          : activeTab === "drafts" 
          ? t("products.draft") 
          : (p.isActive ? t("common.active") : t("common.disabled")),
        actions: (
          <div className="flex items-center gap-2 justify-end">
            {activeTab === "trash" ? (
              // Trash tab actions
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400"
                  onClick={() => navigate(`/products/${p.id}`)}
                  title={t("common.view")}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setRecoverModal({ isOpen: true, product: p })}
                  disabled={isRecovering}
                  className="bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400"
                  title={t("products.recover")}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setPermanentDeleteModal({ isOpen: true, product: p })}
                  disabled={isPermanentlyDeleting}
                  className="bg-red-600/10 hover:bg-red-600/20 text-red-600 dark:text-red-400"
                  title={t("products.deletePermanently")}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            ) : activeTab === "drafts" ? (
              // Drafts tab actions
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400"
                  onClick={() => navigate(`/products/${p.id}`)}
                  title={t("common.view")}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400"
                  onClick={() => navigate(`/products/${p.id}/edit`)}
                  title={t("common.edit")}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setPublishModal({ isOpen: true, product: p })}
                  disabled={isPublishing}
                  className="bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400"
                  title={t("products.publish")}
                >
                  <Send className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteModal({ isOpen: true, product: p })}
                  disabled={isDeleting}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400"
                  title={t("products.moveToTrash")}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            ) : (
              // Published tab actions
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400"
                  onClick={() => navigate(`/products/${p.id}`)}
                  title={t("common.view")}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400"
                  onClick={() => setRestockModal({ isOpen: true, product: p })}
                  title={t("products.restock")}
                >
                  <Package className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setToggleModal({ isOpen: true, product: p })}
                  disabled={isToggling}
                  className={`${p.isActive
                    ? "bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400"
                    : "bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400"
                    }`}
                  title={p.isActive ? t("common.disable") : t("common.activate")}
                >
                  <Power className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400"
                  onClick={() => navigate(`/products/${p.id}/edit`)}
                  title={t("common.edit")}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteModal({ isOpen: true, product: p })}
                  disabled={isDeleting}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400"
                  title={t("products.moveToTrash")}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        ),
      })),
    [filteredProducts, activeTab, isDeleting, isToggling, isRecovering, isPublishing, isPermanentlyDeleting, navigate, t]
  );

  const handleDelete = async () => {
    if (!deleteModal.product) return;
    const res = await deleteProduct(deleteModal.product.id);
    if (res?.data) {
      toast.success(t("products.productMovedToTrash"));
      setDeleteModal({ isOpen: false, product: null });
    } else {
      toast.error(res?.error?.data?.message || t("common.failed"));
    }
  };

  const handleRecover = async () => {
    if (!recoverModal.product) return;
    const res = await recoverProduct(recoverModal.product.id);
    if (res?.data) {
      toast.success(t("products.productRecovered"));
      setRecoverModal({ isOpen: false, product: null });
    } else {
      toast.error(res?.error?.data?.message || t("products.recoverProduct"));
    }
  };

  const handlePublish = async () => {
    if (!publishModal.product) return;
    const res = await publishDraft(publishModal.product.id);
    if (res?.data) {
      toast.success(t("products.productPublished"));
      setPublishModal({ isOpen: false, product: null });
    } else {
      toast.error(res?.error?.data?.message || t("products.publishProduct"));
    }
  };

  const handleToggle = async () => {
    if (!toggleModal.product) return;
    const res = await toggleActive({ id: toggleModal.product.id });
    if (res?.data) {
      toast.success(t("products.productStateUpdated"));
      setToggleModal({ isOpen: false, product: null });
    } else {
      toast.error(res?.error?.data?.message || t("products.productStateUpdated"));
    }
  };

  const handlePermanentDelete = async () => {
    if (!permanentDeleteModal.product) return;
    const res = await permanentDeleteProduct(permanentDeleteModal.product.id);
    if (res?.data) {
      toast.success(t("products.productPermanentlyDeleted"));
      setPermanentDeleteModal({ isOpen: false, product: null });
    } else {
      toast.error(res?.error?.data?.message || t("products.deletePermanently"));
    }
  };

  const handleExportToPDF = () => {
    exportProductsToPDF(filteredProducts, "Products");
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">{t("products.title")}</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportToPDF}
            className="flex items-center gap-2"
            disabled={filteredProducts.length === 0}
          >
            <Download className="h-4 w-4" />
            {t("products.exportToPdf")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/products/bulk-upload")}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {t("products.bulkUpload")}
          </Button>
          <FlashSell products={filteredProducts} categoryOptions={categoryOptions} />
          <Button size="sm" onClick={() => navigate("/products/create")}>
            {t("products.addProduct")}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-2 border-b border-black/10 dark:border-white/10">
        <button
          onClick={() => setActiveTab("published")}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === "published"
              ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
              : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
          }`}
        >
          {t("products.published")} ({publishedProducts.length})
        </button>
        <button
          onClick={() => setActiveTab("drafts")}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === "drafts"
              ? "border-b-2 border-yellow-500 text-yellow-600 dark:text-yellow-400"
              : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
          }`}
        >
          {t("products.drafts")} ({draftProducts.length})
        </button>
        <button
          onClick={() => setActiveTab("trash")}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === "trash"
              ? "border-b-2 border-red-500 text-red-600 dark:text-red-400"
              : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
          }`}
        >
          {t("products.trash")} ({trashedProducts.length})
        </button>
      </div>

      {/* Filter Section */}
      <div className="mb-4 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-black/70 dark:text-white/70">
            {t("products.filterByCategory")}:
          </label>
          <div className="min-w-[200px]">
            <Dropdown
              name={t("products.category")}
              options={filterCategoryOptions}
              setSelectedOption={setSelectedCategory}
              className="py-2"
            >
              {selectedCategory?.label || (
                <span className="text-black/50 dark:text-white/50">{t("products.allCategories")}</span>
              )}
            </Dropdown>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-black/70 dark:text-white/70">
            {t("products.filterByStock")}:
          </label>
          <div className="min-w-[160px]">
            <Dropdown
              name={t("products.stock")}
              options={stockFilterOptions}
              setSelectedOption={setSelectedStockFilter}
              className="py-2"
            >
              {selectedStockFilter?.label || (
                <span className="text-black/50 dark:text-white/50">{t("products.allStock")}</span>
              )}
            </Dropdown>
          </div>
        </div>
        {(selectedCategory || selectedStockFilter) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedCategory(null);
              setSelectedStockFilter(null);
            }}
            className="flex items-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <X className="h-4 w-4" />
            {t("products.clearFilter")}
          </Button>
        )}
        {(selectedCategory || selectedStockFilter) && (
          <span className="text-sm text-black/60 dark:text-white/60">
            {t("products.showingOf", { count: filteredProducts.length, total: products.length })}
          </span>
        )}
      </div>

      <ReusableTable
        data={tableData}
        headers={headers}
        total={filteredProducts.length}
        isLoading={isLoading}
        py="py-2"
      />

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, product: null })}
        onConfirm={handleDelete}
        title={t("products.moveToTrash")}
        description={t("products.moveToTrashDesc")}
        itemName={deleteModal.product?.name || deleteModal.product?.title}
        isLoading={isDeleting}
      />

      {/* Recover Modal */}
      <ConfirmModal
        isOpen={recoverModal.isOpen}
        onClose={() => setRecoverModal({ isOpen: false, product: null })}
        onConfirm={handleRecover}
        title={t("products.recoverProduct")}
        description={t("products.recoverProductDesc")}
        itemName={recoverModal.product?.name || recoverModal.product?.title}
        isLoading={isRecovering}
        type="success"
        confirmText={t("products.recover")}
      />

      {/* Publish Modal */}
      <ConfirmModal
        isOpen={publishModal.isOpen}
        onClose={() => setPublishModal({ isOpen: false, product: null })}
        onConfirm={handlePublish}
        title={t("products.publishProduct")}
        description={t("products.publishProductDesc")}
        itemName={publishModal.product?.name || publishModal.product?.title}
        isLoading={isPublishing}
        type="success"
        confirmText={t("products.publish")}
      />

      {/* Restock Modal */}
      <RestockModal
        isOpen={restockModal.isOpen}
        onClose={() => setRestockModal({ isOpen: false, product: null })}
        product={restockModal.product}
      />

      {/* Toggle Active Modal */}
      <ConfirmModal
        isOpen={toggleModal.isOpen}
        onClose={() => setToggleModal({ isOpen: false, product: null })}
        onConfirm={handleToggle}
        title={toggleModal.product?.isActive ? t("products.disableProduct") : t("products.activateProduct")}
        description={
          toggleModal.product?.isActive ? t("products.disableProductDesc") : t("products.activateProductDesc")
        }
        itemName={toggleModal.product?.name || toggleModal.product?.title}
        isLoading={isToggling}
        type={toggleModal.product?.isActive ? "warning" : "success"}
        confirmText={toggleModal.product?.isActive ? t("common.disable") : t("common.activate")}
      />

      {/* Permanent Delete Modal */}
      <ConfirmModal
        isOpen={permanentDeleteModal.isOpen}
        onClose={() => setPermanentDeleteModal({ isOpen: false, product: null })}
        onConfirm={handlePermanentDelete}
        title={t("products.permanentDeleteProduct")}
        description={t("products.permanentDeleteProductDesc")}
        itemName={permanentDeleteModal.product?.name || permanentDeleteModal.product?.title}
        isLoading={isPermanentlyDeleting}
        type="danger"
        confirmText={t("products.deletePermanently")}
      />
    </div>
  );
};

export default ProductsPage;