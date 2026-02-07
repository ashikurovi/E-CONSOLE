import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { userDetailsFetched } from "@/features/auth/authSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bell, Mail, MessageCircle, Loader2 } from "lucide-react";
import { useUpdateSystemuserMutation } from "@/features/systemuser/systemuserApiSlice";

const NotificationSettings = ({ user: userFromApi }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const authUser = useSelector((state) => state.auth.user);
    const userId = authUser?.userId || authUser?.sub || authUser?.id;
    const user = userFromApi ?? authUser ?? null;

    const [updateSystemuser, { isLoading: isSaving }] = useUpdateSystemuserMutation();

    const { register, handleSubmit, reset } = useForm({
        defaultValues: {
            email: "",
            whatsapp: "",
        },
    });

    useEffect(() => {
        if (!user) return;
        const config = user.notificationConfig;
        reset({
            email: config?.email ?? "",
            whatsapp: config?.whatsapp ?? "",
        });
    }, [user, reset]);

    const onSubmit = async (data) => {
        if (!userId) {
            toast.error(t("settings.userIdNotFound"));
            return;
        }
        try {
            const payload = {
                notificationConfig: {
                    email: data.email?.trim() || null,
                    whatsapp: data.whatsapp?.trim() || null,
                },
            };
            await updateSystemuser({ id: userId, ...payload }).unwrap();
            dispatch(userDetailsFetched(payload));
            toast.success(t("settings.notificationConfigSaved") || "Notification settings saved");
        } catch (e) {
            toast.error(e?.data?.message || (t("settings.notificationConfigFailed") || "Failed to save"));
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Bell className="h-5 w-5 text-nexus-primary" />
                    {t("settings.notifications") || "Notifications"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {t("settings.notificationConfigDesc") || "Configure where to receive notifications (email and WhatsApp). Follows backend notificationConfig."}
                </p>
            </div>

            <Card className="border border-gray-100 dark:border-gray-800">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">
                        {t("settings.notificationChannels") || "Notification channels"}
                    </CardTitle>
                    <CardDescription>
                        {t("settings.notificationChannelsDesc") || "Email and WhatsApp used for alerts and updates."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                {t("settings.notificationEmail") || "Notification email"}
                            </label>
                            <input
                                type="email"
                                {...register("email")}
                                placeholder="notifications@example.com"
                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-nexus-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <MessageCircle className="h-4 w-4" />
                                {t("settings.notificationWhatsapp") || "WhatsApp number"}
                            </label>
                            <input
                                type="text"
                                {...register("whatsapp")}
                                placeholder="+8801712345678"
                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-nexus-primary"
                            />
                        </div>
                        <div className="pt-2">
                            <Button type="submit" disabled={isSaving}>
                                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                {isSaving ? (t("common.saving") || "Saving...") : (t("common.save") || "Save")}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default NotificationSettings;
