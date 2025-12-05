import React, { useState } from "react";
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
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { useCreateSystemuserMutation } from "@/features/systemuser/systemuserApiSlice";
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
    { label: "SMS Configuration", value: "SMS_CONFIGURATION" },
    { label: "Email Configuration", value: "EMAIL_CONFIGURATION" },
    { label: "Payment Methods", value: "PAYMENT_METHODS" },
    { label: "Payment Gateways", value: "PAYMENT_GATEWAYS" },
    { label: "Payment Status", value: "PAYMENT_STATUS" },
    { label: "Payment Transactions", value: "PAYMENT_TRANSACTIONS" },
    { label: "Promocodes", value: "PROMOCODES" },
    { label: "Help", value: "HELP" },
    { label: "Banners", value: "BANNERS" },
    { label: "Fraud Checker", value: "FRUAD_CHECKER" },
    { label: "Manage Users", value: "MANAGE_USERS" },
    { label: "Dashboard", value: "DASHBOARD" },
    { label: "Revenue", value: "REVENUE" },
    { label: "New Customers", value: "NEW_CUSTOMERS" },
    { label: "Repeat Purchase Rate", value: "REPEAT_PURCHASE_RATE" },
    { label: "Average Order Value", value: "AVERAGE_ORDER_VALUE" },
    { label: "Stats", value: "STATS" },
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
        .required("Password is required")
        .min(6, "Password must be at least 6 characters"),
    companyLogo: yup.string().nullable(),
    phone: yup.string().nullable(),
    branchLocation: yup.string().nullable(),
    paymentstatus: yup.string(),
    paymentmethod: yup.string(),
    amount: yup.number().nullable(),
    packagename: yup.string(),
});

const CustomerCreateForm = () => {
    const [open, setOpen] = useState(false);
    const [createSystemuser, { isLoading }] = useCreateSystemuserMutation();
    const [permissions, setPermissions] = useState(["CUSTOMERS"]);
    const [selectedPaymentStatus, setSelectedPaymentStatus] = useState(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
    const [selectedPackage, setSelectedPackage] = useState(null);
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
            name: "",
            companyName: "",
            email: "",
            password: "",
            companyLogo: "",
            phone: "",
            branchLocation: "",
            paymentstatus: "",
            paymentmethod: "",
            amount: "",
            packagename: "",
        },
    });

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
            ...(data.paymentstatus && { paymentstatus: data.paymentstatus }),
            ...(data.paymentmethod && { paymentmethod: data.paymentmethod }),
            ...(data.amount && { amount: parseFloat(data.amount) }),
            ...(data.packagename && { packagename: data.packagename }),
        };

        const payload = {
            name: data.name,
            companyName: data.companyName,
            email: data.email,
            password: data.password,
            permissions,
            ...(logoUrl && { companyLogo: logoUrl }),
            ...(data.phone && { phone: data.phone }),
            ...(data.branchLocation && { branchLocation: data.branchLocation }),
            ...(Object.keys(paymentInfo).length > 0 && { paymentInfo }),
        };

        const res = await createSystemuser(payload);
        if (res?.data) {
            toast.success("Customer system user created");
            reset();
            setPermissions(["CUSTOMERS"]);
            setSelectedPaymentStatus(null);
            setSelectedPaymentMethod(null);
            setSelectedPackage(null);
            setLogoFile(null);
            setOpen(false);
        } else {
            toast.error(res?.error?.data?.message || "Failed to create user");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">Add Customer User</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[600px] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create Customer System User</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <TextField
                        label="Name *"
                        placeholder="Customer manager name"
                        register={register}
                        name="name"
                        error={errors.name}
                    />
                    <TextField
                        label="Company Name *"
                        placeholder="Customer company name"
                        register={register}
                        name="companyName"
                        error={errors.companyName}
                    />
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


