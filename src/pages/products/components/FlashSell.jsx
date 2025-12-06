import React, { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import TextField from "@/components/input/TextField";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    useSetFlashSellMutation,
    useRemoveFlashSellMutation,
    useGetActiveFlashSellProductsQuery,
} from "@/features/product/productApiSlice";
import { Zap, X } from "lucide-react";

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

function FlashSell({ products = [], categoryOptions = [] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isRemoveMode, setIsRemoveMode] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const { data: activeFlashProducts = [] } = useGetActiveFlashSellProductsQuery();

    const { control, handleSubmit, reset, formState: { errors }, watch, setValue } = useForm({
        resolver: yupResolver(flashSellSchema),
        defaultValues: {
            productIds: [],
            flashSellStartTime: "",
            flashSellEndTime: "",
            flashSellPrice: "",
        },
    });

    const [setFlashSell, { isLoading: isSetting }] = useSetFlashSellMutation();
    const [removeFlashSell, { isLoading: isRemoving }] = useRemoveFlashSellMutation();

    const flashSellStartTime = watch("flashSellStartTime");
    const flashSellEndTime = watch("flashSellEndTime");

    // Get products that are currently on flash sell
    const activeFlashProductIds = useMemo(
        () => activeFlashProducts.map((p) => p.id),
        [activeFlashProducts]
    );

    // Filter products - show only active products
    const availableProducts = useMemo(
        () => products.filter((p) => p.isActive),
        [products]
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
            if (isRemoveMode) {
                const res = await removeFlashSell({ productIds: selectedProducts }).unwrap();
                if (res) {
                    toast.success("Flash sell removed from selected products");
                    reset();
                    setSelectedProducts([]);
                    setIsOpen(false);
                    setIsRemoveMode(false);
                }
            } else {
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
                    setIsOpen(false);
                }
            }
        } catch (error) {
            toast.error(error?.data?.message || error?.message || "Failed to update flash sell");
        }
    };

    const handleOpenChange = (open) => {
        setIsOpen(open);
        if (!open) {
            reset();
            setSelectedProducts([]);
            setIsRemoveMode(false);
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

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/20"
                >
                    <Zap className="h-4 w-4" />
                    Flash Sell
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isRemoveMode ? "Remove Flash Sell" : "Set Flash Sell"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-4">
                    {!isRemoveMode ? (
                        <>
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
                            <div className="max-h-[200px] overflow-y-auto border border-black/10 dark:border-white/10 rounded-lg p-2">
                                {availableProducts.length === 0 ? (
                                    <p className="text-sm text-black/50 dark:text-white/50 p-4 text-center">
                                        No active products available
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {availableProducts.map((product) => {
                                            const isSelected = selectedProducts.includes(product.id);
                                            const isOnFlash = activeFlashProductIds.includes(product.id);
                                            return (
                                                <div
                                                    key={product.id}
                                                    className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${isSelected
                                                        ? "bg-green-500/10 border border-green-500/20"
                                                        : "hover:bg-black/5 dark:hover:bg-white/5"
                                                        } ${isOnFlash ? "border-l-4 border-l-yellow-500" : ""}`}
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
                                                        {isOnFlash && (
                                                            <span className="ml-2 text-xs text-yellow-600 dark:text-yellow-400">
                                                                (Currently on flash sell)
                                                            </span>
                                                        )}
                                                        <div className="text-xs text-black/50 dark:text-white/50">
                                                            ${typeof product.price === "number" ? product.price.toFixed(2) : product.price}
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

                            <Controller
                                name="flashSellStartTime"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        label="Start Time *"
                                        type="datetime-local"
                                        value={field.value}
                                        onChange={field.onChange}
                                        error={errors.flashSellStartTime}
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
                                        error={errors.flashSellEndTime}
                                        min={flashSellStartTime || minDateTime}
                                    />
                                )}
                            />

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
                                        error={errors.flashSellPrice}
                                    />
                                )}
                            />
                        </>
                    ) : (
                        <>
                            <p className="text-sm text-black/70 dark:text-white/70 mb-2">
                                Select products to remove from flash sell:
                            </p>
                            <div className="max-h-[300px] overflow-y-auto border border-black/10 dark:border-white/10 rounded-lg p-2">
                                {activeFlashProducts.length === 0 ? (
                                    <p className="text-sm text-black/50 dark:text-white/50 p-4 text-center">
                                        No products currently on flash sell
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {activeFlashProducts.map((product) => {
                                            const isSelected = selectedProducts.includes(product.id);
                                            return (
                                                <div
                                                    key={product.id}
                                                    className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${isSelected
                                                        ? "bg-red-500/10 border border-red-500/20"
                                                        : "hover:bg-black/5 dark:hover:bg-white/5"
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
                                                        <div className="text-xs text-black/50 dark:text-white/50">
                                                            Flash Price: ${product.flashSellPrice?.toFixed(2) || product.price?.toFixed(2)}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </>
                    )}


                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                                setIsRemoveMode(!isRemoveMode);
                                setSelectedProducts([]);
                                reset();
                            }}
                            className="text-sm"
                        >
                            {isRemoveMode ? "Switch to Set Flash Sell" : "Switch to Remove Flash Sell"}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            className="bg-red-500 hover:bg-red-600 text-white"
                            onClick={() => handleOpenChange(false)}
                            disabled={isSetting || isRemoving}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSetting || isRemoving || selectedProducts.length === 0}
                        >
                            {isSetting || isRemoving
                                ? isRemoveMode
                                    ? "Removing..."
                                    : "Setting..."
                                : isRemoveMode
                                    ? "Remove Flash Sell"
                                    : "Set Flash Sell"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default FlashSell;

