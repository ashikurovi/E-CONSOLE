import React, { useMemo } from "react";
import toast from "react-hot-toast";
import ReusableTable from "@/components/table/reusable-table";
import { Button } from "@/components/ui/button";
import {
  useGetPromocodesQuery,
  useDeletePromocodeMutation,
  useTogglePromocodeActiveMutation,
} from "@/features/promocode/promocodeApiSlice";
import PromocodeForm from "./components/PromocodeForm";
import PromocodeEditForm from "./components/PromocodeEditForm";

const PromocodePage = () => {
  const { data: promos = [], isLoading } = useGetPromocodesQuery();
  const [deletePromocode, { isLoading: isDeleting }] = useDeletePromocodeMutation();
  const [toggleActive, { isLoading: isToggling }] = useTogglePromocodeActiveMutation();

  const headers = useMemo(
    () => [
      { header: "Code", field: "code" },
      { header: "Type", field: "type" },
      { header: "Value", field: "value" },
      { header: "Uses", field: "uses" },
      { header: "Min Order", field: "minOrder" },
      { header: "Period", field: "period" },
      { header: "Status", field: "status" },
      { header: "Actions", field: "actions" },
    ],
    []
  );

  const tableData = useMemo(
    () =>
      promos.map((p) => {
        const isPercentage = String(p?.discountType).toLowerCase() === "percentage";
        const valueLabel =
          typeof p?.discountValue === "number"
            ? isPercentage
              ? `${p.discountValue}%`
              : `$${Number(p.discountValue).toFixed(2)}`
            : String(p?.discountValue ?? "-");

        const minOrderLabel =
          typeof p?.minOrderAmount === "number"
            ? `$${Number(p.minOrderAmount).toFixed(2)}`
            : p?.minOrderAmount
            ? `$${Number(p.minOrderAmount || 0).toFixed(2)}`
            : "-";

        const starts =
          p?.startsAt ? new Date(p.startsAt).toLocaleString() : "-";
        const expires =
          p?.expiresAt ? new Date(p.expiresAt).toLocaleString() : "-";
        const periodLabel =
          starts === "-" && expires === "-" ? "-" : `${starts} → ${expires}`;

        return {
          code: p?.code ?? "-",
          type: isPercentage ? "Percentage" : "Fixed",
          value: valueLabel,
          uses:
            p?.maxUses != null
              ? `${p?.currentUses ?? 0} / ${p?.maxUses}`
              : `${p?.currentUses ?? 0}`,
          minOrder: minOrderLabel,
          period: periodLabel,
          status: p?.isActive ? "Active" : "Disabled",
          actions: (
            <div className="flex items-center gap-2 justify-end">
              <Button
                variant={p?.isActive ? "outline" : "default"}
                size="sm"
                onClick={async () => {
                  const res = await toggleActive({ id: p.id, active: !p.isActive });
                  if (res?.data) {
                    toast.success("Promocode state updated");
                  } else {
                    toast.error(res?.error?.data?.message || "Failed to update promocode");
                  }
                }}
                disabled={isToggling}
              >
                {p?.isActive ? "Disable" : "Activate"}
              </Button>

              <PromocodeEditForm promocode={p} />

              <Button
                variant="destructive"
                size="sm"
                onClick={async () => {
                  if (!confirm(`Delete promocode "${p?.code}"?`)) return;
                  const res = await deletePromocode(p.id);
                  if (res?.data) {
                    toast.success("Promocode deleted");
                  } else {
                    toast.error(res?.error?.data?.message || "Failed to delete promocode");
                  }
                }}
                disabled={isDeleting}
              >
                Delete
              </Button>
            </div>
          ),
        };
      }),
    [promos, deletePromocode, toggleActive, isDeleting, isToggling]
  );

  return (
    <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Promocodes</h3>
        <PromocodeForm />
      </div>

      <ReusableTable
        data={tableData}
        headers={headers}
        total={promos.length}
        isLoading={isLoading}
        py="py-2"
      />
    </div>
  );
};

export default PromocodePage;