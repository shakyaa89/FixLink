import {
  Briefcase,
  MessageSquare,
  FileText,
  Star,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useEffect, useState } from "react";
import { JobApi, type JobData } from "../../api/Apis";
import { useAuthStore } from "../../store/authStore";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
);

interface DashboardStats {
  activeJobs: number;
  completedJobs: number;
  offersReceived: number;
  totalReviews: number;
}

export default function UserDashboard() {
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats] = useState<DashboardStats>({
    activeJobs: 0,
    completedJobs: 0,
    offersReceived: 0,
    totalReviews: 0,
  });

  const { user } = useAuthStore();

  const quickActions = [
    {
      to: "/serviceprovider/jobs",
      icon: Briefcase,
      title: "View Jobs",
      description: "Browse jobs in your category",
      color: "text-blue-600",
      bgColor: "bg-(--secondary)",
      hoverColor: "hover:bg-(--secondary)",
    },
    {
      to: "/serviceprovider/jobs",
      icon: Briefcase,
      title: "Job Queue",
      description: "Track active and pending work",
      color: "text-purple-600",
      bgColor: "bg-(--secondary)",
      hoverColor: "hover:bg-(--secondary)",
    },
    {
      to: "/messages",
      icon: MessageSquare,
      title: "Messages",
      description: "Chat with users",
      color: "text-green-600",
      bgColor: "bg-(--secondary)",
      hoverColor: "hover:bg-(--secondary)",
    },
    {
      to: "/offers",
      icon: FileText,
      title: "Offers",
      description: "View your submitted offers",
      color: "text-orange-600",
      bgColor: "bg-(--secondary)",
      hoverColor: "hover:bg-(--secondary)",
    },
  ];

  const statsCards = [
    {
      icon: Clock,
      title: "Active Jobs",
      value: stats.activeJobs,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: CheckCircle,
      title: "Completed Jobs",
      value: stats.completedJobs,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: FileText,
      title: "Offers Received",
      value: stats.offersReceived,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: Star,
      title: "Total Reviews",
      value: stats.totalReviews,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
  ];

  const providerJobStatusChartData = {
    labels: ["Open", "In Progress", "Scheduled", "Completed", "Cancelled"],
    datasets: [
      {
        data: [
          jobs.filter((job) => job.jobStatus === "open").length,
          jobs.filter((job) => job.jobStatus === "in-progress").length,
          jobs.filter((job) => job.jobStatus === "scheduled").length,
          jobs.filter((job) => job.jobStatus === "completed").length,
          jobs.filter((job) => job.jobStatus === "cancelled").length,
        ],
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(139, 92, 246, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(239, 68, 68, 0.8)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const providerJobsByCategoryMap = jobs.reduce<Record<string, number>>(
    (acc, job) => {
      const category = job.jobCategory || "Uncategorized";
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    },
    {},
  );

  const providerCategoryLabels = Object.keys(providerJobsByCategoryMap);
  const providerJobsByCategoryChartData = {
    labels: providerCategoryLabels.length > 0 ? providerCategoryLabels : ["No Data"],
    datasets: [
      {
        label: "Jobs",
        data:
          providerCategoryLabels.length > 0
            ? providerCategoryLabels.map(
                (label) => providerJobsByCategoryMap[label],
              )
            : [0],
        backgroundColor: "rgba(34, 197, 94, 0.7)",
        borderColor: "rgba(34, 197, 94, 1)",
        borderWidth: 1,
      },
    ],
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await JobApi.fetchProviderJobsApi(
          user.providerCategory,
        );
        const fetchedJobs = response.data.jobs || [];
        setJobs(fetchedJobs);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError("Failed to load jobs. Please try again.");
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return (
    <div className="flex min-h-screen bg-(--primary)">
      <Sidebar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            {user.verificationStatus !== "verified" && (
              <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm font-semibold text-red-800">
                  Your profile has not been verified yet.
                </p>
                {user.verificationStatus === "rejected" &&
                  user.rejectionReason && (
                    <p className="mt-1 text-sm text-red-700">
                      Rejection reason: {user.rejectionReason}
                    </p>
                  )}
                {user.verificationStatus === "rejected" && (
                  <Link
                    to="/serviceprovider/complete-profile"
                    className="mt-3 inline-flex items-center rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100"
                  >
                    Reupload verification proof
                  </Link>
                )}
              </div>
            )}
            <h1 className="text-3xl sm:text-4xl font-bold text-(--text)">
              Hello, {user.fullName.split(" ")[0]}
            </h1>
            <p className="text-lg text-(--muted) mt-2">
              Manage your jobs, messages, and offers all in one place.
            </p>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-red-900">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-(--primary) rounded-xl border border-(--border) p-6 animate-pulse"
                  >
                    <div className="w-12 h-12 bg-(--secondary) rounded-lg mb-4"></div>
                    <div className="h-5 bg-(--secondary) rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-(--secondary) rounded w-full"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.to}
                      to={action.to}
                      className={`bg-(--primary) rounded-xl border border-(--border) p-6 text-center transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${action.hoverColor} group`}
                    >
                      <div
                        className={`w-14 h-14 ${action.bgColor} rounded-xl flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-110`}
                      >
                        <Icon className={`w-7 h-7 ${action.color}`} />
                      </div>
                      <h3 className="text-lg font-semibold text-(--text) mb-1">
                        {action.title}
                      </h3>
                      <p className="text-sm text-(--muted)">
                        {action.description}
                      </p>
                    </Link>
                  );
                })}
              </div>

              {/* Stats Section */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-(--text) mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Your Statistics
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {statsCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div
                        key={stat.title}
                        className="bg-(--primary) p-6 rounded-xl border border-(--border) hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center shrink-0`}
                          >
                            <Icon className={`w-6 h-6 ${stat.color}`} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-(--muted) mb-1">
                              {stat.title}
                            </p>
                            <p className={`text-3xl font-bold ${stat.color}`}>
                              {stat.value}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-(--primary) rounded-xl border border-(--border) p-5">
                  <h3 className="text-lg font-semibold text-(--text) mb-4">
                    Job Status Distribution
                  </h3>
                  <div className="max-w-sm mx-auto">
                    <Doughnut data={providerJobStatusChartData} />
                  </div>
                </div>

                <div className="bg-(--primary) rounded-xl border border-(--border) p-5">
                  <h3 className="text-lg font-semibold text-(--text) mb-4">
                    Jobs by Category
                  </h3>
                  <Bar
                    data={providerJobsByCategoryChartData}
                    options={{
                      responsive: true,
                      plugins: { legend: { display: false } },
                    }}
                  />
                </div>
              </div>

              {/* Recent Activity Section */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-(--text) mb-4">
                  Recent Jobs
                </h2>
                {jobs.length > 0 ? (
                  <div className="bg-(--primary) rounded-xl border border-(--border) overflow-hidden">
                    <div className="divide-y divide-gray-200">
                      {jobs.slice(0, 5).map((job) => (
                        <Link
                          key={job._id}
                          to={`/serviceprovider/job/${job._id}`}
                          className="block p-4 hover:bg-(--secondary) transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-(--text)">
                                {job.title || "Untitled Job"}
                              </h3>
                              <p className="text-sm text-(--muted) mt-1">
                                {job.description?.substring(0, 100)}
                                {job.description?.length > 100 ? "..." : ""}
                              </p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                job.jobStatus === "pending"
                                  ? "bg-blue-100 text-blue-700"
                                  : job.jobStatus === "completed"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {job.jobStatus || "Unknown"}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-(--primary) rounded-xl border border-(--border) p-8 text-center">
                    <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-(--muted)">
                      No jobs available right now in your category.
                    </p>
                    <Link
                      to="/serviceprovider/jobs"
                      className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                    >
                      View Available Jobs
                    </Link>
                  </div>
                )}
              </div>              
            </>
          )}
        </div>
      </main>
    </div>
  );
}
