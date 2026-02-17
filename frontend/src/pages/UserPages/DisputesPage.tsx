import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Loader2,
  TrendingDown,
} from "lucide-react";
import Sidebar from "../../components/Sidebar/Sidebar";
import {
  DisputeApi,
  type DisputableJobData,
  type DisputeData,
} from "../../api/Apis";
import toast from "react-hot-toast";

export default function DisputesPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [disputes, setDisputes] = useState<DisputeData[]>([]);
  const [jobs, setJobs] = useState<DisputableJobData[]>([]);
  const [jobId, setJobId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">(
    "medium"
  );

  const fetchDisputeData = async () => {
    try {
      setLoading(true);
      const [disputeResponse, jobsResponse] = await Promise.all([
        DisputeApi.fetchMyDisputes(),
        DisputeApi.fetchDisputableJobs(),
      ]);

      setDisputes((disputeResponse.data.disputes || []) as DisputeData[]);
      setJobs((jobsResponse.data.jobs || []) as DisputableJobData[]);
    } catch (error) {
      console.error("Failed to load disputes", error);
      toast.error("Failed to load disputes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputeData();
  }, []);

  const stats = useMemo(() => {
    const total = disputes.length;
    const open = disputes.filter((item) => item.status === "open").length;
    const resolved = disputes.filter((item) => item.status === "resolved").length;
    const inProgress = Math.max(total - open - resolved, 0);

    return { total, open, inProgress, resolved };
  }, [disputes]);

  const formatDate = (date?: string) => {
    if (!date) return "-";
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return date;
    return parsed.toLocaleDateString();
  };

  const resolveJobLabel = (item: DisputeData) => {
    if (!item.jobId) return "-";
    if (typeof item.jobId === "string") {
      const matchedJob = jobs.find((job) => job._id === item.jobId);
      return matchedJob?.title || item.jobId;
    }

    return item.jobId.title || item.jobId._id || "-";
  };

  const handleCreateDispute = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!jobId || !title.trim()) {
      toast.error("Select a job and enter a dispute title.");
      return;
    }

    try {
      setSubmitting(true);

      await DisputeApi.createDispute({
        jobId,
        title: title.trim(),
        description: description.trim(),
        priority,
      });

      toast.success("Dispute submitted successfully.");
      setTitle("");
      setDescription("");
      setPriority("medium");
      setJobId("");
      fetchDisputeData();
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Failed to submit dispute.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const statusLabel = (status?: string) => {
    if (status === "resolved") return "Resolved";
    if (status === "in-review") return "In Review";
    return "Open";
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 px-6 md:px-12 py-10 bg-(--primary)">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-(--text) mb-3">
              Disputes
            </h1>
            <p className="text-(--text) text-lg">Track and resolve disputes</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-(--primary) rounded-2xl p-6 shadow-sm border border-(--border)">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-(--secondary) rounded-xl">
                  <FileText className="w-6 h-6 text-(--text)" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-(--text)">
                    {loading ? "-" : stats.total}
                  </div>
                  <div className="text-sm text-(--muted)">Total Disputes</div>
                </div>
              </div>
            </div>

            <div className="bg-(--primary) rounded-2xl p-6 shadow-sm border border-(--border)">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-(--warning-bg) rounded-xl">
                  <AlertCircle className="w-6 h-6 text-(--warning)" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-(--text)">
                    {loading ? "-" : stats.open}
                  </div>
                  <div className="text-sm text-(--muted)">Open</div>
                </div>
              </div>
            </div>

            <div className="bg-(--primary) rounded-2xl p-6 shadow-sm border border-(--border)">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-(--accent)/10 rounded-xl">
                  <Clock className="w-6 h-6 text-(--accent)" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-(--text)">
                    {loading ? "-" : stats.inProgress}
                  </div>
                  <div className="text-sm text-(--muted)">In Progress</div>
                </div>
              </div>
            </div>

            <div className="bg-(--primary) rounded-2xl p-6 shadow-sm border border-(--border)">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-(--success-bg) rounded-xl">
                  <CheckCircle className="w-6 h-6 text-(--success)" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-(--text)">
                    {loading ? "-" : stats.resolved}
                  </div>
                  <div className="text-sm text-(--muted)">Resolved</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8 bg-(--primary) rounded-2xl p-6 shadow-sm border border-(--border)">
            <h2 className="text-2xl font-bold text-(--text) mb-4">New Dispute</h2>
            <form onSubmit={handleCreateDispute} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm text-(--muted) mb-2">Job</label>
                <select
                  value={jobId}
                  onChange={(event) => setJobId(event.target.value)}
                  className="w-full p-3 rounded-lg border border-(--border) bg-(--secondary) text-(--text)"
                >
                  <option value="">Select a job</option>
                  {jobs.map((job) => (
                    <option key={job._id} value={job._id}>
                      {job.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-(--muted) mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Describe the dispute briefly"
                  className="w-full p-3 rounded-lg border border-(--border) bg-(--secondary) text-(--text)"
                />
              </div>

              <div>
                <label className="block text-sm text-(--muted) mb-2">Priority</label>
                <select
                  value={priority}
                  onChange={(event) =>
                    setPriority(event.target.value as "low" | "medium" | "high")
                  }
                  className="w-full p-3 rounded-lg border border-(--border) bg-(--secondary) text-(--text)"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-(--muted) mb-2">Description</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Share full details to help with resolution"
                  className="w-full p-3 rounded-lg border border-(--border) bg-(--secondary) text-(--text) resize-none"
                />
              </div>

              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || loading || jobs.length === 0}
                  className="px-4 py-2 bg-(--accent) text-(--primary) rounded-lg font-medium hover:bg-(--accent-hover) transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    "Submit Dispute"
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Disputes List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-(--text)">All Disputes</h2>
              {loading && <Loader2 className="w-5 h-5 animate-spin text-(--accent)" />}
            </div>

            <div className="space-y-4">
              {disputes.map((dispute) => {
                return (
                  <div
                    key={dispute._id}
                    className="bg-(--primary) rounded-2xl p-6 shadow-sm border border-(--border) hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col justify-center items-baseline">
                            <div className="flex flex-wrap items-center gap-3">
                              <h3 className="text-lg font-semibold text-(--text) mb-3">
                                {dispute.title}
                              </h3>
                              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-(--secondary) text-(--muted)">
                                {statusLabel(dispute.status)}
                              </span>
                              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-(--secondary) text-(--muted)">
                                {(dispute.priority || "medium").toUpperCase()}
                              </span>
                            </div>
                            <p className="text-(--text) text-sm leading-relaxed">
                              {dispute.description || "No description provided."}
                            </p>
                            <p className="text-xs text-(--muted) mt-2">
                              Job: {resolveJobLabel(dispute)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 min-w-fit">
                        <span className="text-sm text-(--muted)">
                          {formatDate(dispute.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Empty State (hidden when there are disputes) */}
          {!loading && disputes.length === 0 && (
            <div className="bg-(--primary) rounded-2xl p-12 shadow-sm border border-(--border) text-center">
              <div className="w-16 h-16 bg-(--success-bg) rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingDown className="w-8 h-8 text-(--success)" />
              </div>
              <h3 className="text-xl font-semibold text-(--text) mb-2">
                No disputes found
              </h3>
              <p className="text-(--text)">
                You're all caught up! No active disputes at the moment.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
