import React, { useState } from "react";
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
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { useCreateThemeMutation } from "@/features/theme/themeApiSlice";
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

const ThemeCreateForm = () => {
    const [open, setOpen] = useState(false);
    const [createTheme, { isLoading }] = useCreateThemeMutation();
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
            domainUrl: "",
            logo: "",
            primaryColorCode: "",
            secondaryColorCode: "",
        },
    });

    const primaryColorCode = watch("primaryColorCode");
    const secondaryColorCode = watch("secondaryColorCode");

    const handleLogoChange = (file) => {
        setLogoFile(file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setLogoPreview(null);
            setValue("logo", "");
        }
    };

    const onSubmit = async (data) => {
        let logoUrl = data.logo;

        // Upload logo file if selected
        if (logoFile) {
            logoUrl = await uploadImage(logoFile);
            if (!logoUrl) {
                toast.error("Failed to upload logo");
                return;
            }
        }

        const payload = {
            ...(data.domainUrl && { domainUrl: data.domainUrl }),
            ...(logoUrl && { logo: logoUrl }),
            ...(data.primaryColorCode && { primaryColorCode: data.primaryColorCode }),
            ...(data.secondaryColorCode && { secondaryColorCode: data.secondaryColorCode }),
        };

        // Validate at least one field is provided
        if (Object.keys(payload).length === 0) {
            toast.error("Please fill in at least one field");
            return;
        }

        const res = await createTheme(payload);
        if (res?.data) {
            toast.success("Theme created successfully");
            reset();
            setLogoFile(null);
            setLogoPreview(null);
            setOpen(false);
        } else {
            toast.error(res?.error?.data?.message || "Failed to create theme");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">Add Theme</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[600px] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Theme</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <TextField
                        label="Domain URL"
                        placeholder="https://example.com"
                        register={register}
                        name="domainUrl"
                        error={errors.domainUrl}
                    />

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || isUploading}
                            className="bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400"
                        >
                            {isLoading || isUploading ? "Creating..." : "Create Theme"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ThemeCreateForm;
