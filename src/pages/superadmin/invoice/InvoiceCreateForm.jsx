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
import { useCreateInvoiceMutation } from "@/features/invoice/invoiceApiSlice";
import { useGetSystemusersQuery } from "@/features/systemuser/systemuserApiSlice";
import { useGetPackagesQuery } from "@/features/package/packageApiSlice";
import { Plus } from "lucide-react";

const schema = yup.object().shape({
    customerId: yup
        .number()
        .required("Customer is required")
        .positive("Please select a customer")
        .typeError("Customer is required"),
    totalAmount: yup
        .number()
        .required("Total amount is required")
        .positive("Amount must be positive")
        .typeError("Total amount must be a number"),
    paidAmount: yup
        .number()
        .nullable()
        .min(0, "Paid amount cannot be negative")
        .typeError("Paid amount must be a number")
        .test("not-exceed-total", "Paid amount cannot exceed total amount", function (value) {
            const { totalAmount } = this.parent;
            if (!value) return true;
            return value <= totalAmount;
        }),
    amountType: yup
        .string()
        .required("Amount type is required")
        .oneOf(["package", "service", "other"], "Invalid amount type"),
    status: yup
        .string()
        .required("Status is required")
        .oneOf(["pending", "paid", "cancelled"], "Invalid status"),
    bankName: yup.string().nullable(),
    bankAmount: yup
        .number()
        .nullable()
        .positive("Bank amount must be positive")
        .typeError("Bank amount must be a number"),
    accLastDigit: yup.string().nullable(),
    bankPaymentStatus: yup
        .string()
        .nullable()
        .oneOf(["verified", "pending", "rejected", null], "Invalid bank payment status"),
    bkashPaymentID: yup.string().nullable(),
    bkashTrxID: yup.string().nullable(),
});

