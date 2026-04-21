import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar/AdminSidebar";
import { AdminApi, type AdminMessageData } from "../../api/Apis";

const resolveUserLabel = (
  value?: { _id?: string; fullName?: string; email?: string } | string,
) => {
  if (!value) return "-";
  // API can return sender/receiver as object or plain id.
  if (typeof value === "string") return value;
  return value.fullName || value.email || value._id || "-";
};

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<AdminMessageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<{ id: string; content: string } | null>(null);
  const [editDraft, setEditDraft] = useState("");

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await AdminApi.fetchMessages();
      setMessages(response.data.messages || []);
    } catch (err) {
      console.error("Failed to load messages", err);
      setError("Unable to load messages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleEdit = async (messageId: string, currentContent: string) => {
    setEditTarget({ id: messageId, content: currentContent });
    setEditDraft(currentContent);
  };

  const confirmEdit = async () => {
    if (!editTarget) {
      return;
    }

    if (!editDraft.trim()) {
      // Prevent saving empty or whitespace-only messages.
      setError("Message content cannot be empty.");
      return;
    }

    try {
      setUpdatingId(editTarget.id);
      setError(null);
      await AdminApi.updateMessage(editTarget.id, { content: editDraft.trim() });
      // Reload to show the persisted message content.
      await fetchMessages();
      setEditTarget(null);
      setEditDraft("");
    } catch (err) {
      console.error("Failed to update message", err);
      setError("Unable to update message.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (messageId: string) => {
    setDeleteTarget(messageId);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      setDeletingId(deleteTarget);
      setError(null);
      await AdminApi.deleteMessage(deleteTarget);
      // Refresh list after delete.
      await fetchMessages();
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete message", err);
      setError("Unable to delete message.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-(--primary)">
      <AdminSidebar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <p className="text-(--muted) text-sm">Admin Console</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-(--text)">Messages Moderation</h1>
          </div>

          {error && (
            <div className="bg-(--danger-bg) text-(--danger) border border-(--border) rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-(--accent) animate-spin" />
            </div>
          ) : (
            <div className="bg-(--primary) border border-(--border) rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-(--border) bg-(--secondary)">
                <h2 className="text-lg font-semibold text-(--text)">All Messages</h2>
                <span className="text-sm text-(--muted)">{messages.length} messages</span>
              </div>

              <div className="divide-y divide-(--border)">
                {messages.length === 0 && (
                  <div className="px-6 py-6 text-sm text-(--muted)">No messages found.</div>
                )}
                {messages.map((message) => (
                  <div key={message._id} className="grid grid-cols-1 lg:grid-cols-6 gap-4 px-6 py-4 items-center">
                    <div>
                      <p className="text-xs text-(--muted)">Sender</p>
                      <p className="text-sm text-(--text)">{resolveUserLabel(message.senderId)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-(--muted)">Receiver</p>
                      <p className="text-sm text-(--text)">{resolveUserLabel(message.receiverId)}</p>
                    </div>
                    <div className="lg:col-span-2">
                      <p className="text-xs text-(--muted)">Content</p>
                      <p className="text-sm text-(--text)">{message.content || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-(--muted)">Created</p>
                      <p className="text-sm text-(--text)">
                        {message.createdAt ? new Date(message.createdAt).toLocaleString() : "-"}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                      <button
                        type="button"
                        disabled={!message._id || updatingId === message._id}
                        onClick={() =>
                          message._id &&
                          handleEdit(message._id, message.content || "")
                        }
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-(--secondary) text-(--text) border border-(--border) disabled:opacity-60"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={!message._id || deletingId === message._id}
                        onClick={() => message._id && handleDelete(message._id)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-(--danger-bg) text-(--danger) border border-(--border) disabled:opacity-60"
                      >
                        {deletingId === message._id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            aria-label="Close modal"
            onClick={() => {
              setEditTarget(null);
              setEditDraft("");
            }}
            className="absolute inset-0 bg-black/50"
          />
          <div className="relative w-full max-w-lg rounded-2xl border border-(--border) bg-(--primary) p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-(--text)">Edit Message</h3>
            <p className="mt-2 text-sm text-(--muted)">Update message content.</p>

            <textarea
              value={editDraft}
              onChange={(event) => setEditDraft(event.target.value)}
              rows={4}
              className="mt-4 w-full rounded-lg border border-(--border) bg-(--secondary) p-3 text-(--text) outline-none focus:ring-2 focus:ring-(--accent)"
            />

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setEditTarget(null);
                  setEditDraft("");
                }}
                disabled={updatingId === editTarget.id}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-(--secondary) text-(--text) border border-(--border) disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmEdit}
                disabled={updatingId === editTarget.id}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-(--accent) text-(--primary) disabled:opacity-60"
              >
                {updatingId === editTarget.id ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            aria-label="Close modal"
            onClick={() => setDeleteTarget(null)}
            className="absolute inset-0 bg-black/50"
          />
          <div className="relative w-full max-w-md rounded-2xl border border-(--border) bg-(--primary) p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-(--text)">Delete Message</h3>
            <p className="mt-2 text-sm text-(--muted)">
              Delete this message? This action cannot be undone.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deletingId === deleteTarget}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-(--secondary) text-(--text) border border-(--border) disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deletingId === deleteTarget}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-(--danger-bg) text-(--danger) border border-(--border) disabled:opacity-60"
              >
                {deletingId === deleteTarget ? "Processing..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
