import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { Button } from "@/components/ui/button";
import TextField from "@/components/input/TextField";
import Dropdown from "@/components/dropdown/dropdown";
import FileUpload from "@/components/input/FileUpload";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { useUpdateSystemuserMutation } from "@/features/systemuser/systemuserApiSlice";
import { useGetPackagesQuery } from "@/features/package/packageApiSlice";
import { useGetThemesQuery } from "@/features/theme/themeApiSlice";
import useImageUpload from "@/hooks/useImageUpload";

const PAYMENT_STATUS_OPTIONS = [
    { label: "Paid", value: "PAID" },
    { label: "Pending", value: "PENDING" },
    { label: "Failed", value: "FAILED" },
    { label: "Refunded", value: "REFUNDED" },
    { label: "Cancelled", value: "CANCELLED" },
];

const PAYMENT_METHOD_OPTIONS = [
    { label: "bKash", value: "BKASH" },
    { label: "Nagad", value: "NAGAD" },
    { label: "Rocket", value: "ROCKET" },
    { label: "Credit Card", value: "CREDIT_CARD" },
    { label: "Debit Card", value: "DEBIT_CARD" },
    { label: "Bank Transfer", value: "BANK_TRANSFER" },
    { label: "Cash on Delivery", value: "CASH_ON_DELIVERY" },
    { label: "Stripe", value: "STRIPE" },
    { label: "PayPal", value: "PAYPAL" },
    { label: "Other", value: "OTHER" },
];

const schema = yup.object().shape({
    name: yup
        .string()
        .required("Name is required")
        .min(2, "Name must be at least 2 characters"),
    companyName: yup
        .string()
        .required("Company name is required")
        .min(2, "Company name must be at least 2 characters"),
    email: yup
        .string()
        .required("Email is required")
        .email("Please enter a valid email address"),
    password: yup
        .string()
        .nullable()
        .transform((value, originalValue) =>
            originalValue === "" ? null : value
        )
        .test(
            "password-length",
            "Password must be at least 6 characters",
            (value) => !value || value.length >= 6
        ),
    companyLogo: yup.string().nullable(),
    phone: yup.string().nullable(),
    branchLocation: yup.string().nullable(),
    paymentstatus: yup.string(),
    paymentmethod: yup.string(),
    amount: yup.number().nullable(),
    packageId: yup.number().nullable(),
    themeId: yup.number().nullable(),
    // Pathao Config
    pathaoClientId: yup.string().nullable(),
    pathaoClientSecret: yup.string().nullable(),
    // Steadfast Config
    steadfastApiKey: yup.string().nullable(),
    steadfastSecretKey: yup.string().nullable(),
    // Notification Config
    notificationEmail: yup.string().email("Invalid email").nullable(),
    notificationWhatsapp: yup.string().nullable(),
});

