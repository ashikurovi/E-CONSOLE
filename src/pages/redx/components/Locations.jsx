import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useGetAreasQuery,
  useGetAreasByPostCodeQuery,
  useGetAreasByDistrictQuery,
} from "@/features/redx/redxApiSlice";
import { MapPin } from "lucide-react";

const Locations = () => {
  const { t } = useTranslation();
  const [searchType, setSearchType] = useState("all");
  const [postCode, setPostCode] = useState("");
  const [districtName, setDistrictName] = useState("");

  const { data: areasData } = useGetAreasQuery();
  const { data: areasByPostCode } = useGetAreasByPostCodeQuery(postCode, {
    skip: searchType !== "postcode" || !postCode,
  });
  const { data: areasByDistrict } = useGetAreasByDistrictQuery(districtName, {
    skip: searchType !== "district" || !districtName,
  });

  const areas =
    searchType === "postcode"
      ? areasByPostCode?.areas || []
      : searchType === "district"
      ? areasByDistrict?.areas || []
      : areasData?.areas || [];

  return (
    <div className="max-w-4xl">
      <h3 className="text-lg font-semibold mb-4">{t("redx.browseAreas")}</h3>
      <p className="text-sm text-black/60 dark:text-white/60 mb-6">
        {t("redx.locationsDesc")}
      </p>

      <div className="flex gap-2 flex-wrap mb-4">
        <button
          type="button"
          onClick={() => setSearchType("all")}
          className={`px-4 py-2 rounded-lg text-sm ${searchType === "all" ? "bg-black text-white dark:bg-white dark:text-black" : "bg-black/10 dark:bg-white/10"}`}
        >
          {t("redx.allAreas")}
        </button>
        <button
          type="button"
          onClick={() => setSearchType("postcode")}
          className={`px-4 py-2 rounded-lg text-sm ${searchType === "postcode" ? "bg-black text-white dark:bg-white dark:text-black" : "bg-black/10 dark:bg-white/10"}`}
        >
          {t("redx.byPostCode")}
        </button>
        <button
          type="button"
          onClick={() => setSearchType("district")}
          className={`px-4 py-2 rounded-lg text-sm ${searchType === "district" ? "bg-black text-white dark:bg-white dark:text-black" : "bg-black/10 dark:bg-white/10"}`}
        >
          {t("redx.byDistrict")}
        </button>
      </div>

      {searchType === "postcode" && (
        <div className="mb-4">
          <label className="text-black/50 dark:text-white/50 text-sm ml-1 mb-2 block">
            {t("redx.postCode")}
          </label>
          <input
            type="text"
            value={postCode}
            onChange={(e) => setPostCode(e.target.value)}
            placeholder="1209"
            className="border border-black/5 dark:border-white/10 py-2.5 px-4 bg-bg50 w-full rounded max-w-xs"
          />
        </div>
      )}

      {searchType === "district" && (
        <div className="mb-4">
          <label className="text-black/50 dark:text-white/50 text-sm ml-1 mb-2 block">
            {t("redx.districtName")}
          </label>
          <input
            type="text"
            value={districtName}
            onChange={(e) => setDistrictName(e.target.value)}
            placeholder={t("redx.districtPlaceholder")}
            className="border border-black/5 dark:border-white/10 py-2.5 px-4 bg-bg50 w-full rounded max-w-xs"
          />
        </div>
      )}

      <div className="border border-black/10 dark:border-white/10 rounded-lg overflow-hidden">
        <div className="bg-black/5 dark:bg-white/5 p-3 border-b border-black/10 dark:border-white/10">
          <h4 className="font-semibold text-sm">
            {t("redx.areas")} ({areas.length})
          </h4>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {areas.length === 0 ? (
            <p className="p-4 text-sm text-black/60 dark:text-white/60">
              {searchType === "all"
                ? t("redx.loadingAreas")
                : t("redx.enterSearchCriteria")}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-3">
              {areas.map((area) => (
                <div
                  key={area.id}
                  className="p-3 border border-black/5 dark:border-white/5 rounded-lg flex items-center gap-2"
                >
                  <MapPin className="h-4 w-4 text-black/50 dark:text-white/50 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{area.name}</p>
                    <p className="text-xs text-black/50 dark:text-white/50">
                      {area.division_name} • {area.post_code}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Locations;
