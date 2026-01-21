import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { Button } from "@/components/ui/button";
import TextField from "@/components/input/TextField";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { useUpdateThemeMutation } from "@/features/theme/themeApiSlice";

const schema = yup.object().shape({
    domainUrl: yup
        .string()
        .url("Please enter a valid URL")
        .nullable()
        .transform((value, originalValue) =>
            originalValue === "" ? null : value
        ),
    logo: yup.string().nullable(),
    logoColorCode: yup
        .string()
        .nullable()
        .matches(/^#[0-9A-F]{6}$/i, {
            message: "Logo color code must be a valid hex color (e.g., #FF5733)",
        })
        .transform((value, originalValue) =>
            originalValue === "" ? null : value
        ),
});

const ThemeEditForm = ({ theme, onClose }) => {
    const [updateTheme, { isLoading }] = useUpdateThemeMutation();

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            domainUrl: theme?.domainUrl || "",
            logo: theme?.logo || "",
            logoColorCode: theme?.logoColorCode || "",
        },
    });

    const logoColorCode = watch("logoColorCode");

    useEffect(() => {
        if (theme) {
            reset({
                domainUrl: theme.domainUrl || "",
                logo: theme.logo || "",
                logoColorCode: theme.logoColorCode || "",
            });
        }
    }, [theme, reset]);

    const onSubmit = async (data) => {
        const payload = {
            id: theme.id,
            ...(data.domainUrl && { domainUrl: data.domainUrl }),
            ...(data.logo && { logo: data.logo }),
            ...(data.logoColorCode && { logoColorCode: data.logoColorCode }),
        };

        const res = await updateTheme(payload);
        if (res?.data) {
            toast.success("Theme updated successfully");
            onClose?.();
        } else {
            toast.error(res?.error?.data?.message || "Failed to update theme");
        }
    };

    return (
        <Dialog open={!!theme} onOpenChange={(v) => !v && onClose?.()}>
            <DialogContent className="max-h-[600px] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Theme</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <TextField
                        label="Domain URL"
                        placeholder="https://example.com"
                        register={register}
                        name="domainUrl"
                        error={errors.domainUrl}
                    />
                    
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-black/70 dark:text-white/70">
                            Logo URL
                        </label>
                        <textarea
                            {...register("logo")}
                            placeholder="https://example.com/logo.png or base64 encoded image"
                            className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-[#242424] focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20"
                        />
                        {errors.logo && (
                            <span className="text-red-500 text-xs ml-1">
                                {errors.logo.message}
                            </span>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-black/70 dark:text-white/70">
                            Logo Color Code
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                type="text"
                                {...register("logoColorCode")}
                                placeholder="#FF5733"
                                className="flex-1 px-3 py-2 text-sm rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-[#242424] focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20"
                            />
                            {logoColorCode && /^#[0-9A-F]{6}$/i.test(logoColorCode) && (
                                <div
                                    className="w-10 h-10 rounded border border-black/20 dark:border-white/20"
                                    style={{ backgroundColor: logoColorCode }}
                                    title={logoColorCode}
                                />
                            )}
                        </div>
                        {errors.logoColorCode && (
                            <span className="text-red-500 text-xs ml-1">
                                {errors.logoColorCode.message}
                            </span>
                        )}
                        <p className="text-xs text-black/50 dark:text-white/50">
                            Enter a hex color code (e.g., #FF5733)
                        </p>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400"
                            onClick={() => onClose?.()}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400"
                        >
                            {isLoading ? "Updating..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ThemeEditForm;
