import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
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

const FlashSellPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);
  const [activeTab, setActiveTab] = useState("list"); // "list" or "add"

  const flashSellSchema = useMemo(
    () =>
      yup.object().shape({
        productIds: yup
          .array()
          .of(yup.number())
          .min(1, t("flashSell.validation.atLeastOneProduct"))
          .required(t("flashSell.validation.productsRequired")),
        flashSellStartTime: yup
          .string()
          .required(t("flashSell.validation.startTimeRequired")),
        flashSellEndTime: yup
          .string()
          .required(t("flashSell.validation.endTimeRequired"))
          .test("is-after-start", t("flashSell.validation.endTimeAfterStart"), function (value) {
            const { flashSellStartTime } = this.parent;
            if (!value || !flashSellStartTime) return true;
            return new Date(value) > new Date(flashSellStartTime);
          }),
        flashSellPrice: yup
          .number()
          .positive(t("flashSell.validation.pricePositive"))
          .nullable(),
      }),
    [t]
  );
  
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
      { header: t("flashSell.productName"), field: "name" },
      { header: t("products.sku"), field: "sku" },
      { header: t("flashSell.regularPrice"), field: "regularPrice" },
      { header: t("flashSell.flashPrice"), field: "flashPrice" },
      { header: t("flashSell.discount"), field: "discount" },
      { header: t("flashSell.startTime"), field: "startTime" },
      { header: t("flashSell.endTime"), field: "endTime" },
      { header: t("common.status"), field: "status" },
      { header: t("common.actions"), field: "actions" },
    ],
    [t]
  );

  const tableData = useMemo(
    () =>
      flashSellProducts.map((product) => {
        const regularPrice = parseFloat(product.price) || 0;
        const flashPrice = parseFloat(product.flashSellPrice ?? product.price) || 0;
        const discount = regularPrice > 0 
          ? (((regularPrice - flashPrice) / regularPrice) * 100).toFixed(0)
          : 0;
        
        const now = new Date();
        const startTime = product.flashSellStartTime ? new Date(product.flashSellStartTime) : null;
        const endTime = product.flashSellEndTime ? new Date(product.flashSellEndTime) : null;
        
        let status = t("flashSell.scheduled");
        if (startTime && endTime) {
          if (now < startTime) {
            status = t("flashSell.scheduled");
          } else if (now >= startTime && now <= endTime) {
            status = t("common.active");
          } else {
            status = t("flashSell.expired");
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
                status === t("common.active")
                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                  : status === t("flashSell.scheduled")
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
                title={t("flashSell.viewProduct")}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteModal({ isOpen: true, product })}
                disabled={isRemoving}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400"
                title={t("flashSell.removeFromFlashSell")}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ),
        };
      }),
    [flashSellProducts, navigate, isRemoving, t]
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
        toast.success(t("flashSell.flashSellSetSuccess"));
        reset();
        setSelectedProducts([]);
        setActiveTab("list");
      }
    } catch (error) {
      toast.error(error?.data?.message || error?.message || t("flashSell.flashSellSetFailed"));
    }
  };

  const handleRemoveFlashSell = async () => {
    if (!deleteModal.product) return;
    
    try {
      const res = await removeFlashSell({ productIds: [deleteModal.product.id] }).unwrap();
      if (res) {
        toast.success(t("flashSell.productRemovedFromFlashSell"));
        setDeleteModal({ isOpen: false, product: null });
      }
    } catch (error) {
      toast.error(error?.data?.message || error?.message || t("flashSell.flashSellRemoveFailed"));
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
          <h3 className="text-lg font-medium">{t("flashSell.title")}</h3>
          <p className="text-sm text-black/60 dark:text-white/60 mt-1">
            {t("flashSell.description")}
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
            {t("flashSell.flashSellList")} ({flashSellProducts.length})
          </button>
          <button
            onClick={() => setActiveTab("add")}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === "add"
                ? "border-b-2 border-yellow-500 text-yellow-600 dark:text-yellow-400"
                : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
            }`}
          >
            {t("flashSell.addFlashSell")}
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
            {t("flashSell.exportToPdf")}
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
                {t("flashSell.selectProducts")}
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="text-xs"
              >
                {selectedProducts.length === availableProducts.length ? t("flashSell.deselectAll") : t("flashSell.selectAll")}
              </Button>
            </div>
            <div className="max-h-[300px] overflow-y-auto border border-black/10 dark:border-white/10 rounded-lg p-4">
              {availableProducts.length === 0 ? (
                <p className="text-sm text-black/50 dark:text-white/50 p-4 text-center">
                  {t("flashSell.noAvailableProducts")}
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
                            {t("products.price")}: ${typeof product.price === "number" ? product.price.toFixed(2) : product.price} | 
                            {t("products.stock")}: {product.stock ?? 0} | 
                            {t("products.sku")}: {product.sku || t("common.na")}
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
                  label={t("flashSell.startTimeRequired")}
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
                  label={t("flashSell.endTimeRequired")}
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
                label={t("flashSell.flashPriceOptional")}
                placeholder={t("flashSell.flashPricePlaceholder")}
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
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isSetting || selectedProducts.length === 0}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              {isSetting ? t("flashSell.setting") : t("flashSell.setFlashSell")}
            </Button>
          </div>
        </form>
      )}

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, product: null })}
        onConfirm={handleRemoveFlashSell}
        title={t("flashSell.removeFromFlashSellTitle")}
        description={t("flashSell.removeFromFlashSellDesc")}
        itemName={deleteModal.product?.name || deleteModal.product?.title}
        isLoading={isRemoving}
      />
    </div>
  );
};

export default FlashSellPage;
