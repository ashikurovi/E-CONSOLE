import React, { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import TextField from "@/components/input/TextField";
import Checkbox from "@/components/input/Checkbox";
import Dropdown from "@/components/dropdown/dropdown";
import { useUpdatePromocodeMutation, useGetPromocodesQuery } from "@/features/promocode/promocodeApiSlice";
import { useSelector } from "react-redux";

const discountTypeOptions = [
  { label: "Percentage", value: "percentage" },
  { label: "Fixed", value: "fixed" },
];

const promocodeEditSchema = yup.object().shape({
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
  isActive: yup.boolean().required("Status is required"),
});

export default function PromocodeEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { data: promocodes = [] } = useGetPromocodesQuery();
  const promocode = promocodes.find((p) => p.id === parseInt(id));

  const defaultType = useMemo(() => {
    if (!promocode) return null;
    const val = String(promocode?.discountType).toLowerCase();
    return discountTypeOptions.find((o) => o.value === val) || null;
  }, [promocode]);

  const [discountType, setDiscountType] = useState(defaultType);

  const { register, handleSubmit, setValue, formState: { errors }, trigger, reset } = useForm({
    resolver: yupResolver(promocodeEditSchema),
    defaultValues: {
      code: promocode?.code ?? "",
      description: promocode?.description ?? "",
      discountType: promocode?.discountType ?? "",
      discountValue: typeof promocode?.discountValue === "number" ? promocode?.discountValue : Number(promocode?.discountValue) || "",
      maxUses: promocode?.maxUses != null ? Number(promocode?.maxUses) : "",
      minOrderAmount: promocode?.minOrderAmount != null ? Number(promocode?.minOrderAmount) : "",
      startsAt: promocode?.startsAt ? new Date(promocode.startsAt).toISOString().slice(0, 16) : "",
      expiresAt: promocode?.expiresAt ? new Date(promocode.expiresAt).toISOString().slice(0, 16) : "",
      isActive: !!promocode?.isActive,
    },
  });

  useEffect(() => {
    if (promocode) {
      reset({
        code: promocode.code ?? "",
        description: promocode.description ?? "",
        discountType: promocode.discountType ?? "",
        discountValue: typeof promocode.discountValue === "number" ? promocode.discountValue : Number(promocode.discountValue) || "",
        maxUses: promocode.maxUses != null ? Number(promocode.maxUses) : "",
        minOrderAmount: promocode.minOrderAmount != null ? Number(promocode.minOrderAmount) : "",
        startsAt: promocode.startsAt ? new Date(promocode.startsAt).toISOString().slice(0, 16) : "",
        expiresAt: promocode.expiresAt ? new Date(promocode.expiresAt).toISOString().slice(0, 16) : "",
        isActive: !!promocode.isActive,
      });
      const val = String(promocode.discountType).toLowerCase();
      const found = discountTypeOptions.find((o) => o.value === val);
      setDiscountType(found || null);
    }
  }, [promocode, reset]);

  const [updatePromocode, { isLoading: isUpdating }] = useUpdatePromocodeMutation();

  const handleDiscountTypeChange = (option) => {
    setDiscountType(option);
    setValue("discountType", option?.value || "", { shouldValidate: true });
    trigger("discountValue");
  };

  const onSubmit = async (data) => {
    if (!promocode) return;

    if (!discountType?.value) {
      setValue("discountType", "", { shouldValidate: true });
      return;
    }

    const payload = {
      id: promocode.id,
      code: data.code,
      description: data.description ?? undefined,
      discountType: discountType?.value,
      discountValue: parseFloat(data.discountValue),
      maxUses: data.maxUses !== "" ? parseInt(data.maxUses, 10) : undefined,
      minOrderAmount: data.minOrderAmount !== "" ? parseFloat(data.minOrderAmount) : undefined,
      startsAt: data.startsAt ? new Date(data.startsAt).toISOString() : undefined,
      expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : undefined,
      isActive: !!data.isActive,
    };

    const res = await updatePromocode(payload);
    if (res?.data) {
      toast.success("Promocode updated");
      navigate("/promocodes");
    } else {
      toast.error(res?.error?.data?.message || "Failed to update promocode");
    }
  };

  if (!promocode) {
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
            <h1 className="text-2xl font-semibold">Promocode Not Found</h1>
            <p className="text-sm text-black/60 dark:text-white/60 mt-1">
              The promocode you're looking for doesn't exist
            </p>
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-semibold">Edit Promocode</h1>
          <p className="text-sm text-black/60 dark:text-white/60 mt-1">
            Update promocode information
          </p>
        </div>
      </div>

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
          placeholder="Max Uses "
          register={register}
          name="maxUses"
          type="number"
          error={errors.maxUses}
        />
        <TextField
          placeholder="Min Order Amount "
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
            Active
          </Checkbox>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-black/10 dark:border-white/10">
          <Button variant="ghost" type="button" onClick={() => navigate("/promocodes")} className="bg-red-500 hover:bg-red-600 text-white">
            Cancel
          </Button>
          <Button type="submit" disabled={isUpdating} className="bg-black dark:bg-black hover:bg-black/80 dark:hover:bg-black/80 text-white">
            {isUpdating ? "Updating..." : "Update"}
          </Button>
        </div>
      </form>
    </div>
  );
}
