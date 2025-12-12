import { Link } from "react-router-dom";
import { Briefcase, Edit, Trash2, Eye } from "lucide-react";
import Sidebar from "../../components/Navbar/Sidebar";

export default function MyJobs() {
  // Temporary sample data — replace with API data later
  const jobs = [
    {
      id: 1,
      title: "Fix Kitchen Sink",
      description: "Leaking pipe under the sink.",
      status: "Active",
      offers: 4,
      createdAt: "2025-01-10",
    },
    {
      id: 2,
      title: "Paint Living Room",
      description: "Need a painter for a 20m² living room.",
      status: "Pending",
      offers: 2,
      createdAt: "2025-01-05",
    },
    {
      id: 3,
      title: "Garden Cleanup",
      description: "Remove weeds, mow the lawn, trim bushes.",
      status: "Completed",
      offers: 6,
      createdAt: "2024-12-20",
    },
    {
      id: 4,
      title: "Garden Cleanup",
      description: "Remove weeds, mow the lawn, trim bushes.",
      status: "Cancelled",
      offers: 6,
      createdAt: "2024-12-20",
    },
  ];

  const statusClasses: any = {
    Active: "bg-green-100 text-black",
    Pending: "bg-yellow-100 text-black",
    Completed: "bg-blue-100 text-black",
    Cancelled: "bg-red-100 text-black",
  };

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

          {/* Jobs List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white border border-gray-300 rounded-2xl p-6 shadow-sm"
              >
                {/* Title */}
                <div className="flex items-center gap-3 mb-4">
                  <Briefcase className="w-8 h-8 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    {job.title}
                  </h2>
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-4">{job.description}</p>

                {/* Info Row */}
                <div className="flex flex-wrap items-center justify-between mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      statusClasses[job.status]
                    }`}
                  >
                    {job.status}
                  </span>

                  <span className="text-sm text-gray-500">
                    Offers: <strong>{job.offers}</strong>
                  </span>

                  <span className="text-sm text-gray-500">
                    Posted: {job.createdAt}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 mt-4">
                  <Link
                    to={`/my-jobs/${job.id}`}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </Link>

                  <Link
                    to={`/my-jobs/edit/${job.id}`}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Link>

                  <button className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* If No Jobs Exist */}
          {jobs.length === 0 && (
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
