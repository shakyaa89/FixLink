import { useEffect, useState } from "react";
import { Loader2, MapPin, Calendar, Tag } from "lucide-react";
import Sidebar from "../../components/Sidebar/Sidebar";
import { JobApi, type JobData } from "../../api/Apis";
import { useAuthStore } from "../../store/authStore";
import { Link } from "react-router-dom";

// const jobs = [
//   {
//     id: "J-001",
//     title: "Fix leaky faucet",
//     budget: "$50 - $80",
//     location: "Colombo",
//     date: "2025-12-10",
//     status: "Open",
//   },
//   {
//     id: "J-002",
//     title: "Install ceiling fan",
//     budget: "$30 - $60",
//     location: "Kandy",
//     date: "2025-12-11",
//     status: "In Progress",
//   },
//   {
//     id: "J-003",
//     title: "Repair smartphone screen",
//     budget: "$20 - $45",
//     location: "Galle",
//     date: "2025-12-12",
//     status: "Closed",
//   },
// ];

export default function ViewJobsPage() {
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuthStore();

  const fetchJobs = async () => {
    try {
      const response = await JobApi.fetchProviderJobsApi(user.providerCategory);

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

      <main className="flex-1 bg-white py-10 px-6">
        <div className="max-w-6xl mx-auto">
          <header className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">View Jobs</h1>
            <p className="text-gray-600 mt-1">Browse jobs posted by users</p>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              <div className="col-span-1 md:col-span-2 flex items-center justify-center py-16">
                <Loader2 className="animate-spin" size={40} />
              </div>
            ) : (
              jobs.map((job) => (
                <article
                  key={job._id}
                  className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {job.title}
                      </h3>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                        job.jobStatus === "Open"
                          ? "bg-green-100 text-green-800"
                          : job.jobStatus === "In Progress"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {job.jobStatus}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-md">
                    <div className="flex items-center gap-3 text-gray-700">
                      <Tag className="w-4 h-4" />
                      <div>
                        Rs.{" "}
                        <span className="font-bold text-xl">
                          {job.userPrice}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <div> {job?.createdAt?.split("T")[0]}</div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-md">
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin className="w-4 h-4" />
                      <div>
                        {" "}
                        <span className="font-bold">{job.location}</span>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium capitalize bg-green-100 text-green-800`}
                    >
                      {job.jobCategory}
                    </span>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <Link
                      to={`/serviceprovider/job/${job._id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
                    >
                      <Tag className="w-4 h-4" />
                      View
                    </Link>
                  </div>
                </article>
              ))
            )}
          </section>

          <footer className="mt-8 text-center text-gray-500">
            Showing {jobs.length} jobs
          </footer>
        </div>
      </main>
    </div>
  );
}
