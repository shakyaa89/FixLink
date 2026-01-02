import { Star, TrendingUp, Users } from "lucide-react";
import Sidebar from "../../components/Sidebar/Sidebar";

export default function ReviewsPage() {
  const reviews = [
    {
      id: 1,
      name: "Shakyaa",
      rating: 5,
      comment:
        "Excellent service. Very professional and quick. The team exceeded my expectations and delivered outstanding results. Would highly recommend to anyone looking for quality work.",
      date: "12 Aug 2025",
      avatar: "SS",
    },
    {
      id: 2,
      name: "Shakyaa",
      rating: 4,
      comment:
        "Good work overall, pricing was fair. Communication could be improved but the final delivery was solid.",
      date: "05 Aug 2025",
      avatar: "SS",
    },
    {
      id: 3,
      name: "Shakyaa",
      rating: 5,
      comment:
        "Outstanding experience from start to finish. Very attentive to details and requirements.",
      date: "28 Jul 2025",
      avatar: "SS",
    },
    {
      id: 4,
      name: "Shakyaa",
      rating: 4,
      comment:
        "Great service and timely delivery. Minor revisions were needed but handled promptly.",
      date: "15 Jul 2025",
      avatar: "SS",
    },
  ];

  const averageRating = (
    reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
  ).toFixed(1);
  const totalReviews = reviews.length;
  const fiveStarCount = reviews.filter((r) => r.rating === 5).length;
  const fourStarCount = reviews.filter((r) => r.rating === 4).length;

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
                    {averageRating}
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
                  <div className="text-3xl font-bold text-(--text)">
                    {totalReviews}
                  </div>
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
                    {Math.round((fiveStarCount / totalReviews) * 100)}%
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
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 w-20">
                  <span className="text-sm font-medium text-(--text)">5</span>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 h-3 bg-(--secondary) rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full"
                    style={{
                      width: `${(fiveStarCount / totalReviews) * 100}%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm text-(--muted) w-12 text-right">
                  {fiveStarCount}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 w-20">
                  <span className="text-sm font-medium text-(--text)">4</span>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 h-3 bg-(--secondary) rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full"
                    style={{
                      width: `${(fourStarCount / totalReviews) * 100}%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm text-(--muted) w-12 text-right">
                  {fourStarCount}
                </span>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-(--text)">Reviews</h2>

            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-(--primary) rounded-2xl p-8 shadow-sm border border-(--border) hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg shrink-0">
                    {review.avatar}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                      <h3 className="text-lg font-semibold text-(--text)">
                        {review.name}
                      </h3>
                      <span className="text-sm text-(--muted) mt-1 md:mt-0">
                        {review.date}
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
                      {review.comment}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
