import React, { useMemo } from "react";
import toast from "react-hot-toast";
import ReusableTable from "@/components/table/reusable-table";
import { Button } from "@/components/ui/button";
import { Power, Trash2 } from "lucide-react";
import {
  useGetProductsQuery,
  useDeleteProductMutation,
  useToggleProductActiveMutation,
} from "@/features/product/productApiSlice";
import { useGetCategoriesQuery } from "@/features/category/categoryApiSlice";
import ProductForm from "./components/ProductForm";
import ProductEditForm from "./components/ProductEditForm";

const ProductsPage = () => {
  const { data: products = [], isLoading } = useGetProductsQuery();
  const { data: categories = [] } = useGetCategoriesQuery();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [toggleActive, { isLoading: isToggling }] = useToggleProductActiveMutation();

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

  const tableData = useMemo(
    () =>
      products.map((p) => ({
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
            <Button
              variant={p.isActive ? "outline" : "default"}
              size="icon"
              onClick={async () => {
                const res = await toggleActive({ id: p.id });
                if (res?.data) {
                  toast.success("Product state updated");
                } else {
                  toast.error("Failed to update product");
                }
              }}
              disabled={isToggling}
              title={p.isActive ? "Disable" : "Activate"}
            >
              <Power className="h-4 w-4" />
            </Button>

            <ProductEditForm product={p} categoryOptions={categoryOptions} />

            <Button
              variant="destructive"
              size="icon"
              onClick={async () => {
                if (!confirm(`Delete product "${p.name ?? p.title}"?`)) return;
                const res = await deleteProduct(p.id);
                if (res?.data) {
                  toast.success("Product deleted");
                } else {
                  toast.error("Failed to delete product");
                }
              }}
              disabled={isDeleting}
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      })),
    [products, deleteProduct, toggleActive, isDeleting, isToggling, categoryOptions]
  );

  return (
    <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Products</h3>
        <ProductForm categoryOptions={categoryOptions} />
      </div>

      <ReusableTable
        data={tableData}
        headers={headers}
        total={products.length}
        isLoading={isLoading}
        py="py-2"
      />
    </div>
  );
};

export default ProductsPage;