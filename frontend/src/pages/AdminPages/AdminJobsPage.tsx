import { useEffect, useMemo, useState } from "react";
import { Briefcase, CheckCircle2, XCircle, Clock, Hammer } from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar/AdminSidebar";
import { AdminApi, type AdminJobData } from "../../api/Apis";

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<AdminJobData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await AdminApi.fetchJobs();
        const fetchedJobs = (response.data.jobs || []);
        setJobs(fetchedJobs);
      } catch (err) {
        console.error("Failed to load jobs", err);
        setError("Unable to load jobs. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const stats = useMemo(() => {
    const total = jobs.length;
    const open = jobs.filter((job) => job.jobStatus === "open").length;
    const inProgress = jobs.filter((job) => job.jobStatus === "in-progress").length;
    const completed = jobs.filter((job) => job.jobStatus === "completed").length;
    const cancelled = jobs.filter((job) => job.jobStatus === "cancelled").length;

    return [
      { title: "Total Jobs", value: total, icon: Briefcase },
      { title: "Open", value: open, icon: Clock },
      { title: "In Progress", value: inProgress, icon: Hammer },
      { title: "Completed", value: completed, icon: CheckCircle2 },
      { title: "Cancelled", value: cancelled, icon: XCircle },
    ];
  }, [jobs]);

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
              <h2 className="text-lg font-semibold text-(--text)">All Jobs</h2>
              <button className="px-4 py-2 text-sm font-medium rounded-lg bg-(--accent) text-(--primary) hover:bg-(--accent-hover) transition">
                Export Report
              </button>
            </div>

            <div className="divide-y divide-[var(--border)]">
              {!loading && jobs.length === 0 && (
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
                    <p className="text-sm text-(--text)">{job.userId?.fullName}</p>
                    <p className="text-xs text-(--muted)">{job._id}</p>
                  </div>
                  <div>
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full capitalize bg-(--secondary) text-(--muted) border border-(--border)`}
                    >
                      {job.jobStatus}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-(--text)">{job.createdAt}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-(--secondary) text-(--text) border border-(--border) transition">
                      View Details
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
