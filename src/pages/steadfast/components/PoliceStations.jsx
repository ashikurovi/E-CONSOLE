import React from "react";
import { useTranslation } from "react-i18next";
import { useGetPoliceStationsQuery } from "@/features/steadfast/steadfastApiSlice";
import ReusableTable from "@/components/table/reusable-table";

const PoliceStations = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useGetPoliceStationsQuery();
  const policeStations = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.police_stations)
        ? data.police_stations
        : [];

  // Determine headers based on data structure
  const getHeaders = () => {
    if (policeStations.length === 0) {
      return [
        { header: t("steadfast.name"), field: "name" },
        { header: t("steadfast.address"), field: "address" },
        { header: t("steadfast.phone"), field: "phone" },
      ];
    }

    const firstItem = policeStations[0];
    if (!firstItem || typeof firstItem !== "object") {
      return [
        { header: t("steadfast.name"), field: "name" },
        { header: t("steadfast.address"), field: "address" },
        { header: t("steadfast.phone"), field: "phone" },
      ];
    }
    return Object.keys(firstItem).map((key) => ({
      header: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      field: key,
    }));
  };

  const headers = getHeaders();

  const toRenderableValue = (value) => {
    if (value == null || value === "") return "-";
    if (typeof value === "object") {
      return Array.isArray(value) ? value.join(", ") : JSON.stringify(value);
    }
    return String(value);
  };

  const tableData = Array.isArray(policeStations)
    ? policeStations.map((station, index) => {
        const row = { id: index + 1 };
        headers.forEach((header) => {
          row[header.field] = toRenderableValue(station[header.field]);
        });
        return row;
      })
    : [];

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">{t("steadfast.policeStationsTitle")}</h3>
      <p className="text-sm text-black/60 dark:text-white/60 mb-4">
        {t("steadfast.policeStationsDesc")}
      </p>

      <ReusableTable
        data={tableData}
        headers={headers}
        total={policeStations.length}
        isLoading={isLoading}
        py="py-2"
      />
    </div>
  );
};

export default PoliceStations;
