import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import {
  useGetPickupStoresQuery,
  useCreatePickupStoreMutation,
  useGetAreasQuery,
} from "@/features/redx/redxApiSlice";
import toast from "react-hot-toast";
import TextField from "@/components/input/TextField";
import PrimaryButton from "@/components/buttons/primary-button";
import { Store, Plus, MapPin } from "lucide-react";

const ManageStores = () => {
  const { t } = useTranslation();
  const { data: storesData, isLoading: isLoadingStores, refetch } =
    useGetPickupStoresQuery();
  const [createStore, { isLoading: isCreating }] = useCreatePickupStoreMutation();
  const { data: areasData } = useGetAreasQuery();

  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      area_id: "",
    },
  });

  const stores = storesData?.pickup_stores || [];
  const areas = areasData?.areas || [];

  const onSubmit = async (data) => {
    try {
      const storeData = {
        name: data.name,
        phone: data.phone,
        address: data.address,
        area_id: Number(data.area_id),
      };

      const result = await createStore(storeData).unwrap();

      if (result.id) {
        toast.success(t("redx.storeCreatedSuccess"));
        reset();
        setShowForm(false);
        refetch();
      }
    } catch (error) {
      const errorMessage =
        error?.data?.message || t("redx.createStoreFailed");
      toast.error(errorMessage);
      console.error("Create store error:", error);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{t("redx.manageStoresTitle")}</h3>
        <PrimaryButton
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {showForm ? t("common.cancel") : t("redx.addNewStore")}
        </PrimaryButton>
      </div>

      {showForm && (
        <div className="mb-6 p-4 border border-black/10 dark:border-white/10 rounded-lg bg-black/5 dark:bg-white/5">
          <h4 className="text-md font-semibold mb-4">{t("redx.createNewStore")}</h4>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label={t("redx.storeName")}
                name="name"
                register={register}
                registerOptions={{ required: t("redx.storeNameRequired") }}
                placeholder="Main Store"
                error={errors.name}
              />
              <TextField
                label={t("redx.storePhone")}
                name="phone"
                type="tel"
                register={register}
                registerOptions={{
                  required: t("redx.storePhoneRequired"),
                  pattern: {
                    value: /^01[0-9]{9}$/,
                    message: t("redx.invalidPhoneFormat"),
                  },
                }}
                placeholder="01XXXXXXXXX"
                error={errors.phone}
              />
            </div>

            <div>
              <label className="text-black/50 dark:text-white/50 text-sm ml-1 mb-2 block">
                {t("redx.area")} *
              </label>
              <select
                {...register("area_id", { required: t("redx.areaRequired") })}
                className="border border-black/5 dark:border-white/10 py-2.5 px-4 bg-bg50 w-full outline-none focus:border-green-300/50 dark:focus:border-green-300/50 dark:text-white/90 rounded"
              >
                <option value="">{t("redx.selectArea")}</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name} ({area.division_name})
                  </option>
                ))}
              </select>
              {errors.area_id && (
                <span className="text-red-500 text-xs ml-1">
                  {errors.area_id.message}
                </span>
              )}
            </div>

            <TextField
              label={t("redx.storeAddress")}
              name="address"
              register={register}
              registerOptions={{ required: t("redx.storeAddressRequired") }}
              placeholder={t("redx.addressPlaceholder")}
              multiline
              rows={3}
              error={errors.address}
            />

            <PrimaryButton type="submit" isLoading={isCreating} className="w-full md:w-auto">
              {t("redx.createStore")}
            </PrimaryButton>
          </form>
        </div>
      )}

      <div>
        <h4 className="text-md font-semibold mb-3">{t("redx.yourStores")}</h4>
        {isLoadingStores ? (
          <p className="text-black/60 dark:text-white/60">{t("redx.loadingStores")}</p>
        ) : stores.length === 0 ? (
          <div className="p-8 text-center border border-black/10 dark:border-white/10 rounded-lg bg-black/5 dark:bg-white/5">
            <Store className="h-12 w-12 mx-auto mb-3 text-black/30 dark:text-white/30" />
            <p className="text-black/60 dark:text-white/60">{t("redx.noStoresFoundDesc")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stores.map((store) => (
              <div
                key={store.id}
                className="p-4 border border-black/10 dark:border-white/10 rounded-lg bg-black/5 dark:bg-white/5"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <Store className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold mb-1">{store.name}</h5>
                    <p className="text-sm text-black/60 dark:text-white/60 mb-2">
                      {store.phone}
                    </p>
                    <div className="flex items-start gap-2 text-xs text-black/50 dark:text-white/50">
                      <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span>{store.address}</span>
                    </div>
                    {store.area_name && (
                      <p className="text-xs text-black/40 dark:text-white/40 mt-1">
                        {store.area_name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageStores;
