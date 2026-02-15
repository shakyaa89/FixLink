import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Flag,
  TrendingUp,
} from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar/AdminSidebar";
import { AdminApi, type AdminDisputeData, type AdminJobData, type AdminUserData } from "../../api/Apis";

export default function AdminDashboard() {
  const [users, setUsers] = useState<AdminUserData[]>([]);
  const [jobs, setJobs] = useState<Array<AdminJobData>>([]);
  const [disputes, setDisputes] = useState<Array<AdminDisputeData>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await AdminApi.fetchOverview();
        const fetchedUsers = (response.data.users || []) as AdminUserData[];
        const fetchedJobs = (response.data.jobs || []) as AdminJobData[];
        const fetchedDisputes = (response.data.disputes || []) as AdminDisputeData[];

        setUsers(fetchedUsers);

        setJobs(fetchedJobs);

        setDisputes(fetchedDisputes);
      } catch (err) {
        console.error("Failed to load admin overview", err);
        setError("Unable to load admin overview. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);


  const stats = useMemo(() => {
    const totalUsers = users.length;
    const totalProviders = users.filter((user) => user.role === "serviceProvider").length;
    const totalJobs = jobs.length;
    const openDisputes = disputes.filter((dispute) => dispute.status === "open").length;

    return [
      {
        title: "Total Users",
        value: totalUsers,
        icon: Users,
      },
      {
        title: "Providers",
        value: totalProviders,
        icon: Users,
      },
      {
        title: "Jobs Today",
        value: totalJobs,
        icon: Briefcase,
      },
      {
        title: "Open Disputes",
        value: openDisputes,
        icon: Flag,
      },
    ];
  }, [users, jobs, disputes]);

  return (
    <div className="flex min-h-screen bg-(--primary)">
      <AdminSidebar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <p className="text-(--muted) text-sm">Admin Console</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-(--text)">
                Dashboard Overview
              </h1>
              <p className="text-(--muted) mt-2">
                Track platform activity, users, and disputes in one place.
              </p>
            </div>
            <div className="flex items-center gap-2 text-(--accent)">
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-sm font-medium">Live snapshot</span>
            </div>
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
                  className="bg-(--primary) rounded-2xl border border-(--border) p-5 shadow-sm"
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <section className="bg-(--primary) border border-(--border) rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-(--text)">
                  Latest Users
                </h2>
                <TrendingUp className="w-5 h-5 text-(--accent)" />
              </div>
              <div className="space-y-4">
                {!loading && users.length === 0 && (
                  <p className="text-sm text-(--muted)">No users available.</p>
                )}
                {users.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between gap-4 p-3 rounded-xl bg-(--secondary)"
                  >
                    <div>
                      <p className="text-(--text) font-medium">
                        {user.fullName}
                      </p>
                      <p className="text-xs text-(--muted)">
                        {user.role === "serviceProvider" ? "Service Provider" : user.role === "user" ? "User" : "Admin"} • {new Date(user.createdAt!).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className="text-xs font-semibold px-3 py-1 rounded-full capitalize bg-(--secondary) text-(--muted) border border-(--border)"
                    >
                      {user.verificationStatus ? user.verificationStatus : "-"}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-(--primary) border border-(--border) rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-(--text)">
                  Recent Jobs
                </h2>
                <Briefcase className="w-5 h-5 text-(--accent)" />
              </div>
              <div className="space-y-4">
                {!loading && jobs.length === 0 && (
                  <p className="text-sm text-(--muted)">No jobs available.</p>
                )}
                {jobs.map((job) => (
                  <div
                    key={job._id}
                    className="flex items-center justify-between gap-4 p-3 rounded-xl bg-(--secondary)"
                  >
                    <div>
                      <p className="text-(--text) font-medium">{job.title}</p>
                      <p className="text-xs text-(--muted)">
                        {job.jobCategory} • {new Date(job.createdAt!).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className="text-xs font-semibold px-3 py-1 rounded-full capitalize bg-(--secondary) text-(--muted) border border-(--border)"
                    >
                      {job.jobStatus}
                    </span>
                  </div>
                  
                ))}
              </div>
            </section>

            <section className="bg-(--primary) border border-(--border) rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-(--text)">
                  Dispute Queue
                </h2>
                <Flag className="w-5 h-5 text-(--accent)" />
              </div>
              <div className="space-y-4">
                {!loading && disputes.length === 0 && (
                  <p className="text-sm text-(--muted)">No disputes available.</p>
                )}
                {disputes.map((dispute) => (
                  <div
                    key={dispute._id}
                    className="flex items-center justify-between gap-4 p-3 rounded-xl bg-(--secondary)"
                  >
                    <div>
                      <p className="text-(--text) font-medium">
                        {dispute.title}
                      </p>
                      <p className="text-xs text-(--muted)">
                        Updated {dispute.updatedAt}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full`}
                    >
                      {dispute.status}
                    </span>
                  </div>
                  
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
