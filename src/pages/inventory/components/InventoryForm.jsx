import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import TextField from "@/components/input/TextField";
import Dropdown from "@/components/dropdown/dropdown";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useCreateInventoryMutation } from "@/features/inventory/inventoryApiSlice";

const inventorySchema = (existingInventory = []) => {
  return yup.object().shape({
    productId: yup
      .number()
      .required("Product is required")
      .test("unique-product", "This product already has inventory", function (value) {
        if (!value) return true;
        const productExists = existingInventory.some(
          (inv) => (inv?.product?.id ?? inv?.productId) === value
        );
        return !productExists;
      }),
    stock: yup
      .number()
      .typeError("Stock must be a number")
      .required("Stock is required")
      .min(0, "Stock must be 0 or greater")
      .integer("Stock must be a whole number"),
    sold: yup
      .number()
      .typeError("Sold must be a number")
      .min(0, "Sold must be 0 or greater")
      .integer("Sold must be a whole number")
      .nullable()
      .transform((value, originalValue) => (originalValue === "" ? null : value)),
  });
};

function InventoryForm({ productOptions = [], existingInventory = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productError, setProductError] = useState("");
  const authUser = useSelector((state) => state.auth.user);
  const companyId = authUser?.companyId;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(inventorySchema(existingInventory)),
    defaultValues: {
      productId: null,
      stock: "",
      sold: "",
    },
  });

  const [createInventory, { isLoading: isCreating }] = useCreateInventoryMutation();

  // Validate product selection
  const handleProductSelect = (option) => {
    setSelectedProduct(option);
    setProductError("");

    if (option?.value) {
      const productExists = existingInventory.some(
        (inv) => (inv?.product?.id ?? inv?.productId) === option.value
      );

      if (productExists) {
        setProductError("This product already has inventory");
        setSelectedProduct(null);
        return;
      }

      setValue("productId", option.value, { shouldValidate: true });
    } else {
      setValue("productId", null, { shouldValidate: true });
    }
  };

  const onSubmit = async (data) => {
    if (!companyId) {
      toast.error("Company ID not found. Please log in again.");
      return;
    }

    // Final check for duplicate product
    if (data.productId) {
      const productExists = existingInventory.some(
        (inv) => (inv?.product?.id ?? inv?.productId) === data.productId
      );

      if (productExists) {
        toast.error("This product already has inventory");
        return;
      }
    }

    const payload = {
      productId: data.productId || null,
      stock: parseInt(data.stock, 10) || 0,
      sold: data.sold !== "" && data.sold !== undefined && data.sold !== null ? parseInt(data.sold, 10) || 0 : undefined,
      companyId: companyId,
    };

    const res = await createInventory(payload);
    if (res?.data) {
      toast.success("Inventory created");
      reset();
      setSelectedProduct(null);
      setProductError("");
      setIsOpen(false);
    } else {
      toast.error(res?.error?.data?.message || "Failed to create inventory");
    }
  };

  const handleDialogClose = (open) => {
    setIsOpen(open);
    if (!open) {
      reset();
      setSelectedProduct(null);
      setProductError("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button size="sm">Add Inventory</Button>
      </DialogTrigger>
      <DialogContent className='h-[400px]'>
        <DialogHeader>
          <DialogTitle>Create Inventory</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 mt-4">
          <input type="hidden" {...register("productId")} />
          
          {/* Product Selection Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-2">
              <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                Product Selection
              </h3>
            </div>
            <div>
              <Dropdown
                name="Product"
                options={productOptions}
                setSelectedOption={handleProductSelect}
                className="py-2"
              >
                {selectedProduct?.label || (
                  <span className="text-black/50 dark:text-white/50">Select Product</span>
                )}
              </Dropdown>
              {(errors.productId || productError) && (
                <span className="text-red-500 text-xs ml-1 mt-1 block">
                  {errors.productId?.message || productError}
                </span>
              )}
            </div>
          </div>

          {/* Inventory Details Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-2">
              <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                Stock Information
              </h3>
            </div>
            <TextField
              label="Available Stock *"
              placeholder="100"
              register={register}
              name="stock"
              type="number"
              error={errors.stock}
            />
          </div>

          <DialogFooter>
            <Button variant="ghost" type="button" className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating} className="bg-green-500 hover:bg-green-600 text-white">
              {isCreating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default InventoryForm;