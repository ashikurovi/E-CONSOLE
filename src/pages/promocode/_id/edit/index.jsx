import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
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

export default function PromocodeEditPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { data: promocodes = [] } = useGetPromocodesQuery();
  const promocode = promocodes.find((p) => p.id === parseInt(id));

  const discountTypeOptions = useMemo(
    () => [
      { label: t("promocodes.percentage"), value: "percentage" },
      { label: t("promocodes.fixed"), value: "fixed" },
    ],
    [t]
  );

  const promocodeEditSchema = useMemo(
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
        isActive: yup.boolean().required(t("promocodes.validation.statusRequired")),
      }),
    [t]
  );

  const defaultType = useMemo(() => {
    if (!promocode) return null;
    const val = String(promocode?.discountType).toLowerCase();
    return discountTypeOptions.find((o) => o.value === val) || null;
  }, [promocode, discountTypeOptions]);

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
      toast.success(t("promocodes.promocodeUpdated"));
      navigate("/promocodes");
    } else {
      toast.error(res?.error?.data?.message || t("promocodes.promocodeUpdateFailed"));
    }
  };

  if (!promocode) {
    return (
      <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-6">
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
            <h1 className="text-2xl font-semibold">{t("promocodes.promocodeNotFound")}</h1>
            <p className="text-sm text-black/60 dark:text-white/60 mt-1">
              {t("promocodes.promocodeNotFoundDesc")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-6">
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
          <h1 className="text-2xl font-semibold">{t("promocodes.editPromocode")}</h1>
          <p className="text-sm text-black/60 dark:text-white/60 mt-1">
            {t("createEdit.updatePromocode")}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-4">
        <TextField
          label={t("promocodes.code")}
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

        <div className="flex flex-col gap-2">
          <label className="text-black/50 dark:text-white/50 text-sm ml-1">{t("promocodes.discountType")}</label>
          <Dropdown
            name={t("promocodes.discountType")}
            options={discountTypeOptions}
            setSelectedOption={handleDiscountTypeChange}
            className="py-2"
          >
            {discountType?.label || (
              <span className="text-black/50 dark:text-white/50">{t("promocodes.selectType")}</span>
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
          error={errors.discountValue}
        />
        <TextField
          label={t("promocodes.maxUses")}
          placeholder={t("promocodes.maxUsesPlaceholder")}
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
          error={errors.minOrderAmount}
        />
        <TextField
          label={t("promocodes.startsAt")}
          placeholder={t("promocodes.startsAtPlaceholder")}
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
            {t("common.active")}
          </Checkbox>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button variant="ghost" type="button" onClick={() => navigate("/promocodes")} className="bg-red-500 hover:bg-red-600 text-white">
            {t("common.cancel")}
          </Button>
          <Button type="submit" disabled={isUpdating} className="bg-black dark:bg-black hover:bg-black/80 dark:hover:bg-black/80 text-white">
            {isUpdating ? t("common.updating") : t("common.update")}
          </Button>
        </div>
      </form>
    </div>
  );
}
