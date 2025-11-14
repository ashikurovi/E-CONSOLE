import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import TextField from "@/components/input/TextField";
import {
  useGetSettingsQuery,
  useCreateSettingMutation,
  useUpdateSettingMutation,
} from "@/features/setting/settingApiSlice";

const SettingsPage = () => {
  const { data: settings = [], isLoading } = useGetSettingsQuery();
  const [createSetting, { isLoading: isCreating }] = useCreateSettingMutation();
  const [updateSetting, { isLoading: isUpdating }] = useUpdateSettingMutation();

  const current = useMemo(() => (Array.isArray(settings) && settings.length ? settings[0] : null), [settings]);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      companyName: "",
      logo: "",
      email: "",
      phone: "",
      location: "",
    },
  });

  useEffect(() => {
    if (current) {
      reset({
        companyName: current.companyName || "",
        logo: current.logo || "",
        email: current.email || "",
        phone: current.phone || "",
        location: current.location || "",
      });
    }
  }, [current, reset]);

  const onSubmit = async (data) => {
    try {
      if (current?.id) {
        const res = await updateSetting({ id: current.id, ...data });
        if (res?.data) toast.success("Settings updated");
        else toast.error(res?.error?.data?.message || "Failed to update settings");
      } else {
        const res = await createSetting(data);
        if (res?.data) {
          toast.success("Settings created");
        } else {
          toast.error(res?.error?.data?.message || "Failed to create settings");
        }
      }
    } catch (e) {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">Settings</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField placeholder="Company Name" register={register} name="companyName" />
        <TextField placeholder="Logo URL (optional)" register={register} name="logo" />
        <TextField placeholder="Contact Email" type="email" register={register} name="email" />
        <TextField placeholder="Phone (optional)" register={register} name="phone" />
        <TextField placeholder="Location (optional)" register={register} name="location" />

        <div className="md:col-span-2 flex justify-end gap-2 mt-2">
          <Button type="submit" disabled={isLoading || isCreating || isUpdating}>
            {current ? (isUpdating ? "Updating..." : "Update Settings") : isCreating ? "Creating..." : "Create Settings"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;