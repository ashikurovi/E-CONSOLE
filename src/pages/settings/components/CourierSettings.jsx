import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { userDetailsFetched } from "@/features/auth/authSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Key, Loader2 } from "lucide-react";
import { hasPermission, FeaturePermission } from "@/constants/feature-permission";
import { useUpdateSystemuserMutation } from "@/features/systemuser/systemuserApiSlice";

const CourierSettings = ({ user: userFromApi }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const authUser = useSelector((state) => state.auth.user);
    const userId = authUser?.userId || authUser?.sub || authUser?.id;
    const user = userFromApi ?? authUser ?? null;

    const [updateSystemuser] = useUpdateSystemuserMutation();
    const [savingCourier, setSavingCourier] = React.useState(null);

    const { register: registerPathao, handleSubmit: handleSubmitPathao, reset: resetPathao } = useForm({
        defaultValues: {
            clientId: "",
            clientSecret: "",
        },
    });

    const { register: registerSteadfast, handleSubmit: handleSubmitSteadfast, reset: resetSteadfast } = useForm({
        defaultValues: {
            apiKey: "",
            secretKey: "",
        },
    });

    const { register: registerRedX, handleSubmit: handleSubmitRedX, reset: resetRedX } = useForm({
        defaultValues: {
            token: "",
            sandbox: false,
        },
    });

    useEffect(() => {
        if (!user) return;
        resetPathao({
            clientId: user.pathaoConfig?.clientId || "",
            clientSecret: user.pathaoConfig?.clientSecret || "",
        });
    }, [user, resetPathao]);

    useEffect(() => {
        if (!user) return;
        resetSteadfast({
            apiKey: user.steadfastConfig?.apiKey || "",
            secretKey: user.steadfastConfig?.secretKey || "",
        });
    }, [user, resetSteadfast]);

    useEffect(() => {
        if (!user) return;
        resetRedX({
            token: user.redxConfig?.token || "",
            sandbox: user.redxConfig?.sandbox !== false,
        });
    }, [user, resetRedX]);

    const onSubmitPathao = async (data) => {
        if (!userId) {
            toast.error(t("settings.userIdNotFound"));
            return;
        }
        setSavingCourier("pathao");
        try {
            const payload = {
                pathaoConfig: {
                    clientId: data.clientId || "",
                    clientSecret: data.clientSecret || "",
                },
            };
            await updateSystemuser({ id: userId, ...payload }).unwrap();
            localStorage.setItem("pathaoClientId", data.clientId);
            localStorage.setItem("pathaoClientSecret", data.clientSecret);
            dispatch(userDetailsFetched(payload));
            toast.success(t("pathao.credentialsSaved"));
        } catch (e) {
            toast.error(e?.data?.message || t("pathao.credentialsFailed"));
        } finally {
            setSavingCourier(null);
        }
    };

    const onSubmitSteadfast = async (data) => {
        if (!userId) {
            toast.error(t("settings.userIdNotFound"));
            return;
        }
        setSavingCourier("steadfast");
        try {
            const payload = {
                steadfastConfig: {
                    apiKey: data.apiKey || "",
                    secretKey: data.secretKey || "",
                },
            };
            await updateSystemuser({ id: userId, ...payload }).unwrap();
            localStorage.setItem("steadfastApiKey", data.apiKey);
            localStorage.setItem("steadfastSecretKey", data.secretKey);
            dispatch(userDetailsFetched(payload));
            toast.success(t("steadfast.credentialsSaved"));
        } catch (e) {
            toast.error(e?.data?.message || t("steadfast.credentialsFailed"));
        } finally {
            setSavingCourier(null);
        }
    };

    const onSubmitRedX = async (data) => {
        if (!userId) {
            toast.error(t("settings.userIdNotFound"));
            return;
        }
        setSavingCourier("redx");
        try {
            const payload = {
                redxConfig: {
                    token: data.token || "",
                    sandbox: data.sandbox === true,
                },
            };
            await updateSystemuser({ id: userId, ...payload }).unwrap();
            localStorage.setItem("redxToken", data.token);
            localStorage.setItem("redxSandbox", data.sandbox ? "true" : "false");
            dispatch(userDetailsFetched(payload));
            toast.success(t("redx.credentialsSaved"));
        } catch (e) {
            toast.error(e?.data?.message || t("redx.credentialsFailed"));
        } finally {
            setSavingCourier(null);
        }
    };

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">{t("settings.courierIntegrationSettings")}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Pathao Credentials */}
                {hasPermission(user, FeaturePermission.PATHAO) && (
                    <Card className="border border-gray-100 dark:border-gray-800">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <Truck className="h-5 w-5 text-blue-500" />
                                <CardTitle className="text-base font-semibold">{t("pathao.credentialsTitle")}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmitPathao(onSubmitPathao)} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-black/70 dark:text-white/70">
                                        {t("pathao.clientId")}
                                    </label>
                                    <input
                                        type="text"
                                        {...registerPathao("clientId")}
                                        className="w-full px-3 py-2 border border-gray-100 dark:border-gray-800 rounded-md bg-white dark:bg-[#1a1a1a] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder={t("pathao.clientIdPlaceholder")}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-black/70 dark:text-white/70">
                                        {t("pathao.clientSecret")}
                                    </label>
                                    <input
                                        type="password"
                                        {...registerPathao("clientSecret")}
                                        className="w-full px-3 py-2 border border-gray-100 dark:border-gray-800 rounded-md bg-white dark:bg-[#1a1a1a] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder={t("pathao.clientSecretPlaceholder")}
                                    />
                                </div>
                                <div className="pt-2">
                                    <Button type="submit" className="w-full" disabled={savingCourier === "pathao"}>
                                        {savingCourier === "pathao" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Key className="h-4 w-4 mr-2" />}
                                        {savingCourier === "pathao" ? t("common.saving") : t("createEdit.savePathaoCredentials")}
                                    </Button>
                                </div>
                                <div className="text-xs text-black/50 dark:text-white/50 mt-2">
                                    {t("pathao.getCredentialsFrom")} <a href="https://merchant.pathao.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{t("pathao.pathaoPortal")}</a>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}
                {/* Steadfast Credentials */}
                {hasPermission(user, FeaturePermission.STEARDFAST) && (
                    <Card className="border border-gray-100 dark:border-gray-800">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <Truck className="h-5 w-5 text-green-500" />
                                <CardTitle className="text-base font-semibold">{t("steadfast.credentialsTitle")}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmitSteadfast(onSubmitSteadfast)} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-black/70 dark:text-white/70">
                                        {t("steadfast.apiKey")}
                                    </label>
                                    <input
                                        type="text"
                                        {...registerSteadfast("apiKey")}
                                        className="w-full px-3 py-2 border border-gray-100 dark:border-gray-800 rounded-md bg-white dark:bg-[#1a1a1a] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder={t("steadfast.apiKeyPlaceholder")}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-black/70 dark:text-white/70">
                                        {t("steadfast.secretKey")}
                                    </label>
                                    <input
                                        type="password"
                                        {...registerSteadfast("secretKey")}
                                        className="w-full px-3 py-2 border border-gray-100 dark:border-gray-800 rounded-md bg-white dark:bg-[#1a1a1a] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder={t("steadfast.secretKeyPlaceholder")}
                                    />
                                </div>
                                <div className="pt-2">
                                    <Button type="submit" className="w-full" disabled={savingCourier === "steadfast"}>
                                        {savingCourier === "steadfast" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Key className="h-4 w-4 mr-2" />}
                                        {savingCourier === "steadfast" ? t("common.saving") : t("createEdit.saveSteadfastCredentials")}
                                    </Button>
                                </div>
                                <div className="text-xs text-black/50 dark:text-white/50 mt-2">
                                    {t("steadfast.getCredentialsFrom")} <a href="https://portal.packzy.com" target="_blank" rel="noopener noreferrer" className="text-green-500 hover:underline">{t("steadfast.steadfastPortal")}</a>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}
                {/* RedX Credentials */}
                {hasPermission(user, FeaturePermission.REDX) && (
                    <Card className="border border-black/10 dark:border-white/10">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <Truck className="h-5 w-5 text-red-500" />
                                <CardTitle className="text-base font-semibold">{t("redx.credentialsTitle")}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmitRedX(onSubmitRedX)} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-black/70 dark:text-white/70">
                                        {t("redx.apiToken")}
                                    </label>
                                    <input
                                        type="password"
                                        {...registerRedX("token")}
                                        className="w-full px-3 py-2 border border-black/10 dark:border-white/10 rounded-md bg-white dark:bg-[#1a1a1a] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                        placeholder={t("redx.apiTokenPlaceholder")}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        {...registerRedX("sandbox")}
                                        id="redx-sandbox"
                                        className="rounded"
                                    />
                                    <label htmlFor="redx-sandbox" className="text-sm text-black/70 dark:text-white/70">
                                        {t("redx.useSandbox")}
                                    </label>
                                </div>
                                <div className="pt-2">
                                    <Button type="submit" className="w-full" disabled={savingCourier === "redx"}>
                                        {savingCourier === "redx" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Key className="h-4 w-4 mr-2" />}
                                        {savingCourier === "redx" ? t("common.saving") : t("redx.saveCredentials")}
                                    </Button>
                                </div>
                                <div className="text-xs text-black/50 dark:text-white/50 mt-2">
                                    {t("redx.getCredentialsFrom")} <a href="https://redx.com.bd/developer-api/" target="_blank" rel="noopener noreferrer" className="text-red-500 hover:underline">{t("redx.redxPortal")}</a>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default CourierSettings;
