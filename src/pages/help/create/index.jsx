import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import TextField from "@/components/input/TextField";
import { useCreateHelpMutation } from "@/features/help/helpApiSlice";

function CreateHelpPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const helpSchema = useMemo(
    () =>
      yup.object().shape({
        email: yup
          .string()
          .required(t("help.validation.emailRequired"))
          .email(t("help.validation.emailInvalid"))
          .trim(),
        issue: yup
          .string()
          .required(t("help.validation.issueRequired"))
          .min(10, t("help.validation.issueMin"))
          .max(500, t("help.validation.issueMax"))
          .trim(),
      }),
    [t]
  );
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(helpSchema),
    mode: "onChange",
  });
  const [createHelp, { isLoading: isCreating }] = useCreateHelpMutation();

  const onSubmit = async (data) => {
    const payload = {
      email: data.email,
      issue: data.issue,
    };

    const res = await createHelp(payload);
    if (res?.data) {
      toast.success(t("help.ticketCreated"));
      reset();
      navigate("/help");
    } else {
      toast.error(res?.error?.data?.message || t("help.ticketCreateFailed"));
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/help")}
          className="bg-black dark:bg-black hover:bg-black/80 dark:hover:bg-black/80 text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">{t("help.createHelpTicket")}</h1>
          <p className="text-sm text-black/60 dark:text-white/60 mt-1">
            {t("help.createHelpTicketDesc")}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 mt-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-2">
            <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
              {t("help.contactInformation")}
            </h3>
          </div>
          <TextField 
            label={t("help.yourEmail")} 
            placeholder={t("help.emailPlaceholder")} 
            type="email" 
            register={register} 
            name="email" 
            error={errors.email?.message}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-2">
            <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
              {t("help.issueDetails")}
            </h3>
          </div>
          <TextField 
            label={t("help.issueDescription")} 
            placeholder={t("help.issuePlaceholder")} 
            multiline 
            rows={4} 
            register={register} 
            name="issue" 
            error={errors.issue?.message}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-black/10 dark:border-white/10">
          <Button variant="ghost" type="button" onClick={() => navigate("/help")} className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400">
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

export default CreateHelpPage;