const InvoiceCreateForm = () => {
    const [open, setOpen] = useState(false);
    const [createInvoice, { isLoading }] = useCreateInvoiceMutation();
    const { data: customers = [] } = useGetSystemusersQuery();
    const { data: packages = [] } = useGetPackagesQuery();
    const [showBankPayment, setShowBankPayment] = useState(false);
    const [showBkashPayment, setShowBkashPayment] = useState(false);
    const [selectedPackageName, setSelectedPackageName] = useState("");

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            customerId: "",
            packageId: "",
            totalAmount: "",
            paidAmount: "0",
            amountType: "package",
            status: "pending",
            bankName: "",
            bankAmount: "",
            accLastDigit: "",
            bankPaymentStatus: "pending",
            bkashPaymentID: "",
            bkashTrxID: "",
        },
    });

    const totalAmount = watch("totalAmount");
    const paidAmount = watch("paidAmount");
    const customerId = watch("customerId");
    const packageId = watch("packageId");

    // Auto-fill total amount when package is selected
    React.useEffect(() => {
        if (packageId) {
            const selectedPackage = packages.find(p => p.id === parseInt(packageId));
            if (selectedPackage) {
                const amount = parseFloat(selectedPackage.discountPrice ?? selectedPackage.price ?? 0);
                setSelectedPackageName(selectedPackage.name);
                if (amount > 0) {
                    setValue("totalAmount", amount.toString(), { shouldValidate: true });
                }
            }
        } else {
            setSelectedPackageName("");
        }
    }, [packageId, packages, setValue]);

    // Auto-populate package name and price when customer is selected (if no package selected)
    React.useEffect(() => {
        if (customerId && !packageId) {
            const selectedCustomer = customers.find(c => c.id === parseInt(customerId));
            if (selectedCustomer?.paymentInfo) {
                const { packagename, amount } = selectedCustomer.paymentInfo;
                if (packagename) {
                    setSelectedPackageName(packagename);
                }
                if (amount) {
                    setValue("totalAmount", amount.toString(), { shouldValidate: true });
                }
            } else {
                setSelectedPackageName("");
            }
        } else if (!packageId) {
            setSelectedPackageName("");
        }
    }, [customerId, packageId, customers, setValue]);

    // Auto-calculate due amount
    const dueAmount = totalAmount && paidAmount 
        ? (parseFloat(totalAmount) - parseFloat(paidAmount || 0)).toFixed(2)
        : "0.00";

    const onSubmit = async (data) => {
        const payload = {
            customerId: parseInt(data.customerId),
            totalAmount: Number(parseFloat(data.totalAmount).toFixed(2)),
            paidAmount: data.paidAmount ? Number(parseFloat(data.paidAmount).toFixed(2)) : 0,
            amountType: data.amountType,
            status: data.status,
        };
        if (data.packageId) {
            payload.packageId = parseInt(data.packageId);
        }

        // Add bank payment if provided
        if (showBankPayment && data.bankName) {
            payload.bankPayment = {
                bankName: data.bankName,
                amount: data.bankAmount ? parseFloat(data.bankAmount) : 0,
                accLastDigit: data.accLastDigit || "",
                status: data.bankPaymentStatus || "pending",
            };
        }

        // Add bkash payment if provided
        if (showBkashPayment) {
            if (data.bkashPaymentID) payload.bkashPaymentID = data.bkashPaymentID;
            if (data.bkashTrxID) payload.bkashTrxID = data.bkashTrxID;
        }

        const res = await createInvoice(payload);
        if (res?.data) {
            toast.success("Invoice created successfully");
            reset({ customerId: "", packageId: "", totalAmount: "", paidAmount: "0", amountType: "package", status: "pending" });
            setShowBankPayment(false);
            setShowBkashPayment(false);
            setSelectedPackageName("");
            setOpen(false);
        } else {
            toast.error(res?.error?.data?.message || "Failed to create invoice");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-2 w-full sm:w-auto bg-violet-600 hover:bg-violet-700 text-white shadow-sm shadow-violet-200 dark:shadow-none">
                    <Plus className="h-4 w-4" />
                    Add Invoice
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Create New Invoice</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Customer Selection */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-black/70 dark:text-white/70">
                            Customer *
                        </label>
                        <select
                            {...register("customerId")}
                            className="w-full px-3 py-2 text-sm rounded-md border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1f26] focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20"
                        >
                            <option value="">Select a customer</option>
                            {customers.map((customer) => (
                                <option key={customer.id} value={customer.id}>
                                    {customer.name} - {customer.email} ({customer.companyName})
                                </option>
                            ))}
                        </select>
                        {errors.customerId && (
                            <span className="text-red-500 text-xs ml-1">
                                {errors.customerId.message}
                            </span>
                        )}
                    </div>

                    {/* Package Selection */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-black/70 dark:text-white/70">
                            Package (optional - auto-fills amount)
                        </label>
                        <select
                            {...register("packageId")}
                            className="w-full px-3 py-2 text-sm rounded-md border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1f26] focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20"
                        >
                            <option value="">Select a package</option>
                            {packages.map((pkg) => (
                                <option key={pkg.id} value={pkg.id}>
                                    {pkg.name} - ৳{parseFloat(pkg.discountPrice ?? pkg.price ?? 0).toFixed(2)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Package Info Display */}
                    {selectedPackageName && (
                        <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                            <p className="text-xs text-green-700 dark:text-green-300 mb-1">Selected Package</p>
                            <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                                {selectedPackageName}
                            </p>
                        </div>
                    )}

                    {/* Amount Fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <TextField
                            label="Total Amount (BDT) *"
                            type="number"
                            step="0.01"
                            placeholder="1500.00"
                            register={register}
                            name="totalAmount"
                            error={errors.totalAmount}
                        />
                        <TextField
                            label="Paid Amount (BDT)"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            register={register}
                            name="paidAmount"
                            error={errors.paidAmount}
                        />
                    </div>

                    {/* Due Amount Display */}
                    <div className="p-3 bg-black/5 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-gray-800">
                        <p className="text-xs text-black/60 dark:text-white/60">Due Amount</p>
                        <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                            ৳{dueAmount}
                        </p>
                    </div>

                    {/* Amount Type and Status */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-black/70 dark:text-white/70">
                                Amount Type *
                            </label>
                            <select
                                {...register("amountType")}
                                className="w-full px-3 py-2 text-sm rounded-md border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1f26] focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20"
                            >
                                <option value="package">Package</option>
                                <option value="service">Service</option>
                                <option value="other">Other</option>
                            </select>
                            {errors.amountType && (
                                <span className="text-red-500 text-xs ml-1">
                                    {errors.amountType.message}
                                </span>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-black/70 dark:text-white/70">
                                Status *
                            </label>
                            <select
                                {...register("status")}
                                className="w-full px-3 py-2 text-sm rounded-md border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1f26] focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20"
                            >
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            {errors.status && (
                                <span className="text-red-500 text-xs ml-1">
                                    {errors.status.message}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Payment Methods Toggle */}
                    <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-3">
                        <p className="text-sm font-medium text-black/70 dark:text-white/70">
                            Payment Methods (Optional)
                        </p>
                        
                        <div className="flex flex-wrap gap-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-black/20 dark:border-white/20"
                                    checked={showBankPayment}
                                    onChange={(e) => setShowBankPayment(e.target.checked)}
                                />
                                <span className="text-sm">Bank Payment</span>
                            </label>
                            
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-black/20 dark:border-white/20"
                                    checked={showBkashPayment}
                                    onChange={(e) => setShowBkashPayment(e.target.checked)}
                                />
                                <span className="text-sm">Bkash Payment</span>
                            </label>
                        </div>
                    </div>

                    {/* Bank Payment Section */}
                    {showBankPayment && (
                        <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                                Bank Payment Details
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <TextField
                                    label="Bank Name"
                                    placeholder="e.g., DBBL, Brac Bank"
                                    register={register}
                                    name="bankName"
                                    error={errors.bankName}
                                />
                                <TextField
                                    label="Amount"
                                    type="number"
                                    step="0.01"
                                    placeholder="1500.00"
                                    register={register}
                                    name="bankAmount"
                                    error={errors.bankAmount}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <TextField
                                    label="Account Last 4 Digits"
                                    placeholder="4587"
                                    register={register}
                                    name="accLastDigit"
                                    error={errors.accLastDigit}
                                />
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-black/70 dark:text-white/70">
                                        Payment Status
                                    </label>
                                    <select
                                        {...register("bankPaymentStatus")}
                                        className="w-full px-3 py-2 text-sm rounded-md border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1f26] focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="verified">Verified</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Bkash Payment Section */}
                    {showBkashPayment && (
                        <div className="space-y-4 p-4 bg-pink-50 dark:bg-pink-950/20 rounded-lg border border-pink-200 dark:border-pink-800">
                            <p className="text-sm font-semibold text-pink-700 dark:text-pink-300">
                                Bkash Payment Details
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <TextField
                                    label="Payment ID"
                                    placeholder="BKxxxxxxxxxxxxxx"
                                    register={register}
                                    name="bkashPaymentID"
                                    error={errors.bkashPaymentID}
                                />
                                <TextField
                                    label="Transaction ID"
                                    placeholder="TXNxxxxxxxxx"
                                    register={register}
                                    name="bkashTrxID"
                                    error={errors.bkashTrxID}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400"
                            onClick={() => {
                                setOpen(false);
                                reset({ customerId: "", packageId: "", totalAmount: "", paidAmount: "0", amountType: "package", status: "pending" });
                                setShowBankPayment(false);
                                setShowBkashPayment(false);
                                setSelectedPackageName("");
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400"
                        >
                            {isLoading ? "Creating..." : "Create Invoice"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default InvoiceCreateForm;
