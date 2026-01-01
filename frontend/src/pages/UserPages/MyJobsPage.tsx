import { Link } from "react-router-dom";
import { Eye, Loader2, MapPin, Calendar } from "lucide-react";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useEffect, useState } from "react";
import { JobApi } from "../../api/Apis";
import type { JobData } from "../../api/Apis";

export default function MyJobs() {
  const [loading, setLoading] = useState(true);

  const [jobs, setJobs] = useState<JobData[]>([]);

  const fetchJobs = async () => {
    try {
      const response = await JobApi.fetchUserJobsApi();

      setJobs(response.data.jobs);
    } catch (error) {
      console.log(error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 bg-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-gray-900 text-center">
              My Jobs
            </h1>
            <p className="text-gray-600 text-center mt-2">
              View and manage all your posted jobs.
            </p>
          </div>

          {loading && (
            <div className="flex items-center justify-center mt-40">
              <Loader2 className="animate-spin" size={45} />
            </div>
          )}

          {/* Jobs List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {!loading &&
              jobs.map((job) => (
                <div
                  key={job._id}
                  className="bg-white border border-gray-300 rounded-2xl p-6 shadow-sm"
                >
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="w-full md:w-1/3 lg:w-1/4 shrink-0">
                      <img
                        src={
                          job.images && job.images.length > 0
                            ? job.images[0]
                            : "/"
                        }
                        alt={job.title || "job image"}
                        className="w-full h-48 aspect-square md:h-36 lg:h-40 object-cover rounded-xl"
                        loading="lazy"
                      />
                    </div>

                    <div className="flex-1">
                      {/* Title */}
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-xl font-semibold text-gray-900">
                          {job.title}
                        </h2>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {job.description}
                      </p>

                      {/* Info Row */}
                      <div className="flex flex-wrap items-center justify-between mb-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                            job.jobStatus === "open"
                              ? "bg-green-100 text-green-700"
                              : job.jobStatus === "closed"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {job.jobStatus}
                        </span>

                        <span className="text-sm text-gray-500 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Posted: {job.createdAt?.split("T")[0]}
                        </span>
                      </div>

                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location || "—"}
                      </span>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-3 mt-4">
                        <Link
                          to={`/user/job/${job._id}`}
                          className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* If No Jobs Exist */}
          {jobs.length === 0 && !loading && (
            <div className="text-center mt-20">
              <p className="text-gray-600 text-lg">
                You haven’t posted any jobs yet.
              </p>
              <Link
                to="/user/create-job"
                className="mt-4 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Post Your First Job
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