const CustomerEditForm = ({ user, onClose }) => {
    const [updateSystemuser, { isLoading }] = useUpdateSystemuserMutation();
    const { data: packages, isLoading: isLoadingPackages } = useGetPackagesQuery();
    const { data: themes, isLoading: isLoadingThemes } = useGetThemesQuery();
    const [selectedPaymentStatus, setSelectedPaymentStatus] = useState(
        user?.paymentInfo?.paymentstatus
            ? PAYMENT_STATUS_OPTIONS.find((opt) => opt.value === user.paymentInfo.paymentstatus)
            : null
    );
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
        user?.paymentInfo?.paymentmethod
            ? PAYMENT_METHOD_OPTIONS.find((opt) => opt.value === user.paymentInfo.paymentmethod)
            : null
    );
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [selectedTheme, setSelectedTheme] = useState(null);
    const [isActive, setIsActive] = useState(user?.isActive ?? true);
    const [logoFile, setLogoFile] = useState(null);
    const { uploadImage, isUploading: isUploadingLogo } = useImageUpload();

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            id: user?.id,
            name: user?.name || "",
            companyName: user?.companyName || "",
            email: user?.email || "",
            password: "",
            companyLogo: user?.companyLogo || "",
            phone: user?.phone || "",
            branchLocation: user?.branchLocation || "",
            paymentstatus: user?.paymentInfo?.paymentstatus || "",
            paymentmethod: user?.paymentInfo?.paymentmethod || "",
            amount: user?.paymentInfo?.amount || "",
            packageId: user?.packageId || "",
            themeId: user?.themeId || "",
            pathaoClientId: user?.pathaoConfig?.clientId || "",
            pathaoClientSecret: user?.pathaoConfig?.clientSecret || "",
            steadfastApiKey: user?.steadfastConfig?.apiKey || "",
            steadfastSecretKey: user?.steadfastConfig?.secretKey || "",
            notificationEmail: user?.notificationConfig?.email || "",
            notificationWhatsapp: user?.notificationConfig?.whatsapp || "",
        },
    });

    // Convert packages to dropdown options
    const packageOptions = packages?.map((pkg) => ({
        label: pkg.name,
        value: pkg.id,
        features: pkg.features,
    })) || [];

    // Convert themes to dropdown options
    const themeOptions = themes?.map((theme) => ({
        label: theme.domainUrl || `Theme #${theme.id}`,
        value: theme.id,
    })) || [];

    useEffect(() => {
        if (!user || !packages || !themes) return;

        const paymentStatus = user?.paymentInfo?.paymentstatus
            ? PAYMENT_STATUS_OPTIONS.find((opt) => opt.value === user.paymentInfo.paymentstatus)
            : null;
        const paymentMethod = user?.paymentInfo?.paymentmethod
            ? PAYMENT_METHOD_OPTIONS.find((opt) => opt.value === user.paymentInfo.paymentmethod)
            : null;
        
        // Find package from API data
        const packageData = user?.packageId
            ? packages.find((pkg) => pkg.id === user.packageId)
            : null;
        const packageOption = packageData
            ? { label: packageData.name, value: packageData.id, features: packageData.features }
            : null;

        // Find theme from API data
        const themeData = user?.themeId
            ? themes.find((theme) => theme.id === user.themeId)
            : null;
        const themeOption = themeData
            ? { label: themeData.domainUrl || `Theme #${themeData.id}`, value: themeData.id }
            : null;

        setSelectedPaymentStatus(paymentStatus);
        setSelectedPaymentMethod(paymentMethod);
        setSelectedPackage(packageOption);
        setSelectedTheme(themeOption);
        setIsActive(user?.isActive ?? true);

        reset({
            id: user?.id,
            name: user?.name || "",
            companyName: user?.companyName || "",
            email: user?.email || "",
            password: "",
            companyLogo: user?.companyLogo || "",
            phone: user?.phone || "",
            branchLocation: user?.branchLocation || "",
            paymentstatus: user?.paymentInfo?.paymentstatus || "",
            paymentmethod: user?.paymentInfo?.paymentmethod || "",
            amount: user?.paymentInfo?.amount || "",
            packageId: user?.packageId || "",
            themeId: user?.themeId || "",
            pathaoClientId: user?.pathaoConfig?.clientId || "",
            pathaoClientSecret: user?.pathaoConfig?.clientSecret || "",
            steadfastApiKey: user?.steadfastConfig?.apiKey || "",
            steadfastSecretKey: user?.steadfastConfig?.secretKey || "",
            notificationEmail: user?.notificationConfig?.email || "",
            notificationWhatsapp: user?.notificationConfig?.whatsapp || "",
        });
        setLogoFile(null);
    }, [user, packages, themes, reset]);

    const onSubmit = async (data) => {
        // Upload logo if new file is selected
        let logoUrl = data.companyLogo || user?.companyLogo || null;
        if (logoFile) {
            logoUrl = await uploadImage(logoFile);
            if (!logoUrl) {
                toast.error("Failed to upload company logo");
                return;
            }
        }

        const paymentInfo = {
            ...(data.paymentstatus && { paymentstatus: data.paymentstatus }),
            ...(data.paymentmethod && { paymentmethod: data.paymentmethod }),
            ...(data.amount && { amount: parseFloat(data.amount) }),
            ...(selectedPackage && { packagename: selectedPackage.label }),
        };

        const pathaoConfig = {};
        if (data.pathaoClientId || data.pathaoClientSecret) {
            if (data.pathaoClientId) pathaoConfig.clientId = data.pathaoClientId;
            if (data.pathaoClientSecret) pathaoConfig.clientSecret = data.pathaoClientSecret;
        }

        const steadfastConfig = {};
        if (data.steadfastApiKey || data.steadfastSecretKey) {
            if (data.steadfastApiKey) steadfastConfig.apiKey = data.steadfastApiKey;
            if (data.steadfastSecretKey) steadfastConfig.secretKey = data.steadfastSecretKey;
        }

        const notificationConfig = {};
        if (data.notificationEmail || data.notificationWhatsapp) {
            if (data.notificationEmail) notificationConfig.email = data.notificationEmail;
            if (data.notificationWhatsapp) notificationConfig.whatsapp = data.notificationWhatsapp;
        }

        const payload = {
            id: data.id,
            name: data.name,
            companyName: data.companyName,
            email: data.email,
            isActive,
            ...(logoUrl && { companyLogo: logoUrl }),
            ...(data.phone !== undefined && { phone: data.phone }),
            ...(data.branchLocation !== undefined && { branchLocation: data.branchLocation }),
            ...(Object.keys(paymentInfo).length > 0 && { paymentInfo }),
            ...(data.packageId && { packageId: parseInt(data.packageId) }),
            ...(data.themeId && { themeId: parseInt(data.themeId) }),
            ...(Object.keys(pathaoConfig).length > 0 && { pathaoConfig }),
            ...(Object.keys(steadfastConfig).length > 0 && { steadfastConfig }),
            ...(Object.keys(notificationConfig).length > 0 && { notificationConfig }),
        };

        if (data.password) {
            payload.password = data.password;
        }

        const res = await updateSystemuser(payload);
        if (res?.data) {
            toast.success("Customer updated successfully");
            onClose?.();
        } else {
            toast.error(res?.error?.data?.message || "Failed to update customer");
        }
    };

    return (
        <Dialog open={!!user} onOpenChange={(v) => !v && onClose?.()}>
            <DialogContent className="max-h-[600px] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Customer</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <TextField
                            label="Name *"
                            placeholder="Customer name"
                            register={register}
                            name="name"
                            error={errors.name}
                        />
                        <TextField
                            label="Company Name *"
                            placeholder="Company name"
                            register={register}
                            name="companyName"
                            error={errors.companyName}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <TextField
                            label="Email *"
                            type="email"
                            placeholder="user@example.com"
                            register={register}
                            name="email"
                            error={errors.email}
                        />
                        <TextField
                            label="New Password (optional)"
                            type="password"
                            placeholder="Leave blank to keep current"
                            register={register}
                            name="password"
                            error={errors.password}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <TextField
                            label="Phone"
                            type="tel"
                            placeholder="+880XXXXXXXXXX"
                            register={register}
                            name="phone"
                            error={errors.phone}
                        />
                        <TextField
                            label="Branch Location"
                            placeholder="e.g., Dhaka"
                            register={register}
                            name="branchLocation"
                            error={errors.branchLocation}
                        />
                    </div>
                    <FileUpload
                        label="Company Logo"
                        placeholder="Upload company logo"
                        accept="image/*"
                        onChange={(file) => {
                            setLogoFile(file);
                            if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                    setValue("companyLogo", reader.result, { shouldValidate: true });
                                };
                                reader.readAsDataURL(file);
                            } else {
                                setValue("companyLogo", user?.companyLogo || "", { shouldValidate: true });
                            }
                        }}
                        value={logoFile ? URL.createObjectURL(logoFile) : (user?.companyLogo || null)}
                    />
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isActive"
                            className="w-4 h-4 rounded border-black/20 dark:border-white/20"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                        />
                        <label htmlFor="isActive" className="text-sm font-medium cursor-pointer">
                            Active Account
                        </label>
                    </div>

                    <div className="border-t border-black/10 dark:border-white/10 pt-4 space-y-4">
                        <h3 className="text-sm font-semibold text-black/70 dark:text-white/70">
                            Package & Payment Information
                        </h3>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-black/70 dark:text-white/70">
                                Select Package
                            </label>
                            <Dropdown
                                name="package"
                                options={packageOptions}
                                setSelectedOption={(opt) => {
                                    setSelectedPackage(opt);
                                    setValue("packageId", opt.value, { shouldValidate: true });
                                }}
                            >
                                {selectedPackage?.label || (
                                    <span className="text-black/50 dark:text-white/50">
                                        {isLoadingPackages ? "Loading packages..." : "Select Package"}
                                    </span>
                                )}
                            </Dropdown>
                            {errors.packageId && (
                                <span className="text-red-500 text-xs ml-1">{errors.packageId.message}</span>
                            )}
                        </div>

                        {selectedPackage?.features && selectedPackage.features.length > 0 && (
                            <div className="bg-black/5 dark:bg-white/5 p-3 rounded-lg">
                                <p className="text-xs font-semibold text-black/60 dark:text-white/60 mb-2">
                                    Package Features:
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {selectedPackage.features.map((feature) => (
                                        <span
                                            key={feature}
                                            className="text-xs px-2 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded"
                                        >
                                            {feature.replace(/_/g, " ")}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-black/70 dark:text-white/70">
                                Select Theme (Optional)
                            </label>
                            <Dropdown
                                name="theme"
                                options={themeOptions}
                                setSelectedOption={(opt) => {
                                    setSelectedTheme(opt);
                                    setValue("themeId", opt.value, { shouldValidate: true });
                                }}
                            >
                                {selectedTheme?.label || (
                                    <span className="text-black/50 dark:text-white/50">
                                        {isLoadingThemes ? "Loading themes..." : "Select Theme"}
                                    </span>
                                )}
                            </Dropdown>
                            {errors.themeId && (
                                <span className="text-red-500 text-xs ml-1">{errors.themeId.message}</span>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-black/70 dark:text-white/70">
                                    Payment Status
                                </label>
                                <Dropdown
                                    name="payment status"
                                    options={PAYMENT_STATUS_OPTIONS}
                                    setSelectedOption={(opt) => {
                                        setSelectedPaymentStatus(opt);
                                        setValue("paymentstatus", opt.value, { shouldValidate: true });
                                    }}
                                >
                                    {selectedPaymentStatus?.label || (
                                        <span className="text-black/50 dark:text-white/50">
                                            Select Status
                                        </span>
                                    )}
                                </Dropdown>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-black/70 dark:text-white/70">
                                    Payment Method
                                </label>
                                <Dropdown
                                    name="payment method"
                                    options={PAYMENT_METHOD_OPTIONS}
                                    setSelectedOption={(opt) => {
                                        setSelectedPaymentMethod(opt);
                                        setValue("paymentmethod", opt.value, { shouldValidate: true });
                                    }}
                                >
                                    {selectedPaymentMethod?.label || (
                                        <span className="text-black/50 dark:text-white/50">
                                            Select Method
                                        </span>
                                    )}
                                </Dropdown>
                            </div>
                        </div>
                        <TextField
                            label="Amount (BDT)"
                            type="number"
                            step="0.01"
                            placeholder="1999.00"
                            register={register}
                            name="amount"
                            error={errors.amount}
                        />
                    </div>

                    <div className="border-t border-black/10 dark:border-white/10 pt-4 space-y-4">
                        <h3 className="text-sm font-semibold text-black/70 dark:text-white/70">
                            Courier Configuration (Optional)
                        </h3>
                        <div className="space-y-3">
                            <p className="text-xs font-medium text-black/60 dark:text-white/60">Pathao Config</p>
                            <div className="grid grid-cols-2 gap-4">
                                <TextField
                                    label="Client ID"
                                    placeholder="PATHAO_CLIENT_ID"
                                    register={register}
                                    name="pathaoClientId"
                                    error={errors.pathaoClientId}
                                />
                                <TextField
                                    label="Client Secret"
                                    placeholder="PATHAO_CLIENT_SECRET"
                                    register={register}
                                    name="pathaoClientSecret"
                                    error={errors.pathaoClientSecret}
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <p className="text-xs font-medium text-black/60 dark:text-white/60">Steadfast Config</p>
                            <div className="grid grid-cols-2 gap-4">
                                <TextField
                                    label="API Key"
                                    placeholder="STEADFAST_API_KEY"
                                    register={register}
                                    name="steadfastApiKey"
                                    error={errors.steadfastApiKey}
                                />
                                <TextField
                                    label="Secret Key"
                                    placeholder="STEADFAST_SECRET_KEY"
                                    register={register}
                                    name="steadfastSecretKey"
                                    error={errors.steadfastSecretKey}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-black/10 dark:border-white/10 pt-4 space-y-4">
                        <h3 className="text-sm font-semibold text-black/70 dark:text-white/70">
                            Notification Configuration (Optional)
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <TextField
                                label="Notification Email"
                                type="email"
                                placeholder="notifications@example.com"
                                register={register}
                                name="notificationEmail"
                                error={errors.notificationEmail}
                            />
                            <TextField
                                label="WhatsApp Number"
                                placeholder="+880XXXXXXXXXX"
                                register={register}
                                name="notificationWhatsapp"
                                error={errors.notificationWhatsapp}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400"
                            onClick={() => onClose?.()}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || isUploadingLogo}
                            className="bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400"
                        >
                            {isLoading || isUploadingLogo ? "Updating..." : "Save"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CustomerEditForm;


