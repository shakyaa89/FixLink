import {
  Briefcase,
  MessageSquare,
  FileText,
  PlusCircle,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar/Sidebar";

export default function ServiceProviderDashboard() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 bg-(--primary) py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold text-(--text)">Welcome Back</h1>
            <p className="text-lg text-(--muted) mt-2">
              Manage your jobs, messages, and offers all in one place.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Link
              to="/user/create-job"
              className="bg-(--primary) rounded-2xl border border-(--border) transition p-6 text-center group hover:scale-105"
            >
              <PlusCircle className="w-10 h-10 text-(--accent) mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-(--text)">
                Create Job
              </h3>
              <p className="text-(--muted) text-sm mt-1">
                Post a new service request
              </p>
            </Link>

            <Link
              to="/my-jobs"
              className="bg-(--primary) rounded-2xl border border-(--border) transition p-6 text-center group hover:scale-105"
            >
              <Briefcase className="w-10 h-10 text-purple-600 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-(--text)">My Jobs</h3>
              <p className="text-(--muted) text-sm mt-1">
                View and manage your job posts
              </p>
            </Link>

            <Link
              to="/messages"
              className="bg-(--primary) rounded-2xl border border-(--border) transition p-6 text-center group hover:scale-105"
            >
              <MessageSquare className="w-10 h-10 text-green-600 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-(--text)">Messages</h3>
              <p className="text-(--muted) text-sm mt-1">
                Chat with service providers
              </p>
            </Link>

            <Link
              to="/offers"
              className="bg-(--primary) rounded-2xl border border-(--border) transition p-6 text-center group hover:scale-105"
            >
              <FileText className="w-10 h-10 text-orange-500 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-(--text)">Offers</h3>
              <p className="text-(--muted) text-sm mt-1">
                Compare offers from providers
              </p>
            </Link>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-(--primary) p-6 rounded-2xl border border-(--border) transition flex items-center gap-4">
              <Briefcase className="w-8 h-8 text-(--accent)" />
              <div>
                <h4 className="text-lg font-semibold text-(--text) mb-2">
                  Active Jobs
                </h4>
                <p className="text-4xl font-bold text-(--accent)">3</p>
              </div>
            </div>

            <div className="bg-(--primary) p-6 rounded-2xl border border-(--border) transition flex items-center gap-4">
              <FileText className="w-8 h-8 text-purple-600" />
              <div>
                <h4 className="text-lg font-semibold text-(--text) mb-2">
                  Offers Received
                </h4>
                <p className="text-4xl font-bold text-purple-600">12</p>
              </div>
            </div>

            <div className="bg-(--primary) p-6 rounded-2xl border border-(--border) transition flex items-center gap-4">
              <Star className="w-8 h-8 text-green-600" />
              <div>
                <h4 className="text-lg font-semibold text-(--text) mb-2">
                  Total Reviews
                </h4>
                <p className="text-4xl font-bold text-green-600">5</p>
              </div>
            </div>
          </div>

          {/* Reviews CTA */}
          <div className="mt-12 bg-(--primary) rounded-2xl p-8 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h2 className="text-2xl font-bold text-(--text)">
                  Share Your Experience
                </h2>
                <p className="text-(--muted) mt-2">
                  Help others by rating service providers you've worked with.
                </p>
              </div>

              <Link
                to="/my-reviews"
                className="px-8 py-3 bg-(--secondary) text-(--text) rounded-lg font-medium hover:bg-(--secondary) transition shadow-md"
              >
                Leave a Review
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
