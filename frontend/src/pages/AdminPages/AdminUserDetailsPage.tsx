import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar/AdminSidebar";
import { AdminApi, type AdminUserData } from "../../api/Apis";

export default function AdminUserDetailsPage() {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<AdminUserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      // Guard against missing route param before API call.
      if (!userId) return;

      try {
        setLoading(true);
        setError(null);
        const response = await AdminApi.fetchUserById(userId);
        setUser(response.data.user || null);
      } catch (err) {
        console.error("Failed to fetch user", err);
        setError("Unable to load user details.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  return (
    <div className="flex min-h-screen bg-(--primary)">
      <AdminSidebar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-(--muted) text-sm">Admin Console</p>
              <h1 className="text-3xl font-bold text-(--text)">User Details</h1>
            </div>
            <Link
              to="/admin/users"
              className="px-4 py-2 text-sm font-medium rounded-lg bg-(--secondary) text-(--text) border border-(--border)"
            >
              Back
            </Link>
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
          ) : !user ? (
            <div className="text-(--muted)">User not found.</div>
          ) : (
            <div className="bg-(--primary) border border-(--border) rounded-2xl p-6 space-y-4">
              <div>
                <p className="text-xs text-(--muted)">Name</p>
                <p className="text-(--text) font-semibold">{user.fullName}</p>
              </div>
              <div>
                <p className="text-xs text-(--muted)">Email</p>
                <p className="text-(--text)">{user.email}</p>
              </div>
              <div>
                <p className="text-xs text-(--muted)">Role</p>
                <p className="text-(--text) capitalize">{user.role}</p>
              </div>
              <div>
                <p className="text-xs text-(--muted)">Verification</p>
                <p className="text-(--text) capitalize">{user.verificationStatus || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-(--muted)">Created</p>
                <p className="text-(--text)">
                  {user.createdAt ? new Date(user.createdAt).toLocaleString() : "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-(--muted)">ID</p>
                <p className="text-(--text)">{user._id || "-"}</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
