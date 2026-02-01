import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  useGetReviewByIdQuery,
  useReplyReviewMutation,
} from "@/features/reviews/reviewsApiSlice";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { ArrowLeft, Send, Star, MessageSquare } from "lucide-react";

const ReviewDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const authUser = useSelector((state) => state.auth.user);

  const [replyText, setReplyText] = useState("");

  const { data: review, isLoading, refetch } = useGetReviewByIdQuery(
    { id: Number(id), companyId: authUser?.companyId },
    { skip: !id || !authUser?.companyId }
  );
  const [addReply, { isLoading: isReplying }] = useReplyReviewMutation();

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !review?.id) return;
    try {
      await addReply({
        id: review.id,
        body: { reply: replyText.trim() },
      }).unwrap();
      setReplyText("");
      refetch();
    } catch (err) {
      console.error("Failed to reply:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">
            {t("reviews.detailTitle") || "Review Detail"}
          </h1>
          <p className="text-sm text-black/60 dark:text-white/60">
            {t("reviews.detailSubtitle") ||
              "View the review and reply to the customer from your dashboard."}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/reviews")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("common.back") || "Back"}
        </Button>
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-5">
        {isLoading && <p className="text-sm">Loading review…</p>}

        {!isLoading && !review && (
          <p className="text-sm text-red-500">
            {t("reviews.notFound") || "Review not found or no longer available."}
          </p>
        )}

        {!isLoading && review && (
          <div className="space-y-6 text-sm">
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                  {t("reviews.reviewInfo") || "Review Information"}
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-medium text-black/60 dark:text-white/60 block mb-1">
                    {t("reviews.reviewId") || "Review ID"}
                  </label>
                  <p className="font-semibold">#{review.id}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-black/60 dark:text-white/60 block mb-1">
                    {t("reviews.product") || "Product"}
                  </label>
                  <p className="font-medium">{review.product?.name ?? "-"}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-black/60 dark:text-white/60 block mb-1">
                    {t("reviews.customer") || "Customer"}
                  </label>
                  <p className="font-medium">
                    {review.user?.name ?? review.user?.email ?? "Guest"}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-black/60 dark:text-white/60 block mb-1">
                    {t("reviews.rating") || "Rating"}
                  </label>
                  <p className="font-medium flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    {review.rating}/5
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                  {t("reviews.customerComment") || "Customer Comment"}
                </h3>
              </div>
              <div className="border border-gray-100 dark:border-gray-800 rounded-lg p-4 bg-black/5 dark:bg-white/5">
                {review.title && (
                  <p className="font-medium mb-2">{review.title}</p>
                )}
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {review.comment ?? "-"}
                </p>
                <p className="text-xs text-black/50 dark:text-white/50 mt-2">
                  {review.createdAt
                    ? new Date(review.createdAt).toLocaleString()
                    : "-"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                <MessageSquare className="w-4 h-4" />
                <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                  {t("reviews.yourReply") || "Your Reply"}
                </h3>
              </div>

              {review.reply ? (
                <div className="border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 bg-emerald-50/50 dark:bg-emerald-950/20">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {review.reply}
                  </p>
                  <p className="text-xs text-black/50 dark:text-white/50 mt-2">
                    {t("reviews.updatedAt") || "Last updated"}:{" "}
                    {review.updatedAt
                      ? new Date(review.updatedAt).toLocaleString()
                      : "-"}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-black/60 dark:text-white/60">
                  {t("reviews.noReplyYet") || "No reply yet. Add a reply below."}
                </p>
              )}

              <form onSubmit={handleReply} className="space-y-3">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={
                    review.reply
                      ? (t("reviews.updateReplyPlaceholder") || "Update your reply...")
                      : (t("reviews.replyPlaceholder") || "Type your reply to the customer...")
                  }
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  disabled={isReplying}
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={isReplying || !replyText.trim()}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isReplying
                    ? t("common.sending") || "Sending..."
                    : review.reply
                      ? t("reviews.updateReply") || "Update Reply"
                      : t("reviews.sendReply") || "Send Reply"}
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewDetailPage;
