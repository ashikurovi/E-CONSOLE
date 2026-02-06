import React, { useState } from "react";
import {
  Check,
  Book,
  Flame,
  Eye,
  Trash2,
  ChevronRight,
  CheckCircle2,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const OptimizedUpgradePlan = () => {
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
      color: "bg-white",
      border: "border-gray-200",
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
      color: "bg-white",
      border: "border-gray-200",
    },
    {
      name: "Your Current Packages",
      subtitle: "Suitable plan for starter",
      price: "149.99",
      features: [
        "Get Enterprise Plan",
        "Access All Feature",
        "Get 2 TB Cloud Storage",
      ],
      buttonText: "Active plan",
      color: "bg-gradient-to-br from-purple-600 to-purple-700",
      border: "border-purple-600",
      badge: "Most Popular",
    },
  ];

  const comparisonSections = [
    {
      title: "Data",
      rows: [
        {
          name: "Email Credits",
          basic: "200/month",
          pro: "Unlimited",
          custom: "Unlimited",
        },
        {
          name: "Direct Dials",
          basic: false,
          pro: "50/month",
          custom: "Custom",
        },
        {
          name: "Record Selection Limit",
          basic: "25",
          pro: "25",
          custom: "50,000",
        },
        {
          name: "Linkedin Extension",
          basic: true,
          pro: true,
          custom: true,
        },
        {
          name: "CSV Export",
          basic: true,
          pro: true,
          custom: true,
        },
        {
          name: "Basic Filters",
          basic: true,
          pro: true,
          custom: true,
        },
        {
          name: "Advanced Filters",
          basic: true,
          pro: true,
          custom: true,
        },
        {
          name: "Scoring Engine",
          basic: true,
          pro: true,
          custom: true,
        },
        {
          name: "Enrichment",
          basic: false,
          pro: false,
          custom: true,
        },
        {
          name: "Job Change Alerts",
          basic: false,
          pro: false,
          custom: true,
        },
        {
          name: "Mobile Phone Numbers",
          basic: false,
          pro: "Included",
          custom: "Included",
        },
        {
          name: "Personal Emails",
          basic: "Limited",
          pro: "Included",
          custom: "Included",
        },
        {
          name: "Technology Stack Data",
          basic: false,
          pro: true,
          custom: true,
        },
        {
          name: "Intent Signals",
          basic: false,
          pro: true,
          custom: true,
        },
        {
          name: "Org Charts",
          basic: false,
          pro: true,
          custom: true,
        },
        {
          name: "Funding Data",
          basic: true,
          pro: true,
          custom: true,
        },
        {
          name: "News & Alerts",
          basic: true,
          pro: true,
          custom: true,
        },
        {
          name: "Competitor Intelligence",
          basic: false,
          pro: false,
          custom: true,
        },
        {
          name: "Technographics",
          basic: false,
          pro: true,
          custom: true,
        },
        {
          name: "SEO Keywords",
          basic: false,
          pro: false,
          custom: true,
        },
      ],
    },
    {
      title: "Automation",
      rows: [
        {
          name: "Number of Sequences",
          basic: "Unlimited",
          pro: "Unlimited",
          custom: "Unlimited",
        },
        {
          name: "Daily Emails Sending Limit",
          basic: "Unlimited",
          pro: "Unlimited",
          custom: "Unlimited",
        },
        {
          name: "Email Integration",
          basic: "All Providers",
          pro: "All Providers",
          custom: "All Providers",
        },
        {
          name: "Outreach & Salesloft Integration",
          basic: true,
          pro: true,
          custom: true,
        },
        {
          name: "Gmail Extension",
          basic: true,
          pro: true,
          custom: true,
        },
        {
          name: "Open, Click & Meeting Tracking",
          basic: true,
          pro: true,
          custom: true,
        },
        {
          name: "Basic Sequencing",
          basic: true,
          pro: true,
          custom: true,
        },
        {
          name: "Advanced Sequencing",
          basic: false,
          pro: true,
          custom: true,
        },
        {
          name: "Custom Fields",
          basic: true,
          pro: true,
          custom: true,
        },
        {
          name: "Rules Engine Process Builder",
          basic: true,
          pro: true,
          custom: true,
        },
        { name: "Dialer", basic: false, pro: true, custom: true },
        {
          name: "Advanced Dialer",
          basic: false,
          pro: false,
          custom: true,
        },
        {
          name: "Account Based Automation",
          basic: false,
          pro: false,
          custom: true,
        },
        {
          name: "Sendgrid Integration",
          basic: true,
          pro: true,
          custom: true,
        },
        {
          name: "Multi-channel Sequences",
          basic: false,
          pro: true,
          custom: true,
        },
        {
          name: "AI Email Writer",
          basic: true,
          pro: true,
          custom: true,
        },
        {
          name: "LinkedIn Automation",
          basic: false,
          pro: true,
          custom: true,
        },
        {
          name: "Task Automation",
          basic: true,
          pro: true,
          custom: true,
        },
        {
          name: "Meeting Scheduler",
          basic: true,
          pro: true,
          custom: true,
        },
        {
          name: "Video Personalization",
          basic: false,
          pro: false,
          custom: true,
        },
      ],
    },
    {
      title: "CRM",
      rows: [
        {
          name: "Salesforce Extension",
          basic: true,
          pro: true,
          custom: true,
        },
        {
          name: "Opportunities",
          basic: true,
          pro: true,
          custom: true,
        },
        {
          name: "Pull CRM (Salesforce & Hubspot)",
          basic: true,
          pro: true,
          custom: true,
        },
        {
          name: "HubSpot Integration",
          basic: true,
          pro: true,
          custom: true,
        },
        {
          name: "Pipedrive Integration",
          basic: true,
          pro: true,
          custom: true,
        },
        {
          name: "Zoho CRM Integration",
          basic: false,
          pro: true,
          custom: true,
        },
        {
          name: "Dynamics 365 Integration",
          basic: false,
          pro: true,
          custom: true,
        },
        {
          name: "Custom Field Mapping",
          basic: true,
          pro: true,
          custom: true,
        },
        {
          name: "Auto-Create Leads",
          basic: true,
          pro: true,
          custom: true,
        },
        {
          name: "Duplicate Detection",
          basic: true,
          pro: true,
          custom: true,
        },
        {
          name: "Activity Sync",
          basic: true,
          pro: true,
          custom: true,
        },
        {
          name: "Note Sync",
          basic: true,
          pro: true,
          custom: true,
        },
        {
          name: "Call Logging",
          basic: false,
          pro: true,
          custom: true,
        },
        {
          name: "Task Sync",
          basic: true,
          pro: true,
          custom: true,
        },
        {
          name: "Opportunity Sync",
          basic: false,
          pro: true,
          custom: true,
        },
        {
          name: "Account Sync",
          basic: true,
          pro: true,
          custom: true,
        },
        {
          name: "CRM Reports",
          basic: false,
          pro: true,
          custom: true,
        },
        {
          name: "ROI Analytics",
          basic: false,
          pro: true,
          custom: true,
        },
        {
          name: "Team Performance",
          basic: false,
          pro: true,
          custom: true,
        },
        {
          name: "API Rate Limits",
          basic: "Standard",
          pro: "High",
          custom: "Unlimited",
        },
      ],
    },
  ];

  const renderComparisonValue = (value) => {
    if (value === true) {
      return (
        <div className="flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border border-teal-200 bg-teal-50 flex items-center justify-center">
            <Check className="w-3.5 h-3.5 text-teal-600" />
          </div>
        </div>
      );
    }
    if (value === false) {
      return (
        <div className="flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center">
            <X className="w-3.5 h-3.5 text-gray-400" />
          </div>
        </div>
      );
    }
    return <span className="text-sm font-medium text-gray-600">{value}</span>;
  };

  const billingHistory = [
    {
      id: "01",
      invoice: "Invoice#129810",
      date: "25 Dec 2023",
      amount: "$149.99",
      plan: "Professional Plan",
      status: "Success",
    },
    {
      id: "02",
      invoice: "Invoice#129811",
      date: "05 Jul 2023",
      amount: "$149.99",
      plan: "Professional Plan",
      status: "Success",
    },
  ];

  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (sectionTitle) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle],
    }));
  };

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

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <motion.div
        className="bg-white p-8 md:p-12 max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Top Featured Card */}
        <div className="mb-12 rounded-3xl bg-gradient-to-r from-gray-50 to-gray-100 p-8 md:p-12 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Left side */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-xs font-bold border border-orange-200">
                  BUSINESS
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full text-xs font-bold shadow-lg shadow-purple-600/20">
                  <Flame className="w-3.5 h-3.5" />
                  Most Popular
                </span>
              </div>

              <div>
                <h2 className="text-gray-600 text-lg font-semibold mb-4">
                  Your Current Packages
                </h2>
              </div>

              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-gray-900">$29</span>
                  <span className="text-gray-600 text-sm font-medium">
                    per seat/month · billed annually
                  </span>
                </div>
                <p className="text-gray-600 text-sm flex items-center gap-2">
                  <span className="line-through opacity-60">$39</span>
                  <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs font-bold border border-green-200">
                    Save 25%
                  </span>
                  Billed monthly
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-purple-600/20 transition-all"
              >
                Upgrade Now
              </motion.button>

              <p className="text-center text-xs text-gray-500">
                14-day money-back guarantee · Cancel anytime
              </p>
            </motion.div>

            {/* Right side */}
            <motion.div
              className="bg-white rounded-2xl p-6 space-y-4"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-gray-900 font-bold text-base flex items-center gap-2">
                <span className="text-purple-600">✓</span> Everything in our
                Starter plan +
              </p>

              <div className="space-y-3">
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
                    transition={{ delay: 0.4 + i * 0.08 }}
                  >
                    <div className="w-2 h-2 rounded-full bg-purple-600 flex-shrink-0"></div>
                    <span className="text-gray-700 text-sm font-medium">
                      {feature}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Pricing Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
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
                whileHover={{ y: -8 }}
                whileTap={{ scale: 0.98 }}
                variants={itemVariants}
                className={`rounded-2xl p-8 cursor-pointer border-2 transition-all duration-300 relative overflow-hidden ${
                  isActive
                    ? "bg-gradient-to-br from-purple-600 to-purple-700 border-purple-600 text-white shadow-xl shadow-purple-600/20"
                    : "bg-white border-gray-200 hover:border-purple-300 shadow-sm hover:shadow-md"
                }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <motion.div
                    className="absolute top-6 right-6 inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 text-white rounded-full text-xs font-bold backdrop-blur-sm"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", delay: 0.3 }}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    {plan.badge}
                  </motion.div>
                )}

                {/* Content */}
                <div className="mb-8">
                  <h3
                    className={`text-2xl font-bold mb-1 ${isActive ? "text-white" : "text-gray-900"}`}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className={`text-sm ${isActive ? "text-purple-100" : "text-gray-500"}`}
                  >
                    {plan.subtitle}
                  </p>
                </div>

                {/* Price */}
                <motion.div
                  className="mb-8"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-baseline gap-1 mb-1">
                    <span
                      className={`text-4xl font-black ${isActive ? "text-white" : "text-gray-900"}`}
                    >
                      ${plan.price}
                    </span>
                    <span
                      className={`text-sm ${isActive ? "text-purple-100" : "text-gray-500"}`}
                    >
                      /year
                    </span>
                  </div>
                </motion.div>

                {/* Features */}
                <motion.div
                  className="flex-1 space-y-4 mb-8"
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
                        <Check
                          className={`w-5 h-5 ${
                            isActive ? "text-purple-200" : "text-purple-600"
                          }`}
                        />
                      </motion.div>
                      <span
                        className={`text-sm font-medium ${
                          isActive ? "text-white" : "text-gray-700"
                        }`}
                      >
                        {feature}
                      </span>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Button */}
                <motion.button
                  className={`w-full py-3 rounded-xl font-bold text-base transition-all ${
                    isActive
                      ? "bg-white text-purple-600 hover:bg-purple-50"
                      : "bg-purple-600 text-white hover:bg-purple-700"
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isActive ? `✓ ${plan.buttonText}` : plan.buttonText}
                </motion.button>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Feature Comparison Section */}
        <motion.div
          className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-12"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {/* Header */}
          <div className="p-8 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <Book className="w-6 h-6 text-purple-600" />
              <h3 className="text-2xl font-bold text-gray-900">
                Compare features by plan
              </h3>
            </div>
            <p className="text-sm text-gray-500 ml-9">
              Easily compare features across all available plans.
            </p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <div className="w-full min-w-[800px]">
              {/* Table Header */}
              <div className="grid grid-cols-4 bg-gray-100/50 border-b border-gray-200">
                <div className="p-4 font-bold text-gray-900 flex items-center">
                  <span className="text-purple-600 font-bold text-sm bg-purple-50 px-2 py-1 rounded">
                    Data
                  </span>
                </div>
                {["Starter", "Premium", "Enterprise"].map((plan) => (
                  <div
                    key={plan}
                    className="p-4 text-center font-bold text-gray-900 bg-gray-50/50"
                  >
                    {plan}
                  </div>
                ))}
              </div>

              {/* Sections */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    {comparisonSections.map((section, sectionIdx) => {
                      const isSectionExpanded = expandedSections[section.title];
                      const visibleRows = isSectionExpanded
                        ? section.rows
                        : section.rows.slice(0, 10);
                      const hasMore = section.rows.length > 10;

                      return (
                        <div key={sectionIdx}>
                          {/* Section Header */}
                          <div className="bg-blue-50/30 border-y border-gray-200 p-3 px-4">
                            <h4 className="font-bold text-blue-600 text-sm">
                              {section.title}
                            </h4>
                          </div>

                          {/* Rows */}
                          <div className="divide-y divide-gray-100">
                            {visibleRows.map((row, rowIdx) => (
                              <div
                                key={rowIdx}
                                className="grid grid-cols-4 hover:bg-gray-50/50 transition-colors"
                              >
                                <div className="p-4 py-3 text-sm font-medium text-gray-700 flex items-center">
                                  {row.name}
                                </div>
                                <div className="p-4 py-3 text-center flex items-center justify-center border-l border-gray-50">
                                  {renderComparisonValue(row.basic)}
                                </div>
                                <div className="p-4 py-3 text-center flex items-center justify-center border-l border-gray-50">
                                  {renderComparisonValue(row.pro)}
                                </div>
                                <div className="p-4 py-3 text-center flex items-center justify-center border-l border-gray-50">
                                  {renderComparisonValue(row.custom)}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* View Details Button */}
                          {hasMore && (
                            <div className="p-3 bg-gray-50/30 flex justify-center border-t border-gray-100">
                              <button
                                onClick={() => toggleSection(section.title)}
                                className="text-purple-600 text-xs font-bold flex items-center gap-1 hover:text-purple-700 bg-white border border-purple-200 px-3 py-1.5 rounded-full shadow-sm hover:shadow transition-all"
                              >
                                {isSectionExpanded
                                  ? "Show Less"
                                  : "View Details"}
                                <ChevronRight
                                  className={`w-3 h-3 transition-transform ${
                                    isSectionExpanded
                                      ? "-rotate-90"
                                      : "rotate-90"
                                  }`}
                                />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Footer toggle */}
          <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-center">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:text-blue-700"
            >
              {isExpanded
                ? "Hide Detailed Plan Comparison"
                : "Show Detailed Plan Comparison"}
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronRight className="w-4 h-4 rotate-90" />
              </motion.div>
            </button>
          </div>
        </motion.div>

        {/* Billing History Section */}
        <motion.div
          className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {/* Header */}
          <div className="p-8 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Billing History</h3>
            <motion.span
              className="text-sm text-gray-500 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {selectedRows.size > 0
                ? `${selectedRows.size} selected`
                : `${billingHistory.length} invoices`}
            </motion.span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-purple-600 cursor-pointer"
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
                  <th className="text-left p-4 font-bold text-gray-600">No</th>
                  <th className="text-left p-4 font-bold text-gray-600">
                    Invoices
                  </th>
                  <th className="text-left p-4 font-bold text-gray-600">
                    Created Date
                  </th>
                  <th className="text-left p-4 font-bold text-gray-600">
                    Amount
                  </th>
                  <th className="text-left p-4 font-bold text-gray-600">
                    Plan
                  </th>
                  <th className="text-left p-4 font-bold text-gray-600">
                    Status
                  </th>
                  <th className="text-right p-4 font-bold text-gray-600">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <AnimatePresence>
                  {billingHistory.map((item, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                      className={`hover:bg-gray-50 transition-colors ${
                        selectedRows.has(index) ? "bg-purple-50" : ""
                      }`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-purple-600 cursor-pointer"
                          checked={selectedRows.has(index)}
                          onChange={() => toggleRowSelection(index)}
                        />
                      </td>
                      <td className="p-4 font-semibold text-gray-900">
                        {item.id}
                      </td>
                      <td className="p-4 font-semibold text-gray-900">
                        {item.invoice}
                      </td>
                      <td className="p-4 text-gray-600">{item.date}</td>
                      <td className="p-4 font-semibold text-gray-900">
                        💰 {item.amount}
                      </td>
                      <td className="p-4 text-gray-700">{item.plan}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                          <Check className="w-3 h-3" />
                          {item.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <motion.div
                          className="flex items-center justify-end gap-2"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 + 0.2 }}
                        >
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
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
            className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 bg-gray-50 border-t border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.75 }}
            >
              <p className="text-xs text-gray-500 uppercase font-semibold">
                Total Invoices
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {billingHistory.length}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <p className="text-xs text-gray-500 uppercase font-semibold">
                Total Paid
              </p>
              <p className="text-3xl font-bold text-green-600 mt-2">$299.98</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.85 }}
            >
              <p className="text-xs text-gray-500 uppercase font-semibold">
                Status
              </p>
              <p className="text-3xl font-bold text-blue-600 mt-2">Active</p>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default OptimizedUpgradePlan;
