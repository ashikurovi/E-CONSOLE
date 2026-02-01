import React, { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetSuperadminHelpByIdQuery,
  useAddSuperadminHelpReplyMutation,
  useUpdateSuperadminHelpMutation,
} from "@/features/superadmin/superadminApiSlice";
import { useHelpSocket } from "@/hooks/useHelpSocket";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, MessageSquare } from "lucide-react";

const SuperAdminSupportDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const numericId = Number(id);
  const superadminUser = useSelector((state) => state.superadminAuth.user);

  const [replyText, setReplyText] = useState("");

  const { data: ticket, isLoading, refetch } = useGetSuperadminHelpByIdQuery(
    id,
    { skip: !id }
  );
  const [addReply, { isLoading: isReplying }] =
    useAddSuperadminHelpReplyMutation();
  const [updateHelp, { isLoading: isUpdating }] =
    useUpdateSuperadminHelpMutation();

  const handleNewReply = useCallback(() => {
    refetch();
  }, [refetch]);

  useHelpSocket(id, {
    onReply: handleNewReply,
    currentUserName: superadminUser?.name || "Support",
    playSound: true,
  });

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !ticket?.id || !superadminUser?.name) return;
    try {
      await addReply({
        id: ticket.id,
        body: {
          message: replyText.trim(),
          author: superadminUser.name,
        },
      }).unwrap();
      setReplyText("");
      refetch();
    } catch (err) {
      console.error("Failed to add reply:", err);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!ticket?.id) return;
    try {
      await updateHelp({
        id: ticket.id,
        body: { status: newStatus },
      }).unwrap();
      refetch();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const replies = Array.isArray(ticket?.replies) ? ticket.replies : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Support ticket detail</h1>
          <p className="text-sm text-black/60 dark:text-white/60">
            Review the full context and reply to this support request.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/superadmin/support")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-5">
        {isLoading && <p className="text-sm">Loading ticket…</p>}

        {!isLoading && !ticket && (
          <p className="text-sm text-red-500">
            Ticket not found or no longer available.
          </p>
        )}

        {!isLoading && ticket && (
          <div className="space-y-6 text-sm">
            {/* Ticket Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                  Ticket Information
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-medium text-black/60 dark:text-white/60 block mb-1">
                    Ticket ID
                  </label>
                  <p className="font-semibold">#{ticket.id}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-black/60 dark:text-white/60 block mb-1">
                    Email
                  </label>
                  <p className="font-medium break-all">{ticket.email ?? "-"}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-black/60 dark:text-white/60 block mb-1">
                    Status
                  </label>
                  <select
                    value={ticket.status ?? "pending"}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={isUpdating}
                    className="border rounded px-2 py-1 text-xs bg-transparent dark:bg-white/5"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
                {ticket.companyId && (
                  <div>
                    <label className="text-xs font-medium text-black/60 dark:text-white/60 block mb-1">
                      Company ID
                    </label>
                    <p className="font-medium">{ticket.companyId}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Issue Description Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                  Issue Description
                </h3>
              </div>
              <div className="border border-gray-100 dark:border-gray-800 rounded-lg p-4 bg-black/5 dark:bg-white/5">
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {ticket.issue ?? "-"}
                </p>
              </div>
            </div>

            {/* Replies Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                <MessageSquare className="w-4 h-4" />
                <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                  Replies ({replies.length})
                </h3>
              </div>

              {replies.length > 0 && (
                <div className="space-y-3">
                  {replies.map((r, idx) => (
                    <div
                      key={idx}
                      className="border border-gray-100 dark:border-gray-800 rounded-lg p-4 bg-white/50 dark:bg-white/5"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-primary">
                          {r.author}
                        </span>
                        <span className="text-xs text-black/50 dark:text-white/50">
                          {r.createdAt
                            ? new Date(r.createdAt).toLocaleString()
                            : "-"}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{r.message}</p>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleReply} className="space-y-3">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  disabled={isReplying}
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={isReplying || !replyText.trim()}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isReplying ? "Sending..." : "Send Reply"}
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminSupportDetailPage;
