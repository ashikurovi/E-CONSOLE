import React, { useState } from "react";
import {
  CheckSquare,
  CheckCircle2,
  Circle,
  Eye,
  Trash2,
  Book,
  Flame,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const UpgradePlanPage = () => {
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(2);
  const [selectedRows, setSelectedRows] = useState(new Set());

  const plans = [
    {
      name: "Basic Plan",
      subtitle: "Suitable plan for starter business",
      price: "99.99",
      features: [
        "Customers Segmentations",
        "Google Integrations",
        "Activity Reminder",
      ],
      buttonText: "Choose Plan",
    },
    {
      name: "Enterprise Plan",
      subtitle: "Best plan for mid-sized businesses",
      price: "119.99",
      features: [
        "Get a Basic Plans",
        "Access All Feature",
        "Get 1 TB Cloud Storage",
      ],
      buttonText: "Choose Plan",
    },
    {
      name: "Your Current Packages Futhe ",
      subtitle: "Suitable plan for starter",
      price: "149.99",
      features: [
        "Get Enterprise Plan",
        "Access All Feature",
        "Get 2 TB Cloud Storage",
      ],
      buttonText: "Active plan",
    },
  ];

  const allFeatures = [
    {
      name: "Users",
      Individual: "1 user",
      Enterprise: "Unlimited users",
      Professional: "Unlimited users",
    },
    {
      name: "Update Frequency",
      Individual: "Every 12h",
      Enterprise: "Every 1h",
      Professional: "Real time",
    },
    {
      name: "AI Sentiment",
      Individual: true,
      Enterprise: true,
      Professional: true,
    },
    {
      name: "Mentions Volume",
      Individual: false,
      Enterprise: "Up to 100",
      Professional: "Unlimited",
    },
    {
      name: "Engagement Tracking",
      Individual: false,
      Enterprise: "Likes, Comments",
      Professional: "All types",
    },
    {
      name: "Influencer Analysis",
      Individual: false,
      Enterprise: true,
      Professional: true,
    },
    {
      name: "Presence Score",
      Individual: false,
      Enterprise: "For 1 account",
      Professional: "Unlimited accounts",
    },
    {
      name: "Integrations (Slack)",
      Individual: false,
      Enterprise: false,
      Professional: true,
    },
    {
      name: "API Access",
      Individual: false,
      Enterprise: true,
      Professional: true,
    },
    {
      name: "Priority Support",
      Individual: false,
      Enterprise: true,
      Professional: true,
    },
  ];

  const billingHistory = [
    {
      id: "01",
      invoice: "Invoice#129810",
      date: "25 Dec 2023",
      amount: "$149,99",
      plan: "Professional Plan",
      status: "Success",
    },
    {
      id: "02",
      invoice: "Invoice#129811",
      date: "05 Jul 2023",
      amount: "$149,99",
      plan: "Professional Plan",
      status: "Success",
    },
  ];

  const selectedPlanName =
    plans[selectedPlanIndex].name === "Basic Plan"
      ? "Individual"
      : plans[selectedPlanIndex].name === "Enterprise Plan"
        ? "Enterprise"
        : "Professional";

  const toggleRowSelection = (index) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 },
    },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
  };

  const featureRowVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: (index) => ({
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, delay: index * 0.05 },
    }),
  };

  const columnVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2 },
    },
  };

  const renderFeatureValue = (value) => {
    if (value === true) {
      return (
        <motion.div
          className="flex items-center justify-center"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
        >
          <CheckCircle2 className="w-6 h-6 text-green-500" />
        </motion.div>
      );
    }
    if (value === false) {
      return (
        <motion.div
          className="flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Circle className="w-6 h-6 text-gray-300 dark:text-gray-600" />
        </motion.div>
      );
    }
    return (
      <motion.span
        className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center block"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {value}
      </motion.span>
    );
  };

  const getPlanColor = (index) => {
    const colors = [
      {
        bg: "bg-blue-50 dark:bg-blue-900/20",
        text: "text-blue-600 dark:text-blue-400",
        border: "border-blue-200 dark:border-blue-700",
      },
      {
        bg: "bg-purple-50 dark:bg-purple-900/20",
        text: "text-purple-600 dark:text-purple-400",
        border: "border-purple-200 dark:border-purple-700",
      },
      {
        bg: "bg-violet-50 dark:bg-violet-900/20",
        text: "text-violet-600 dark:text-violet-400",
        border: "border-violet-200 dark:border-violet-700",
      },
    ];
    return colors[index];
  };

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#0b0f14] dark:to-[#151b23] min-h-screen">
      {/* Frist One Card  */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-6xl mx-auto mb-12 relative group"
      >
        {/* Animated background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-200/30 via-fuchsia-200/30 to-indigo-200/30 dark:from-violet-900/20 dark:via-fuchsia-900/20 dark:to-indigo-900/20 blur-3xl -z-10 rounded-[40px] opacity-70 group-hover:opacity-100 transition-opacity duration-700" />

        <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-2xl rounded-[32px] p-8 md:p-12 border border-white/60 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-black/20 overflow-hidden relative transition-all duration-500 hover:shadow-[0_20px_40px_rgba(124,58,237,0.1)]">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-purple-100/40 to-transparent dark:from-purple-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-orange-500 font-bold tracking-wider text-sm uppercase bg-orange-50 dark:bg-orange-900/20 px-3 py-1 rounded-lg border border-orange-100 dark:border-orange-900/30">
                    Business
                  </span>
                  <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md shadow-orange-500/20">
                    <Flame className="w-3.5 h-3.5 fill-current" />
                    <span className="text-xs font-bold">Most Popular</span>
                  </div>
                </div>
                <h2 className="text-gray-600 dark:text-gray-300 text-lg font-medium">
                  Recommended for Sales and Customer Success
                </h2>
              </div>

              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-7xl font-extrabold bg-clip-text text-transparent bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 tracking-tight">
                    $29
                  </span>
                  <span className="text-gray-500 font-medium text-sm">
                    per seat/month . billed annually
                  </span>
                </div>
                <p className="text-gray-500 text-sm font-medium pl-1 flex items-center gap-2">
                  <span className="line-through opacity-60">$39</span>
                  <span className="text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded text-xs font-bold">
                    Save 25%
                  </span>
                  Billed monthly
                </p>
              </div>

              <Button className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white h-16 rounded-2xl text-xl font-bold shadow-xl shadow-violet-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] border-t border-white/20">
                Upgrade Now
              </Button>
              <p className="text-center text-xs text-gray-400">
                14-day money-back guarantee • Cancel anytime
              </p>
            </div>

            <div className="relative pl-0 md:pl-10">
              <div className="space-y-8 bg-white/50 dark:bg-black/20 p-8 rounded-3xl border border-purple-100/50 dark:border-purple-900/20 backdrop-blur-sm">
                <p className="text-gray-900 dark:text-white font-bold text-lg flex items-center gap-2">
                  Everything in our Starter plan +
                </p>

                <div className="space-y-4">
                  {[
                    "Unlimited uploads",
                    "A.I Coaching",
                    "Deal boards",
                    "Team Performance Insights",
                    "Smart tags (Trackers)",
                    "Hubspot Integration",
                    "Salesforce Integration",
                  ].map((feature, i) => (
                    <motion.div
                      key={i}
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                    >
                      <div className="bg-gradient-to-br from-violet-500 to-purple-600 p-1 rounded-full flex-shrink-0 shadow-sm">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-200 font-medium">
                        {feature}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Pricing Cards Section */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {plans.map((plan, index) => {
          const isActive = index === selectedPlanIndex;
          return (
            <motion.div
              key={index}
              layout
              onClick={() => setSelectedPlanIndex(index)}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              whileTap={{ scale: 0.98 }}
              className={`rounded-2xl p-8 flex flex-col h-full relative overflow-hidden cursor-pointer border transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-br from-[#8B5CF6] to-purple-600 text-white border-transparent shadow-xl shadow-purple-500/30"
                  : "bg-white dark:bg-[#1a1f26] text-gray-900 dark:text-white border-gray-200 dark:border-gray-800 hover:border-violet-300 dark:hover:border-violet-700 shadow-sm hover:shadow-md"
              }`}
            >
              {isActive && (
                <motion.div
                  className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360],
                  }}
                  transition={{ duration: 8, repeat: Infinity }}
                />
              )}

              <div className="mb-6 relative z-10">
                <motion.h3
                  className="text-xl font-bold mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {plan.name}
                </motion.h3>
                <p
                  className={`text-sm ${
                    isActive
                      ? "text-violet-100"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {plan.subtitle}
                </p>
              </div>

              <div className="mb-8 relative z-10">
                <motion.div
                  className="flex items-baseline"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="text-4xl font-extrabold">${plan.price}</span>
                  <span
                    className={`ml-2 text-sm ${
                      isActive
                        ? "text-violet-100"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    /year
                  </span>
                </motion.div>
              </div>

              <motion.div
                className="flex-1 space-y-4 mb-8 relative z-10"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {plan.features.map((feature, idx) => (
                  <motion.div
                    key={idx}
                    className="flex items-center gap-3"
                    variants={itemVariants}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 + idx * 0.1 }}
                    >
                      <CheckSquare
                        className={`w-5 h-5 ${
                          isActive ? "text-violet-200" : "text-violet-500"
                        }`}
                      />
                    </motion.div>
                    <span
                      className={`text-sm font-medium ${
                        isActive
                          ? "text-white"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {feature}
                    </span>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                className="relative z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Button
                  className={`w-full py-6 rounded-xl font-bold text-base transition-all duration-300 ${
                    isActive
                      ? "bg-white text-violet-600 hover:bg-violet-50 shadow-lg"
                      : "bg-violet-500 text-white hover:bg-violet-600"
                  }`}
                >
                  {isActive ? "✓ Active plan" : "Choose Plan"}
                </Button>
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Feature Comparison Section */}
      <motion.div
        className="bg-white dark:bg-[#1a1f26] rounded-2xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
      >
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Book className="w-6 h-6 text-violet-500" />
              Compare features by plan
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Easily compare features across all available plans.
            </p>
          </div>
        </motion.div>

        <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left font-bold text-gray-900 dark:text-white">
                  Feature
                </th>
                <AnimatePresence mode="wait">
                  <motion.th
                    key={selectedPlanIndex}
                    variants={columnVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className={`px-6 py-4 text-center font-bold transition-all duration-300 ${
                      getPlanColor(selectedPlanIndex).bg
                    } border-l border-r ${getPlanColor(selectedPlanIndex).border}`}
                  >
                    <motion.div
                      className={`font-bold text-lg ${getPlanColor(selectedPlanIndex).text}`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {plans[selectedPlanIndex].name}
                    </motion.div>
                  </motion.th>
                </AnimatePresence>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              <AnimatePresence>
                {allFeatures.map((feature, featureIdx) => (
                  <motion.tr
                    key={featureIdx}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    custom={featureIdx}
                    variants={featureRowVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <td className="px-6 py-5 font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                      {feature.name}
                    </td>
                    <AnimatePresence mode="wait">
                      <motion.td
                        key={`${selectedPlanIndex}-${featureIdx}`}
                        className={`px-6 py-5 text-center transition-all duration-300 ${
                          getPlanColor(selectedPlanIndex).bg
                        } border-l border-r ${getPlanColor(selectedPlanIndex).border}`}
                        variants={columnVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        {renderFeatureValue(feature[selectedPlanName])}
                      </motion.td>
                    </AnimatePresence>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        <motion.div
          className={`mt-6 p-4 rounded-lg border flex items-start gap-3 ${
            getPlanColor(selectedPlanIndex).bg +
            " " +
            getPlanColor(selectedPlanIndex).border
          }`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <CheckCircle2
            className={`w-5 h-5 flex-shrink-0 mt-0.5 ${getPlanColor(selectedPlanIndex).text}`}
          />
          <div>
            <p
              className={`font-semibold ${getPlanColor(selectedPlanIndex).text}`}
            >
              Your current plan: {plans[selectedPlanIndex].name}
            </p>
            <p
              className={`text-sm ${getPlanColor(selectedPlanIndex).text} opacity-75 mt-1`}
            >
              Click on any plan card above to compare its features with others.
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Billing History Section */}
      <motion.div
        className="bg-white dark:bg-[#1a1f26] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.5 }}
      >
        <motion.div
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Billing History
          </h3>
          <motion.span
            className="text-sm text-gray-500 dark:text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            {selectedRows.size > 0
              ? `${selectedRows.size} selected`
              : `${billingHistory.length} invoices`}
          </motion.span>
        </motion.div>

        <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-400 uppercase border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="py-4 px-4 w-10">
                  <motion.input
                    type="checkbox"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows(
                          new Set(billingHistory.map((_, i) => i)),
                        );
                      } else {
                        setSelectedRows(new Set());
                      }
                    }}
                    checked={selectedRows.size === billingHistory.length}
                  />
                </th>
                <th className="py-4 px-4 font-semibold text-gray-600 dark:text-gray-300">
                  No
                </th>
                <th className="py-4 px-4 font-semibold text-gray-600 dark:text-gray-300">
                  Invoices
                </th>
                <th className="py-4 px-4 font-semibold text-gray-600 dark:text-gray-300">
                  Created Date
                </th>
                <th className="py-4 px-4 font-semibold text-gray-600 dark:text-gray-300">
                  Amount
                </th>
                <th className="py-4 px-4 font-semibold text-gray-600 dark:text-gray-300">
                  Plan
                </th>
                <th className="py-4 px-4 font-semibold text-gray-600 dark:text-gray-300">
                  Status
                </th>
                <th className="py-4 px-4 font-semibold text-right text-gray-600 dark:text-gray-300">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              <AnimatePresence>
                {billingHistory.map((item, index) => (
                  <motion.tr
                    key={index}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ delay: index * 0.1 }}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                      selectedRows.has(index)
                        ? "bg-indigo-50 dark:bg-indigo-900/20"
                        : ""
                    }`}
                  >
                    <td className="py-4 px-4">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.1 }}
                      >
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                          checked={selectedRows.has(index)}
                          onChange={() => toggleRowSelection(index)}
                        />
                      </motion.div>
                    </td>
                    <td className="py-4 px-4 font-semibold text-gray-900 dark:text-white">
                      {item.id}
                    </td>
                    <td className="py-4 px-4 font-semibold text-gray-900 dark:text-white">
                      {item.invoice}
                    </td>
                    <td className="py-4 px-4 text-gray-500 dark:text-gray-400">
                      {item.date}
                    </td>
                    <td className="py-4 px-4 font-semibold text-gray-900 dark:text-white">
                      💰 {item.amount}
                    </td>
                    <td className="py-4 px-4 font-medium text-gray-900 dark:text-white">
                      {item.plan}
                    </td>
                    <td className="py-4 px-4">
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.2 }}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 shadow-sm"
                      >
                        ✓ {item.status}
                      </motion.span>
                    </td>
                    <td className="py-4 px-4">
                      <motion.div
                        className="flex items-center justify-end gap-2"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 + 0.25 }}
                      >
                        <motion.button
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors shadow-sm"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1, rotate: -5 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors shadow-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </motion.div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Summary Footer */}
        <motion.div
          className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.85 }}
            >
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">
                Total Invoices
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {billingHistory.length}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
            >
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">
                Total Paid
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                $299.98
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.95 }}
            >
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">
                Status
              </p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                Active
              </p>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default UpgradePlanPage;
