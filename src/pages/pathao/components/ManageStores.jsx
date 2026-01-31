import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import {
  useGetStoresQuery,
  useCreateStoreMutation,
  useGetCitiesQuery,
  useGetZonesQuery,
  useGetAreasQuery,
} from "@/features/pathao/pathaoApiSlice";
import toast from "react-hot-toast";
import TextField from "@/components/input/TextField";
import PrimaryButton from "@/components/buttons/primary-button";
import { Store, Plus, MapPin } from "lucide-react";

const ManageStores = () => {
  const { t } = useTranslation();
  const { data: storesData, isLoading: isLoadingStores, refetch } = useGetStoresQuery();
  const [createStore, { isLoading: isCreating }] = useCreateStoreMutation();
  const { data: citiesData } = useGetCitiesQuery();
  
  const [showForm, setShowForm] = useState(false);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedZone, setSelectedZone] = useState("");
  
  const { data: zonesData } = useGetZonesQuery(selectedCity, {
    skip: !selectedCity,
  });
  
  const { data: areasData } = useGetAreasQuery(selectedZone, {
    skip: !selectedZone,
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      store_name: "",
      store_contact_name: "",
      store_contact_phone: "",
      store_address: "",
      store_city: "",
      store_zone: "",
      store_area: "",
    },
  });

  // Watch city and zone changes
  const watchCity = watch("store_city");
  const watchZone = watch("store_zone");

  React.useEffect(() => {
    if (watchCity) {
      setSelectedCity(watchCity);
      setValue("store_zone", "");
      setValue("store_area", "");
    }
  }, [watchCity, setValue]);

  React.useEffect(() => {
    if (watchZone) {
      setSelectedZone(watchZone);
      setValue("store_area", "");
    }
  }, [watchZone, setValue]);

  const onSubmit = async (data) => {
    try {
      const storeData = {
        store_name: data.store_name,
        store_contact_name: data.store_contact_name,
        store_contact_phone: data.store_contact_phone,
        store_address: data.store_address,
        store_city_id: Number(data.store_city),
        store_zone_id: Number(data.store_zone),
        store_area_id: Number(data.store_area),
      };

      const result = await createStore(storeData).unwrap();
      
      if (result.code === 200 || result.type === "success") {
        toast.success(t("pathao.storeCreatedSuccess"));
        reset();
        setShowForm(false);
        refetch();
      }
    } catch (error) {
      const errorMessage = error?.data?.message || t("pathao.createStoreFailed");
      toast.error(errorMessage);
      console.error("Create store error:", error);
    }
  };

  const stores = storesData?.data?.data || [];
  const cities = citiesData?.data?.data || [];
  const zones = zonesData?.data?.data || [];
  const areas = areasData?.data?.data || [];

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{t("pathao.manageStoresTitle")}</h3>
        <PrimaryButton
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {showForm ? t("common.cancel") : t("pathao.addNewStore")}
        </PrimaryButton>
      </div>

      {showForm && (
        <div className="mb-6 p-4 border border-gray-100 dark:border-gray-800 rounded-lg bg-black/5 dark:bg-white/5">
          <h4 className="text-md font-semibold mb-4">{t("pathao.createNewStore")}</h4>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label={t("pathao.storeName")}
                name="store_name"
                register={register}
                registerOptions={{ required: t("pathao.storeNameRequired") }}
                placeholder="Main Store"
                error={errors.store_name}
              />

              <TextField
                label={t("pathao.contactName")}
                name="store_contact_name"
                register={register}
                registerOptions={{ required: t("pathao.contactNameRequired") }}
                placeholder="John Doe"
                error={errors.store_contact_name}
              />

              <TextField
                label={t("pathao.contactPhone")}
                name="store_contact_phone"
                type="tel"
                register={register}
                registerOptions={{
                  required: t("pathao.contactPhoneRequired"),
                  pattern: {
                    value: /^01[0-9]{9}$/,
                    message: t("pathao.invalidPhoneFormat"),
                  },
                }}
                placeholder="01XXXXXXXXX"
                error={errors.store_contact_phone}
              />

              <div>
                <label className="text-black/50 dark:text-white/50 text-sm ml-1 mb-2 block">
                  {t("pathao.city")}
                </label>
                <select
                  {...register("store_city", { required: t("pathao.cityRequired") })}
                  className="border border-black/5 dark:border-gray-800 py-2.5 px-4 bg-gray-50 dark:bg-[#1a1f26] w-full outline-none focus:border-green-300/50 dark:focus:border-green-300/50 dark:text-white/90 rounded"
                >
                  <option value="">{t("pathao.selectCity")}</option>
                  {cities.map((city) => (
                    <option key={city.city_id} value={city.city_id}>
                      {city.city_name}
                    </option>
                  ))}
                </select>
                {errors.store_city && (
                  <span className="text-red-500 text-xs ml-1">{errors.store_city.message}</span>
                )}
              </div>

              <div>
                <label className="text-black/50 dark:text-white/50 text-sm ml-1 mb-2 block">
                  {t("pathao.zone")}
                </label>
                <select
                  {...register("store_zone", { required: t("pathao.zoneRequired") })}
                  className="border border-black/5 dark:border-gray-800 py-2.5 px-4 bg-gray-50 dark:bg-[#1a1f26] w-full outline-none focus:border-green-300/50 dark:focus:border-green-300/50 dark:text-white/90 rounded"
                  disabled={!selectedCity}
                >
                  <option value="">{t("pathao.selectZone")}</option>
                  {zones.map((zone) => (
                    <option key={zone.zone_id} value={zone.zone_id}>
                      {zone.zone_name}
                    </option>
                  ))}
                </select>
                {errors.store_zone && (
                  <span className="text-red-500 text-xs ml-1">{errors.store_zone.message}</span>
                )}
              </div>

              <div>
                <label className="text-black/50 dark:text-white/50 text-sm ml-1 mb-2 block">
                  {t("pathao.area")}
                </label>
                <select
                  {...register("store_area", { required: t("pathao.areaRequired") })}
                  className="border border-black/5 dark:border-gray-800 py-2.5 px-4 bg-gray-50 dark:bg-[#1a1f26] w-full outline-none focus:border-green-300/50 dark:focus:border-green-300/50 dark:text-white/90 rounded"
                  disabled={!selectedZone}
                >
                  <option value="">{t("pathao.selectArea")}</option>
                  {areas.map((area) => (
                    <option key={area.area_id} value={area.area_id}>
                      {area.area_name}
                    </option>
                  ))}
                </select>
                {errors.store_area && (
                  <span className="text-red-500 text-xs ml-1">{errors.store_area.message}</span>
                )}
              </div>
            </div>

            <TextField
              label={t("pathao.storeAddress")}
              name="store_address"
              register={register}
              registerOptions={{ required: t("pathao.storeAddressRequired") }}
              placeholder={t("pathao.addressPlaceholder")}
              multiline
              rows={3}
              error={errors.store_address}
            />

            <PrimaryButton type="submit" isLoading={isCreating} className="w-full md:w-auto">
              {t("pathao.createStore")}
            </PrimaryButton>
          </form>
        </div>
      )}

      {/* Existing Stores */}
      <div>
        <h4 className="text-md font-semibold mb-3">{t("pathao.yourStores")}</h4>
        {isLoadingStores ? (
          <p className="text-black/60 dark:text-white/60">{t("pathao.loadingStores")}</p>
        ) : stores.length === 0 ? (
          <div className="p-8 text-center border border-gray-100 dark:border-gray-800 rounded-lg bg-black/5 dark:bg-white/5">
            <Store className="h-12 w-12 mx-auto mb-3 text-black/30 dark:text-white/30" />
            <p className="text-black/60 dark:text-white/60">{t("pathao.noStoresFoundDesc")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stores.map((store) => (
              <div
                key={store.store_id}
                className="p-4 border border-gray-100 dark:border-gray-800 rounded-lg bg-black/5 dark:bg-white/5"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Store className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold mb-1">{store.store_name}</h5>
                    <p className="text-sm text-black/60 dark:text-white/60 mb-2">
                      {store.store_contact_name} • {store.store_contact_phone}
                    </p>
                    <div className="flex items-start gap-2 text-xs text-black/50 dark:text-white/50">
                      <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span>{store.store_address}</span>
                    </div>
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
