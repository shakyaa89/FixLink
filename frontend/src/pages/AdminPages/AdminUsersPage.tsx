import { useEffect, useMemo, useState } from "react";
import { Users, UserCheck, UserX, ShieldCheck } from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar/AdminSidebar";
import { AdminApi, type AdminUserData } from "../../api/Apis";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await AdminApi.fetchUsers();
        const fetchedUsers = (response.data.users || []);
        setUsers(fetchedUsers);
      } catch (err) {
        console.error("Failed to load users", err);
        setError("Unable to load users. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const stats = useMemo(() => {
    const total = users.length;
    const providers = users.filter((user) => user.role === "serviceProvider").length;
    const admins = users.filter((user) => user.role === "admin").length;
    const suspended = users.filter((user) => user.verificationStatus === "rejected").length;

    return [
      { title: "Total Users", value: total, icon: Users },
      { title: "Providers", value: providers, icon: UserCheck },
      { title: "Admins", value: admins, icon: ShieldCheck },
      { title: "Suspended", value: suspended, icon: UserX },
    ];
  }, [users]);

  return (
    <div className="flex min-h-screen bg-(--primary)">
      <AdminSidebar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <p className="text-(--muted) text-sm">Admin Console</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-(--text)">
              User Management
            </h1>
            <p className="text-(--muted) mt-2">
              Review onboarding, manage status, and monitor account activity.
            </p>
          </div>

          {error && (
            <div className="bg-(--danger-bg) text-(--danger) border border-(--border) rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.title}
                  className="bg-(--primary) border border-(--border) rounded-2xl p-5 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-(--secondary) flex items-center justify-center">
                      <Icon className="w-6 h-6 text-(--accent)" />
                    </div>
                    <div>
                      <p className="text-sm text-(--muted)">{stat.title}</p>
                      <p className="text-2xl font-bold text-(--text)">
                        {loading ? "-" : stat.value}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-(--primary) border border-(--border) rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-(--border) bg-(--secondary)">
              <h2 className="text-lg font-semibold text-(--text)">All Users</h2>
              <button className="px-4 py-2 text-sm font-medium rounded-lg bg-(--accent) text-(--primary) hover:bg-(--accent-hover) transition">
                Invite Admin
              </button>
            </div>

            <div className="divide-y divide-[var(--border)]">
              {!loading && users.length === 0 && (
                <div className="px-6 py-6 text-sm text-(--muted)">
                  No users found.
                </div>
              )}
              {users.map((user) => (
                <div
                  key={user._id}
                  className="grid grid-cols-1 md:grid-cols-4 gap-4 px-6 py-4 items-center"
                >
                  <div>
                    <p className="text-(--text) font-semibold">
                      {user.fullName}
                    </p>
                    <p className="text-xs text-(--muted)">{user.email}</p>
                  </div>
                  <div>
                    <span
                      className="text-xs font-semibold px-3 py-1 rounded-full bg-(--secondary) text-(--muted) border border-(--border)"
                    >
                      {user.role === "serviceProvider" ? "Service Provider" : user.role === "user" ? "User" : "Admin"}
                    </span>
                  </div>
                  <div>
                    <span
                      className="text-xs font-semibold px-3 py-1 rounded-full bg-(--secondary) text-(--muted) border border-(--border) capitalize"
                    >
                      {user.verificationStatus ? user.verificationStatus : "-"}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-(--text)">{new Date(user.createdAt!).toLocaleDateString()}</p>
                    <p className="text-xs text-(--muted)">{user._id}</p>
                  </div>
                  
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
