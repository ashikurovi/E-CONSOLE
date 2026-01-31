import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useGetCitiesQuery,
  useGetZonesQuery,
  useGetAreasQuery,
} from "@/features/pathao/pathaoApiSlice";
import { MapPin, ChevronRight } from "lucide-react";

const Locations = () => {
  const { t } = useTranslation();
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);

  const { data: citiesData, isLoading: isLoadingCities } = useGetCitiesQuery();
  const { data: zonesData, isLoading: isLoadingZones } = useGetZonesQuery(selectedCity?.city_id, {
    skip: !selectedCity,
  });
  const { data: areasData, isLoading: isLoadingAreas } = useGetAreasQuery(selectedZone?.zone_id, {
    skip: !selectedZone,
  });

  const cities = citiesData?.data?.data || [];
  const zones = zonesData?.data?.data || [];
  const areas = areasData?.data?.data || [];

  return (
    <div className="max-w-6xl">
      <h3 className="text-lg font-semibold mb-4">{t("pathao.browseLocations")}</h3>
      <p className="text-sm text-black/60 dark:text-white/60 mb-6">
        {t("pathao.locationsDesc")}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Cities */}
        <div className="border border-gray-100 dark:border-gray-800 rounded-lg overflow-hidden">
          <div className="bg-black/5 dark:bg-white/5 p-3 border-b border-gray-100 dark:border-gray-800">
            <h4 className="font-semibold text-sm">{t("pathao.cities")} ({cities.length})</h4>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {isLoadingCities ? (
              <p className="p-4 text-sm text-black/60 dark:text-white/60">{t("common.loading")}</p>
            ) : (
              <div>
                {cities.map((city) => (
                  <button
                    key={city.city_id}
                    onClick={() => {
                      setSelectedCity(city);
                      setSelectedZone(null);
                    }}
                    className={`w-full text-left p-3 border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center justify-between ${
                      selectedCity?.city_id === city.city_id
                        ? "bg-black/10 dark:bg-white/10"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-black/50 dark:text-white/50" />
                      <span className="text-sm">{city.city_name}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-black/30 dark:text-white/30" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Zones */}
        <div className="border border-gray-100 dark:border-gray-800 rounded-lg overflow-hidden">
          <div className="bg-black/5 dark:bg-white/5 p-3 border-b border-gray-100 dark:border-gray-800">
            <h4 className="font-semibold text-sm">
              {t("pathao.zones")} {selectedCity && `(${zones.length})`}
            </h4>
            {selectedCity && (
              <p className="text-xs text-black/50 dark:text-white/50 mt-1">
                {t("pathao.inLabel")} {selectedCity.city_name}
              </p>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {!selectedCity ? (
              <p className="p-4 text-sm text-black/60 dark:text-white/60">
                {t("pathao.selectCityToViewZones")}
              </p>
            ) : isLoadingZones ? (
              <p className="p-4 text-sm text-black/60 dark:text-white/60">{t("common.loading")}</p>
            ) : zones.length === 0 ? (
              <p className="p-4 text-sm text-black/60 dark:text-white/60">
                {t("pathao.noZonesAvailable")}
              </p>
            ) : (
              <div>
                {zones.map((zone) => (
                  <button
                    key={zone.zone_id}
                    onClick={() => setSelectedZone(zone)}
                    className={`w-full text-left p-3 border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center justify-between ${
                      selectedZone?.zone_id === zone.zone_id
                        ? "bg-black/10 dark:bg-white/10"
                        : ""
                    }`}
                  >
                    <span className="text-sm">{zone.zone_name}</span>
                    <ChevronRight className="h-4 w-4 text-black/30 dark:text-white/30" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Areas */}
        <div className="border border-gray-100 dark:border-gray-800 rounded-lg overflow-hidden">
          <div className="bg-black/5 dark:bg-white/5 p-3 border-b border-gray-100 dark:border-gray-800">
            <h4 className="font-semibold text-sm">
              {t("pathao.areas")} {selectedZone && `(${areas.length})`}
            </h4>
            {selectedZone && (
              <p className="text-xs text-black/50 dark:text-white/50 mt-1">
                {t("pathao.inLabel")} {selectedZone.zone_name}
              </p>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {!selectedZone ? (
              <p className="p-4 text-sm text-black/60 dark:text-white/60">
                {t("pathao.selectZoneToViewAreas")}
              </p>
            ) : isLoadingAreas ? (
              <p className="p-4 text-sm text-black/60 dark:text-white/60">{t("common.loading")}</p>
            ) : areas.length === 0 ? (
              <p className="p-4 text-sm text-black/60 dark:text-white/60">
                {t("pathao.noAreasAvailable")}
              </p>
            ) : (
              <div>
                {areas.map((area) => (
                  <div
                    key={area.area_id}
                    className="p-3 border-b border-black/5 dark:border-white/5 text-sm"
                  >
                    {area.area_name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Locations;
