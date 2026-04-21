import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, UserCheck, UserX, ShieldCheck, Loader2 } from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar/AdminSidebar";
import { AdminApi, type AdminUserData } from "../../api/Apis";

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; fullName: string } | null>(null);

  const stats = useMemo(() => {
    // Dashboard counters from the same users list shown below.
    const total = users.length;
    const providers = users.filter(
      (user) => user.role === "serviceProvider",
    ).length;
    const admins = users.filter((user) => user.role === "admin").length;
    const rejected = users.filter(
      (user) => user.verificationStatus === "rejected",
    ).length;

    return [
      { title: "Total Users", value: total, icon: Users },
      { title: "Providers", value: providers, icon: UserCheck },
      { title: "Admins", value: admins, icon: ShieldCheck },
      { title: "Rejected", value: rejected, icon: UserX },
    ];
  }, [users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await AdminApi.fetchUsers();
      const fetchedUsers = response.data.users || [];
      setUsers(fetchedUsers);
    } catch (err) {
      console.error("Failed to load users", err);
      setError("Unable to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleUpdate = async (
    userId: string,
    role: "user" | "serviceProvider" | "admin",
  ) => {
    try {
      setUpdatingId(userId);
      setError(null);
      await AdminApi.updateUser(userId, { role });
      // Re-fetch so role badge and stats stay in sync.
      await fetchUsers();
    } catch (err) {
      console.error("Failed to update user role", err);
      setError("Unable to update user role.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteUser = async (userId: string, fullName: string) => {
    setDeleteTarget({ id: userId, fullName });
  };

  const confirmDeleteUser = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      setDeletingId(deleteTarget.id);
      setError(null);
      await AdminApi.deleteUser(deleteTarget.id);
      // Refresh list after deletion to remove stale row.
      await fetchUsers();
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete user", err);
      setError("Unable to delete user.");
    } finally {
      setDeletingId(null);
    }
  };

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

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-(--accent) animate-spin" />
            </div>
          ) : (
            <>
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
                            {stat.value}
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
                </div>

                <div className="divide-y divide-(--border)">
                  {users.length === 0 && (
                    <div className="px-6 py-6 text-sm text-(--muted)">
                      No users found.
                    </div>
                  )}
                  {users.map((user) => (
                    <div
                      key={user._id}
                      className="grid grid-cols-1 md:grid-cols-5 gap-4 px-6 py-4 items-center"
                    >
                      <div>
                        <p className="text-(--text) font-semibold">
                          {user.fullName}
                        </p>
                        <p className="text-xs text-(--muted)">{user.email}</p>
                      </div>
                      <div>
                        <select
                          value={user.role}
                          disabled={!user._id || updatingId === user._id}
                          onChange={(event) =>
                            user._id &&
                            handleRoleUpdate(
                              user._id,
                              event.target.value as
                                | "user"
                                | "serviceProvider"
                                | "admin",
                            )
                          }
                          className="w-full text-xs font-semibold px-3 py-2 rounded-lg bg-(--secondary) text-(--muted) border border-(--border)"
                        >
                          <option value="user">User</option>
                          <option value="serviceProvider">Service Provider</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      <div>
                        <span className="inline-flex text-xs font-semibold px-3 py-1 rounded-full bg-(--secondary) text-(--muted) border border-(--border) capitalize">
                          {user.verificationStatus || "-"}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-(--text)">
                          {new Date(user.createdAt!).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-(--muted)">{user._id}</p>
                      </div>
                      <div className="flex justify-start md:justify-end">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={!user._id}
                            onClick={() =>
                              user._id && navigate(`/admin/users/${user._id}`)
                            }
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-(--secondary) text-(--text) border border-(--border) transition disabled:opacity-60"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            disabled={!user._id || deletingId === user._id}
                            onClick={() =>
                              user._id && handleDeleteUser(user._id, user.fullName)
                            }
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-(--danger-bg) text-(--danger) border border-(--border) transition disabled:opacity-60"
                          >
                            {deletingId === user._id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            aria-label="Close modal"
            onClick={() => setDeleteTarget(null)}
            className="absolute inset-0 bg-black/50"
          />
          <div className="relative w-full max-w-md rounded-2xl border border-(--border) bg-(--primary) p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-(--text)">Delete User</h3>
            <p className="mt-2 text-sm text-(--muted)">
              Delete {deleteTarget.fullName}? This action cannot be undone.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deletingId === deleteTarget.id}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-(--secondary) text-(--text) border border-(--border) disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteUser}
                disabled={deletingId === deleteTarget.id}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-(--danger-bg) text-(--danger) border border-(--border) disabled:opacity-60"
              >
                {deletingId === deleteTarget.id ? "Processing..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
