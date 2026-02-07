import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { userDetailsFetched } from "@/features/auth/authSlice";
import { Button } from "@/components/ui/button";
import TextField from "@/components/input/TextField";
import FileUpload from "@/components/input/FileUpload";
import useImageUpload from "@/hooks/useImageUpload";
import { useUpdateSystemuserMutation } from "@/features/systemuser/systemuserApiSlice";

const ProfileSettings = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const authUser = useSelector((state) => state.auth.user);
    const userId = authUser?.userId || authUser?.sub || authUser?.id;
    const user = authUser || null;

    const [updateSystemuser, { isLoading: isUpdating }] = useUpdateSystemuserMutation();
    const [logoFile, setLogoFile] = useState(null);
    const { uploadImage, isUploading } = useImageUpload();

    // Profile form
    const { register, handleSubmit, reset } = useForm({
        defaultValues: {
            name: "",
            email: "",
            companyName: "",
            phone: "",
            branchLocation: "",
        },
    });

    useEffect(() => {
        if (user) {
            reset({
                name: user.name || "",
                email: user.email || "",
                companyName: user.companyName || "",
                phone: user.phone || "",
                branchLocation: user.branchLocation || "",
            });
            setLogoFile(null);
        }
    }, [user, reset]);

    const onSubmit = async (data) => {
        if (!userId) {
            toast.error(t("settings.userIdNotFound"));
            return;
        }

        try {
            let companyLogo = user?.companyLogo || "";

            // If a file is selected, upload it first
            if (logoFile) {
                const uploadedUrl = await uploadImage(logoFile);
                if (!uploadedUrl) {
                    toast.error(t("settings.failedUploadLogo"));
                    return;
                }
                companyLogo = uploadedUrl;
            }

            const payload = {
                ...data,
                companyLogo,
            };

            const res = await updateSystemuser({ id: userId, ...payload });
            if (res?.data) {
                toast.success(t("settings.profileUpdated"));
                setLogoFile(null);

                // Update Redux state and localStorage immediately
                dispatch(userDetailsFetched(payload));
            } else {
                toast.error(res?.error?.data?.message || t("settings.profileUpdateFailed"));
            }
        } catch (e) {
            toast.error(t("settings.somethingWentWrong"));
        }
    };

    return (
        <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-4">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">{t("settings.updateProfile")}</h2>
            </div>

            {!user ? (
                <div className="text-center py-8">
                    <p className="text-black/60 dark:text-white/60">{t("settings.noUserData")}</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextField placeholder={t("settings.fullName")} register={register} name="name" />
                    <TextField placeholder={t("settings.email")} type="email" register={register} name="email" />
                    <TextField placeholder={t("settings.companyNamePlaceholder")} register={register} name="companyName" />
                    <TextField placeholder={t("settings.phone")} register={register} name="phone" />
                    <TextField placeholder={t("settings.branchLocationPlaceholder")} register={register} name="branchLocation" />
                    <div className="md:col-span-2">
                        <FileUpload
                            placeholder={t("settings.chooseLogoFile")}
                            label={t("settings.companyLogo")}
                            name="companyLogo"
                            accept="image/*"
                            onChange={setLogoFile}
                            value={user?.companyLogo || null}
                        />
                    </div>

                    <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                        <Button type="submit" disabled={isUpdating || isUploading}>
                            {isUpdating || isUploading ? t("settings.updating") : t("settings.updateProfile")}
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default ProfileSettings;
