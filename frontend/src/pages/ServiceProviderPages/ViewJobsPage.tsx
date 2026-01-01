import { useEffect, useState } from "react";
import { Loader2, MapPin, Calendar, Eye } from "lucide-react";
import Sidebar from "../../components/Sidebar/Sidebar";
import { JobApi, type JobData } from "../../api/Apis";
import { useAuthStore } from "../../store/authStore";
import { Link } from "react-router-dom";

export default function ViewJobsPage() {
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await JobApi.fetchProviderJobsApi(
          user.providerCategory
        );
        setJobs(response.data.jobs || []);
      } catch (err) {
        console.error(err);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [user]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 bg-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-gray-900 text-center">
              Available Jobs
            </h1>
            <p className="text-gray-600 text-center mt-2">
              Browse jobs that match your service category.
            </p>
          </div>

          {/* Loader */}
          {loading && (
            <div className="flex items-center justify-center mt-40">
              <Loader2 className="animate-spin" size={45} />
            </div>
          )}

          {/* Jobs List */}
          {!loading && jobs.length > 0 && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <div
                  key={job._id}
                  className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Image */}
                    <div className="w-full md:w-1/3 lg:w-1/4 shrink-0">
                      <img
                        src={
                          job.images?.length
                            ? job.images[0]
                            : "/placeholder.jpg"
                        }
                        alt={job.title}
                        className="w-full h-48 md:h-36 lg:h-40 object-cover rounded-xl"
                        loading="lazy"
                      />

                      {/* Thumbnails */}
                      {job.images?.length > 1 && (
                        <div className="flex gap-2 mt-2 overflow-x-auto">
                          {job.images.slice(1, 4).map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt="thumbnail"
                              className="w-14 h-14 object-cover rounded-lg border"
                              loading="lazy"
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      {/* Title */}
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-xl font-semibold text-gray-900">
                          {job.title}
                        </h2>
                      </div>

                      <p className="text-gray-600 mb-3 line-clamp-3">
                        {job.description}
                      </p>

                      {/* Description */}

                      <div className="flex flex-wrap items-center justify-between mb-3">
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

                        <span className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          {job.createdAt?.split("T")[0]}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-centertext-gray-600 mb-2">
                        <span className="font-semibold text-gray-800 text-lg">
                          Rs {job.userPrice}
                        </span>
                      </div>

                      <span className="text-sm text-gray-500 flex items-center gap-1 mb-3">
                        <MapPin className="w-4 h-4" />
                        {job.location || "—"}
                      </span>

                      {/* Action */}
                      <Link
                        to={`/serviceprovider/job/${job._id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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

          {/* Empty State */}
          {!loading && jobs.length === 0 && (
            <div className="text-center mt-20">
              <p className="text-gray-600 text-lg">
                No jobs available for your category.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
