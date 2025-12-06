import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import RichTextEditor from "@/components/input/RichTextEditor";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { useCreatePrivacyPolicyMutation } from "@/features/privacy-policy/privacyPolicyApiSlice";

const privacyPolicySchema = yup.object().shape({
    content: yup
        .string()
        .required("Content is required")
        .min(10, "Content must be at least 10 characters"),
});

function PrivacyPolicyForm({ onClose, onSuccess }) {
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
                if (onSuccess) onSuccess();
                if (onClose) onClose();
            }
        } catch (error) {
            toast.error(error?.data?.message || error?.message || "Failed to create Privacy Policy");
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create Privacy Policy</DialogTitle>
                </DialogHeader>
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
                    <DialogFooter>
                        <Button
                            variant="ghost"
                            type="button"
                            onClick={onClose}
                            className="bg-red-500 hover:bg-red-600 text-white"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isCreating} className="bg-green-500 hover:bg-green-600 text-white">
                            {isCreating ? "Creating..." : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default PrivacyPolicyForm;
