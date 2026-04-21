import { useEffect, useMemo, useState } from "react";
import {
  Flag,
  CheckCircle2,
  Timer,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar/AdminSidebar";
import { AdminApi, type AdminDisputeData } from "../../api/Apis";

interface AdminDispute extends AdminDisputeData {
  statusLabel: "Open" | "In Review" | "Resolved";
  priorityLabel: "Low" | "Medium" | "High";
  updatedLabel: string;
  jobLabel: string;
}

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<AdminDispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [resolveTarget, setResolveTarget] = useState<{
    id: string;
    title: string;
    message: string;
  } | null>(null);
  const [resolveError, setResolveError] = useState<string | null>(null);

  const formatDate = (value?: string) => {
    if (!value) return "-";
    const date = new Date(value);
    // Keep original value if backend sends a non-ISO date string.
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString();
  };

  const mapDisputeStatus = (status?: string) => {
    if (status === "open") return "Open" as const;
    if (status === "in-review") return "In Review" as const;
    if (status === "resolved") return "Resolved" as const;
    return "Open" as const;
  };

  const mapPriority = (priority?: string) => {
    if (priority === "high") return "High" as const;
    if (priority === "medium") return "Medium" as const;
    if (priority === "low") return "Low" as const;
    return "Medium" as const;
  };

  const resolveJobLabel = (jobId?: AdminDisputeData["jobId"]) => {
    if (!jobId) return "-";
    // Some responses send only job id string, others send full job object.
    if (typeof jobId === "string") return jobId;
    return jobId.title || jobId._id || "-";
  };

  const stats = useMemo(() => {
    const total = disputes.length;
    const open = disputes.filter((item) => item.statusLabel === "Open").length;
    const inReview = disputes.filter(
      (item) => item.statusLabel === "In Review",
    ).length;
    const resolved = disputes.filter(
      (item) => item.statusLabel === "Resolved",
    ).length;

    return [
      { title: "Total", value: total, icon: Flag },
      { title: "Open", value: open, icon: AlertTriangle },
      { title: "In Review", value: inReview, icon: Timer },
      { title: "Resolved", value: resolved, icon: CheckCircle2 },
    ];
  }, [disputes]);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await AdminApi.fetchDisputes();
      const fetchedDisputes = (response.data.disputes ||
        []) as AdminDisputeData[];
      // Normalize API data once.
      setDisputes(
        fetchedDisputes.map((dispute) => ({
          ...dispute,
          statusLabel: mapDisputeStatus(dispute.status),
          priorityLabel: mapPriority(dispute.priority),
          updatedLabel: formatDate(dispute.updatedAt),
          jobLabel: resolveJobLabel(dispute.jobId),
        })),
      );
    } catch (err) {
      console.error("Failed to load disputes", err);
      setError("Unable to load disputes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleDisputeUpdate = async (
    disputeId: string,
    data: Partial<{ status: "open" | "resolved"; priority: "low" | "medium" | "high" }>,
  ) => {
    try {
      setUpdatingId(disputeId);
      setError(null);
      // Re-fetch to keep status, priority, and derived labels in sync.
      await AdminApi.updateDispute(disputeId, data);
      await fetchDisputes();
    } catch (err) {
      console.error("Failed to update dispute", err);
      setError("Unable to update dispute.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteDispute = async (disputeId: string, title: string) => {
    setDeleteTarget({ id: disputeId, title });
  };

  const handleResolveDispute = (disputeId: string, title: string) => {
    setResolveError(null);
    setResolveTarget({ id: disputeId, title, message: "" });
  };

  const confirmResolveDispute = async () => {
    if (!resolveTarget) {
      return;
    }

    const message = resolveTarget.message.trim();
    // Force a message so resolution history is clear to both sides.
    if (!message) {
      setResolveError("Please enter a resolution message.");
      return;
    }

    try {
      setUpdatingId(resolveTarget.id);
      setError(null);
      await AdminApi.updateDispute(resolveTarget.id, {
        status: "resolved",
        resolutionMessage: message,
      });
      setResolveTarget(null);
      await fetchDisputes();
    } catch (err) {
      console.error("Failed to resolve dispute", err);
      setError("Unable to resolve dispute.");
    } finally {
      setUpdatingId(null);
    }
  };

  const confirmDeleteDispute = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      setDeletingId(deleteTarget.id);
      setError(null);
      await AdminApi.deleteDispute(deleteTarget.id);
      // Refresh table.
      await fetchDisputes();
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete dispute", err);
      setError("Unable to delete dispute.");
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
            <h1 className="text-3xl sm:text-4xl font-bold text-(--text)">
              Dispute Resolution
            </h1>
            <p className="text-(--muted) mt-2">
              Prioritize claims and keep service quality on track.
            </p>
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
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.title}
                      className="bg-(--primary) border border-(--border) rounded-2xl p-5 shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-(--secondary) flex items-center justify-center">
                          <Icon className="w-6 h-6 text-(--accent)" />
                        </div>
                        <div>
                          <p className="text-sm text-(--muted)">{stat.title}</p>
                          <p className="text-2xl font-bold text-(--text)">
                            {stat.value}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-(--primary) border border-(--border) rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-(--border) bg-(--secondary)">
                  <h2 className="text-lg font-semibold text-(--text)">
                    Active Disputes
                  </h2>
                  <span className="text-sm text-(--muted)">
                    {disputes.length} disputes
                  </span>
                </div>

                <div className="divide-y divide-(--border)">
                  {disputes.length === 0 && (
                    <div className="px-6 py-6 text-sm text-(--muted)">
                      No disputes found.
                    </div>
                  )}
                  {disputes.map((dispute) => (
                    <div
                      key={dispute._id}
                      className="grid grid-cols-1 lg:grid-cols-7 gap-4 px-6 py-4 items-center"
                    >
                      <div className="lg:col-span-2">
                        <p className="text-(--text) font-semibold">
                          {dispute.title}
                        </p>
                        <p className="text-xs text-(--muted)">{dispute._id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-(--text)">{dispute.jobLabel}</p>
                        <p className="text-xs text-(--muted)">Job reference</p>
                      </div>
                      <div>
                        <select
                          value={dispute.status === "resolved" ? "resolved" : "open"}
                          disabled={!dispute._id || updatingId === dispute._id}
                          onChange={(event) =>
                            dispute._id &&
                            (event.target.value === "resolved"
                              ? handleResolveDispute(dispute._id, dispute.title)
                              : handleDisputeUpdate(dispute._id, {
                                  status: "open",
                                }))
                          }
                          className="text-xs font-semibold px-3 py-2 rounded-lg bg-(--secondary) text-(--muted) border border-(--border) capitalize"
                        >
                          <option value="open">open</option>
                          <option value="resolved">resolved</option>
                        </select>
                      </div>
                      <div>
                        <select
                          value={(dispute.priority || "medium") as "low" | "medium" | "high"}
                          disabled={!dispute._id || updatingId === dispute._id}
                          onChange={(event) =>
                            dispute._id &&
                            handleDisputeUpdate(dispute._id, {
                              priority: event.target.value as "low" | "medium" | "high",
                            })
                          }
                          className="text-xs font-semibold px-3 py-2 rounded-lg bg-(--secondary) text-(--muted) border border-(--border) capitalize"
                        >
                          <option value="low">low</option>
                          <option value="medium">medium</option>
                          <option value="high">high</option>
                        </select>
                      </div>
                      <div>
                        <p className="text-sm text-(--text)">
                          {dispute.updatedLabel}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                        {dispute.status === "resolved" ? (
                          <button
                            type="button"
                            disabled={!dispute._id || updatingId === dispute._id}
                            onClick={() =>
                              dispute._id &&
                              handleDisputeUpdate(dispute._id, { status: "open" })
                            }
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-(--secondary) text-(--text) border border-(--border) transition disabled:opacity-60"
                          >
                            Open
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={!dispute._id || updatingId === dispute._id}
                            onClick={() =>
                              dispute._id &&
                              handleResolveDispute(dispute._id, dispute.title)
                            }
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-(--success-bg) text-(--success) border border-(--border) transition disabled:opacity-60"
                          >
                            Resolve
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={!dispute._id || deletingId === dispute._id}
                          onClick={() =>
                            dispute._id &&
                            handleDeleteDispute(dispute._id, dispute.title)
                          }
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-(--danger-bg) text-(--danger) border border-(--border) transition disabled:opacity-60"
                        >
                          {deletingId === dispute._id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            aria-label="Close modal"
            onClick={() => setDeleteTarget(null)}
            className="absolute inset-0 bg-black/50"
          />
          <div className="relative w-full max-w-md rounded-2xl border border-(--border) bg-(--primary) p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-(--text)">Delete Dispute</h3>
            <p className="mt-2 text-sm text-(--muted)">
              Delete dispute "{deleteTarget.title}"? This action cannot be undone.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deletingId === deleteTarget.id}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-(--secondary) text-(--text) border border-(--border) disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteDispute}
                disabled={deletingId === deleteTarget.id}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-(--danger-bg) text-(--danger) border border-(--border) disabled:opacity-60"
              >
                {deletingId === deleteTarget.id ? "Processing..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {resolveTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            aria-label="Close modal"
            onClick={() => {
              setResolveTarget(null);
              setResolveError(null);
            }}
            className="absolute inset-0 bg-black/50"
          />
          <div className="relative w-full max-w-lg rounded-2xl border border-(--border) bg-(--primary) p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-(--text)">Resolve Dispute</h3>
            <p className="mt-2 text-sm text-(--muted)">
              Add a resolution message for "{resolveTarget.title}".
            </p>

            <div className="mt-4">
              <label className="block text-sm font-medium text-(--text) mb-2">
                Resolution message
              </label>
              <textarea
                rows={4}
                value={resolveTarget.message}
                onChange={(event) =>
                  setResolveTarget((prev) =>
                    prev ? { ...prev, message: event.target.value } : prev,
                  )
                }
                className="w-full border border-(--border) rounded-lg px-3 py-2 bg-(--primary) text-(--text)"
                placeholder="Explain how the dispute was resolved"
              />
              {resolveError && (
                <p className="text-sm text-(--danger) mt-2">{resolveError}</p>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setResolveTarget(null);
                  setResolveError(null);
                }}
                disabled={updatingId === resolveTarget.id}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-(--secondary) text-(--text) border border-(--border) disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmResolveDispute}
                disabled={updatingId === resolveTarget.id}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-(--accent) text-(--primary) border border-(--border) disabled:opacity-60"
              >
                {updatingId === resolveTarget.id ? "Processing..." : "Confirm Resolve"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
