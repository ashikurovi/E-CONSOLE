import React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import RichTextEditor from "@/components/input/RichTextEditor";
import { useCreatePrivacyPolicyMutation } from "@/features/privacy-policy/privacyPolicyApiSlice";

const privacyPolicySchema = yup.object().shape({
    content: yup
        .string()
        .required("Content is required")
        .min(10, "Content must be at least 10 characters"),
});

function CreatePrivacyPolicyPage() {
    const navigate = useNavigate();
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
                toast.success("Privacy Policy created");
                reset();
                navigate("/privacy-policy");
            }
        } catch (error) {
            toast.error(error?.data?.message || error?.message || "Failed to create Privacy Policy");
        }
    };

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
                    <h1 className="text-2xl font-semibold">Create Privacy Policy</h1>
                    <p className="text-sm text-black/60 dark:text-white/60 mt-1">
                        Create a new privacy policy for your store
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
                    <Button type="submit" disabled={isCreating} className="bg-black dark:bg-black hover:bg-black/80 dark:hover:bg-black/80 text-white">
                        {isCreating ? "Creating..." : "Create"}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default CreatePrivacyPolicyPage;
