import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import ReusableTable from "@/components/table/reusable-table";
import { Button } from "@/components/ui/button";
import { useGetReviewsQuery } from "@/features/reviews/reviewsApiSlice";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Star, MessageSquare } from "lucide-react";

function ReviewsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);
  const { data: reviews = [], isLoading } = useGetReviewsQuery(
    { companyId: authUser?.companyId },
    { skip: !authUser?.companyId }
  );

  const headers = useMemo(
    () => [
      { header: "ID", field: "id" },
      { header: t("reviews.product") || "Product", field: "productName" },
      { header: t("reviews.customer") || "Customer", field: "customerName" },
      { header: t("reviews.rating") || "Rating", field: "rating" },
      { header: t("reviews.comment") || "Comment", field: "comment" },
      { header: t("reviews.reply") || "Reply", field: "hasReply" },
      { header: t("reviews.createdAt") || "Created", field: "createdAt" },
      { header: t("common.actions") || "Actions", field: "actions", sortable: false },
    ],
    [t]
  );

  const tableData = useMemo(
    () =>
      reviews.map((review) => ({
        id: review.id,
        productName: review.product?.name ?? "-",
        customerName: review.user?.name ?? review.user?.email ?? "Guest",
        rating: (
          <span className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            {review.rating}
          </span>
        ),
        comment:
          review.comment?.length > 80
            ? `${review.comment.slice(0, 80)}…`
            : review.comment ?? "-",
        hasReply: review.reply ? (
          <span className="text-emerald-600 dark:text-emerald-400 text-xs font-medium">
            {t("reviews.replied") || "Replied"}
          </span>
        ) : (
          <span className="text-amber-600 dark:text-amber-400 text-xs font-medium">
            {t("reviews.pending") || "Pending"}
          </span>
        ),
        createdAt: review.createdAt
          ? new Date(review.createdAt).toLocaleString()
          : "-",
        actions: (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate(`/reviews/${review.id}`)}
            className="text-xs"
          >
            <MessageSquare className="w-4 h-4 mr-1" />
            {t("reviews.viewReply") || "View / Reply"}
          </Button>
        ),
      })),
    [reviews, t, navigate]
  );

  return (
    <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold">
            {t("reviews.title") || "Customer Reviews"}
          </h2>
          <p className="text-sm text-black/60 dark:text-white/60 mt-1">
            {t("reviews.subtitle") ||
              "View and reply to customer product reviews from your dashboard."}
          </p>
        </div>
      </div>

      <ReusableTable
        data={tableData}
        headers={headers}
        total={reviews.length}
        isLoading={isLoading}
        py="py-2"
      />
    </div>
  );
}

export default ReviewsPage;
