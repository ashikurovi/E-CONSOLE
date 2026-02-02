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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Store, Plus, MapPin, Loader2, ChevronDown, Building2, Phone, User, X } from "lucide-react";

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

  // Premium select input styling
  const selectClassName = "flex h-14 w-full rounded-2xl border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950/50 px-5 py-3.5 text-[15px] font-medium text-gray-900 dark:text-gray-100 ring-offset-background placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#8B5CF6] focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-gray-900 appearance-none transition-all duration-200 hover:border-gray-200 dark:hover:border-gray-700";
  const selectWrapperClass = "relative group";
  const selectIconClass = "absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 pointer-events-none transition-transform duration-200 group-focus-within:rotate-180";

  return (
    <div className="min-h-screen  py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Premium Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-2xl">
              <Store className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#8B5CF6] via-[#7C3AED] to-[#8B5CF6] bg-clip-text text-transparent">
                {t("pathao.manageStoresTitle")}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-base">
                {t("pathao.manageStoresDesc") || "Manage your Pathao stores and locations"}
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="group h-14 px-8 text-base font-bold bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#6D28D9] text-white rounded-2xl transition-all duration-300"
          >
            {showForm ? (
              <>
                <X className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                {t("common.cancel")}
              </>
            ) : (
              <>
                <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                {t("pathao.addNewStore")}
              </>
            )}
          </Button>
        </div>

        <div className="space-y-7">
          {showForm && (
            <Card className="border-2 border-[#8B5CF6]/20 bg-gradient-to-br from-[#8B5CF6]/5 via-white to-[#8B5CF6]/5 dark:from-[#8B5CF6]/10 dark:via-gray-900 dark:to-[#8B5CF6]/10 rounded-3xl overflow-hidden">
              <CardHeader className="border-b-2 border-[#8B5CF6]/10 bg-white/50 dark:bg-gray-950/50 pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-xl">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                      {t("pathao.createNewStore")}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Add a new store location to your Pathao account
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-8 pb-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  {/* Store Information Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-5">
                      <div className="w-1.5 h-6 bg-[#8B5CF6] rounded-full"></div>
                      <h5 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                        Store Information
                      </h5>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <TextField
                        label={t("pathao.storeName")}
                        name="store_name"
                        register={register}
                        registerOptions={{ required: t("pathao.storeNameRequired") }}
                        placeholder="Main Store"
                        error={errors.store_name}
                        inputClassName="bg-white dark:bg-gray-950/50 border-2 border-gray-100 dark:border-gray-800 rounded-2xl h-14 px-5 text-[15px] font-medium focus:ring-2 focus:ring-offset-2 focus:ring-[#8B5CF6] hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-200"
                        className="gap-3"
                      />

                      <TextField
                        label={t("pathao.contactName")}
                        name="store_contact_name"
                        register={register}
                        registerOptions={{ required: t("pathao.contactNameRequired") }}
                        placeholder="John Doe"
                        error={errors.store_contact_name}
                        inputClassName="bg-white dark:bg-gray-950/50 border-2 border-gray-100 dark:border-gray-800 rounded-2xl h-14 px-5 text-[15px] font-medium focus:ring-2 focus:ring-offset-2 focus:ring-[#8B5CF6] hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-200"
                        className="gap-3"
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
                        inputClassName="bg-white dark:bg-gray-950/50 border-2 border-gray-100 dark:border-gray-800 rounded-2xl h-14 px-5 text-[15px] font-medium focus:ring-2 focus:ring-offset-2 focus:ring-[#8B5CF6] hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-200"
                        className="gap-3"
                      />
                    </div>
                  </div>

                  {/* Location Section */}
                  <div>
                    <div className="flex items-center gap-2 mb-5">
                      <div className="w-1.5 h-6 bg-[#8B5CF6] rounded-full"></div>
                      <h5 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                        Location Details
                      </h5>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1 mb-3 block">
                          {t("pathao.city")} <span className="text-red-500">*</span>
                        </label>
                        <div className={selectWrapperClass}>
                          <select
                            {...register("store_city", { required: t("pathao.cityRequired") })}
                            className={selectClassName}
                          >
                            <option value="">{t("pathao.selectCity")}</option>
                            {cities.map((city) => (
                              <option key={city.city_id} value={city.city_id}>
                                {city.city_name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className={selectIconClass} />
                        </div>
                        {errors.store_city && (
                          <span className="text-red-500 text-xs font-medium ml-1 mt-2 flex items-center gap-1">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {errors.store_city.message}
                          </span>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1 mb-3 block">
                          {t("pathao.zone")} <span className="text-red-500">*</span>
                        </label>
                        <div className={selectWrapperClass}>
                          <select
                            {...register("store_zone", { required: t("pathao.zoneRequired") })}
                            className={selectClassName}
                            disabled={!selectedCity}
                          >
                            <option value="">{t("pathao.selectZone")}</option>
                            {zones.map((zone) => (
                              <option key={zone.zone_id} value={zone.zone_id}>
                                {zone.zone_name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className={selectIconClass} />
                        </div>
                        {errors.store_zone && (
                          <span className="text-red-500 text-xs font-medium ml-1 mt-2 flex items-center gap-1">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {errors.store_zone.message}
                          </span>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1 mb-3 block">
                          {t("pathao.area")} <span className="text-red-500">*</span>
                        </label>
                        <div className={selectWrapperClass}>
                          <select
                            {...register("store_area", { required: t("pathao.areaRequired") })}
                            className={selectClassName}
                            disabled={!selectedZone}
                          >
                            <option value="">{t("pathao.selectArea")}</option>
                            {areas.map((area) => (
                              <option key={area.area_id} value={area.area_id}>
                                {area.area_name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className={selectIconClass} />
                        </div>
                        {errors.store_area && (
                          <span className="text-red-500 text-xs font-medium ml-1 mt-2 flex items-center gap-1">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {errors.store_area.message}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-6">
                      <TextField
                        label={t("pathao.storeAddress")}
                        name="store_address"
                        register={register}
                        registerOptions={{ required: t("pathao.storeAddressRequired") }}
                        placeholder={t("pathao.addressPlaceholder")}
                        multiline
                        rows={3}
                        error={errors.store_address}
                        inputClassName="bg-white dark:bg-gray-950/50 border-2 border-gray-100 dark:border-gray-800 rounded-2xl px-5 py-4 text-[15px] font-medium focus:ring-2 focus:ring-offset-2 focus:ring-[#8B5CF6] hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-200 resize-none"
                        className="gap-3"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button 
                      type="submit" 
                      disabled={isCreating} 
                      className="group h-14 px-10 text-base font-bold bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#6D28D9] text-white rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                          {t("pathao.createStore")}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Existing Stores */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-xl">
                <Store className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                {t("pathao.yourStores")}
              </h4>
            </div>
            
            {isLoadingStores ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-950/50 rounded-3xl border-2 border-gray-100 dark:border-gray-800">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-[#8B5CF6]/20 rounded-full"></div>
                  <div className="w-16 h-16 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                </div>
                <p className="mt-4 text-base font-semibold text-gray-600 dark:text-gray-400">
                  {t("pathao.loadingStores")}
                </p>
              </div>
            ) : stores.length === 0 ? (
              <div className="p-16 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-950">
                <div className="p-5 bg-gray-100 dark:bg-gray-800 rounded-2xl inline-block mb-4">
                  <Store className="h-16 w-16 text-gray-300 dark:text-gray-600" />
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {t("pathao.noStoresFoundDesc")}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Add your first store to start creating delivery orders
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stores.map((store) => (
                  <Card 
                    key={store.store_id} 
                    className="group border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950/50 rounded-2xl overflow-hidden hover:border-[#8B5CF6]/30 dark:hover:border-[#8B5CF6]/30 transition-all duration-300"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-gradient-to-br from-[#8B5CF6]/10 to-[#7C3AED]/10 rounded-xl group-hover:from-[#8B5CF6]/20 group-hover:to-[#7C3AED]/20 transition-all duration-300">
                          <Store className="h-6 w-6 text-[#8B5CF6]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-base font-bold text-gray-900 dark:text-white mb-3 truncate group-hover:text-[#8B5CF6] transition-colors duration-300">
                            {store.store_name}
                          </h5>
                          
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <User className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                                {store.store_contact_name}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                                <Phone className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                              </div>
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {store.store_contact_phone}
                              </p>
                            </div>
                            
                            <div className="flex items-start gap-2 pt-2 border-t-2 border-gray-50 dark:border-gray-800">
                              <div className="p-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg mt-0.5">
                                <MapPin className="h-3.5 w-3.5 text-[#8B5CF6]" />
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                {store.store_address}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageStores;