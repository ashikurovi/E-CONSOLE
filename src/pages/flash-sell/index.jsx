import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import ReusableTable from "@/components/table/reusable-table";
import { Button } from "@/components/ui/button";
import { Eye, Zap, X, ArrowLeft, Download } from "lucide-react";
import TextField from "@/components/input/TextField";
import {
  useGetActiveFlashSellProductsQuery,
  useSetFlashSellMutation,
  useRemoveFlashSellMutation,
  useGetProductsQuery,
} from "@/features/product/productApiSlice";
import { useSelector } from "react-redux";
import DeleteModal from "@/components/modals/DeleteModal";
import { exportFlashSellToPDF } from "@/utils/pdfExport";

const flashSellSchema = yup.object().shape({
  productIds: yup
    .array()
    .of(yup.number())
    .min(1, "At least one product must be selected")
    .required("Products are required"),
  flashSellStartTime: yup
    .string()
    .required("Start time is required"),
  flashSellEndTime: yup
    .string()
    .required("End time is required")
    .test("is-after-start", "End time must be after start time", function (value) {
      const { flashSellStartTime } = this.parent;
      if (!value || !flashSellStartTime) return true;
      return new Date(value) > new Date(flashSellStartTime);
    }),
  flashSellPrice: yup
    .number()
    .positive("Price must be positive")
    .nullable(),
});

