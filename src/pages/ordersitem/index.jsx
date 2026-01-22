import React, { useMemo, useState } from "react";
import ReusableTable from "@/components/table/reusable-table";
import { useGetOrderItemsQuery } from "@/features/ordersitem/ordersItemApiSlice";
import OrderItemViewModal from "./components/OrderItemViewModal";
import TextField from "@/components/input/TextField";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportOrderItemsToPDF } from "@/utils/pdfExport";
import { useSelector } from "react-redux";

const OrdersItemsPage = () => {
  const authUser = useSelector((state) => state.auth.user);
  const { data: items = [], isLoading } = useGetOrderItemsQuery({ companyId: authUser?.companyId });
  // Default to today's date in YYYY-MM-DD format
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const headers = useMemo(
    () => [
      { header: "Order ID", field: "orderId" },
      { header: "Product", field: "product" },
      { header: "SKU", field: "sku" },
      { header: "Quantity", field: "quantity" },
      { header: "Unit Price", field: "unitPrice" },
      { header: "Total", field: "totalPrice" },
      { header: "Order Status", field: "orderStatus" },
      { header: "Created", field: "createdAt" },
      { header: "Actions", field: "actions" },
    ],
    []
  );

  // Get filtered items based on selected date
  const filteredItems = useMemo(() => {
    if (!selectedDate) return [];

    // Get selected date at midnight for comparison
    const filterDate = new Date(selectedDate);
    filterDate.setHours(0, 0, 0, 0);

    // Filter items to only include orders from the selected date
    return items.filter((it) => {
      if (!it.createdAt) return false;
      const itemDate = new Date(it.createdAt);
      itemDate.setHours(0, 0, 0, 0);
      return itemDate.getTime() === filterDate.getTime();
    });
  }, [items, selectedDate]);

  const tableData = useMemo(() => {
    return filteredItems.map((it) => ({
      orderId: it.orderId,
      product: it.productName,
      sku: it.sku,
      quantity: it.quantity,
      unitPrice:
        typeof it.unitPrice === "number"
          ? `$${Number(it.unitPrice).toFixed(2)}`
          : it.unitPrice ?? "-",
      totalPrice:
        typeof it.totalPrice === "number"
          ? `$${Number(it.totalPrice).toFixed(2)}`
          : it.totalPrice ?? "-",
      orderStatus: it.orderStatus,
      createdAt: it.createdAt ? new Date(it.createdAt).toLocaleString() : "-",
      actions: (
        <div className="flex items-center gap-2 justify-end">
          <OrderItemViewModal orderItem={it} />
        </div>
      ),
    }));
  }, [filteredItems]);

  const handleExportToPDF = () => {
    if (!filteredItems || filteredItems.length === 0) {
      return;
    }

    exportOrderItemsToPDF(filteredItems, `order-items-${selectedDate}`);
  };
  return (
    <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">Order Items</h2>
        <div className="flex items-center gap-2">
          <div className="w-48">
            <TextField
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mb-0"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportToPDF}
            className="flex items-center gap-2"
            disabled={filteredItems.length === 0}
          >
            <Download className="h-4 w-4" />
            Export to PDF
          </Button>
        </div>
      </div>
      <ReusableTable
        data={tableData}
        headers={headers}
        total={tableData.length}
        isLoading={isLoading}
        py="py-2"
      />
    </div>
  );
};

export default OrdersItemsPage;