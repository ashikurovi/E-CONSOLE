import React, { useState } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

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
import { useCreatePackageMutation } from "@/features/package/packageApiSlice";
import { useGetThemesQuery } from "@/features/theme/themeApiSlice";

const FEATURE_DISPLAY_NAMES = {
    PATHAO: "Pathao Courier",
    STEARDFAST: "Steadfast Courier",
    REDX: "RedX Courier",
};

const getFeatureDisplayName = (feature) =>
    FEATURE_DISPLAY_NAMES[feature] || feature.replace(/_/g, " ");

const AVAILABLE_FEATURES = [
    "PRODUCTS",
    "ORDERS",
    "STEARDFAST",
    "PATHAO",
    "REDX",
    "NOTIFICATIONS",
    "EMAIL_NOTIFICATIONS",
    "WHATSAPP_NOTIFICATIONS",
    "SMS_NOTIFICATIONS",
    "ORDERS_ITEM",
    "CATEGORY",
    "CUSTOMERS",
    "REPORTS",
    "SETTINGS",
    "STAFF",
    "SMS_CONFIGURATION",
    "EMAIL_CONFIGURATION",
    "PAYMENT_METHODS",
    "PAYMENT_GATEWAYS",
    "PAYMENT_STATUS",
    "PAYMENT_TRANSACTIONS",
    "PROMOCODES",
    "HELP",
    "BANNERS",
    "FRUAD_CHECKER",
    "MANAGE_USERS",
    "DASHBOARD",
    "REVENUE",
    "NEW_CUSTOMERS",
    "REPEAT_PURCHASE_RATE",
    "AVERAGE_ORDER_VALUE",
    "STATS",
    "LOG_ACTIVITY",
    "REVIEW",
    "PATHAO_COURIER",
    "STEADFAST_COURIER",
    "REDX_COURIER",
    "PATHAO_COURIER_CONFIGURATION",
    "STEADFAST_COURIER_CONFIGURATION",
    "REDX_COURIER_CONFIGURATION",
    "PATHAO_COURIER_CONFIGURATION",
    "STEADFAST_COURIER_CONFIGURATION",
    "REDX_COURIER_CONFIGURATION",
    "PATHAO_COURIER_CONFIGURATION",
    "STEADFAST_COURIER_CONFIGURATION",
    "REDX_COURIER_CONFIGURATION",
    
];

const schema = yup.object().shape({
    name: yup
        .string()
        .required("Package name is required")
        .min(2, "Name must be at least 2 characters"),
    description: yup
        .string()
        .required("Description is required")
        .min(10, "Description must be at least 10 characters"),
    price: yup
        .number()
        .required("Price is required")
        .positive("Price must be positive")
        .typeError("Price must be a number"),
    discountPrice: yup
        .number()
        .nullable()
        .positive("Discount price must be positive")
        .typeError("Discount price must be a number")
        .test("is-less-than-price", "Discount price must be less than price", function (value) {
            const { price } = this.parent;
            if (!value) return true;
            return value < price;
        }),
});

const PackageCreateForm = () => {
    const [open, setOpen] = useState(false);
    const [createPackage, { isLoading }] = useCreatePackageMutation();
    const { data: themes = [], isLoading: isLoadingThemes } = useGetThemesQuery();
    const [features, setFeatures] = useState(["DASHBOARD", "ORDERS", "PRODUCTS"]);
    const [isFeatured, setIsFeatured] = useState(false);
    const [themeId, setThemeId] = useState("");

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            name: "",
            description: "",
            price: "",
            discountPrice: "",
        },
    });

    const toggleFeature = (value) => {
        setFeatures((prev) =>
            prev.includes(value)
                ? prev.filter((f) => f !== value)
                : [...prev, value]
        );
    };

    const onSubmit = async (data) => {
        // Filter to only valid features before submit
        const validFeatures = features.filter((f) => AVAILABLE_FEATURES.includes(f));
        if (!validFeatures.length) {
            toast.error("Select at least one feature");
            return;
        }

        const payload = {
            name: data.name,
            description: data.description,
            price: parseFloat(data.price),
            discountPrice: data.discountPrice ? parseFloat(data.discountPrice) : null,
            isFeatured,
            features: validFeatures,
            ...(themeId && { themeId: parseInt(themeId) }),
        };

        const res = await createPackage(payload);
        if (res?.data) {
            toast.success("Package created successfully");
            reset();
            setFeatures(["DASHBOARD", "ORDERS", "PRODUCTS"]);
            setIsFeatured(false);
            setThemeId("");
            setOpen(false);
        } else {
            toast.error(res?.error?.data?.message || "Failed to create package");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">Add Package</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[600px] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Package</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <TextField
                        label="Package Name *"
                        placeholder="e.g., Basic, Premium, Enterprise"
                        register={register}
                        name="name"
                        error={errors.name}
                    />
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-black/70 dark:text-white/70">
                            Description *
                        </label>
                        <textarea
                            {...register("description")}
                            placeholder="Describe the package features and benefits"
                            className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1f26] focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20"
                        />
                        {errors.description && (
                            <span className="text-red-500 text-xs ml-1">
                                {errors.description.message}
                            </span>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <TextField
                            label="Price (BDT) *"
                            type="number"
                            step="0.01"
                            placeholder="999.00"
                            register={register}
                            name="price"
                            error={errors.price}
                        />
                        <TextField
                            label="Discount Price (BDT)"
                            type="number"
                            step="0.01"
                            placeholder="799.00"
                            register={register}
                            name="discountPrice"
                            error={errors.discountPrice}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isFeatured"
                            className="w-4 h-4 rounded border-black/20 dark:border-white/20"
                            checked={isFeatured}
                            onChange={(e) => setIsFeatured(e.target.checked)}
                        />
                        <label
                            htmlFor="isFeatured"
                            className="text-sm font-medium cursor-pointer"
                        >
                            Mark as Featured Package
                        </label>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-black/70 dark:text-white/70">
                            Theme (Optional)
                        </label>
                        <select
                            value={themeId}
                            onChange={(e) => setThemeId(e.target.value)}
                            className="w-full px-3 py-2 text-sm rounded-md border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1f26] focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20"
                            disabled={isLoadingThemes}
                        >
                            <option value="">Select a theme</option>
                            {themes.map((theme) => (
                                <option key={theme.id} value={theme.id}>
                                    {theme.domainUrl || `Theme #${theme.id}`}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-medium text-black/70 dark:text-white/70">
                            Features * (Select at least one)
                        </p>
                        <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto border border-gray-100 dark:border-gray-800 rounded-lg p-3">
                            {AVAILABLE_FEATURES.map((feature) => (
                                <label
                                    key={feature}
                                    className="flex items-center gap-2 text-sm cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-black/20 dark:border-white/20"
                                        checked={features.includes(feature)}
                                        onChange={() => toggleFeature(feature)}
                                    />
                                    <span>{getFeatureDisplayName(feature)}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400"
                        >
                            {isLoading ? "Creating..." : "Create Package"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default PackageCreateForm;