const FlashSellPage = () => {
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);
  const [activeTab, setActiveTab] = useState("list"); // "list" or "add"
  
  const { data: flashSellProducts = [], isLoading } = useGetActiveFlashSellProductsQuery(
    { companyId: authUser?.companyId },
    { skip: !authUser?.companyId }
  );
  const { data: allProducts = [] } = useGetProductsQuery(
    { companyId: authUser?.companyId },
    { skip: !authUser?.companyId }
  );
  const [setFlashSell, { isLoading: isSetting }] = useSetFlashSellMutation();
  const [removeFlashSell, { isLoading: isRemoving }] = useRemoveFlashSellMutation();
  
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, product: null });

  const { control, handleSubmit, reset, formState: { errors }, watch, setValue } = useForm({
    resolver: yupResolver(flashSellSchema),
    defaultValues: {
      productIds: [],
      flashSellStartTime: "",
      flashSellEndTime: "",
      flashSellPrice: "",
    },
  });

  const flashSellStartTime = watch("flashSellStartTime");
  const flashSellEndTime = watch("flashSellEndTime");

  // Get products that are currently on flash sell
  const activeFlashProductIds = useMemo(
    () => flashSellProducts.map((p) => p.id),
    [flashSellProducts]
  );

  // Filter products - show only active, published products that are not already on flash sell
  const availableProducts = useMemo(
    () => allProducts.filter((p) => 
      p.isActive && 
      p.status === 'published' && 
      !activeFlashProductIds.includes(p.id)
    ),
    [allProducts, activeFlashProductIds]
  );

  const headers = useMemo(
    () => [
      { header: "Product Name", field: "name" },
      { header: "SKU", field: "sku" },
      { header: "Regular Price", field: "regularPrice" },
      { header: "Flash Price", field: "flashPrice" },
      { header: "Discount", field: "discount" },
      { header: "Start Time", field: "startTime" },
      { header: "End Time", field: "endTime" },
      { header: "Status", field: "status" },
      { header: "Actions", field: "actions" },
    ],
    []
  );

  const tableData = useMemo(
    () =>
      flashSellProducts.map((product) => {
        const regularPrice = product.price || 0;
        const flashPrice = product.flashSellPrice || product.price || 0;
        const discount = regularPrice > 0 
          ? (((regularPrice - flashPrice) / regularPrice) * 100).toFixed(0)
          : 0;
        
        const now = new Date();
        const startTime = product.flashSellStartTime ? new Date(product.flashSellStartTime) : null;
        const endTime = product.flashSellEndTime ? new Date(product.flashSellEndTime) : null;
        
        let status = "Scheduled";
        if (startTime && endTime) {
          if (now < startTime) {
            status = "Scheduled";
          } else if (now >= startTime && now <= endTime) {
            status = "Active";
          } else {
            status = "Expired";
          }
        }

        return {
          name: product.name || "-",
          sku: product.sku || "-",
          regularPrice: `$${regularPrice.toFixed(2)}`,
          flashPrice: `$${flashPrice.toFixed(2)}`,
          discount: `${discount}%`,
          startTime: startTime ? startTime.toLocaleString() : "-",
          endTime: endTime ? endTime.toLocaleString() : "-",
          status: (
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                status === "Active"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                  : status === "Scheduled"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
              }`}
            >
              {status}
            </span>
          ),
          actions: (
            <div className="flex items-center gap-2 justify-end">
              <Button
                variant="ghost"
                size="icon"
                className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400"
                onClick={() => navigate(`/products/${product.id}`)}
                title="View Product"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteModal({ isOpen: true, product })}
                disabled={isRemoving}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400"
                title="Remove from Flash Sell"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ),
        };
      }),
    [flashSellProducts, navigate, isRemoving]
  );

  const handleProductToggle = (productId) => {
    setSelectedProducts((prev) => {
      const newSelection = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
      setValue("productIds", newSelection);
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === availableProducts.length) {
      const empty = [];
      setSelectedProducts(empty);
      setValue("productIds", empty);
    } else {
      const allIds = availableProducts.map((p) => p.id);
      setSelectedProducts(allIds);
      setValue("productIds", allIds);
    }
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        productIds: selectedProducts.length > 0 ? selectedProducts : data.productIds,
        flashSellStartTime: data.flashSellStartTime,
        flashSellEndTime: data.flashSellEndTime,
        ...(data.flashSellPrice ? { flashSellPrice: parseFloat(data.flashSellPrice) } : {}),
      };

      const res = await setFlashSell(payload).unwrap();
      if (res) {
        toast.success("Flash sell set for selected products");
        reset();
        setSelectedProducts([]);
        setActiveTab("list");
      }
    } catch (error) {
      toast.error(error?.data?.message || error?.message || "Failed to set flash sell");
    }
  };

  const handleRemoveFlashSell = async () => {
    if (!deleteModal.product) return;
    
    try {
      const res = await removeFlashSell({ productIds: [deleteModal.product.id] }).unwrap();
      if (res) {
        toast.success("Product removed from flash sell");
        setDeleteModal({ isOpen: false, product: null });
      }
    } catch (error) {
      toast.error(error?.data?.message || error?.message || "Failed to remove flash sell");
    }
  };

  // Format datetime-local value from Date
  const getDateTimeLocal = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Get minimum datetime (now)
  const minDateTime = getDateTimeLocal(new Date());

  const handleExportToPDF = () => {
    exportFlashSellToPDF(flashSellProducts, "Flash_Sell_Products");
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/products")}
          className="bg-black dark:bg-black hover:bg-black/80 dark:hover:bg-black/80 text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h3 className="text-lg font-medium">Flash Sell Management</h3>
          <p className="text-sm text-black/60 dark:text-white/60 mt-1">
            Manage flash sell promotions for your products
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex items-center justify-between border-b border-black/10 dark:border-white/10">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("list")}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === "list"
                ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
            }`}
          >
            Flash Sell List ({flashSellProducts.length})
          </button>
          <button
            onClick={() => setActiveTab("add")}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === "add"
                ? "border-b-2 border-yellow-500 text-yellow-600 dark:text-yellow-400"
                : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
            }`}
          >
            Add Flash Sell
          </button>
        </div>
        {activeTab === "list" && flashSellProducts.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportToPDF}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export to PDF
          </Button>
        )}
      </div>

      {activeTab === "list" ? (
        <ReusableTable
          data={tableData}
          headers={headers}
          total={flashSellProducts.length}
          isLoading={isLoading}
          py="py-2"
        />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Product Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-black/70 dark:text-white/70">
                Select Products *
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="text-xs"
              >
                {selectedProducts.length === availableProducts.length ? "Deselect All" : "Select All"}
              </Button>
            </div>
            <div className="max-h-[300px] overflow-y-auto border border-black/10 dark:border-white/10 rounded-lg p-4">
              {availableProducts.length === 0 ? (
                <p className="text-sm text-black/50 dark:text-white/50 p-4 text-center">
                  No available products. All active products may already be on flash sell.
                </p>
              ) : (
                <div className="space-y-2">
                  {availableProducts.map((product) => {
                    const isSelected = selectedProducts.includes(product.id);
                    return (
                      <div
                        key={product.id}
                        className={`flex items-center gap-2 p-3 rounded cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-green-500/10 border border-green-500/20"
                            : "hover:bg-black/5 dark:hover:bg-white/5 border border-transparent"
                        }`}
                        onClick={() => handleProductToggle(product.id)}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleProductToggle(product.id)}
                          className="cursor-pointer"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium">
                            {product.name || product.title}
                          </span>
                          <div className="text-xs text-black/50 dark:text-white/50 mt-1">
                            Price: ${typeof product.price === "number" ? product.price.toFixed(2) : product.price} | 
                            Stock: {product.stock ?? 0} | 
                            SKU: {product.sku || "N/A"}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {errors.productIds && (
              <span className="text-red-500 text-xs ml-1">{errors.productIds.message}</span>
            )}
          </div>

          {/* Time and Price Fields */}
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="flashSellStartTime"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Start Time *"
                  type="datetime-local"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.flashSellStartTime?.message}
                  min={minDateTime}
                />
              )}
            />

            <Controller
              name="flashSellEndTime"
              control={control}
              render={({ field }) => (
                <TextField
                  label="End Time *"
                  type="datetime-local"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.flashSellEndTime?.message}
                  min={flashSellStartTime || minDateTime}
                />
              )}
            />
          </div>

          <Controller
            name="flashSellPrice"
            control={control}
            render={({ field }) => (
              <TextField
                label="Flash Price (optional)"
                placeholder="Leave empty to use product price"
                type="number"
                step="0.01"
                value={field.value}
                onChange={field.onChange}
                error={errors.flashSellPrice?.message}
              />
            )}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-black/10 dark:border-white/10">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                reset();
                setSelectedProducts([]);
                setActiveTab("list");
              }}
              disabled={isSetting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSetting || selectedProducts.length === 0}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              {isSetting ? "Setting..." : "Set Flash Sell"}
            </Button>
          </div>
        </form>
      )}

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, product: null })}
        onConfirm={handleRemoveFlashSell}
        title="Remove from Flash Sell"
        description="This will remove the product from flash sell. The product will remain active but won't be on flash sell anymore."
        itemName={deleteModal.product?.name || deleteModal.product?.title}
        isLoading={isRemoving}
      />
    </div>
  );
};

export default FlashSellPage;
