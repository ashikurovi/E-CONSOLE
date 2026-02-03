import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  FileEdit,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

const InventoryHistoryPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Mock Data - Replace with actual API call
  const historyData = [
    {
      id: 1,
      productName: "Wireless Headphones",
      sku: "WH-001",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
      type: "stock_in",
      amount: 50,
      reason: "New shipment received",
      date: new Date(Date.now() - 1000 * 60 * 60 * 2),
      user: "Admin User",
    },
    {
      id: 2,
      productName: "Smart Watch Series 5",
      sku: "SW-005",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80",
      type: "stock_out",
      amount: 12,
      reason: "Order #12345 fulfillment",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24),
      user: "System",
    },
    {
      id: 3,
      productName: "Ergonomic Office Chair",
      sku: "EC-100",
      image: "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=500&q=80",
      type: "update",
      field: "price",
      oldValue: "$120.00",
      newValue: "$125.00",
      date: new Date(Date.now() - 1000 * 60 * 60 * 48),
      user: "Manager",
    },
    {
      id: 4,
      productName: "Wireless Headphones",
      sku: "WH-001",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
      type: "stock_out",
      amount: 5,
      reason: "Damaged goods",
      date: new Date(Date.now() - 1000 * 60 * 60 * 72),
      user: "Admin User",
    },
    {
      id: 5,
      productName: "Gaming Keyboard",
      sku: "GK-202",
      image: "https://images.unsplash.com/photo-1587829741301-dc798b91a446?w=500&q=80",
      type: "created",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      user: "Admin User",
    },
  ];

  const getBadge = (type) => {
    switch (type) {
      case "stock_in":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200 gap-1">
            <ArrowDownCircle className="w-3 h-3" /> Stock In
          </Badge>
        );
      case "stock_out":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200 gap-1">
            <ArrowUpCircle className="w-3 h-3" /> Stock Out
          </Badge>
        );
      case "update":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200 gap-1">
            <FileEdit className="w-3 h-3" /> Updated
          </Badge>
        );
      case "created":
        return (
          <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200 gap-1">
            <Package className="w-3 h-3" /> Created
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-4 lg:p-8 space-y-8 relative">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-50/50 to-transparent dark:from-indigo-950/20 dark:to-transparent -z-10" />

      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="pl-0 hover:bg-transparent hover:text-indigo-600 mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Inventory
          </Button>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Clock className="w-8 h-8 text-indigo-500" />
            Inventory History
          </h1>
          <p className="text-slate-500 mt-2">
            Track all stock movements and product updates
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="bg-white">
            <Download className="w-4 h-4 mr-2" /> Export Log
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by product, SKU, or user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
        <Button variant="outline" className="border-slate-200">
          <Filter className="w-4 h-4 mr-2" /> Filter Type
        </Button>
        <Button variant="outline" className="border-slate-200">
          <Calendar className="w-4 h-4 mr-2" /> Date Range
        </Button>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm"
      >
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="pl-6">Product</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Change</TableHead>
              <TableHead>Reason / Details</TableHead>
              <TableHead>User</TableHead>
              <TableHead className="text-right pr-6">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {historyData.map((item) => (
              <TableRow key={item.id} className="group hover:bg-slate-50/50">
                <TableCell className="pl-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {item.productName}
                      </p>
                      <p className="text-xs text-slate-500">{item.sku}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{getBadge(item.type)}</TableCell>
                <TableCell>
                  {item.type === "stock_in" && (
                    <span className="text-emerald-600 font-bold">
                      +{item.amount}
                    </span>
                  )}
                  {item.type === "stock_out" && (
                    <span className="text-red-600 font-bold">
                      -{item.amount}
                    </span>
                  )}
                  {item.type === "update" && (
                    <span className="text-slate-500">—</span>
                  )}
                  {item.type === "created" && (
                    <span className="text-emerald-600 font-bold">Initial</span>
                  )}
                </TableCell>
                <TableCell>
                  {item.type === "update" ? (
                    <div className="text-sm">
                      <span className="text-slate-500">Changed {item.field}: </span>
                      <span className="line-through text-red-400 mr-2">
                        {item.oldValue}
                      </span>
                      <span className="text-emerald-600 font-medium">
                        {item.newValue}
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-600 dark:text-slate-300">
                      {item.reason || "—"}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                      {item.user.charAt(0)}
                    </div>
                    <span className="text-sm text-slate-600">{item.user}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right pr-6">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      {format(item.date, "MMM d, yyyy")}
                    </span>
                    <span className="text-xs text-slate-500">
                      {format(item.date, "h:mm a")}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
};

export default InventoryHistoryPage;
