import React, { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useGetTermsConditionsQuery,
  useUpdateTermsConditionsMutation,
} from "@/features/terms-conditions/termsConditionsApiSlice";
import AtomLoader from "@/components/loader/AtomLoader";
import toast from "react-hot-toast";
import RichTextEditor from "@/components/input/RichTextEditor";
import { motion } from "framer-motion";
import {
  Save,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  History,
  Shield,
  Lightbulb,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";

const schema = yup.object().shape({
  content: yup.string().required("Content is required"),
  version: yup.string().required("Version is required"),
  isActive: yup.boolean(),
});

function EditTermsConditionsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);
  const { data: terms, isLoading: isFetching } = useGetTermsConditionsQuery({ companyId: authUser?.companyId });
  const latestTerms = terms?.[0];
  const [updateTermsConditions, { isLoading: isUpdating }] = useUpdateTermsConditionsMutation();

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      content: "",
      version: "",
      isActive: true,
    },
  });

  const isActive = watch("isActive");

  useEffect(() => {
    if (latestTerms) {
      reset({
        content: latestTerms.content || "",
        version: latestTerms.version || "1.0.0",
        isActive: latestTerms.isActive ?? true,
      });
    }
  }, [latestTerms, reset]);

  const onSubmit = async (data) => {
    try {
      if (!latestTerms?.id && !latestTerms?._id) {
        toast.error("No terms found to update");
        return;
      }
      const id = latestTerms.id || latestTerms._id;
      await updateTermsConditions({ id, ...data }).unwrap();
      toast.success(t("termsConditions.updatedSuccess") || "Terms updated successfully");
      navigate("/terms-conditions");
    } catch (error) {
      toast.error(error.data?.message || t("termsConditions.updateFailed") || "Failed to update terms");
    }
  };

  if (isFetching) return <div className="flex justify-center items-center h-screen"><AtomLoader /></div>;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-4 md:p-8 font-sans text-gray-900 dark:text-gray-100">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mt-2">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 dark:from-indigo-400 dark:via-violet-400 dark:to-purple-400 drop-shadow-sm">
                  {t("termsConditions.editTitle")}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  Update and maintain your platform's legal documentation
                </p>
              </div>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/terms-conditions")}
            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Overview
          </motion.button>
        </motion.div>

        {/* No Policy Found State */}
        {!latestTerms && !isFetching && (
           <motion.div variants={itemVariants} className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-800 text-center">
             <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
             <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">{t("termsConditions.notFound")}</h3>
             <p className="text-gray-600 dark:text-gray-400 mb-4">{t("termsConditions.notFoundDesc")}</p>
             <button
                onClick={() => navigate("/terms-conditions/create")}
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
             >
               Create New Terms
             </button>
           </motion.div>
        )}

        {latestTerms && (
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-8">
              <motion.div variants={itemVariants} className="bg-white dark:bg-gray-900 rounded-[24px] p-6 md:p-8 shadow-xl border border-gray-100 dark:border-gray-800/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
                
                <div className="flex items-center gap-2 mb-6 relative z-10">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
                    Terms Content
                  </h2>
                </div>

                <div className="space-y-6 relative z-10">
                  {/* Version Input */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      Version Number
                    </label>
                    <Controller
                      name="version"
                      control={control}
                      render={({ field }) => (
                        <div className="relative">
                          <input
                            {...field}
                            type="text"
                            placeholder="e.g., 2.0.1"
                            className={`w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/50 border ${
                              errors.version ? "border-red-500" : "border-gray-200 dark:border-gray-700"
                            } focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:text-white font-medium transition-all`}
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                             <span className="text-xs font-bold text-gray-400 bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">v{field.value || "?"}</span>
                          </div>
                        </div>
                      )}
                    />
                    {errors.version && (
                      <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {errors.version.message}
                      </p>
                    )}
                  </div>

                  {/* RichTextEditor */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      Legal Text
                    </label>
                    <div className={`rounded-xl overflow-hidden border ${errors.content ? "border-red-500" : "border-gray-200 dark:border-gray-700"} shadow-sm`}>
                      <Controller
                        name="content"
                        control={control}
                        render={({ field }) => (
                          <RichTextEditor
                            placeholder={t("termsConditions.contentPlaceholder")}
                            value={field.value || ""}
                            onChange={field.onChange}
                            error={errors.content}
                            height="500px"
                          />
                        )}
                      />
                    </div>
                    {errors.content && (
                      <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {errors.content.message}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Sidebar Column */}
            <div className="lg:col-span-1 space-y-6">
              {/* Status Card */}
              <motion.div variants={itemVariants} className="bg-white dark:bg-gray-900 rounded-[24px] p-6 shadow-xl border border-gray-100 dark:border-gray-800/50 sticky top-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  Publishing Status
                </h3>
                
                <div className="space-y-4">
                  {/* Active Toggle */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-700 dark:text-gray-200">Active Status</span>
                      <span className="text-xs text-gray-500">Visible to public</span>
                    </div>
                    <Controller
                      name="isActive"
                      control={control}
                      render={({ field }) => (
                        <button
                          type="button"
                          onClick={() => field.onChange(!field.value)}
                          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                            field.value ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-700"
                          }`}
                        >
                          <span
                            className={`${
                              field.value ? "translate-x-6" : "translate-x-1"
                            } inline-block h-5 w-5 transform rounded-full bg-white transition-transform`}
                          />
                        </button>
                      )}
                    />
                  </div>

                  {/* Metadata */}
                  <div className="bg-gray-50 dark:bg-black/20 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 space-y-3">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                           <History className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                           <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Current Version</p>
                           <p className="text-sm font-bold text-gray-800 dark:text-white">v{latestTerms.version || "N/A"}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                           <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                           <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Last Modified</p>
                           <p className="text-sm font-bold text-gray-800 dark:text-white">
                             {latestTerms.updatedAt ? new Date(latestTerms.updatedAt).toLocaleDateString() : "Never"}
                           </p>
                        </div>
                     </div>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isUpdating}
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                  >
                    {isUpdating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>Update Terms</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>

              {/* Best Practices Card */}
              <motion.div variants={itemVariants} className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-[24px] p-6 border border-indigo-100 dark:border-indigo-800/30">
                <h4 className="font-bold text-indigo-900 dark:text-indigo-100 mb-3 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  Best Practices
                </h4>
                <ul className="space-y-3 text-sm text-indigo-800 dark:text-indigo-200">
                  <li className="flex gap-2">
                    <span className="text-indigo-500">•</span>
                    <span>Increment version number (e.g., 1.0 → 1.1) for minor changes.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-indigo-500">•</span>
                    <span>Use clear headings (H1, H2) for readability.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-indigo-500">•</span>
                    <span>Preview your markdown to ensure correct formatting.</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}

export default EditTermsConditionsPage;
