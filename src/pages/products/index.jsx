import React, { useMemo, useState } from "react";
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
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);
  const [activeTab, setActiveTab] = useState("published"); // published, drafts, trash
  
  const { data: publishedProducts = [], isLoading: isLoadingPublished } = useGetProductsQuery(
    { companyId: authUser?.companyId },
    { skip: activeTab !== "published" }
  );
  const { data: draftProducts = [], isLoading: isLoadingDrafts } = useGetDraftProductsQuery(
    { companyId: authUser?.companyId },
    { skip: activeTab !== "drafts" }
  );
  const { data: trashedProducts = [], isLoading: isLoadingTrash } = useGetTrashedProductsQuery(
    { companyId: authUser?.companyId },
    { skip: activeTab !== "trash" }
  );
  
  const { data: categories = [] } = useGetCategoriesQuery({ companyId: authUser?.companyId });
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [toggleActive, { isLoading: isToggling }] = useToggleProductActiveMutation();
  const [recoverProduct, { isLoading: isRecovering }] = useRecoverProductMutation();
  const [publishDraft, { isLoading: isPublishing }] = usePublishDraftMutation();
  
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, product: null });
  const [toggleModal, setToggleModal] = useState({ isOpen: false, product: null });
  const [recoverModal, setRecoverModal] = useState({ isOpen: false, product: null });
  const [publishModal, setPublishModal] = useState({ isOpen: false, product: null });
  const [restockModal, setRestockModal] = useState({ isOpen: false, product: null });
  const [selectedCategory, setSelectedCategory] = useState(null);

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
      { header: "Name", field: "name" },
      { header: "SKU", field: "sku" },
      { header: "Category", field: "categoryName" },
      { header: "Price", field: "price" },
      { header: "Stock", field: "stock" },
      { header: "Status", field: "status" },
      { header: "Actions", field: "actions" },
    ],
    []
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
      { label: "All Categories", value: null },
      ...categoryOptions,
    ],
    [categoryOptions]
  );

  // Filter products by selected category
  const filteredProducts = useMemo(() => {
    if (!selectedCategory?.value) return products;
    return products.filter((p) => {
      const categoryId = p.category?.id ?? p.categoryId;
      return categoryId === selectedCategory.value;
    });
  }, [products, selectedCategory]);

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
          ? "Trashed" 
          : activeTab === "drafts" 
          ? "Draft" 
          : (p.isActive ? "Active" : "Disabled"),
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
                  title="View"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setRecoverModal({ isOpen: true, product: p })}
                  disabled={isRecovering}
                  className="bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400"
                  title="Recover"
                >
                  <RotateCcw className="h-4 w-4" />
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
                  title="View"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400"
                  onClick={() => navigate(`/products/${p.id}/edit`)}
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setPublishModal({ isOpen: true, product: p })}
                  disabled={isPublishing}
                  className="bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400"
                  title="Publish"
                >
                  <Send className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteModal({ isOpen: true, product: p })}
                  disabled={isDeleting}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400"
                  title="Move to Trash"
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
                  title="View"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400"
                  onClick={() => setRestockModal({ isOpen: true, product: p })}
                  title="Restock"
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
                  title={p.isActive ? "Disable" : "Activate"}
                >
                  <Power className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400"
                  onClick={() => navigate(`/products/${p.id}/edit`)}
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteModal({ isOpen: true, product: p })}
                  disabled={isDeleting}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400"
                  title="Move to Trash"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        ),
      })),
    [filteredProducts, activeTab, isDeleting, isToggling, isRecovering, isPublishing, navigate]
  );

  const handleDelete = async () => {
    if (!deleteModal.product) return;
    const res = await deleteProduct(deleteModal.product.id);
    if (res?.data) {
      toast.success("Product moved to trash");
      setDeleteModal({ isOpen: false, product: null });
    } else {
      toast.error(res?.error?.data?.message || "Failed to move product to trash");
    }
  };

  const handleRecover = async () => {
    if (!recoverModal.product) return;
    const res = await recoverProduct(recoverModal.product.id);
    if (res?.data) {
      toast.success("Product recovered from trash");
      setRecoverModal({ isOpen: false, product: null });
    } else {
      toast.error(res?.error?.data?.message || "Failed to recover product");
    }
  };

  const handlePublish = async () => {
    if (!publishModal.product) return;
    const res = await publishDraft(publishModal.product.id);
    if (res?.data) {
      toast.success("Product published");
      setPublishModal({ isOpen: false, product: null });
    } else {
      toast.error(res?.error?.data?.message || "Failed to publish product");
    }
  };

  const handleToggle = async () => {
    if (!toggleModal.product) return;
    const res = await toggleActive({ id: toggleModal.product.id });
    if (res?.data) {
      toast.success("Product state updated");
      setToggleModal({ isOpen: false, product: null });
    } else {
      toast.error(res?.error?.data?.message || "Failed to update product");
    }
  };

  const handleExportToPDF = () => {
    exportProductsToPDF(filteredProducts, "Products");
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Products</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportToPDF}
            className="flex items-center gap-2"
            disabled={filteredProducts.length === 0}
          >
            <Download className="h-4 w-4" />
            Export to PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/products/bulk-upload")}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Bulk Upload
          </Button>
          <FlashSell products={filteredProducts} categoryOptions={categoryOptions} />
          <Button size="sm" onClick={() => navigate("/products/create")}>
            Add Product
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
          Published ({publishedProducts.length})
        </button>
        <button
          onClick={() => setActiveTab("drafts")}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === "drafts"
              ? "border-b-2 border-yellow-500 text-yellow-600 dark:text-yellow-400"
              : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
          }`}
        >
          Drafts ({draftProducts.length})
        </button>
        <button
          onClick={() => setActiveTab("trash")}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === "trash"
              ? "border-b-2 border-red-500 text-red-600 dark:text-red-400"
              : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
          }`}
        >
          Trash ({trashedProducts.length})
        </button>
      </div>

      {/* Filter Section */}
      <div className="mb-4 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-black/70 dark:text-white/70">
            Filter by Category:
          </label>
          <div className="min-w-[200px]">
            <Dropdown
              name="Category"
              options={filterCategoryOptions}
              setSelectedOption={setSelectedCategory}
              className="py-2"
            >
              {selectedCategory?.label || (
                <span className="text-black/50 dark:text-white/50">All Categories</span>
              )}
            </Dropdown>
          </div>
        </div>
        {selectedCategory && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className="flex items-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <X className="h-4 w-4" />
            Clear Filter
          </Button>
        )}
        {selectedCategory && (
          <span className="text-sm text-black/60 dark:text-white/60">
            Showing {filteredProducts.length} of {products.length} products
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
        title="Move to Trash"
        description="This will move the product to trash. You can recover it later from the trash tab."
        itemName={deleteModal.product?.name || deleteModal.product?.title}
        isLoading={isDeleting}
      />

      {/* Recover Modal */}
      <ConfirmModal
        isOpen={recoverModal.isOpen}
        onClose={() => setRecoverModal({ isOpen: false, product: null })}
        onConfirm={handleRecover}
        title="Recover Product"
        description="This will restore the product from trash and make it available again."
        itemName={recoverModal.product?.name || recoverModal.product?.title}
        isLoading={isRecovering}
        type="success"
        confirmText="Recover"
      />

      {/* Publish Modal */}
      <ConfirmModal
        isOpen={publishModal.isOpen}
        onClose={() => setPublishModal({ isOpen: false, product: null })}
        onConfirm={handlePublish}
        title="Publish Product"
        description="This will publish the draft product and make it visible to customers."
        itemName={publishModal.product?.name || publishModal.product?.title}
        isLoading={isPublishing}
        type="success"
        confirmText="Publish"
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
        title={toggleModal.product?.isActive ? "Disable Product" : "Activate Product"}
        description={
          toggleModal.product?.isActive
            ? "This will disable the product and it will not be visible to customers."
            : "This will activate the product and make it visible to customers."
        }
        itemName={toggleModal.product?.name || toggleModal.product?.title}
        isLoading={isToggling}
        type={toggleModal.product?.isActive ? "warning" : "success"}
        confirmText={toggleModal.product?.isActive ? "Disable" : "Activate"}
      />
    </div>
  );
};

export default ProductsPage;