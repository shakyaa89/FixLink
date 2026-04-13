import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar/AdminSidebar";
import { AdminApi } from "../../api/Apis";

interface AdminJobDetail {
  _id?: string;
  title?: string;
  description?: string;
  jobCategory?: string;
  userPrice?: number;
  finalPrice?: number;
  location?: string;
  locationURL?: string;
  jobStatus?: string;
  createdAt?: string;
  scheduledFor?: string;
  images?: string[];
  userId?: { _id?: string; fullName?: string } | string;
}

const resolveUser = (userId?: AdminJobDetail["userId"]) => {
  if (!userId) return "-";
  if (typeof userId === "string") return userId;
  return userId.fullName || userId._id || "-";
};

export default function AdminJobDetailsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<AdminJobDetail | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) return;

      try {
        setLoading(true);
        setError(null);
        const response = await AdminApi.fetchJobById(jobId);
        const fetchedJob = response.data.job || null;
        setJob(fetchedJob);
        setSelectedImageIndex(0);
      } catch (err) {
        console.error("Failed to fetch job", err);
        setError("Unable to load job details.");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  return (
    <div className="flex min-h-screen bg-(--primary)">
      <AdminSidebar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-(--muted) text-sm">Admin Console</p>
              <h1 className="text-3xl font-bold text-(--text)">Job Details</h1>
            </div>
            <Link
              to="/admin/jobs"
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
          ) : !job ? (
            <div className="text-(--muted)">Job not found.</div>
          ) : (
            <div className="bg-(--primary) border border-(--border) rounded-2xl p-6 space-y-4">
              <div>
                <p className="text-xs text-(--muted)">Images</p>
                {job.images && job.images.length > 0 ? (
                  <div className="space-y-3 mt-2">
                    <img
                      src={job.images[selectedImageIndex]}
                      alt={`Job image ${selectedImageIndex + 1}`}
                      className="w-full max-h-96 object-cover rounded-xl border border-(--border)"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600";
                      }}
                    />
                    {job.images.length > 1 && (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {job.images.map((image, idx) => (
                          <button
                            type="button"
                            key={`${image}-${idx}`}
                            onClick={() => setSelectedImageIndex(idx)}
                            className={`rounded-lg overflow-hidden border ${
                              selectedImageIndex === idx
                                ? "border-(--accent) ring-2 ring-(--accent)/30"
                                : "border-(--border)"
                            }`}
                          >
                            <img
                              src={image}
                              alt={`Job thumbnail ${idx + 1}`}
                              className="w-full h-16 object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=200";
                              }}
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-(--text)">No images available</p>
                )}
              </div>

              <div>
                <p className="text-xs text-(--muted)">Title</p>
                <p className="text-(--text) font-semibold">{job.title || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-(--muted)">Description</p>
                <p className="text-(--text)">{job.description || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-(--muted)">Category</p>
                <p className="text-(--text)">{job.jobCategory || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-(--muted)">Owner</p>
                <p className="text-(--text)">{resolveUser(job.userId)}</p>
              </div>
              <div>
                <p className="text-xs text-(--muted)">Status</p>
                <p className="text-(--text) capitalize">{job.jobStatus || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-(--muted)">Price</p>
                <p className="text-(--text)">{job.userPrice ?? "-"}</p>
              </div>
              <div>
                <p className="text-xs text-(--muted)">Location</p>
                <p className="text-(--text)">{job.location || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-(--muted)">Created</p>
                <p className="text-(--text)">
                  {job.createdAt ? new Date(job.createdAt).toLocaleString() : "-"}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
