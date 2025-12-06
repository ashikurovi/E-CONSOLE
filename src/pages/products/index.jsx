import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import ReusableTable from "@/components/table/reusable-table";
import { Button } from "@/components/ui/button";
import { Power, Trash2, X, Download } from "lucide-react";
import {
  useGetProductsQuery,
  useDeleteProductMutation,
  useToggleProductActiveMutation,
} from "@/features/product/productApiSlice";
import { useGetCategoriesQuery } from "@/features/category/categoryApiSlice";
import ProductForm from "./components/ProductForm";
import ProductEditForm from "./components/ProductEditForm";
import ProductViewModal from "./components/ProductViewModal";
import FlashSell from "./components/FlashSell";
import DeleteModal from "@/components/modals/DeleteModal";
import ConfirmModal from "@/components/modals/ConfirmModal";
import Dropdown from "@/components/dropdown/dropdown";
import { exportProductsToExcel } from "@/utils/excelExport";

const ProductsPage = () => {
  const { data: products = [], isLoading } = useGetProductsQuery();
  const { data: categories = [] } = useGetCategoriesQuery();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [toggleActive, { isLoading: isToggling }] = useToggleProductActiveMutation();
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, product: null });
  const [toggleModal, setToggleModal] = useState({ isOpen: false, product: null });
  const [selectedCategory, setSelectedCategory] = useState(null);

  const headers = useMemo(
    () => [
      { header: "Name", field: "name" },
      { header: "SKU", field: "sku" },
      { header: "Category", field: "categoryName" },
      { header: "Price", field: "price" },
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
        status: p.isActive ? "Active" : "Disabled",
        actions: (
          <div className="flex items-center gap-2 justify-end">
            <ProductViewModal product={p} />

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

            <ProductEditForm product={p} categoryOptions={categoryOptions} />

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteModal({ isOpen: true, product: p })}
              disabled={isDeleting}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      })),
    [filteredProducts, deleteProduct, toggleActive, isDeleting, isToggling, categoryOptions]
  );

  const handleDelete = async () => {
    if (!deleteModal.product) return;
    const res = await deleteProduct(deleteModal.product.id);
    if (res?.data) {
      toast.success("Product deleted");
      setDeleteModal({ isOpen: false, product: null });
    } else {
      toast.error(res?.error?.data?.message || "Failed to delete product");
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

  const handleExportToExcel = () => {
    exportProductsToExcel(filteredProducts, "Products");
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Products</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportToExcel}
            className="flex items-center gap-2"
            disabled={filteredProducts.length === 0}
          >
            <Download className="h-4 w-4" />
            Export to Excel
          </Button>
          <FlashSell products={filteredProducts} categoryOptions={categoryOptions} />
          <ProductForm categoryOptions={categoryOptions} />
        </div>
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
        title="Delete Product"
        description="This action cannot be undone. This will permanently delete the product."
        itemName={deleteModal.product?.name || deleteModal.product?.title}
        isLoading={isDeleting}
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