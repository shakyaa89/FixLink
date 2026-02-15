import { useEffect, useMemo, useState } from "react";
import { Flag, CheckCircle2, Timer, AlertTriangle } from "lucide-react";
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

  useEffect(() => {
    const fetchDisputes = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await AdminApi.fetchDisputes();
        const fetchedDisputes = (response.data.disputes || []) as AdminDisputeData[];
        setDisputes(
          fetchedDisputes.map((dispute) => ({
            ...dispute,
            statusLabel: mapDisputeStatus(dispute.status),
            priorityLabel: mapPriority(dispute.priority),
            updatedLabel: formatDate(dispute.updatedAt),
            jobLabel: resolveJobLabel(dispute.jobId),
          }))
        );
      } catch (err) {
        console.error("Failed to load disputes", err);
        setError("Unable to load disputes. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDisputes();
  }, []);

  const formatDate = (value?: string) => {
    if (!value) return "-";
    const date = new Date(value);
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
    if (typeof jobId === "string") return jobId;
    return jobId.title || jobId._id || "-";
  };

  const stats = useMemo(() => {
    const total = disputes.length;
    const open = disputes.filter((item) => item.statusLabel === "Open").length;
    const inReview = disputes.filter(
      (item) => item.statusLabel === "In Review"
    ).length;
    const resolved = disputes.filter(
      (item) => item.statusLabel === "Resolved"
    ).length;

    return [
      { title: "Total", value: total, icon: Flag },
      { title: "Open", value: open, icon: AlertTriangle },
      { title: "In Review", value: inReview, icon: Timer },
      { title: "Resolved", value: resolved, icon: CheckCircle2 },
    ];
  }, [disputes]);

  const statusClass = (status: string) => {
    if (status === "Open") {
      return "bg-(--warning-bg) text-(--warning)";
    }
    if (status === "In Review") {
      return "bg-(--info-bg) text-(--info)";
    }
    if (status === "Resolved") {
      return "bg-(--success-bg) text-(--success)";
    }
    return "bg-(--secondary) text-(--muted)";
  };

  const priorityClass = (priority: string) => {
    if (priority === "High") {
      return "bg-(--danger-bg) text-(--danger)";
    }
    if (priority === "Medium") {
      return "bg-(--warning-bg) text-(--warning)";
    }
    if (priority === "Low") {
      return "bg-(--success-bg) text-(--success)";
    }
    return "bg-(--secondary) text-(--muted)";
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
                        {loading ? "-" : stat.value}
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
              <button className="px-4 py-2 text-sm font-medium rounded-lg bg-(--accent) text-(--primary) hover:bg-(--accent-hover) transition">
                Create Resolution Plan
              </button>
            </div>

            <div className="divide-y divide-[var(--border)]">
              {!loading && disputes.length === 0 && (
                <div className="px-6 py-6 text-sm text-(--muted)">
                  No disputes found.
                </div>
              )}
              {disputes.map((dispute) => (
                <div
                  key={dispute._id}
                  className="grid grid-cols-1 lg:grid-cols-6 gap-4 px-6 py-4 items-center"
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
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${statusClass(
                        dispute.statusLabel
                      )}`}
                    >
                      {dispute.statusLabel}
                    </span>
                  </div>
                  <div>
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${priorityClass(
                        dispute.priorityLabel
                      )}`}
                    >
                      {dispute.priorityLabel} Priority
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-(--text)">{dispute.updatedLabel}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-(--secondary) text-(--text) border border-(--border) transition">
                      Review
                    </button>
                    <button className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-(--success-bg) text-(--success) border border-(--border) transition">
                      Resolve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
