import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import TextField from "@/components/input/TextField";
import Checkbox from "@/components/input/Checkbox";
import Dropdown from "@/components/dropdown/dropdown";
import { useCreatePromocodeMutation } from "@/features/promocode/promocodeApiSlice";

const discountTypeOptions = [
  { label: "Percentage", value: "percentage" },
  { label: "Fixed", value: "fixed" },
];

const promocodeSchema = yup.object().shape({
  code: yup.string().required("Code is required").min(2, "Code must be at least 2 characters").max(50, "Code must be less than 50 characters"),
  description: yup.string().nullable().transform((value) => (value === "" ? null : value)).max(500, "Description must be less than 500 characters"),
  discountType: yup.string().required("Discount type is required").oneOf(discountTypeOptions.map((o) => o.value), "Please select a valid discount type"),
  discountValue: yup.number().typeError("Discount value must be a number").required("Discount value is required").positive("Discount value must be greater than 0").test("max-percentage", "Percentage discount cannot exceed 100", function (value) {
    const discountType = this.parent.discountType;
    if (discountType === "percentage" && value > 100) {
      return false;
    }
    return true;
  }),
  maxUses: yup.number().typeError("Max uses must be a number").nullable().transform((value, originalValue) => (originalValue === "" ? null : value)).min(1, "Max uses must be at least 1").integer("Max uses must be a whole number"),
  minOrderAmount: yup.number().typeError("Min order amount must be a number").nullable().transform((value, originalValue) => (originalValue === "" ? null : value)).min(0, "Min order amount must be 0 or greater"),
  startsAt: yup.string().nullable().transform((value) => (value === "" ? null : value)),
  expiresAt: yup.string().nullable().transform((value) => (value === "" ? null : value)).test("after-starts", "Expires at must be after starts at", function (value) {
    const startsAt = this.parent.startsAt;
    if (!value || !startsAt) return true;
    return new Date(value) > new Date(startsAt);
  }),
});

function CreatePromocodePage() {
  const navigate = useNavigate();
  const [discountType, setDiscountType] = useState(null);
  const { register, handleSubmit, reset, setValue, formState: { errors }, trigger } = useForm({
    resolver: yupResolver(promocodeSchema),
  });
  const [createPromocode, { isLoading: isCreating }] = useCreatePromocodeMutation();

  const handleDiscountTypeChange = (option) => {
    setDiscountType(option);
    setValue("discountType", option?.value || "", { shouldValidate: true });
    trigger("discountValue");
  };

  const onSubmit = async (data) => {
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
      navigate("/promocodes");
    } else {
      toast.error(res?.error?.data?.message || "Failed to create promocode");
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/promocodes")}
          className="bg-black dark:bg-black hover:bg-black/80 dark:hover:bg-black/80 text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Create Promocode</h1>
          <p className="text-sm text-black/60 dark:text-white/60 mt-1">
            Add a new promotional code
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 mt-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-2">
            <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
              Code Details
            </h3>
          </div>
          <TextField
            label="Promocode *"
            placeholder="SAVE20"
            register={register}
            name="code"
            error={errors.code}
          />
          <TextField
            label="Description"
            placeholder="Description (optional)"
            register={register}
            name="description"
            error={errors.description}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-2">
            <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
              Discount Configuration
            </h3>
          </div>
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
            label="Discount Value *"
            placeholder="10"
            register={register}
            name="discountValue"
            type="number"
            step="0.01"
            error={errors.discountValue}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-2">
            <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
              Usage Limits
            </h3>
          </div>
          <TextField
            label="Max Uses"
            placeholder="100 (optional)"
            register={register}
            name="maxUses"
            type="number"
            error={errors.maxUses}
          />
          <TextField
            label="Min Order Amount"
            placeholder="500 (optional)"
            register={register}
            name="minOrderAmount"
            type="number"
            step="0.01"
            error={errors.minOrderAmount}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-2">
            <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
              Validity Period
            </h3>
          </div>
          <TextField
            label="Starts At"
            placeholder="Select start date"
            register={register}
            name="startsAt"
            type="datetime-local"
            error={errors.startsAt}
          />
          <TextField
            label="Expires At"
            placeholder="Select expiry date"
            register={register}
            name="expiresAt"
            type="datetime-local"
            error={errors.expiresAt}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-2">
            <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
              Status
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox className="bg-black text-white hover:bg-black/90" name="isActive" value={true} setValue={() => { }}>
              Active by default
            </Checkbox>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-black/10 dark:border-white/10">
          <Button variant="ghost" type="button" onClick={() => navigate("/promocodes")} className="bg-red-500 hover:bg-red-600 text-white">
            Cancel
          </Button>
          <Button type="submit" disabled={isCreating} className="bg-black dark:bg-black hover:bg-black/80 dark:hover:bg-black/80 text-white">
            {isCreating ? "Creating..." : "Create"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CreatePromocodePage;
