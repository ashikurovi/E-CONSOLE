import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import ReusableTable from "@/components/table/reusable-table";
import { Button } from "@/components/ui/button";
import { Power, Trash2 } from "lucide-react";
import {
  useGetPromocodesQuery,
  useDeletePromocodeMutation,
  useTogglePromocodeActiveMutation,
} from "@/features/promocode/promocodeApiSlice";
import { useNavigate } from "react-router-dom";
import { Pencil } from "lucide-react";
import DeleteModal from "@/components/modals/DeleteModal";
import { useSelector } from "react-redux";

const PromocodePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);
  const { data: promos = [], isLoading } = useGetPromocodesQuery({ companyId: authUser?.companyId });
  const [deletePromocode, { isLoading: isDeleting }] = useDeletePromocodeMutation();
  const [toggleActive, { isLoading: isToggling }] = useTogglePromocodeActiveMutation();
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, promocode: null });

  const headers = useMemo(
    () => [
      { header: t("promocodes.code"), field: "code" },
      { header: t("promocodes.type"), field: "type" },
      { header: t("promocodes.value"), field: "value" },
      { header: t("promocodes.uses"), field: "uses" },
      { header: t("promocodes.minOrder"), field: "minOrder" },
      { header: t("promocodes.period"), field: "period" },
      { header: t("common.status"), field: "status" },
      { header: t("common.actions"), field: "actions" },
    ],
    [t]
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
          type: isPercentage ? t("promocodes.percentage") : t("promocodes.fixed"),
          value: valueLabel,
          uses:
            p?.maxUses != null
              ? `${p?.currentUses ?? 0} / ${p?.maxUses}`
              : `${p?.currentUses ?? 0}`,
          minOrder: minOrderLabel,
          period: periodLabel,
          status: p?.isActive ? t("common.active") : t("common.disabled"),
          actions: (
            <div className="flex items-center gap-2 justify-end">
              <Button
                variant="ghost"
                size="icon"
                onClick={async () => {
                  const res = await toggleActive({ id: p.id, active: !p.isActive });
                  if (res?.data) {
                    toast.success(t("promocodes.promocodeStateUpdated"));
                  } else {
                    toast.error(res?.error?.data?.message || t("promocodes.promocodeUpdateFailed"));
                  }
                }}
                disabled={isToggling}
                className={`${p?.isActive
                  ? "bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400"
                  : "bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400"}`}
                title={p?.isActive ? t("common.disable") : t("common.activate")}
              >
                <Power className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400"
                onClick={() => navigate(`/promocodes/${p.id}/edit`)}
                title={t("common.edit")}
              >
                <Pencil className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteModal({ isOpen: true, promocode: p })}
                disabled={isDeleting}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400"
                title={t("common.delete")}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ),
        };
      }),
    [promos, deletePromocode, toggleActive, isDeleting, isToggling, t]
  );

  return (
    <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{t("promocodes.title")}</h3>
        <Button size="sm" onClick={() => navigate("/promocodes/create")}>
          {t("promocodes.addPromocode")}
        </Button>
      </div>

      <ReusableTable
        data={tableData}
        headers={headers}
        total={promos.length}
        isLoading={isLoading}
        py="py-2"
      />

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, promocode: null })}
        onConfirm={async () => {
          if (!deleteModal.promocode) return;
          const res = await deletePromocode(deleteModal.promocode.id);
          if (res?.data) {
            toast.success(t("promocodes.promocodeDeleted"));
            setDeleteModal({ isOpen: false, promocode: null });
          } else {
            toast.error(res?.error?.data?.message || t("common.failed"));
          }
        }}
        title={t("promocodes.deletePromocode")}
        description={t("promocodes.deletePromocodeDesc")}
        itemName={deleteModal.promocode?.code}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default PromocodePage;