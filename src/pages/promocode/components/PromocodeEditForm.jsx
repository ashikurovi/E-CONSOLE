import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
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
import { useUpdatePromocodeMutation } from "@/features/promocode/promocodeApiSlice";

const discountTypeOptions = [
  { label: "Percentage", value: "percentage" },
  { label: "Fixed", value: "fixed" },
];

export default function PromocodeEditForm({ promocode }) {
  const [isOpen, setIsOpen] = useState(false);

  const defaultType = useMemo(() => {
    const val = String(promocode?.discountType).toLowerCase();
    return discountTypeOptions.find((o) => o.value === val) || null;
  }, [promocode]);

  const [discountType, setDiscountType] = useState(defaultType);

  const { register, handleSubmit } = useForm({
    defaultValues: {
      code: promocode?.code ?? "",
      description: promocode?.description ?? "",
      discountValue:
        typeof promocode?.discountValue === "number"
          ? promocode?.discountValue
          : Number(promocode?.discountValue) || "",
      maxUses:
        promocode?.maxUses != null ? Number(promocode?.maxUses) : "",
      minOrderAmount:
        promocode?.minOrderAmount != null ? Number(promocode?.minOrderAmount) : "",
      startsAt: promocode?.startsAt
        ? new Date(promocode.startsAt).toISOString().slice(0, 16)
        : "",
      expiresAt: promocode?.expiresAt
        ? new Date(promocode.expiresAt).toISOString().slice(0, 16)
        : "",
      isActive: !!promocode?.isActive,
    },
  });

  const [updatePromocode, { isLoading: isUpdating }] = useUpdatePromocodeMutation();

  const onSubmit = async (data) => {
    const payload = {
      id: promocode.id,
      code: data.code,
      description: data.description ?? undefined,
      discountType: discountType?.value,
      discountValue: parseFloat(data.discountValue),
      maxUses: data.maxUses !== "" ? parseInt(data.maxUses, 10) : undefined,
      minOrderAmount:
        data.minOrderAmount !== "" ? parseFloat(data.minOrderAmount) : undefined,
      startsAt: data.startsAt ? new Date(data.startsAt).toISOString() : undefined,
      expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : undefined,
      isActive: !!data.isActive,
    };

    const res = await updatePromocode(payload);
    if (res?.data) {
      toast.success("Promocode updated");
      setIsOpen(false);
    } else {
      toast.error(res?.error?.data?.message || "Failed to update promocode");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" title="Edit">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Promocode</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-4">
          <TextField placeholder="Code" register={register} name="code" />
          <TextField placeholder="Description (optional)" register={register} name="description" />

          <Dropdown
            name="Discount Type"
            options={discountTypeOptions}
            setSelectedOption={setDiscountType}
            className="py-2"
          >
            {discountType?.label || (
              <span className="text-black/50 dark:text-white/50">Select Type</span>
            )}
          </Dropdown>

          <TextField
            placeholder="Discount Value"
            register={register}
            name="discountValue"
            type="number"
          />
          <TextField
            placeholder="Max Uses (optional)"
            register={register}
            name="maxUses"
            type="number"
          />
          <TextField
            placeholder="Min Order Amount (optional)"
            register={register}
            name="minOrderAmount"
            type="number"
          />
          <TextField
            placeholder="Starts At (optional)"
            register={register}
            name="startsAt"
            type="datetime-local"
          />
          <TextField
            placeholder="Expires At (optional)"
            register={register}
            name="expiresAt"
            type="datetime-local"
          />

          <div className="flex items-center gap-2">
            <Checkbox name="isActive" value={true} setValue={() => {}}>
              Active
            </Checkbox>
          </div>

          <DialogFooter>
            <Button variant="ghost" type="button" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}