import {
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  TrendingDown,
} from "lucide-react";
import Sidebar from "../../components/Navbar/Sidebar";

export default function DisputesPage() {
  const disputes = [
    {
      id: "DSP-1023",
      title: "Overcharged for plumbing repair",
      description:
        "Customer claims the final bill was 40% higher than the quoted estimate without prior notification.",
      status: "Open",
      date: "10 Aug 2025",

      lastUpdate: "2 hours ago",
    },
    {
      id: "DSP-1015",
      title: "Service not completed on time",
      description:
        "Electrical work was scheduled for completion by Aug 5 but remained incomplete until Aug 9.",
      status: "In Progress",
      date: "08 Aug 2025",

      lastUpdate: "1 day ago",
    },
    {
      id: "DSP-0987",
      title: "Incomplete painting work",
      description:
        "Two rooms were left unpainted despite being included in the original contract agreement.",
      status: "Resolved",
      date: "22 Jul 2025",

      lastUpdate: "15 days ago",
    },
    {
      id: "DSP-0956",
      title: "Damaged property during installation",
      description:
        "Flooring was scratched during furniture installation. Customer is requesting compensation.",
      status: "Resolved",
      date: "10 Jul 2025",

      lastUpdate: "28 days ago",
    },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 px-6 md:px-12 py-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
              Disputes
            </h1>
            <p className="text-gray-600 text-lg">Track and resolve disputes</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gray-100 rounded-xl">
                  <FileText className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">
                    {disputes.length}
                  </div>
                  <div className="text-sm text-gray-500">Total Disputes</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">0</div>
                  <div className="text-sm text-gray-500">Open</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">0</div>
                  <div className="text-sm text-gray-500">In Progress</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-green-100 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">0</div>
                  <div className="text-sm text-gray-500">Resolved</div>
                </div>
              </div>
            </div>
          </div>

          {/* Disputes List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">All Disputes</h2>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                + New Dispute
              </button>
            </div>

            <div className="space-y-4">
              {disputes.map((dispute) => {
                return (
                  <div
                    key={dispute.id}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col justify-center items-baseline">
                            <div className="flex flex-wrap items-center gap-3">
                              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                {dispute.title}
                              </h3>
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed">
                              {dispute.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 min-w-fit">
                        <span className="text-sm text-gray-500">
                          {dispute.date}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Empty State (hidden when there are disputes) */}
          {disputes.length === 0 && (
            <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-200 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingDown className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No disputes found
              </h3>
              <p className="text-gray-600">
                You're all caught up! No active disputes at the moment.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
