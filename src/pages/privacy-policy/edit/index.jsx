import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import RichTextEditor from "@/components/input/RichTextEditor";
import { useUpdatePrivacyPolicyMutation, useGetPrivacyPoliciesQuery } from "@/features/privacy-policy/privacyPolicyApiSlice";
import { useSelector } from "react-redux";

const privacyPolicySchema = yup.object().shape({
    content: yup
        .string()
        .required("Content is required")
        .min(10, "Content must be at least 10 characters"),
});

function EditPrivacyPolicyPage() {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { data: policies = [] } = useGetPrivacyPoliciesQuery({ companyId: user?.companyId });
    const latestPolicy = policies.length > 0 ? policies[0] : null;

    const { control, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: yupResolver(privacyPolicySchema),
        defaultValues: {
            content: latestPolicy?.content || "",
        },
    });
    const [updatePrivacyPolicy, { isLoading: isUpdating }] = useUpdatePrivacyPolicyMutation();

    useEffect(() => {
        if (latestPolicy) {
            reset({
                content: latestPolicy.content || "",
            });
        }
    }, [latestPolicy, reset]);

    const onSubmit = async (data) => {
        if (!latestPolicy) return;

        const payload = {
            content: data.content,
        };

        const res = await updatePrivacyPolicy({ id: latestPolicy.id, ...payload });
        if (res?.data) {
            toast.success("Privacy Policy updated");
            navigate("/privacy-policy");
        } else {
            toast.error(res?.error?.data?.message || "Failed to update Privacy Policy");
        }
    };

    if (!latestPolicy) {
        return (
            <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-6">
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
                        <h1 className="text-2xl font-semibold">Privacy Policy Not Found</h1>
                        <p className="text-sm text-black/60 dark:text-white/60 mt-1">
                            Please create a privacy policy first
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
                    onClick={() => navigate("/privacy-policy")}
                    className="bg-black dark:bg-black hover:bg-black/80 dark:hover:bg-black/80 text-white"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-semibold">Edit Privacy Policy</h1>
                    <p className="text-sm text-black/60 dark:text-white/60 mt-1">
                        Update your privacy policy content
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-4">
                <Controller
                    name="content"
                    control={control}
                    render={({ field }) => (
                        <RichTextEditor
                            placeholder="Privacy Policy Content"
                            value={field.value || ""}
                            onChange={field.onChange}
                            error={errors.content}
                            height="400px"
                        />
                    )}
                />
                <div className="flex justify-end gap-3 pt-4 border-t border-black/10 dark:border-white/10">
                    <Button
                        variant="ghost"
                        type="button"
                        onClick={() => navigate("/privacy-policy")}
                        className="bg-red-500 hover:bg-red-600 text-white"
                    >
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

export default EditPrivacyPolicyPage;
