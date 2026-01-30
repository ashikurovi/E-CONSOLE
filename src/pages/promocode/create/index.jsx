import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
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

function CreatePromocodePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const discountTypeOptions = useMemo(
    () => [
      { label: t("promocodes.percentage"), value: "percentage" },
      { label: t("promocodes.fixed"), value: "fixed" },
    ],
    [t]
  );

  const promocodeSchema = useMemo(
    () =>
      yup.object().shape({
        code: yup
          .string()
          .required(t("promocodes.validation.codeRequired"))
          .min(2, t("promocodes.validation.codeMin"))
          .max(50, t("promocodes.validation.codeMax")),
        description: yup
          .string()
          .nullable()
          .transform((value) => (value === "" ? null : value))
          .max(500, t("promocodes.validation.descriptionMax")),
        discountType: yup
          .string()
          .required(t("promocodes.validation.discountTypeRequired"))
          .oneOf(["percentage", "fixed"], t("promocodes.validation.discountTypeInvalid")),
        discountValue: yup
          .number()
          .typeError(t("promocodes.validation.discountValueNumber"))
          .required(t("promocodes.validation.discountValueRequired"))
          .positive(t("promocodes.validation.discountValuePositive"))
          .test("max-percentage", t("promocodes.validation.percentageMax"), function (value) {
            const discountType = this.parent.discountType;
            if (discountType === "percentage" && value > 100) {
              return false;
            }
            return true;
          }),
        maxUses: yup
          .number()
          .typeError(t("promocodes.validation.maxUsesNumber"))
          .nullable()
          .transform((value, originalValue) => (originalValue === "" ? null : value))
          .min(1, t("promocodes.validation.maxUsesMin"))
          .integer(t("promocodes.validation.maxUsesInteger")),
        minOrderAmount: yup
          .number()
          .typeError(t("promocodes.validation.minOrderNumber"))
          .nullable()
          .transform((value, originalValue) => (originalValue === "" ? null : value))
          .min(0, t("promocodes.validation.minOrderMin")),
        startsAt: yup.string().nullable().transform((value) => (value === "" ? null : value)),
        expiresAt: yup
          .string()
          .nullable()
          .transform((value) => (value === "" ? null : value))
          .test("after-starts", t("promocodes.validation.expiresAfterStarts"), function (value) {
            const startsAt = this.parent.startsAt;
            if (!value || !startsAt) return true;
            return new Date(value) > new Date(startsAt);
          }),
      }),
    [t]
  );
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
      toast.success(t("promocodes.promocodeCreated"));
      reset();
      setDiscountType(null);
      navigate("/promocodes");
    } else {
      toast.error(res?.error?.data?.message || t("promocodes.promocodeCreateFailed"));
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
          <h1 className="text-2xl font-semibold">{t("createEdit.createPromocode")}</h1>
          <p className="text-sm text-black/60 dark:text-white/60 mt-1">
            {t("createEdit.createPromocodeDesc")}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 mt-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-2">
            <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
              {t("promocodes.codeDetails")}
            </h3>
          </div>
          <TextField
            label={t("promocodes.promocodeLabel")}
            placeholder={t("promocodes.promocodePlaceholder")}
            register={register}
            name="code"
            error={errors.code}
          />
          <TextField
            label={t("promocodes.descriptionLabel")}
            placeholder={t("promocodes.descriptionPlaceholder")}
            register={register}
            name="description"
            error={errors.description}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-2">
            <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
              {t("promocodes.discountConfiguration")}
            </h3>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-black/50 dark:text-white/50 text-sm ml-1">{t("promocodes.discountType")}</label>
            <Dropdown
              name={t("promocodes.discountType")}
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
              label={t("promocodes.discountValue")}
              placeholder={t("promocodes.discountValuePlaceholder")}
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
            label={t("promocodes.minOrderAmount")}
            placeholder={t("promocodes.minOrderAmountPlaceholder")}
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
              {t("promocodes.validityPeriod")}
            </h3>
          </div>
          <TextField
            label={t("promocodes.startsAt")}
            placeholder={t("promocodes.startsAtPlaceholder")}
            register={register}
            name="startsAt"
            type="datetime-local"
            error={errors.startsAt}
          />
          <TextField
            label={t("promocodes.expiresAt")}
            placeholder={t("promocodes.expiresAtPlaceholder")}
            register={register}
            name="expiresAt"
            type="datetime-local"
            error={errors.expiresAt}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-2">
            <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
              {t("common.status")}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox className="bg-black text-white hover:bg-black/90" name="isActive" value={true} setValue={() => { }}>
              {t("promocodes.activeByDefault")}
            </Checkbox>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-black/10 dark:border-white/10">
          <Button variant="ghost" type="button" onClick={() => navigate("/promocodes")} className="bg-red-500 hover:bg-red-600 text-white">
            {t("common.cancel")}
          </Button>
          <Button type="submit" disabled={isCreating} className="bg-black dark:bg-black hover:bg-black/80 dark:hover:bg-black/80 text-white">
            {isCreating ? t("common.creating") : t("common.create")}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CreatePromocodePage;
