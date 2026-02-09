import React, { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetHelpByIdQuery, useAddHelpReplyMutation } from "@/features/help/helpApiSlice";
import { Button } from "@/components/ui/button";

const SuperAdminSupportDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const numericId = useMemo(() => Number(id), [id]);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyAuthor, setReplyAuthor] = useState("Support");

  const { data: ticket, isLoading } = useGetHelpByIdQuery(numericId, {
    skip: !numericId || isNaN(numericId),
  });
  const [addReply, { isLoading: isSubmittingReply }] = useAddHelpReplyMutation();

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;
    try {
      await addReply({
        id: numericId,
        body: { message: replyMessage.trim(), author: replyAuthor.trim() || "Support" },
      }).unwrap();
      setReplyMessage("");
    } catch (err) {
      console.error("Failed to add reply:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-violet-600 to-indigo-700 p-8 text-white shadow-xl shadow-violet-500/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Support Ticket Detail</h1>
            <p className="text-violet-100 text-lg max-w-2xl">
              Review the full context of a single support request.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/superadmin/support")}
            className="bg-white text-violet-600 hover:bg-violet-50 border-0 shadow-lg shadow-black/10"
          >
            Back to list
          </Button>
        </div>
      </div>

      <div className="rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl">
        {isLoading && <p className="text-sm text-slate-500">Loading ticket…</p>}

        {!isLoading && !ticket && (
          <p className="text-sm text-rose-500">
            Ticket not found or no longer available.
          </p>
        )}

        {!isLoading && ticket && (
          <div className="space-y-6 text-sm">
            {/* Ticket Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wide">
                  Ticket Information
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
                    Ticket ID
                  </label>
                  <p className="font-semibold text-slate-900 dark:text-white">#{ticket.id}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
                    Email
                  </label>
                  <p className="font-medium break-all text-slate-900 dark:text-white">
                    {ticket.email ?? "-"}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
                    Status
                  </label>
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                    ticket.status === 'resolved' 
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" 
                      : ticket.status === 'closed'
                      ? "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                  }`}>
                    {ticket.status?.replace("_", " ") ?? "-"}
                  </span>
                </div>
                {ticket.companyId && (
                  <div>
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
                      Company ID
                    </label>
                    <p className="font-medium text-slate-900 dark:text-white">{ticket.companyId}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Issue Description Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wide">
                  Issue Description
                </h3>
              </div>
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50 dark:bg-slate-800/50">
                <p className="text-sm whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300">
                  {ticket.issue ?? "-"}
                </p>
              </div>
            </div>

            {/* Timeline Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wide">
                  Timeline
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
                    Created At
                  </label>
                  <p className="text-xs font-medium text-slate-900 dark:text-white">
                    {ticket.createdAt
                      ? new Date(ticket.createdAt).toLocaleString()
                      : "-"}
                  </p>
                </div>
                {ticket.updatedAt && (
                  <div>
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
                      Last Updated
                    </label>
                    <p className="text-xs font-medium text-slate-900 dark:text-white">
                      {new Date(ticket.updatedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Replies Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wide">
                  Replies
                </h3>
              </div>

              {/* Existing replies */}
              <div className="space-y-3">
                {Array.isArray(ticket.replies) && ticket.replies.length > 0 ? (
                  ticket.replies.map((reply, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-semibold text-violet-600 dark:text-violet-400">
                          {reply.author ?? "Support"}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {reply.createdAt
                            ? new Date(reply.createdAt).toLocaleString()
                            : ""}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                        {reply.message}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400 py-2">
                    No replies yet. Add a reply below.
                  </p>
                )}
              </div>

              {/* Reply form */}
              <form onSubmit={handleSubmitReply} className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
                    Your reply
                  </label>
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your reply..."
                    rows={4}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    disabled={isSubmittingReply}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-[120px]">
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
                      Author name
                    </label>
                    <input
                      type="text"
                      value={replyAuthor}
                      onChange={(e) => setReplyAuthor(e.target.value)}
                      placeholder="e.g. Support"
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      disabled={isSubmittingReply}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="submit"
                      disabled={!replyMessage.trim() || isSubmittingReply}
                      className="bg-violet-600 hover:bg-violet-700 text-white"
                    >
                      {isSubmittingReply ? "Sending…" : "Send reply"}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminSupportDetailPage;









