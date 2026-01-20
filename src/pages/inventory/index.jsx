import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import ReusableTable from "@/components/table/reusable-table";
import { Button } from "@/components/ui/button";
import { Trash2, Download, X } from "lucide-react";
import {
  useGetInventoryQuery,
  useDeleteInventoryMutation,
} from "@/features/inventory/inventoryApiSlice";
import { useGetProductsQuery } from "@/features/product/productApiSlice";
import InventoryForm from "./components/InventoryForm";
import InventoryEditForm from "./components/InventoryEditForm";
import DeleteModal from "@/components/modals/DeleteModal";
import Dropdown from "@/components/dropdown/dropdown";
import { exportToExcel } from "@/utils/excelExport";
import { useSelector } from "react-redux";

const InventoryPage = () => {
  const authUser = useSelector((state) => state.auth.user);
  const { data: inventory = [], isLoading } = useGetInventoryQuery({ companyId: authUser?.companyId });
  const { data: products = [] } = useGetProductsQuery({ companyId: authUser?.companyId });
  const [deleteInventory, { isLoading: isDeleting }] = useDeleteInventoryMutation();
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null });
  const [selectedProduct, setSelectedProduct] = useState(null);

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

  // Add "All Products" option to filter dropdown
  const filterProductOptions = useMemo(
    () => [
      { label: "All Products", value: null },
      ...productOptions,
    ],
    [productOptions]
  );

  // Filter inventory by selected product
  const filteredInventory = useMemo(() => {
    if (!selectedProduct?.value) return inventory;
    return inventory.filter((inv) => {
      const productId = inv?.product?.id ?? inv?.productId;
      return productId === selectedProduct.value;
    });
  }, [inventory, selectedProduct]);

  const tableData = useMemo(
    () =>
      filteredInventory.map((inv) => ({
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
              variant="ghost"
              size="icon"
              onClick={() => setDeleteModal({ isOpen: true, item: inv })}
              disabled={isDeleting}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      })),
    [filteredInventory, isDeleting, productOptions]
  );

  const handleDelete = async () => {
    if (!deleteModal.item) return;
    const res = await deleteInventory(deleteModal.item.id);
    if (res?.data) {
      toast.success("Inventory deleted");
      setDeleteModal({ isOpen: false, item: null });
    } else {
      toast.error(res?.error?.data?.message || "Failed to delete inventory");
    }
  };

  const handleExportToExcel = () => {
    const dataMapper = (inv) => ({
      Product: inv?.product?.name ?? inv?.product?.title ?? "-",
      Stock: inv?.stock ?? 0,
      Sold: inv?.sold ?? 0,
      Income: typeof inv?.totalIncome === "number"
        ? Number(inv.totalIncome).toFixed(2)
        : Number(inv?.totalIncome || 0).toFixed(2),
      "Low Stock": inv?.isLowStock ? "Yes" : "No",
    });

    const columnWidths = [
      { wch: 30 }, // Product
      { wch: 12 }, // Stock
      { wch: 12 }, // Sold
      { wch: 15 }, // Income
      { wch: 12 }, // Low Stock
    ];

    exportToExcel({
      data: filteredInventory,
      fileName: "Inventory",
      sheetName: "Inventory",
      columnWidths,
      dataMapper,
      successMessage: `Exported ${filteredInventory.length} inventory item${filteredInventory.length === 1 ? "" : "s"} to Excel`,
    });
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Inventory</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportToExcel}
            className="flex items-center gap-2"
            disabled={filteredInventory.length === 0}
          >
            <Download className="h-4 w-4" />
            Export to Excel
          </Button>
          <InventoryForm productOptions={productOptions} existingInventory={inventory} />
        </div>
      </div>

      {/* Filter Section */}
      <div className="mb-4 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-black/70 dark:text-white/70">
            Filter by Product:
          </label>
          <div className="min-w-[200px]">
            <Dropdown
              name="Product"
              options={filterProductOptions}
              setSelectedOption={setSelectedProduct}
              className="py-2"
            >
              {selectedProduct?.label || (
                <span className="text-black/50 dark:text-white/50">All Products</span>
              )}
            </Dropdown>
          </div>
        </div>
        {selectedProduct && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedProduct(null)}
            className="flex items-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <X className="h-4 w-4" />
            Clear Filter
          </Button>
        )}
        {selectedProduct && (
          <span className="text-sm text-black/60 dark:text-white/60">
            Showing {filteredInventory.length} of {inventory.length} inventory items
          </span>
        )}
      </div>

      <ReusableTable
        data={tableData}
        headers={headers}
        total={filteredInventory.length}
        isLoading={isLoading}
        py="py-2"
      />

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, item: null })}
        onConfirm={handleDelete}
        title="Delete Inventory"
        description="This action cannot be undone. This will permanently delete the inventory record."
        itemName={deleteModal.item?.product?.name || deleteModal.item?.product?.title}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default InventoryPage;