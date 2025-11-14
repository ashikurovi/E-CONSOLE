import React, { useMemo } from "react";
import toast from "react-hot-toast";
import ReusableTable from "@/components/table/reusable-table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  useGetInventoryQuery,
  useDeleteInventoryMutation,
} from "@/features/inventory/inventoryApiSlice";
import { useGetProductsQuery } from "@/features/product/productApiSlice";
import InventoryForm from "./components/InventoryForm";
import InventoryEditForm from "./components/InventoryEditForm";

const InventoryPage = () => {
  const { data: inventory = [], isLoading } = useGetInventoryQuery();
  const { data: products = [] } = useGetProductsQuery();
  const [deleteInventory, { isLoading: isDeleting }] = useDeleteInventoryMutation();

  const headers = useMemo(
    () => [
      { header: "Product", field: "productName" },
      { header: "Stock", field: "stock" },
      { header: "Sold", field: "sold" },
      { header: "Income", field: "income" },
      { header: "Low Stock", field: "lowStock" },
      { header: "Actions", field: "actions" },
    ],
    []
  );

  const productOptions = useMemo(
    () =>
      products.map((p) => ({
        label: p.name ?? p.title ?? `#${p.id}`,
        value: p.id,
      })),
    [products]
  );

  const tableData = useMemo(
    () =>
      inventory.map((inv) => ({
        productName: inv?.product?.name ?? inv?.product?.title ?? "-",
        stock: inv?.stock ?? 0,
        sold: inv?.sold ?? 0,
        income:
          typeof inv?.totalIncome === "number"
            ? `$${Number(inv.totalIncome).toFixed(2)}`
            : `$${Number(inv?.totalIncome || 0).toFixed(2)}`,
        lowStock: inv?.isLowStock ? "Yes" : "No",
        actions: (
          <div className="flex items-center gap-2 justify-end">
            <InventoryEditForm item={inv} productOptions={productOptions} />
            <Button
              variant="destructive"
              size="icon"
              onClick={async () => {
                if (!confirm(`Delete inventory for "${inv?.product?.name ?? inv?.product?.title}"?`)) return;
                const res = await deleteInventory(inv.id);
                if (res?.data) {
                  toast.success("Inventory deleted");
                } else {
                  toast.error("Failed to delete inventory");
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
    [inventory, deleteInventory, isDeleting, productOptions]
  );

  return (
    <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Inventory</h3>
        <InventoryForm productOptions={productOptions} />
      </div>

      <ReusableTable
        data={tableData}
        headers={headers}
        total={inventory.length}
        isLoading={isLoading}
        py="py-2"
      />
    </div>
  );
};

export default InventoryPage;