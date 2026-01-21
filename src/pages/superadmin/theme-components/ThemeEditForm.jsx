import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { Button } from "@/components/ui/button";
import TextField from "@/components/input/TextField";
import FileUpload from "@/components/input/FileUpload";
import ColorPicker from "@/components/input/ColorPicker";
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

    const handleLogoChange = (file) => {
        setLogoFile(file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setLogoPreview(theme?.logo || null);
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
                            Logo
                        </label>
                        <FileUpload
                            label=""
                            name="logo"
                            accept="image/*"
                            onChange={handleLogoChange}
                            value={logoPreview}
                            placeholder="Choose logo image"
                        />
                        {errors.logo && (
                            <span className="text-red-500 text-xs ml-1">
                                {errors.logo.message}
                            </span>
                        )}
                    </div>

                    <ColorPicker
                        label="Primary Color Code"
                        value={primaryColorCode}
                        onChange={(color) => setValue("primaryColorCode", color)}
                        error={errors.primaryColorCode}
                        placeholder="#FF5733"
                    />

                    <ColorPicker
                        label="Secondary Color Code"
                        value={secondaryColorCode}
                        onChange={(color) => setValue("secondaryColorCode", color)}
                        error={errors.secondaryColorCode}
                        placeholder="#33FF57"
                    />

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
                            disabled={isLoading || isUploading}
                            className="bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400"
                        >
                            {isLoading || isUploading ? "Updating..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ThemeEditForm;
