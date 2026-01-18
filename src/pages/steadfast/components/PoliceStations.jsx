import React from "react";
import { useGetPoliceStationsQuery } from "@/features/steadfast/steadfastApiSlice";
import ReusableTable from "@/components/table/reusable-table";

const PoliceStations = () => {
  const { data: policeStations = [], isLoading } = useGetPoliceStationsQuery();

  // Determine headers based on data structure
  const getHeaders = () => {
    if (!policeStations || policeStations.length === 0) {
      return [
        { header: "Name", field: "name" },
        { header: "Address", field: "address" },
        { header: "Phone", field: "phone" },
      ];
    }

    const firstItem = policeStations[0];
    return Object.keys(firstItem).map((key) => ({
      header: key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      field: key,
    }));
  };

  const headers = getHeaders();

  const tableData = Array.isArray(policeStations)
    ? policeStations.map((station, index) => {
        const row = { id: index + 1 };
        headers.forEach((header) => {
          row[header.field] = station[header.field] || "-";
        });
        return row;
      })
    : [];

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Police Stations</h3>
      <p className="text-sm text-black/60 dark:text-white/60 mb-4">
        List of available police stations
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
