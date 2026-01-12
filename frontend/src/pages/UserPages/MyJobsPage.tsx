import { Link } from "react-router-dom";
import {
  Eye,
  Loader2,
  MapPin,
  Calendar,
  Briefcase,
  AlertCircle,
  RefreshCw,
  Filter,
  Search,
} from "lucide-react";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useEffect, useState } from "react";
import { JobApi } from "../../api/Apis";
import type { JobData } from "../../api/Apis";

type JobStatusFilter = "all" | "open" | "closed" | "pending" | "completed";

export default function MyJobs() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobData[]>([]);
  const [statusFilter, setStatusFilter] = useState<JobStatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await JobApi.fetchUserJobsApi();
      const fetchedJobs = response.data.jobs || [];
      setJobs(fetchedJobs);
      setFilteredJobs(fetchedJobs);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Failed to load your jobs. Please try again.");
      setJobs([]);
      setFilteredJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Filter jobs based on status and search query
  useEffect(() => {
    let filtered = jobs;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((job) => job.jobStatus === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.title?.toLowerCase().includes(query) ||
          job.description?.toLowerCase().includes(query) ||
          job.location?.toLowerCase().includes(query)
      );
    }

    setFilteredJobs(filtered);
  }, [statusFilter, searchQuery, jobs]);

  const getStatusBadgeStyles = (status?: string) => {
    switch (status) {
      case "open":
      case "pending":
        return "bg-green-100 text-green-700 border border-green-200";
      case "closed":
        return "bg-red-100 text-red-700 border border-red-200";
      case "completed":
        return "bg-blue-100 text-blue-700 border border-blue-200";
      default:
        return "bg-(--secondary) text-(--text) border border-(--border)";
    }
  };

  return (
    <div className="flex min-h-screen bg-(--secondary)">
      <Sidebar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 bg-(--primary)">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-(--text)">
                  My Jobs
                </h1>
                <p className="text-(--muted) mt-2">
                  View and manage all your posted jobs.
                </p>
              </div>

              <Link
                to="/user/create-job"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-(--accent) text-white rounded-lg hover:bg-(--accent-hover) transition font-medium shadow-sm"
              >
                <Briefcase className="w-4 h-4" />
                Create New Job
              </Link>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="bg-(--primary) border border-(--border) rounded-xl p-4">
                <p className="text-sm text-(--muted) mb-1">Total Jobs</p>
                <p className="text-2xl font-bold text-(--text)">
                  {jobs.length}
                </p>
              </div>
              <div className="bg-(--primary) border border-(--border) rounded-xl p-4">
                <p className="text-sm text-(--muted) mb-1">Open</p>
                <p className="text-2xl font-bold text-green-600">
                  {
                    jobs.filter(
                      (j) => j.jobStatus === "open" || j.jobStatus === "pending"
                    ).length
                  }
                </p>
              </div>
              <div className="bg-(--primary) border border-(--border) rounded-xl p-4">
                <p className="text-sm text-(--muted) mb-1">Closed</p>
                <p className="text-2xl font-bold text-red-600">
                  {jobs.filter((j) => j.jobStatus === "closed").length}
                </p>
              </div>
              <div className="bg-(--primary) border border-(--border) rounded-xl p-4">
                <p className="text-sm text-(--muted) mb-1">Completed</p>
                <p className="text-2xl font-bold text-blue-600">
                  {jobs.filter((j) => j.jobStatus === "completed").length}
                </p>
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-900">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <button
                onClick={fetchJobs}
                className="text-red-600 hover:text-red-800 transition"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Filters and Search */}
          {!loading && jobs.length > 0 && (
            <div className="mb-6 bg-(--primary) border border-(--border) rounded-xl p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--muted)" />
                    <input
                      type="text"
                      placeholder="Search jobs by title, description, or location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-(--border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--accent) focus:border-transparent bg-(--primary) text-(--text)"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div className="sm:w-48">
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--muted)" />
                    <select
                      value={statusFilter}
                      onChange={(e) =>
                        setStatusFilter(e.target.value as JobStatusFilter)
                      }
                      className="w-full pl-10 pr-4 py-2 border border-(--border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--accent) focus:border-transparent bg-(--primary) text-(--text) appearance-none cursor-pointer"
                    >
                      <option value="all">All Jobs</option>
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Results Count */}
              <div className="mt-3 text-sm text-(--muted)">
                Showing {filteredJobs.length} of {jobs.length} jobs
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2
                className="animate-spin text-(--accent) mb-4"
                size={48}
              />
              <p className="text-(--muted)">Loading your jobs...</p>
            </div>
          )}

          {/* Jobs List */}
          {!loading && filteredJobs.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredJobs.map((job) => (
                <div
                  key={job._id}
                  className="bg-(--primary) border border-(--border) rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Job Image */}
                    <div className="sm:w-40 sm:shrink-0">
                      <img
                        src={
                          job.images && job.images.length > 0
                            ? job.images[0]
                            : "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400"
                        }
                        alt={job.title || "job image"}
                        className="w-full h-48 sm:h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400";
                        }}
                      />
                    </div>

                    {/* Job Content */}
                    <div className="flex-1 p-5">
                      {/* Title and Status */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h2 className="text-lg font-semibold text-(--text) line-clamp-2">
                          {job.title || "Untitled Job"}
                        </h2>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium capitalize whitespace-nowrap ${getStatusBadgeStyles(
                            job.jobStatus
                          )}`}
                        >
                          {job.jobStatus}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-(--muted) text-sm mb-4 line-clamp-2">
                        {job.description || "No description provided."}
                      </p>

                      {/* Meta Info */}
                      <div className="space-y-2 mb-4">
                        {job.location && (
                          <div className="flex items-center gap-2 text-sm text-(--muted)">
                            <MapPin className="w-4 h-4 shrink-0" />
                            <span className="truncate">{job.location}</span>
                          </div>
                        )}
                        {job.createdAt && (
                          <div className="flex items-center gap-2 text-sm text-(--muted)">
                            <Calendar className="w-4 h-4 shrink-0" />
                            <span>
                              Posted:{" "}
                              {new Date(job.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <Link
                        to={`/user/job/${job._id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm text-(--accent) bg-(--secondary) border border-(--border) rounded-lg hover:bg-(--accent) hover:text-white transition font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State - No Jobs */}
          {!loading && jobs.length === 0 && !error && (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-(--secondary) border border-(--border) rounded-full mb-4">
                <Briefcase className="w-8 h-8 text-(--muted)" />
              </div>
              <h3 className="text-xl font-semibold text-(--text) mb-2">
                No Jobs Yet
              </h3>
              <p className="text-(--muted) mb-6 max-w-md mx-auto">
                You haven't posted any jobs yet. Create your first job posting
                to get started and connect with service providers.
              </p>
              <Link
                to="/user/create-job"
                className="inline-flex items-center gap-2 px-6 py-3 bg-(--accent) text-white rounded-lg hover:bg-(--accent-hover) transition font-medium shadow-sm"
              >
                <Briefcase className="w-4 h-4" />
                Post Your First Job
              </Link>
            </div>
          )}

          {/* Empty State - No Results */}
          {!loading &&
            jobs.length > 0 &&
            filteredJobs.length === 0 &&
            !error && (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-(--secondary) border border-(--border) rounded-full mb-4">
                  <Search className="w-8 h-8 text-(--muted)" />
                </div>
                <h3 className="text-xl font-semibold text-(--text) mb-2">
                  No Jobs Found
                </h3>
                <p className="text-(--muted) mb-6">
                  No jobs match your current filters. Try adjusting your search
                  or filters.
                </p>
                <button
                  onClick={() => {
                    setStatusFilter("all");
                    setSearchQuery("");
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-(--secondary) border border-(--border) text-(--text) rounded-lg hover:bg-(--accent) hover:text-white transition font-medium"
                >
                  <RefreshCw className="w-4 h-4" />
                  Clear Filters
                </button>
              </div>
            )}
        </div>
      </main>
    </div>
  );
}
