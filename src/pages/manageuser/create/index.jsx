import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import TextField from "@/components/input/TextField";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useCreateSystemuserMutation } from "@/features/systemuser/systemuserApiSlice";
import { useGetCurrentUserQuery } from "@/features/auth/authApiSlice";

const CreateUserPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [createUser, { isLoading }] = useCreateSystemuserMutation();
  const { data: currentUser } = useGetCurrentUserQuery();

  const createUserSchema = useMemo(
    () =>
      yup.object().shape({
        name: yup
          .string()
          .required(t("manageUsers.validation.nameRequired"))
          .min(2, t("manageUsers.validation.nameMin")),
        email: yup
          .string()
          .required(t("manageUsers.validation.emailRequired"))
          .email(t("manageUsers.validation.emailInvalid")),
        phone: yup
          .string()
          .required(t("manageUsers.validation.phoneRequired"))
          .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, t("manageUsers.validation.phoneInvalid")),
        password: yup
          .string()
          .required(t("manageUsers.validation.passwordRequired"))
          .min(6, t("manageUsers.validation.passwordMin"))
          .max(50, t("manageUsers.validation.passwordMax")),
      }),
    [t]
  );

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    // Use System Owner's companyName for the user, default role to EMPLOYEE
    const payload = {
      ...data,
      companyName: currentUser?.companyName || "Company",
      role: "EMPLOYEE",
    };
    
    const res = await createUser(payload);
    if (res?.data) {
      toast.success(t("manageUsers.userCreated"));
      navigate("/manage-users");
    } else {
      toast.error(res?.error?.data?.message || t("manageUsers.userCreateFailed"));
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/manage-users")}
          className="bg-black dark:bg-black hover:bg-black/80 dark:hover:bg-black/80 text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h3 className="text-lg font-medium">{t("manageUsers.createEmployee")}</h3>
          <p className="text-sm text-black/60 dark:text-white/60 mt-1">
            {t("manageUsers.createEmployeeDesc")}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
        <TextField
          label={t("manageUsers.nameLabel")}
          placeholder={t("manageUsers.namePlaceholder")}
          register={register}
          name="name"
          error={errors.name}
        />
        <TextField
          label={t("manageUsers.emailLabel")}
          type="email"
          placeholder={t("manageUsers.emailPlaceholder")}
          register={register}
          name="email"
          error={errors.email}
        />
        <TextField
          label={t("manageUsers.phoneLabel")}
          placeholder={t("manageUsers.phonePlaceholder")}
          register={register}
          name="phone"
          error={errors.phone}
        />
        <TextField
          label={t("manageUsers.passwordLabel")}
          type="password"
          placeholder={t("manageUsers.passwordPlaceholder")}
          register={register}
          name="password"
          error={errors.password}
        />
        <p className="text-xs text-black/60 dark:text-white/60">
          {t("manageUsers.assignPermissionsNote")}
        </p>
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/manage-users")}
            disabled={isLoading}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400"
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400"
          >
            {isLoading ? t("common.saving") : t("common.create")}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateUserPage;
