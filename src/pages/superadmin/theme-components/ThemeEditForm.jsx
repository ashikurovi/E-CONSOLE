import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Upload, X, Check, Loader2, Globe, Palette, ImageIcon } from "lucide-react";

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
import useImageUpload from "@/hooks/useImageUpload";

const schema = yup.object().shape({
    domainUrl: yup
        .string()
        .url("Please enter a valid URL")
        .nullable()
        .transform((value, originalValue) =>
            originalValue === "" ? null : value
        ),
    logo: yup.string().nullable(),
    primaryColorCode: yup
        .string()
        .nullable()
        .matches(/^#[0-9A-F]{6}$/i, {
            message: "Primary color code must be a valid hex color (e.g., #FF5733)",
        })
        .transform((value, originalValue) =>
            originalValue === "" ? null : value
        ),
    secondaryColorCode: yup
        .string()
        .nullable()
        .matches(/^#[0-9A-F]{6}$/i, {
            message: "Secondary color code must be a valid hex color (e.g., #FF5733)",
        })
        .transform((value, originalValue) =>
            originalValue === "" ? null : value
        ),
});

const ThemeEditForm = ({ theme, onClose }) => {
    const [updateTheme, { isLoading }] = useUpdateThemeMutation();
    const { uploadImage, isUploading } = useImageUpload();
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            domainUrl: theme?.domainUrl || "",
            logo: theme?.logo || "",
            primaryColorCode: theme?.primaryColorCode || "",
            secondaryColorCode: theme?.secondaryColorCode || "",
        },
    });

    const primaryColorCode = watch("primaryColorCode");
    const secondaryColorCode = watch("secondaryColorCode");

    useEffect(() => {
        if (theme) {
            reset({
                domainUrl: theme.domainUrl || "",
                logo: theme.logo || "",
                primaryColorCode: theme.primaryColorCode || "",
                secondaryColorCode: theme.secondaryColorCode || "",
            });
            setLogoPreview(theme.logo || null);
            setLogoFile(null);
        }
    }, [theme, reset]);

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setLogoPreview(theme?.logo || null);
            setLogoFile(null);
            setValue("logo", theme?.logo || "");
        }
    };

    const onSubmit = async (data) => {
        let logoUrl = data.logo;

        // Upload logo file if a new one is selected
        if (logoFile) {
            logoUrl = await uploadImage(logoFile);
            if (!logoUrl) {
                toast.error("Failed to upload logo");
                return;
            }
        }

        const payload = {
            id: theme.id,
            ...(data.domainUrl && { domainUrl: data.domainUrl }),
            ...(logoUrl && { logo: logoUrl }),
            ...(data.primaryColorCode && { primaryColorCode: data.primaryColorCode }),
            ...(data.secondaryColorCode && { secondaryColorCode: data.secondaryColorCode }),
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
            <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white dark:bg-slate-900 border-0 shadow-2xl rounded-[24px]">
                <div className="bg-gradient-to-br from-violet-600 to-indigo-600 px-8 py-6">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                            <Palette className="h-6 w-6" />
                            Edit Theme
                        </DialogTitle>
                        <p className="text-violet-100 mt-2">
                            Update branding and visual settings for this theme.
                        </p>
                    </DialogHeader>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Left Column: Branding */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                                <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                                    Brand Identity
                                </h3>
                            </div>

                            <TextField
                                label="Domain URL"
                                placeholder="https://example.com"
                                register={register}
                                name="domainUrl"
                                error={errors.domainUrl}
                                icon={<Globe className="h-4 w-4 text-slate-400" />}
                                className="h-11 rounded-xl"
                            />

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Logo
                                </label>
                                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer relative group">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    {logoPreview ? (
                                        <div className="relative w-full flex justify-center">
                                            <img 
                                                src={logoPreview} 
                                                alt="Logo Preview" 
                                                className="h-20 object-contain" 
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                                <p className="text-white text-xs font-medium">Change Logo</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-2">
                                                <ImageIcon className="h-5 w-5" />
                                            </div>
                                            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                                Click to upload logo
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                PNG, JPG up to 2MB
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Colors */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                                <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                                    Color Scheme
                                </h3>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <TextField
                                        label="Primary Color"
                                        placeholder="#000000"
                                        register={register}
                                        name="primaryColorCode"
                                        error={errors.primaryColorCode}
                                        className="h-11 rounded-xl font-mono"
                                    />
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            {...register("primaryColorCode")}
                                            className="h-10 w-full rounded-lg cursor-pointer border-0 p-0"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <TextField
                                        label="Secondary Color"
                                        placeholder="#000000"
                                        register={register}
                                        name="secondaryColorCode"
                                        error={errors.secondaryColorCode}
                                        className="h-11 rounded-xl font-mono"
                                    />
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            {...register("secondaryColorCode")}
                                            className="h-10 w-full rounded-lg cursor-pointer border-0 p-0"
                                        />
                                    </div>
                                </div>

                                {/* Preview Card */}
                                <div className="mt-6 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                        Live Preview
                                    </p>
                                    <div className="flex gap-2">
                                        <div 
                                            className="flex-1 h-20 rounded-lg flex items-center justify-center text-white text-xs font-medium shadow-sm transition-colors"
                                            style={{ backgroundColor: primaryColorCode || '#e2e8f0', color: primaryColorCode ? '#fff' : '#64748b' }}
                                        >
                                            Primary
                                        </div>
                                        <div 
                                            className="flex-1 h-20 rounded-lg flex items-center justify-center text-white text-xs font-medium shadow-sm transition-colors"
                                            style={{ backgroundColor: secondaryColorCode || '#f1f5f9', color: secondaryColorCode ? '#fff' : '#64748b' }}
                                        >
                                            Secondary
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-6 border-t border-slate-100 dark:border-slate-800 gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            className="rounded-xl h-11 px-6 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            onClick={() => onClose?.()}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || isUploading}
                            className="rounded-xl h-11 px-8 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition-all duration-300"
                        >
                            {isLoading || isUploading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Updating...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Check className="h-4 w-4" />
                                    <span>Save Changes</span>
                                </div>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ThemeEditForm;
