import { useEffect, useState } from "react";
import { Loader2, Star } from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar/AdminSidebar";
import { AdminApi, type AdminReviewData } from "../../api/Apis";

const resolveLabel = (
  value?: { _id?: string; fullName?: string; email?: string } | string,
) => {
  if (!value) return "-";
  // Backend may return populated user object or raw id string.
  if (typeof value === "string") return value;
  return value.fullName || value.email || value._id || "-";
};

const resolveJobLabel = (job?: AdminReviewData["jobId"]) => {
  if (!job) return "-";
  if (typeof job === "string") return job;
  return job.title || job._id || "-";
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await AdminApi.fetchReviews();
      setReviews(response.data.reviews || []);
    } catch (err) {
      console.error("Failed to load reviews", err);
      setError("Unable to load reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleRatingUpdate = async (reviewId: string, rating: number) => {
    try {
      setUpdatingId(reviewId);
      setError(null);
      await AdminApi.updateReview(reviewId, { rating });
      // Reload to reflect persisted rating and any backend recalculations.
      await fetchReviews();
    } catch (err) {
      console.error("Failed to update review", err);
      setError("Unable to update review.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (reviewId: string) => {
    setDeleteTarget(reviewId);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      setDeletingId(deleteTarget);
      setError(null);
      await AdminApi.deleteReview(deleteTarget);
      // Refresh list immediately after delete.
      await fetchReviews();
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete review", err);
      setError("Unable to delete review.");
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
            <h1 className="text-3xl sm:text-4xl font-bold text-(--text)">Reviews Moderation</h1>
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
            <div className="bg-(--primary) border border-(--border) rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-(--border) bg-(--secondary)">
                <h2 className="text-lg font-semibold text-(--text)">All Reviews</h2>
                <span className="text-sm text-(--muted)">{reviews.length} reviews</span>
              </div>

              <div className="divide-y divide-(--border)">
                {reviews.length === 0 && (
                  <div className="px-6 py-6 text-sm text-(--muted)">No reviews found.</div>
                )}
                {reviews.map((review) => (
                  <div key={review._id} className="grid grid-cols-1 lg:grid-cols-7 gap-4 px-6 py-4 items-center">
                    <div>
                      <p className="text-xs text-(--muted)">Job</p>
                      <p className="text-sm text-(--text)">{resolveJobLabel(review.jobId)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-(--muted)">Reviewer</p>
                      <p className="text-sm text-(--text)">{resolveLabel(review.reviewerId)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-(--muted)">Reviewee</p>
                      <p className="text-sm text-(--text)">{resolveLabel(review.revieweeId)}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((value) => {
                          const active = value <= (review.rating || 1);
                          return (
                            <button
                              key={value}
                              type="button"
                              disabled={!review._id || updatingId === review._id}
                              onClick={() => review._id && handleRatingUpdate(review._id, value)}
                              aria-label={`Set rating to ${value}`}
                              className="p-1 rounded-md disabled:opacity-60"
                            >
                              <Star
                                className={`w-5 h-5 ${active ? "text-yellow-500" : "text-(--border)"}`}
                                fill={active ? "currentColor" : "none"}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="lg:col-span-2">
                      <p className="text-xs text-(--muted)">Comment</p>
                      <p className="text-sm text-(--text)">{review.comment || "-"}</p>
                    </div>
                    <div className="flex justify-start lg:justify-end">
                      <button
                        type="button"
                        disabled={!review._id || deletingId === review._id}
                        onClick={() => review._id && handleDelete(review._id)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-(--danger-bg) text-(--danger) border border-(--border) disabled:opacity-60"
                      >
                        {deletingId === review._id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
            <h3 className="text-xl font-semibold text-(--text)">Delete Review</h3>
            <p className="mt-2 text-sm text-(--muted)">
              Delete this review? This action cannot be undone.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deletingId === deleteTarget}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-(--secondary) text-(--text) border border-(--border) disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deletingId === deleteTarget}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-(--danger-bg) text-(--danger) border border-(--border) disabled:opacity-60"
              >
                {deletingId === deleteTarget ? "Processing..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
