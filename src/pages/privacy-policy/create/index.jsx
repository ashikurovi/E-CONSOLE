import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import RichTextEditor from "@/components/input/RichTextEditor";
import { useCreatePrivacyPolicyMutation } from "@/features/privacy-policy/privacyPolicyApiSlice";

function CreatePrivacyPolicyPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const privacyPolicySchema = useMemo(
        () =>
            yup.object().shape({
                content: yup
                    .string()
                    .required(t("privacyPolicy.validation.contentRequired"))
                    .min(10, t("privacyPolicy.validation.contentMin")),
            }),
        [t]
    );
    const { control, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: yupResolver(privacyPolicySchema),
    });
    const [createPrivacyPolicy, { isLoading: isCreating }] = useCreatePrivacyPolicyMutation();

    const onSubmit = async (data) => {
        try {
            const payload = {
                content: data.content,
            };

            const res = await createPrivacyPolicy(payload).unwrap();
            if (res) {
                toast.success(t("privacyPolicy.createdSuccess"));
                reset();
                navigate("/privacy-policy");
            }
        } catch (error) {
            toast.error(error?.data?.message || error?.message || t("privacyPolicy.createFailed"));
        }
    };

    return (
        <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-6">
            <div className="flex items-center gap-4 mb-6">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate("/privacy-policy")}
                    className="bg-black dark:bg-black hover:bg-black/80 dark:hover:bg-black/80 text-white"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-semibold">{t("privacyPolicy.createTitle")}</h1>
                    <p className="text-sm text-black/60 dark:text-white/60 mt-1">
                        {t("privacyPolicy.createDesc")}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-4">
                <Controller
                    name="content"
                    control={control}
                    render={({ field }) => (
                        <RichTextEditor
                            placeholder={t("privacyPolicy.contentPlaceholder")}
                            value={field.value || ""}
                            onChange={field.onChange}
                            error={errors.content}
                            height="400px"
                        />
                    )}
                />
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <Button
                        variant="ghost"
                        type="button"
                        onClick={() => navigate("/privacy-policy")}
                        className="bg-red-500 hover:bg-red-600 text-white"
                    >
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

export default CreatePrivacyPolicyPage;
