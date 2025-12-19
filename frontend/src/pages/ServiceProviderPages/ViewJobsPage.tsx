import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import { JobApi, type JobData } from "../../api/Apis";
import { useAuthStore } from "../../store/authStore";

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

  const { user } = useAuthStore();

  const fetchJobs = async () => {
    try {
      const response = await JobApi.fetchAllJobsApi();

      setJobs(response.data.jobs);
    } catch (error) {
      console.log(error);
      setJobs([]);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  console.log(jobs);
  console.log("job: ", user.providerCategory);

  const filteredJobs = jobs.filter(
    (job) =>
      job.jobCategory === user.providerCategory && job.jobStatus === "open"
  );

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
            {filteredJobs.map((job) => (
              <article className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
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
                  <div>
                    Rs.{" "}
                    <span className="font-bold text-xl">{job.userPrice}</span>
                  </div>
                  <div>Created Date: {job?.createdAt?.split("T")[0]}</div>
                </div>

                <div className="mt-4 flex items-center justify-between text-md">
                  <div>
                    Job Location:{" "}
                    <span className="font-bold">{job.location}</span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium capitalize bg-green-100 text-green-800`}
                  >
                    {job.jobCategory}
                  </span>
                </div>

                <div className="mt-4 flex gap-3">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                    View
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg">
                    Send Offer
                  </button>
                </div>
              </article>
            ))}
          </section>

          <footer className="mt-8 text-center text-gray-500">
            Showing {filteredJobs.length} jobs
          </footer>
        </div>
      </main>
    </div>
  );
}
