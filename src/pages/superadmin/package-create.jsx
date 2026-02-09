import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import TextField from "@/components/input/TextField";
import {
    useCreatePackageMutation
} from "@/features/package/packageApiSlice";
import { useGetThemesQuery } from "@/features/theme/themeApiSlice";
import {
    ArrowLeft,
    Package,
    Plus,
    CheckCircle2
} from "lucide-react";

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

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4 },
    },
};

const PackageCreatePage = () => {
    const navigate = useNavigate();
    
    const [createPackage, { isLoading: isCreating }] = useCreatePackageMutation();
    const { data: themes = [], isLoading: isLoadingThemes } = useGetThemesQuery();
    
    const [features, setFeatures] = useState([]);
    const [isFeatured, setIsFeatured] = useState(false);
    const [themeId, setThemeId] = useState("");

    const {
        register,
        handleSubmit,
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
            features,
            ...(themeId && { themeId: parseInt(themeId) }),
        };

        const res = await createPackage(payload);
        if (res?.data) {
            toast.success("Package created successfully");
            navigate("/superadmin/packages");
        } else {
            toast.error(res?.error?.data?.message || "Failed to create package");
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-5xl mx-auto space-y-6 p-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigate("/superadmin/packages")}
                        className="rounded-full h-10 w-10 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    </Button>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            Create Package
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
                            Add a new subscription package to your platform
                        </p>
                    </div>
                </div>
                <Button
                    onClick={handleSubmit(onSubmit)}
                    disabled={isCreating}
                    className="rounded-xl bg-violet-600 text-white hover:bg-violet-700 shadow-lg shadow-violet-500/20"
                >
                    {isCreating ? (
                        <>
                            <div className="w-4 h-4 mr-2 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                            Creating...
                        </>
                    ) : (
                        <>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Package
                        </>
                    )}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Form Column */}
                <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <Package className="w-5 h-5 text-violet-500" />
                            Package Information
                        </h2>
                        <div className="space-y-6">
                            <TextField
                                label="Package Name *"
                                placeholder="e.g., Basic, Premium, Enterprise"
                                register={register}
                                name="name"
                                error={errors.name}
                            />
                            
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Description *
                                </label>
                                <textarea
                                    {...register("description")}
                                    placeholder="Describe the package features and benefits"
                                    className="w-full min-h-[120px] px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all resize-y"
                                />
                                {errors.description && (
                                    <span className="text-red-500 text-xs ml-1">
                                        {errors.description.message}
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                            <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                                <input
                                    type="checkbox"
                                    id="isFeatured"
                                    className="w-5 h-5 rounded border-amber-400 text-amber-600 focus:ring-amber-500 cursor-pointer"
                                    checked={isFeatured}
                                    onChange={(e) => setIsFeatured(e.target.checked)}
                                />
                                <label
                                    htmlFor="isFeatured"
                                    className="text-sm font-medium text-amber-900 dark:text-amber-100 cursor-pointer select-none"
                                >
                                    Mark as Featured Package
                                    <p className="text-xs font-normal text-amber-700 dark:text-amber-300 mt-0.5">
                                        Featured packages are highlighted to customers
                                    </p>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            Included Features
                        </h2>
                        <div className="space-y-4">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Select the features included in this package ({features.length} selected)
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {AVAILABLE_FEATURES.map((feature) => (
                                    <label
                                        key={feature}
                                        className={`
                                            flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200
                                            ${features.includes(feature)
                                                ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800"
                                                : "bg-white border-slate-200 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:hover:border-slate-700"
                                            }
                                        `}
                                    >
                                        <div className={`
                                            w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors
                                            ${features.includes(feature)
                                                ? "bg-emerald-500 border-emerald-500"
                                                : "bg-transparent border-slate-300 dark:border-slate-600"
                                            }
                                        `}>
                                            {features.includes(feature) && (
                                                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                            )}
                                        </div>
                                        <span className={`text-sm font-medium ${
                                            features.includes(feature)
                                                ? "text-emerald-900 dark:text-emerald-100"
                                                : "text-slate-600 dark:text-slate-300"
                                        }`}>
                                            {getFeatureDisplayName(feature)}
                                        </span>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={features.includes(feature)}
                                            onChange={() => toggleFeature(feature)}
                                        />
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Sidebar Column */}
                <motion.div variants={itemVariants} className="space-y-6">
                    <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 sticky top-6">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
                            Configuration
                        </h2>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Theme Selection (Optional)
                                </label>
                                <div className="relative">
                                    <select
                                        value={themeId}
                                        onChange={(e) => setThemeId(e.target.value)}
                                        className="w-full appearance-none px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all pr-10"
                                        disabled={isLoadingThemes}
                                    >
                                        <option value="">Select a theme</option>
                                        {themes.map((theme) => (
                                            <option key={theme.id} value={theme.id}>
                                                {theme.domainUrl || `Theme #${theme.id}`}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Assign a specific theme layout to this package
                                </p>
                            </div>

                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                <Button
                                    onClick={handleSubmit(onSubmit)}
                                    disabled={isCreating}
                                    className="w-full rounded-xl bg-violet-600 text-white hover:bg-violet-700 shadow-lg shadow-violet-500/20 py-6"
                                >
                                    {isCreating ? "Creating Package..." : "Create Package"}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => navigate("/superadmin/packages")}
                                    className="w-full mt-3 rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 py-6 text-slate-600 dark:text-slate-400"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default PackageCreatePage;
