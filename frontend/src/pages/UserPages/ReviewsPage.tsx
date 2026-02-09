import { Star, TrendingUp, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import { ReviewApi, type ReviewData } from "../../api/Apis";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await ReviewApi.fetchMyReceivedReviews();
        setReviews(response.data.reviews || []);
      } catch (err) {
        console.error("Failed to load reviews", err);
        setError("Failed to load reviews. Please try again.");
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, []);

  const stats = useMemo(() => {
    const total = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    const average = total ? (sum / total).toFixed(1) : "0.0";
    const counts = [5, 4, 3, 2, 1].map((value) =>
      reviews.filter((r) => r.rating === value).length
    );
    return { total, average, counts };
  }, [reviews]);

  return (
    <div className="flex min-h-screen ">
      <Sidebar />

      <main className="flex-1 px-6 md:px-12 py-10 bg-(--primary)">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-(--text) mb-3">
              Your Reviews and Ratings
            </h1>
            <p className="text-(--muted) text-lg">
              See what providers have to say
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-(--primary) rounded-2xl p-6 shadow-sm border border-(--border)">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-(--text)">
                    {stats.average}
                  </div>
                  <div className="text-sm text-(--muted)">Average Rating</div>
                </div>
              </div>
            </div>

            <div className="bg-(--primary) rounded-2xl p-6 shadow-sm border border-(--border)">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-(--accent)/10 rounded-xl">
                  <Users className="w-6 h-6 text-(--accent)" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-(--text)">{stats.total}</div>
                  <div className="text-sm text-(--muted)">Total Reviews</div>
                </div>
              </div>
            </div>

            <div className="bg-(--primary) rounded-2xl p-6 shadow-sm border border-(--border)">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-green-100 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-(--text)">
                    {stats.total
                      ? Math.round((stats.counts[0] / stats.total) * 100)
                      : 0}
                    %
                  </div>
                  <div className="text-sm text-(--muted)">5-Star Reviews</div>
                </div>
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="bg-(--primary) rounded-2xl p-8 shadow-sm border border-(--border) mb-12">
            <h2 className="text-xl font-bold text-(--text) mb-6">
              Rating Distribution
            </h2>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((value, index) => {
                const count = stats.counts[index];
                const percent = stats.total
                  ? Math.round((count / stats.total) * 100)
                  : 0;
                return (
                  <div key={value} className="flex items-center gap-4">
                    <div className="flex items-center gap-1 w-20">
                      <span className="text-sm font-medium text-(--text)">
                        {value}
                      </span>
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1 h-3 bg-(--secondary) rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-(--muted) w-12 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-(--text)">Reviews</h2>

            {loading && (
              <div className="text-(--muted)">Loading reviews...</div>
            )}

            {error && <div className="text-red-600">{error}</div>}

            {!loading && !error && reviews.length === 0 && (
              <div className="text-(--muted)">No reviews yet.</div>
            )}

            {reviews.map((review) => {
              const reviewerName = review.reviewerId?.fullName || "Anonymous";
              const initials = reviewerName
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0])
                .join("")
                .toUpperCase();

              return (
                <div
                  key={review._id}
                  className="bg-(--primary) rounded-2xl p-8 shadow-sm border border-(--border) hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    {review.reviewerId?.profilePicture ? (
                      <img
                        src={review.reviewerId.profilePicture}
                        alt={reviewerName}
                        className="w-12 h-12 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg shrink-0">
                        {initials || "?"}
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-(--text)">
                            {reviewerName}
                          </h3>
                          {typeof review.jobId === "object" &&
                            review.jobId?.title && (
                              <p className="text-sm text-(--muted)">
                                {review.jobId.title}
                              </p>
                            )}
                        </div>
                        <span className="text-sm text-(--muted) mt-1 md:mt-0">
                          {review.createdAt
                            ? new Date(review.createdAt).toLocaleDateString()
                            : ""}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 mb-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-(--muted)"
                            }`}
                          />
                        ))}
                      </div>

                      <p className="text-(--text) leading-relaxed">
                        {review.comment || "No comment provided."}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
