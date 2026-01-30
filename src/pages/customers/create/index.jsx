import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import TextField from "@/components/input/TextField";
import Dropdown from "@/components/dropdown/dropdown";
import { useCreateUserMutation } from "@/features/user/userApiSlice";
import { useSelector } from "react-redux";

function CreateCustomerPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const roleOptions = useMemo(
    () => [
      { label: t("customers.customerRole"), value: "customer" },
      { label: t("customers.adminRole"), value: "admin" },
    ],
    [t]
  );

  const [roleOption, setRoleOption] = useState(() => roleOptions[0]);

  useEffect(() => {
    setRoleOption((prev) => roleOptions.find((o) => o.value === prev?.value) || roleOptions[0]);
  }, [roleOptions]);

  const customerSchema = useMemo(
    () =>
      yup.object().shape({
        name: yup
          .string()
          .required(t("customers.validation.fullNameRequired"))
          .min(2, t("customers.validation.nameMin"))
          .max(100, t("customers.validation.nameMax"))
          .trim(),
        email: yup
          .string()
          .required(t("customers.validation.emailRequired"))
          .email(t("customers.validation.emailInvalid"))
          .trim(),
        phone: yup
          .string()
          .max(20, t("customers.validation.phoneMax"))
          .matches(/^[+\d\s()-]*$/, t("customers.validation.phoneInvalid"))
          .trim(),
        address: yup.string().max(500, t("customers.validation.addressMax")).trim(),
      }),
    [t]
  );
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(customerSchema),
    mode: "onChange",
  });
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const authUser = useSelector((state) => state.auth.user);
  
  const onSubmit = async (data) => {
    const payload = {
      name: data.name,
      email: data.email,
      phone: data.phone || undefined,
      address: data.address || undefined,
      role: roleOption?.value || "customer",
      isActive: true,
    };

    const params = {
      companyId: authUser?.companyId,
    };

    const res = await createUser({ body: payload, params });
    if (res?.data) {
      toast.success(t("customers.customerCreated"));
      reset();
      setRoleOption(roleOptions[0]);
      navigate("/customers");
    } else {
      toast.error(res?.error?.data?.message || t("customers.customerCreateFailed"));
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/customers")}
          className="bg-black dark:bg-black hover:bg-black/80 dark:hover:bg-black/80 text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">{t("createEdit.createCustomer")}</h1>
          <p className="text-sm text-black/60 dark:text-white/60 mt-1">
            {t("createEdit.createCustomerDesc")}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 mt-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-2">
            <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
              {t("customers.personalInformation")}
            </h3>
          </div>
          <TextField
            label={t("customers.fullName")}
            placeholder={t("customers.fullNamePlaceholder")}
            register={register}
            name="name"
            error={errors.name?.message}
          />
          <TextField
            label={t("customers.emailAddress")}
            placeholder={t("customers.emailPlaceholder")}
            register={register}
            name="email"
            type="email"
            error={errors.email?.message}
          />
          <TextField
            label={t("customers.phoneNumber")}
            placeholder={t("customers.phonePlaceholder")}
            register={register}
            name="phone"
            error={errors.phone?.message}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-2">
            <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
              {t("customers.address")}
            </h3>
          </div>
          <TextField
            label={t("customers.completeAddress")}
            placeholder={t("customers.addressPlaceholder")}
            register={register}
            name="address"
            error={errors.address?.message}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-2">
            <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
              {t("customers.roleAndPermissions")}
            </h3>
          </div>
          <Dropdown
            name={t("customers.role")}
            options={roleOptions}
            setSelectedOption={setRoleOption}
            className="py-2"
          >
            {roleOption?.label || (
              <span className="text-black/50 dark:text-white/50">{t("customers.selectRole")}</span>
            )}
          </Dropdown>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-black/10 dark:border-white/10">
          <Button variant="ghost" type="button" className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400" onClick={() => navigate("/customers")}>
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

export default CreateCustomerPage;
