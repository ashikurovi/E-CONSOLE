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
import useImageUpload from "@/hooks/useImageUpload";

const PERMISSION_OPTIONS = [
    { label: "Products", value: "PRODUCTS" },
    { label: "Orders", value: "ORDERS" },
    { label: "Category", value: "CATEGORY" },
    { label: "Customers", value: "CUSTOMERS" },
    { label: "Reports", value: "REPORTS" },
    { label: "Inventory", value: "INVENTORY" },
    { label: "Settings", value: "SETTINGS" },
    { label: "Staff", value: "STAFF" },
];

const PAYMENT_STATUS_OPTIONS = [
    { label: "Paid", value: "Paid" },
    { label: "Pending", value: "Pending" },
    { label: "Failed", value: "Failed" },
    { label: "Refunded", value: "Refunded" },
    { label: "Cancelled", value: "Cancelled" },
];

const PAYMENT_METHOD_OPTIONS = [
    { label: "Credit Card", value: "Credit Card" },
    { label: "Debit Card", value: "Debit Card" },
    { label: "PayPal", value: "PayPal" },
    { label: "Bank Transfer", value: "Bank Transfer" },
    { label: "Cash", value: "Cash" },
    { label: "Stripe", value: "Stripe" },
    { label: "Other", value: "Other" },
];

const PACKAGE_OPTIONS = [
    { label: "Basic", value: "Basic" },
    { label: "Standard", value: "Standard" },
    { label: "Premium", value: "Premium" },
    { label: "Enterprise", value: "Enterprise" },
    { label: "Custom", value: "Custom" },
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
    packagename: yup.string(),
});

const CustomerEditForm = ({ user, onClose }) => {
    const [updateSystemuser, { isLoading }] = useUpdateSystemuserMutation();
    const [permissions, setPermissions] = useState(user?.permissions ?? []);
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
    const [selectedPackage, setSelectedPackage] = useState(
        user?.paymentInfo?.packagename
            ? PACKAGE_OPTIONS.find((opt) => opt.value === user.paymentInfo.packagename)
            : null
    );
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
            packagename: user?.paymentInfo?.packagename || "",
        },
    });

    useEffect(() => {
        const paymentStatus = user?.paymentInfo?.paymentstatus
            ? PAYMENT_STATUS_OPTIONS.find((opt) => opt.value === user.paymentInfo.paymentstatus)
            : null;
        const paymentMethod = user?.paymentInfo?.paymentmethod
            ? PAYMENT_METHOD_OPTIONS.find((opt) => opt.value === user.paymentInfo.paymentmethod)
            : null;
        const packageName = user?.paymentInfo?.packagename
            ? PACKAGE_OPTIONS.find((opt) => opt.value === user.paymentInfo.packagename)
            : null;

        setSelectedPaymentStatus(paymentStatus);
        setSelectedPaymentMethod(paymentMethod);
        setSelectedPackage(packageName);

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
            packagename: user?.paymentInfo?.packagename || "",
        });
        setPermissions(user?.permissions ?? []);
        setLogoFile(null);
    }, [user, reset]);

    const togglePermission = (value) => {
        setPermissions((prev) =>
            prev.includes(value)
                ? prev.filter((p) => p !== value)
                : [...prev, value]
        );
    };

    const onSubmit = async (data) => {
        if (!permissions.length) {
            toast.error("Select at least one permission");
            return;
        }

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
            ...(data.packagename && { packagename: data.packagename }),
        };

        const payload = {
            id: data.id,
            name: data.name,
            companyName: data.companyName,
            email: data.email,
            permissions,
            ...(logoUrl && { companyLogo: logoUrl }),
            ...(data.phone !== undefined && { phone: data.phone }),
            ...(data.branchLocation !== undefined && { branchLocation: data.branchLocation }),
            ...(Object.keys(paymentInfo).length > 0 && { paymentInfo }),
        };

        if (data.password) {
            payload.password = data.password;
        }

        const res = await updateSystemuser(payload);
        if (res?.data) {
            toast.success("Customer system user updated");
            onClose?.();
        } else {
            toast.error(res?.error?.data?.message || "Failed to update user");
        }
    };

    return (
        <Dialog open={!!user} onOpenChange={(v) => !v && onClose?.()}>
            <DialogContent className="max-h-[600px] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Customer System User</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <TextField
                        label="Name *"
                        register={register}
                        name="name"
                        error={errors.name}
                    />
                    <TextField
                        label="Company Name *"
                        register={register}
                        name="companyName"
                        error={errors.companyName}
                    />
                    <TextField
                        label="Email *"
                        type="email"
                        register={register}
                        name="email"
                        error={errors.email}
                    />
                    <TextField
                        label="New Password (optional)"
                        type="password"
                        placeholder="Leave blank to keep current password"
                        register={register}
                        name="password"
                        error={errors.password}
                    />
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
                    <TextField
                        label="Phone"
                        type="tel"
                        placeholder="Company phone number"
                        register={register}
                        name="phone"
                        error={errors.phone}
                    />
                    <TextField
                        label="Branch Location"
                        placeholder="Company branch location"
                        register={register}
                        name="branchLocation"
                        error={errors.branchLocation}
                    />

                    <div className="border-t border-black/10 dark:border-white/10 pt-4 space-y-4">
                        <h3 className="text-sm font-semibold text-black/70 dark:text-white/70">
                            Payment Information (Optional)
                        </h3>
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
                                        Select Payment Status
                                    </span>
                                )}
                            </Dropdown>
                            {errors.paymentstatus && (
                                <span className="text-red-500 text-xs ml-1">{errors.paymentstatus.message}</span>
                            )}
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
                                        Select Payment Method
                                    </span>
                                )}
                            </Dropdown>
                            {errors.paymentmethod && (
                                <span className="text-red-500 text-xs ml-1">{errors.paymentmethod.message}</span>
                            )}
                        </div>
                        <TextField
                            label="Amount"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            register={register}
                            name="amount"
                            error={errors.amount}
                        />
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-black/70 dark:text-white/70">
                                Package Name
                            </label>
                            <Dropdown
                                name="package"
                                options={PACKAGE_OPTIONS}
                                setSelectedOption={(opt) => {
                                    setSelectedPackage(opt);
                                    setValue("packagename", opt.value, { shouldValidate: true });
                                }}
                            >
                                {selectedPackage?.label || (
                                    <span className="text-black/50 dark:text-white/50">
                                        Select Package
                                    </span>
                                )}
                            </Dropdown>
                            {errors.packagename && (
                                <span className="text-red-500 text-xs ml-1">{errors.packagename.message}</span>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-medium text-black/70 dark:text-white/70">
                            Permissions *
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            {PERMISSION_OPTIONS.map((perm) => (
                                <label
                                    key={perm.value}
                                    className="flex items-center gap-2 text-sm cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-black/20 dark:border-white/20"
                                        checked={permissions.includes(perm.value)}
                                        onChange={() => togglePermission(perm.value)}
                                    />
                                    <span>{perm.label}</span>
                                </label>
                            ))}
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


