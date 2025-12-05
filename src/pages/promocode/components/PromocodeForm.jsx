import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import TextField from "@/components/input/TextField";
import Checkbox from "@/components/input/Checkbox";
import Dropdown from "@/components/dropdown/dropdown";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useCreatePromocodeMutation } from "@/features/promocode/promocodeApiSlice";

const discountTypeOptions = [
  { label: "Percentage", value: "percentage" },
  { label: "Fixed", value: "fixed" },
];

const promocodeSchema = yup.object().shape({
  code: yup
    .string()
    .required("Code is required")
    .min(2, "Code must be at least 2 characters")
    .max(50, "Code must be less than 50 characters"),
  description: yup
    .string()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .max(500, "Description must be less than 500 characters"),
  discountType: yup
    .string()
    .required("Discount type is required")
    .oneOf(
      discountTypeOptions.map((o) => o.value),
      "Please select a valid discount type"
    ),
  discountValue: yup
    .number()
    .typeError("Discount value must be a number")
    .required("Discount value is required")
    .positive("Discount value must be greater than 0")
    .test("max-percentage", "Percentage discount cannot exceed 100", function (value) {
      const discountType = this.parent.discountType;
      if (discountType === "percentage" && value > 100) {
        return false;
      }
      return true;
    }),
  maxUses: yup
    .number()
    .typeError("Max uses must be a number")
    .nullable()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .min(1, "Max uses must be at least 1")
    .integer("Max uses must be a whole number"),
  minOrderAmount: yup
    .number()
    .typeError("Min order amount must be a number")
    .nullable()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .min(0, "Min order amount must be 0 or greater"),
  startsAt: yup
    .string()
    .nullable()
    .transform((value) => (value === "" ? null : value)),
  expiresAt: yup
    .string()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .test("after-starts", "Expires at must be after starts at", function (value) {
      const startsAt = this.parent.startsAt;
      if (!value || !startsAt) return true;
      return new Date(value) > new Date(startsAt);
    }),

});

function PromocodeForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [discountType, setDiscountType] = useState(null);
  const { register, handleSubmit, reset, setValue, formState: { errors }, trigger } = useForm({
    resolver: yupResolver(promocodeSchema),
  });
  const [createPromocode, { isLoading: isCreating }] = useCreatePromocodeMutation();

  const handleDiscountTypeChange = (option) => {
    setDiscountType(option);
    setValue("discountType", option?.value || "", { shouldValidate: true });
    // Re-validate discountValue when discountType changes
    trigger("discountValue");
  };

  const onSubmit = async (data) => {

    console.log(data);
    // Validate discount type
    if (!discountType?.value) {
      setValue("discountType", "", { shouldValidate: true });
      return;
    }

    const payload = {
      code: data.code,
      description: data.description || undefined,
      discountType: discountType?.value,
      discountValue: parseFloat(data.discountValue),
      maxUses: data.maxUses ? parseInt(data.maxUses, 10) : undefined,
      minOrderAmount: data.minOrderAmount ? parseFloat(data.minOrderAmount) : undefined,
      startsAt: data.startsAt ? new Date(data.startsAt).toISOString() : undefined,
      expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : undefined,
      isActive: !!data.isActive,
    };

    const res = await createPromocode(payload);
    if (res?.data) {
      toast.success("Promocode created");
      reset();
      setDiscountType(null);
      setIsOpen(false);
    } else {
      toast.error(res?.error?.data?.message || "Failed to create promocode");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Add Promocode</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Promocode</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-4">
          <TextField
            placeholder="Code"
            register={register}
            name="code"
            error={errors.code}
          />
          <TextField
            placeholder="Description "
            register={register}
            name="description"
            error={errors.description}
          />

          <div className="flex flex-col gap-2">
            <label className="text-black/50 dark:text-white/50 text-sm ml-1">Discount Type</label>
            <Dropdown
              name="Discount Type"
              options={discountTypeOptions}
              setSelectedOption={handleDiscountTypeChange}
              className="py-2"
            >
              {discountType?.label || (
                <span className="text-black/50 dark:text-white/50">Select Type</span>
              )}
            </Dropdown>
            {errors.discountType && (
              <span className="text-red-500 text-xs ml-1">{errors.discountType.message}</span>
            )}
          </div>

          <TextField
            placeholder="Discount Value"
            register={register}
            name="discountValue"
            type="number"
            error={errors.discountValue}
          />
          <TextField
            placeholder="Max Uses"
            register={register}
            name="maxUses"
            type="number"
            error={errors.maxUses}
          />
          <TextField
            placeholder="Min Order Amount"
            register={register}
            name="minOrderAmount"
            type="number"
            error={errors.minOrderAmount}
          />
          <TextField
            placeholder="Starts At"
            register={register}
            name="startsAt"
            type="datetime-local"
            error={errors.startsAt}
          />
          <TextField
            placeholder="Expires At "
            register={register}
            name="expiresAt"
            type="datetime-local"
            error={errors.expiresAt}
          />

          <div className="flex items-center gap-2">
            <Checkbox className="bg-black text-white hover:bg-black/90" name="isActive" value={true} setValue={() => { }}>
              Active by default
            </Checkbox>
          </div>

          <DialogFooter>
            <Button variant="ghost" type="button" onClick={() => setIsOpen(false)} className="bg-red-500 hover:bg-red-600 text-white">
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

export default PromocodeForm;