import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useGetCitiesQuery,
  useGetZonesQuery,
  useGetAreasQuery,
} from "@/features/pathao/pathaoApiSlice";
import {
  MapPin,
  ChevronRight,
  Map,
  Navigation,
  Loader2,
  Building,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Locations = () => {
  const { t } = useTranslation();
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);

  const { data: citiesData, isLoading: isLoadingCities } = useGetCitiesQuery();
  const { data: zonesData, isLoading: isLoadingZones } = useGetZonesQuery(
    selectedCity?.city_id,
    {
      skip: !selectedCity,
    },
  );
  const { data: areasData, isLoading: isLoadingAreas } = useGetAreasQuery(
    selectedZone?.zone_id,
    {
      skip: !selectedZone,
    },
  );

  const cities = citiesData?.data?.data || [];
  const zones = zonesData?.data?.data || [];
  const areas = areasData?.data?.data || [];

  return (
    <div className="min-h-screen  py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Premium Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-2xl">
              <Map className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#8B5CF6] via-[#7C3AED] to-[#8B5CF6] bg-clip-text text-transparent">
                {t("pathao.browseLocations")}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-base">
                {t("pathao.locationsDesc") ||
                  "Browse cities, zones, and areas for delivery"}
              </p>
            </div>
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        {(selectedCity || selectedZone) && (
          <div className="mb-6 p-4 bg-white dark:bg-gray-950/50 border-2 border-[#8B5CF6]/20 rounded-2xl">
            <div className="flex items-center flex-wrap gap-2 text-sm">
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                Selected:
              </span>
              {selectedCity && (
                <>
                  <span className="px-3 py-1.5 bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white rounded-full font-semibold flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {selectedCity.city_name}
                  </span>
                  {selectedZone && (
                    <>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                      <span className="px-3 py-1.5 bg-[#8B5CF6]/10 text-[#8B5CF6] border-2 border-[#8B5CF6]/20 rounded-full font-semibold">
                        {selectedZone.zone_name}
                      </span>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Location Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cities */}
          <Card className="border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950/50 rounded-3xl overflow-hidden">
            <CardHeader className="border-b-2 border-gray-100 dark:border-gray-800 bg-gradient-to-r from-blue-50 to-white dark:from-blue-900/10 dark:to-gray-900 pb-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                    <Building className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-gray-900 dark:text-white">
                      {t("pathao.cities")}
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      {cities.length} available
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[500px] overflow-y-auto">
                {isLoadingCities ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 text-[#8B5CF6] animate-spin mb-3" />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t("common.loading")}
                    </p>
                  </div>
                ) : cities.length === 0 ? (
                  <div className="p-8 text-center">
                    <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No cities available
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {cities.map((city) => (
                      <button
                        key={city.city_id}
                        onClick={() => {
                          setSelectedCity(city);
                          setSelectedZone(null);
                        }}
                        className={`w-full text-left p-4 transition-all duration-200 flex items-center justify-between group ${
                          selectedCity?.city_id === city.city_id
                            ? "bg-gradient-to-r from-[#8B5CF6]/10 to-[#8B5CF6]/5 border-l-4 border-[#8B5CF6]"
                            : "hover:bg-gray-50 dark:hover:bg-gray-900/50 border-l-4 border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className={`p-2 rounded-lg transition-all duration-200 ${
                              selectedCity?.city_id === city.city_id
                                ? "bg-[#8B5CF6]/20"
                                : "bg-gray-100 dark:bg-gray-800 group-hover:bg-[#8B5CF6]/10"
                            }`}
                          >
                            <MapPin
                              className={`h-4 w-4 ${
                                selectedCity?.city_id === city.city_id
                                  ? "text-[#8B5CF6]"
                                  : "text-gray-500 dark:text-gray-400 group-hover:text-[#8B5CF6]"
                              }`}
                            />
                          </div>
                          <span
                            className={`text-sm font-medium truncate ${
                              selectedCity?.city_id === city.city_id
                                ? "text-[#8B5CF6] font-semibold"
                                : "text-gray-700 dark:text-gray-300 group-hover:text-[#8B5CF6]"
                            }`}
                          >
                            {city.city_name}
                          </span>
                        </div>
                        <ChevronRight
                          className={`h-5 w-5 transition-all duration-200 flex-shrink-0 ${
                            selectedCity?.city_id === city.city_id
                              ? "text-[#8B5CF6] translate-x-1"
                              : "text-gray-400 group-hover:text-[#8B5CF6] group-hover:translate-x-1"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Zones */}
          <Card className="border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950/50 rounded-3xl overflow-hidden">
            <CardHeader className="border-b-2 border-gray-100 dark:border-gray-800 bg-gradient-to-r from-emerald-50 to-white dark:from-emerald-900/10 dark:to-gray-900 pb-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl">
                    <Navigation className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-gray-900 dark:text-white">
                      {t("pathao.zones")}
                    </CardTitle>
                    {selectedCity ? (
                      <CardDescription className="text-xs mt-0.5">
                        {zones.length} in {selectedCity.city_name}
                      </CardDescription>
                    ) : (
                      <CardDescription className="text-xs mt-0.5">
                        Select a city first
                      </CardDescription>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[500px] overflow-y-auto">
                {!selectedCity ? (
                  <div className="p-12 text-center">
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl inline-block mb-4">
                      <Navigation className="h-12 w-12 text-emerald-400 dark:text-emerald-500" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                      {t("pathao.selectCityToViewZones") || "Select a City"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Choose a city to view its zones
                    </p>
                  </div>
                ) : isLoadingZones ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 text-[#8B5CF6] animate-spin mb-3" />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t("common.loading")}
                    </p>
                  </div>
                ) : zones.length === 0 ? (
                  <div className="p-8 text-center">
                    <Navigation className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t("pathao.noZonesAvailable")}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {zones.map((zone) => (
                      <button
                        key={zone.zone_id}
                        onClick={() => setSelectedZone(zone)}
                        className={`w-full text-left p-4 transition-all duration-200 flex items-center justify-between group ${
                          selectedZone?.zone_id === zone.zone_id
                            ? "bg-gradient-to-r from-[#8B5CF6]/10 to-[#8B5CF6]/5 border-l-4 border-[#8B5CF6]"
                            : "hover:bg-gray-50 dark:hover:bg-gray-900/50 border-l-4 border-transparent"
                        }`}
                      >
                        <span
                          className={`text-sm font-medium flex-1 truncate ${
                            selectedZone?.zone_id === zone.zone_id
                              ? "text-[#8B5CF6] font-semibold"
                              : "text-gray-700 dark:text-gray-300 group-hover:text-[#8B5CF6]"
                          }`}
                        >
                          {zone.zone_name}
                        </span>
                        <ChevronRight
                          className={`h-5 w-5 transition-all duration-200 flex-shrink-0 ml-2 ${
                            selectedZone?.zone_id === zone.zone_id
                              ? "text-[#8B5CF6] translate-x-1"
                              : "text-gray-400 group-hover:text-[#8B5CF6] group-hover:translate-x-1"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Areas */}
          <Card className="border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950/50 rounded-3xl overflow-hidden">
            <CardHeader className="border-b-2 border-gray-100 dark:border-gray-800 bg-gradient-to-r from-[#8B5CF6]/10 to-white dark:from-[#8B5CF6]/10 dark:to-gray-900 pb-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-xl">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-gray-900 dark:text-white">
                      {t("pathao.areas")}
                    </CardTitle>
                    {selectedZone ? (
                      <CardDescription className="text-xs mt-0.5">
                        {areas.length} in {selectedZone.zone_name}
                      </CardDescription>
                    ) : (
                      <CardDescription className="text-xs mt-0.5">
                        Select a zone first
                      </CardDescription>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[500px] overflow-y-auto">
                {!selectedZone ? (
                  <div className="p-12 text-center">
                    <div className="p-4 bg-[#8B5CF6]/10 rounded-2xl inline-block mb-4">
                      <MapPin className="h-12 w-12 text-[#8B5CF6]" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                      {t("pathao.selectZoneToViewAreas") || "Select a Zone"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Choose a zone to view its areas
                    </p>
                  </div>
                ) : isLoadingAreas ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 text-[#8B5CF6] animate-spin mb-3" />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t("common.loading")}
                    </p>
                  </div>
                ) : areas.length === 0 ? (
                  <div className="p-8 text-center">
                    <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t("pathao.noAreasAvailable")}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {areas.map((area, index) => (
                      <div
                        key={area.area_id}
                        className="p-4 hover:bg-gradient-to-r hover:from-[#8B5CF6]/5 hover:to-transparent transition-all duration-200 group border-l-4 border-transparent hover:border-[#8B5CF6]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#8B5CF6]/10 text-[#8B5CF6] text-xs font-bold group-hover:bg-[#8B5CF6]/20 transition-colors">
                            {index + 1}
                          </div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-[#8B5CF6] transition-colors">
                            {area.area_name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Footer */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-6 bg-white dark:bg-gray-950/50 border-2 border-blue-100 dark:border-blue-900/30 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <Building className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {cities.length}
                </p>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Total Cities
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-gray-950/50 border-2 border-emerald-100 dark:border-emerald-900/30 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl">
                <Navigation className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedCity ? zones.length : "—"}
                </p>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {selectedCity ? "Zones in City" : "Select City"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-gray-950/50 border-2 border-[#8B5CF6]/20 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-xl">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedZone ? areas.length : "—"}
                </p>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {selectedZone ? "Areas in Zone" : "Select Zone"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Locations;
