import React, { useState } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { Button } from "@/components/ui/button";
import TextField from "@/components/input/TextField";
import ColorPicker from "@/components/input/ColorPicker";
import Dropdown from "@/components/dropdown/dropdown";
import FileUpload from "@/components/input/FileUpload";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { useCreateSystemuserMutation } from "@/features/systemuser/systemuserApiSlice";
import { useGetPackagesQuery } from "@/features/package/packageApiSlice";
import { useGetThemesQuery } from "@/features/theme/themeApiSlice";
import useImageUpload from "@/hooks/useImageUpload";

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
        .required("Password is required")
        .min(6, "Password must be at least 6 characters"),
    companyLogo: yup.string().nullable(),
    phone: yup.string().nullable(),
    branchLocation: yup.string().nullable(),
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
    domainName: yup.string().nullable(),
    primaryColor: yup
        .string()
        .nullable()
        .matches(/^#[0-9A-F]{6}$/i, {
            message: "Primary color must be a valid hex color (e.g., #FF5733)",
        })
        .transform((value, originalValue) => (originalValue === "" ? null : value)),
    secondaryColor: yup
        .string()
        .nullable()
        .matches(/^#[0-9A-F]{6}$/i, {
            message: "Secondary color must be a valid hex color (e.g., #FF5733)",
        })
        .transform((value, originalValue) => (originalValue === "" ? null : value)),
});

const CustomerCreateForm = () => {
    const [open, setOpen] = useState(false);
    const [createSystemuser, { isLoading }] = useCreateSystemuserMutation();
    const { data: packages, isLoading: isLoadingPackages } = useGetPackagesQuery();
    const { data: themes, isLoading: isLoadingThemes } = useGetThemesQuery();
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [selectedTheme, setSelectedTheme] = useState(null);
    const [isActive, setIsActive] = useState(true);
    const [logoFile, setLogoFile] = useState(null);
    const { uploadImage, isUploading: isUploadingLogo } = useImageUpload();

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            name: "",
            companyName: "",
            email: "",
            password: "",
            companyLogo: "",
            phone: "",
            branchLocation: "",
            packageId: "",
            themeId: "",
            pathaoClientId: "",
            pathaoClientSecret: "",
            steadfastApiKey: "",
            steadfastSecretKey: "",
            notificationEmail: "",
            notificationWhatsapp: "",
            domainName: "",
            primaryColor: "",
            secondaryColor: "",
        },
    });

    const primaryColor = watch("primaryColor");
    const secondaryColor = watch("secondaryColor");

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

    const onSubmit = async (data) => {
        // Upload logo if file is selected
        let logoUrl = data.companyLogo || null;
        if (logoFile) {
            logoUrl = await uploadImage(logoFile);
            if (!logoUrl) {
                toast.error("Failed to upload company logo");
                return;
            }
        }

        const paymentInfo = {
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
            name: data.name,
            companyName: data.companyName,
            email: data.email,
            password: data.password,
            isActive,
            ...(logoUrl && { companyLogo: logoUrl }),
            ...(data.phone && { phone: data.phone }),
            ...(data.branchLocation && { branchLocation: data.branchLocation }),
            ...(Object.keys(paymentInfo).length > 0 && { paymentInfo }),
            ...(data.packageId && { packageId: parseInt(data.packageId) }),
            ...(data.themeId && { themeId: parseInt(data.themeId) }),
            ...(Object.keys(pathaoConfig).length > 0 && { pathaoConfig }),
            ...(Object.keys(steadfastConfig).length > 0 && { steadfastConfig }),
            ...(Object.keys(notificationConfig).length > 0 && { notificationConfig }),
            ...(data.domainName && { domainName: data.domainName }),
            ...(data.primaryColor && { primaryColor: data.primaryColor }),
            ...(data.secondaryColor && { secondaryColor: data.secondaryColor }),
        };

        const res = await createSystemuser(payload);
        if (res?.data) {
            toast.success("Customer created successfully");
            reset();
            setSelectedPackage(null);
            setSelectedTheme(null);
            setIsActive(true);
            setLogoFile(null);
            setOpen(false);
        } else {
            toast.error(res?.error?.data?.message || "Failed to create customer");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">Add Customer</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[600px] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create Customer</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Account Information Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                            <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                                Account Information
                            </h3>
                        </div>
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
                                label="Password *"
                                type="password"
                                placeholder="At least 6 characters"
                                register={register}
                                name="password"
                                error={errors.password}
                            />
                        </div>
                    </div>

                    {/* Contact & Location Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                            <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                                Contact & Location
                            </h3>
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
                    </div>

                    {/* Company Branding Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                            <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                                Company Branding
                            </h3>
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
                                    setValue("companyLogo", "", { shouldValidate: true });
                                }
                            }}
                            value={logoFile ? URL.createObjectURL(logoFile) : null}
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
                    </div>
                    <TextField
                        label="Domain Name *"
                        placeholder="https://example.com"
                        register={register}
                        name="domainName"
                        error={errors.domainName}
                    />
                    <ColorPicker
                        label="Primary Color"
                        value={primaryColor}
                        onChange={(color) => setValue("primaryColor", color)}
                        error={errors.primaryColor}
                        placeholder="#FF5733"
                    />
                    <ColorPicker
                        label="Secondary Color"
                        value={secondaryColor}
                        onChange={(color) => setValue("secondaryColor", color)}
                        error={errors.secondaryColor}
                        placeholder="#33FF57"
                    />

                    {/* Package & Payment Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                            <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                                Package & Payment Information
                            </h3>
                        </div>
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

                    </div>

                    {/* Courier Configuration Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                            <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                                Courier Configuration (Optional)
                            </h3>
                        </div>
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

                    {/* Notification Configuration Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                            <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                                Notification Configuration (Optional)
                            </h3>
                        </div>
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
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || isUploadingLogo}
                            className="bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400"
                        >
                            {isLoading || isUploadingLogo ? "Saving..." : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CustomerCreateForm;


