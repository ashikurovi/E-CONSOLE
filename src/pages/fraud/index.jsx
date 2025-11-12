import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import ReusableTable from "@/components/table/reusable-table";
import { Button } from "@/components/ui/button";
import {
  useLazyCheckUserRiskQuery,
  useFlagUserMutation,
  useUnflagUserMutation,
} from "@/features/fraud/fraudApiSlice";

const FraudPage = () => {
  const [checkType, setCheckType] = useState("email"); // 'email' | 'name' | 'phone'
  const [queryValue, setQueryValue] = useState("");
  const [triggerCheck, { data, isFetching, isLoading: isChecking }] = useLazyCheckUserRiskQuery();
  const [flagUser, { isLoading: isFlagging }] = useFlagUserMutation();
  const [unflagUser, { isLoading: isUnflagging }] = useUnflagUserMutation();

  const results = useMemo(() => {
    // API returns res.data which is either an object (email/phone) or array (name)
    if (!data) return [];
    return Array.isArray(data) ? data : [data];
  }, [data]);

  const headers = useMemo(
    () => [
      { header: "User ID", field: "id" },
      { header: "Name", field: "name" },
      { header: "Email", field: "email" },
      { header: "Phone", field: "phone" },
      { header: "Risk Score", field: "riskScore" },
      { header: "Actions", field: "actions" },
    ],
    []
  );

  const tableData = useMemo(
    () =>
      results.map((u) => ({
        id: u?.id ?? "-",
        name: u?.name ?? u?.fullName ?? "-",
        email: u?.email ?? "-",
        phone: u?.phone ?? "-",
        riskScore:
          typeof u?.riskScore === "number"
            ? `${u.riskScore}`
            : u?.riskScore ?? u?.risk?.score ?? "-",
        actions: (
          <div className="flex items-center gap-2 justify-end">
            <Button
              size="sm"
              variant="destructive"
              disabled={isFlagging}
              onClick={async () => {
                const reason = window.prompt("Enter reason to flag (ban) this user:");
                if (!reason || !reason.trim()) return;
                const res = await flagUser({ id: u?.id, reason });
                if (res?.data) toast.success("User flagged");
                else toast.error(res?.error?.data?.message || "Failed to flag user");
              }}
            >
              {isFlagging ? "Flagging..." : "Flag User"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={isUnflagging}
              onClick={async () => {
                const res = await unflagUser({ id: u?.id });
                if (res?.data) toast.success("User unflagged");
                else toast.error(res?.error?.data?.message || "Failed to unflag user");
              }}
            >
              {isUnflagging ? "Unflagging..." : "Unflag User"}
            </Button>
          </div>
        ),
      })),
    [results, flagUser, unflagUser, isFlagging, isUnflagging]
  );

  const runCheck = async () => {
    const value = queryValue?.trim();
    if (!value) {
      toast.error("Please provide a value for the selected check type.");
      return;
    }
    try {
      await triggerCheck({ [checkType]: value }).unwrap();
      toast.success("Risk check complete");
    } catch (e) {
      toast.error(e?.data?.message || "Failed to run risk check");
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">Fraud Checker</h2>
      </div>

      <div className="flex flex-col md:flex-row gap-3 items-start md:items-end mb-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Check Type</label>
          <select
            className="border rounded-md px-3 py-2 dark:bg-[#242424]"
            value={checkType}
            onChange={(e) => setCheckType(e.target.value)}
          >
            <option value="email">Email</option>
            <option value="name">Name</option>
            <option value="phone">Phone</option>
          </select>
        </div>

        <div className="flex-1 w-full md:w-auto">
          <label className="text-sm font-medium mb-1 block">Value</label>
          <input
            type="text"
            placeholder={`Enter ${checkType}`}
            className="border rounded-md px-3 py-2 w-full dark:bg-[#242424]"
            value={queryValue}
            onChange={(e) => setQueryValue(e.target.value)}
          />
        </div>

        <Button size="sm" variant="outline" disabled={isChecking || isFetching} onClick={runCheck}>
          {isChecking || isFetching ? "Checking..." : "Run Check"}
        </Button>
      </div>

      <ReusableTable
        data={tableData}
        headers={headers}
        total={results.length}
        isLoading={isChecking || isFetching}
        py="py-2"
      />
    </div>
  );
};

export default FraudPage;