import { Mail, Phone, MapPin, Calendar, Edit2, Briefcase } from "lucide-react";
import { useState } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useAuthStore } from "../../store/authStore";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("overview");

  const profileData = {
    name: "Shakyaa",
    role: "user",
    email: "shakyaa@shakyaa.com",
    phone: "9849977706",
    location: "Nepal, Kathmandu",
    memberSince: "January 2025",
    totalSpent: "5,000",
  };

  const { user } = useAuthStore();

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 px-6 md:px-12 py-10 bg-(--primary)">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-(--text) mb-3">
              My Profile
            </h1>
            <p className="text-(--muted) text-lg">
              Manage your account information and preferences
            </p>
          </div>

          {/* Profile Header Card */}
          <div className="bg-(--primary) rounded-2xl shadow-sm border border-(--border) mb-8">
            <div className="px-6 md:px-8 py-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                {/* Left */}
                <div className="flex items-center gap-6">
                  <div className="w-28 h-28">
                    <img
                      src={user.profilePicture}
                      alt="Profile Picture"
                      className="rounded-2xl aspect-square object-cover"
                    />
                  </div>

                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-(--text) mb-1">
                      {user.fullName}
                    </h2>
                    <p className="text-(--muted) flex items-center gap-2 capitalize">
                      <Briefcase className="w-4 h-4" />
                      {user.role}
                    </p>
                  </div>
                </div>

                {/* Action */}
                <button className="px-6 py-3 bg-(--accent) text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2">
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-(--primary) rounded-2xl p-6 shadow-sm border border-(--border)">
              <div className="text-sm text-(--muted) mb-1">Completed Jobs</div>
              <div className="text-3xl font-bold text-(--text)">0</div>
            </div>
            <div className="bg-(--primary) rounded-2xl p-6 shadow-sm border border-(--border)">
              <div className="text-sm text-(--muted) mb-1">Active Jobs</div>
              <div className="text-3xl font-bold text-(--accent)">0</div>
            </div>
            <div className="bg-(--primary) rounded-2xl p-6 shadow-sm border border-(--border)">
              <div className="text-sm text-(--muted) mb-1">Total Spent</div>
              <div className="text-3xl font-bold text-(--text)">
                Rs. {profileData.totalSpent}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-(--primary) rounded-t-2xl border border-(--border) border-b-0">
            <div className="flex gap-1 p-2">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === "overview"
                    ? "bg-(--accent)/10 text-(--accent-hover)"
                    : "text-(--muted) hover:bg-(--secondary)"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("contact")}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === "contact"
                    ? "bg-(--accent)/10 text-(--accent-hover)"
                    : "text-(--muted) hover:bg-(--secondary)"
                }`}
              >
                Contact Info
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-(--primary) rounded-b-2xl shadow-sm border border-(--border) p-8">
            {activeTab === "overview" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-(--text) mb-4">
                    Account Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-(--secondary) rounded-xl p-6">
                      <p className="text-sm text-(--muted) mb-2">
                        Member Since
                      </p>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-(--muted)" />
                        <p className="text-lg font-medium text-(--text)">
                          {user.createdAt.split("T")[0]}
                        </p>
                      </div>
                    </div>
                    <div className="bg-(--secondary) rounded-xl p-6">
                      <p className="text-sm text-(--muted) mb-2">Location</p>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-(--muted)" />
                        <p className="text-lg font-medium text-(--text)">
                          {user.address}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "contact" && (
              <div className="space-y-8">
                <h3 className="text-lg font-semibold text-(--text) mb-6">
                  Contact Information
                </h3>

                <div className="bg-(--secondary) rounded-xl p-6">
                  <p className="text-sm text-(--muted) mb-2">Email</p>
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-(--muted)" />
                    <p className="text-lg font-medium text-(--text)">
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="bg-(--secondary) rounded-xl p-6">
                  <p className="text-sm text-(--muted) mb-2">Phone Number</p>
                  <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-(--muted)" />
                    <p className="text-lg font-medium text-(--text)">
                      {user.phoneNumber}
                    </p>
                  </div>
                </div>

                <div className="bg-(--secondary) rounded-xl p-6">
                  <p className="text-sm text-(--muted) mb-2">Location</p>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-(--muted)" />
                    <p className="text-lg font-medium text-(--text)">
                      {user.address}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
