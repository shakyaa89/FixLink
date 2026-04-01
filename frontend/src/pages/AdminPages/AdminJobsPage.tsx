import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  CheckCircle2,
  XCircle,
  Clock,
  Hammer,
  Loader2,
} from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar/AdminSidebar";
import { AdminApi, type AdminJobData } from "../../api/Apis";

type JobStatus = "open" | "scheduled" | "in-progress" | "cancelled" | "completed";

export default function AdminJobsPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<AdminJobData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  const stats = useMemo(() => {
    const total = jobs.length;
    const open = jobs.filter((job) => job.jobStatus === "open").length;
    const inProgress = jobs.filter(
      (job) => job.jobStatus === "in-progress",
    ).length;
    const completed = jobs.filter(
      (job) => job.jobStatus === "completed",
    ).length;
    const cancelled = jobs.filter(
      (job) => job.jobStatus === "cancelled",
    ).length;

    return [
      { title: "Total Jobs", value: total, icon: Briefcase },
      { title: "Open", value: open, icon: Clock },
      { title: "In Progress", value: inProgress, icon: Hammer },
      { title: "Completed", value: completed, icon: CheckCircle2 },
      { title: "Cancelled", value: cancelled, icon: XCircle },
    ];
  }, [jobs]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await AdminApi.fetchJobs();
      const fetchedJobs = response.data.jobs || [];
      setJobs(fetchedJobs);
    } catch (err) {
      console.error("Failed to load jobs", err);
      setError("Unable to load jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleStatusUpdate = async (jobId: string, jobStatus: JobStatus) => {
    try {
      setUpdatingId(jobId);
      setError(null);
      await AdminApi.updateJob(jobId, { jobStatus });
      await fetchJobs();
    } catch (err) {
      console.error("Failed to update job status", err);
      setError("Unable to update job status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteJob = async (jobId: string, title: string) => {
    setDeleteTarget({ id: jobId, title });
  };

  const confirmDeleteJob = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      setDeletingId(deleteTarget.id);
      setError(null);
      await AdminApi.deleteJob(deleteTarget.id);
      await fetchJobs();
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete job", err);
      setError("Unable to delete job.");
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
              Job Oversight
            </h1>
            <p className="text-(--muted) mt-2">
              Monitor marketplace activity and resolve jobs quickly.
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
                  <h2 className="text-lg font-semibold text-(--text)">All Jobs</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-(--muted)">{jobs.length} jobs</span>
                    <button
                      type="button"
                      onClick={() => navigate("/admin/jobs/create")}
                      className="px-4 py-2 text-sm font-semibold rounded-lg bg-(--accent) text-(--primary) hover:bg-(--accent-hover) transition"
                    >
                      Create Job
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-(--border)">
                  {jobs.length === 0 && (
                    <div className="px-6 py-6 text-sm text-(--muted)">
                      No jobs found.
                    </div>
                  )}
                  {jobs.map((job) => (
                    <div
                      key={job._id}
                      className="grid grid-cols-1 lg:grid-cols-6 gap-4 px-6 py-4 items-center"
                    >
                      <div className="lg:col-span-2">
                        <p className="text-(--text) font-semibold">{job.title}</p>
                        <p className="text-xs text-(--muted)">{job.jobCategory}</p>
                      </div>
                      <div>
                        <p className="text-sm text-(--text)">
                          {job.userId?.fullName}
                        </p>
                        <p className="text-xs text-(--muted)">{job._id}</p>
                      </div>
                      <div>
                        <select
                          value={(job.jobStatus || "open") as JobStatus}
                          disabled={!job._id || updatingId === job._id}
                          onChange={(event) =>
                            job._id &&
                            handleStatusUpdate(job._id, event.target.value as JobStatus)
                          }
                          className="text-xs font-semibold px-3 py-2 rounded-lg capitalize bg-(--secondary) text-(--muted) border border-(--border)"
                        >
                          <option value="open">open</option>
                          <option value="scheduled">scheduled</option>
                          <option value="in-progress">in-progress</option>
                          <option value="cancelled">cancelled</option>
                          <option value="completed">completed</option>
                        </select>
                      </div>
                      <div>
                        <p className="text-sm text-(--text)">
                          {job.createdAt
                            ? new Date(job.createdAt).toLocaleDateString()
                            : "-"}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          disabled={!job._id}
                          onClick={() =>
                            job._id && navigate(`/admin/jobs/${job._id}`)
                          }
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-(--secondary) text-(--text) border border-(--border) transition disabled:opacity-60"
                        >
                          View Details
                        </button>
                        <button
                          type="button"
                          disabled={!job._id || deletingId === job._id}
                          onClick={() =>
                            job._id && handleDeleteJob(job._id, job.title)
                          }
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-(--danger-bg) text-(--danger) border border-(--border) transition disabled:opacity-60"
                        >
                          {deletingId === job._id ? "Deleting..." : "Delete"}
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
            <h3 className="text-xl font-semibold text-(--text)">Delete Job</h3>
            <p className="mt-2 text-sm text-(--muted)">
              Delete job "{deleteTarget.title}"? This action cannot be undone.
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
                onClick={confirmDeleteJob}
                disabled={deletingId === deleteTarget.id}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-(--danger-bg) text-(--danger) border border-(--border) disabled:opacity-60"
              >
                {deletingId === deleteTarget.id ? "Processing..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
