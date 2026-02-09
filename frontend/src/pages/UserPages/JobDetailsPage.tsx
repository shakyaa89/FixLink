import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import { JobApi, OfferApi, ReviewApi, type JobData } from "../../api/Apis";
import { useParams, useNavigate } from "react-router-dom";
import {
  Ban,
  Loader2,
  Inbox,
  Tag,
  DollarSign,
  MapPin,
  Calendar,
  FileText,
  Mail,
  Phone,
  Check,
  AlertCircle,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";

export default function JobDetailsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [job, setJob] = useState<JobData>();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showOfferAcceptDialog, setShowOfferAcceptDialog] = useState(false);
  const [acceptOfferId, setAcceptOfferId] = useState<string>("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const { jobId } = useParams();
  const navigate = useNavigate();

  const fetchJob = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await JobApi.fetchJobByIdApi(jobId!);
      setJob(response.data.job);
    } catch (err) {
      console.error("Error fetching job:", err);
      setError("Failed to load job details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jobId) {
      fetchJob();
    }
  }, [jobId]);

  const getStatusStyles = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "open":
      case "pending":
        return "bg-green-100 text-green-800 border border-green-200";
      case "closed":
        return "bg-red-100 text-red-800 border border-red-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      default:
        return "bg-(--secondary) text-(--text) border border-(--border)";
    }
  };

  const handleCancelJob = async (jobId: string) => {
    try {
      const response = await JobApi.cancelJobApi(jobId);

      toast.success(response?.data?.message);

      fetchJob();
    } catch (error: any) {
      console.error("Error cancelling job:", error);
      toast.error(error?.data?.message || "Error cancelling the job");
    }

    setShowCancelDialog(false);
  };

  const handleOfferAccept = async (offerId: string) => {
    try {
      if (offerId === "") return;

      const payload = { offerId };

      const response = await OfferApi.acceptOffer(payload);

      toast.success(response?.data?.message);

      fetchJob();
    } catch (error) {
      console.error("Error accepting offer:", error);
      toast.error("Failed to accept offer. Please try again.");
    }
  };

  const handleSubmitReview = async () => {
    if (!job?._id) return;

    if (reviewRating < 1 || reviewRating > 5) {
      toast.error("Please select a rating between 1 and 5.");
      return;
    }

    try {
      setReviewSubmitting(true);
      await ReviewApi.createReview({
        jobId: job._id,
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewSubmitted(true);
      toast.success("Review submitted.");
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Failed to submit review.";
      if (message === "Review already submitted") {
        setReviewSubmitted(true);
      }
      toast.error(message);
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center bg-(--secondary)">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-(--accent) mx-auto mb-4" />
            <p className="text-(--muted)">Loading job details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 bg-(--secondary) py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  Error Loading Job
                </h3>
                <p className="text-red-700 mb-4">
                  {error || "Job not found or has been removed."}
                </p>
                <button
                  onClick={() => navigate("/my-jobs")}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to My Jobs
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const acceptedOffer = job.offers?.find((offer) => offer.status === "accepted");
  const provider = acceptedOffer?.serviceProviderId as
    | { fullName?: string }
    | undefined;

  return (
    <div className="flex min-h-screen bg-(--secondary)">
      <Sidebar />

      <main className="flex-1 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 bg-(--primary)">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-(--muted) hover:text-(--text) transition mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-(--text)">
                  Job Details
                </h1>
                <p className="text-(--muted) mt-1">
                  Complete information about this job posting
                </p>
              </div>
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium capitalize w-fit ${getStatusStyles(
                  job.jobStatus,
                )}`}
              >
                {job.jobStatus}
              </span>
            </div>
          </div>

          {/* Main Job Details Card */}
          <div className="bg-(--primary) border border-(--border) rounded-xl overflow-hidden mb-6">
            {/* Job Header */}
            <div className="p-4 sm:p-6 border-b border-(--border)">
              <h2 className="text-xl sm:text-2xl font-bold text-(--text) mb-2">
                {job.title}
              </h2>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-(--muted)">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Posted {new Date(job.createdAt!).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Tag className="w-4 h-4" />
                  {job.jobCategory}
                </span>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 sm:p-6">
              {/* Image Gallery */}
              <div className="lg:col-span-1">
                {job.images && job.images.length > 0 ? (
                  <div className="space-y-3">
                    <div className="relative">
                      <img
                        src={job.images[selectedImageIndex]}
                        alt={job.title || "Job image"}
                        className="w-full h-64 sm:h-80 object-cover rounded-xl"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600";
                        }}
                      />
                      {job.images.length > 1 && (
                        <div className="absolute bottom-3 right-3 bg-black/60 text-white px-2 py-1 rounded text-xs">
                          {selectedImageIndex + 1} / {job.images.length}
                        </div>
                      )}
                    </div>

                    {job.images.length > 1 && (
                      <div className="grid grid-cols-4 gap-2">
                        {job.images.map((image, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedImageIndex(idx)}
                            className={`overflow-hidden rounded-lg border-2 transition focus:outline-none ${
                              selectedImageIndex === idx
                                ? "border-(--accent)"
                                : "border-(--border) hover:border-(--accent)/50"
                            }`}
                          >
                            <img
                              src={image}
                              alt={`${job.title || "Job"} ${idx + 1}`}
                              className="w-full h-16 sm:h-20 object-cover"
                              loading="lazy"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-64 sm:h-80 bg-(--secondary) rounded-xl flex flex-col items-center justify-center text-(--muted)">
                    <FileText className="w-12 h-12 mb-2" />
                    <p>No images available</p>
                  </div>
                )}
              </div>

              {/* Job Information */}
              <div className="lg:col-span-2 space-y-6">
                {/* Key Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-(--secondary) rounded-xl p-4 border border-(--border)">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-(--primary) rounded-lg flex items-center justify-center shrink-0">
                        <DollarSign className="w-5 h-5 text-(--accent)" />
                      </div>
                      <div>
                        <p className="text-sm text-(--muted) mb-1">Price</p>
                        <p className="text-2xl font-bold text-(--text)">
                          Rs.{" "}
                          {job.jobStatus === "open"
                            ? job.userPrice?.toLocaleString()
                            : job.finalPrice?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-(--secondary) rounded-xl p-4 border border-(--border)">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-(--primary) rounded-lg flex items-center justify-center shrink-0">
                        <Inbox className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-(--muted) mb-1">
                          Offers Received
                        </p>
                        <p className="text-2xl font-bold text-(--text)">
                          {job.offers?.length || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-(--secondary) rounded-xl p-4 border border-(--border)">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-(--primary) rounded-lg flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-(--muted) mb-1">Location</p>
                        {job.locationURL ? (
                          <a
                            href={job.locationURL}
                            target="_blank"
                            rel="noreferrer"
                            className="text-(--accent) hover:underline flex items-center gap-1 text-sm"
                          >
                            <span className="truncate">{job.location}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        ) : (
                          <p className="text-(--text) truncate">
                            {job.location || "Not specified"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-(--secondary) rounded-xl p-4 border border-(--border)">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-(--primary) rounded-lg flex items-center justify-center shrink-0">
                        <Tag className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-(--muted) mb-1">Category</p>
                        <p className="text-(--text) font-medium">
                          {job.jobCategory}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-(--text) mb-3">
                    <FileText className="w-5 h-5" />
                    Description
                  </h3>
                  <div className="bg-(--secondary) rounded-xl p-4 border border-(--border)">
                    <p className="text-(--text) leading-relaxed whitespace-pre-wrap">
                      {job.description || "No description provided."}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                {(job.jobStatus === "open" ||
                  job.jobStatus === "in-progress") && (
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setShowCancelDialog(true)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium shadow-sm"
                    >
                      <Ban className="w-4 h-4" />
                      Cancel Job
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Offers Section */}
          {job.jobStatus === "open" && (
            <div className="bg-(--primary) border border-(--border) rounded-xl overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-(--border)">
                <h3 className="text-xl font-bold text-(--text) flex items-center gap-2">
                  <Inbox className="w-5 h-5" />
                  Offers ({job.offers?.length || 0})
                </h3>
                <p className="text-sm text-(--muted) mt-1">
                  Service providers interested in your job
                </p>
              </div>

              <div className="p-4 sm:p-6">
                {job.offers && job.offers.length > 0 ? (
                  <div className="space-y-4">
                    {job.offers.map((offer) => {
                      const provider = offer.serviceProviderId;

                      return (
                        <div
                          key={offer._id}
                          className="bg-(--secondary) border border-(--border) rounded-xl p-4 sm:p-5 hover:shadow-md transition"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                            {/* Provider Info */}
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className="w-12 h-12 bg-(--primary) rounded-full flex items-center justify-center shrink-0 border border-(--border)">
                                <img
                                  src={provider?.profilePicture}
                                  alt="Provider Image"
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-semibold text-(--text) text-lg">
                                  {provider.fullName}
                                </h4>
                                <p className="text-sm text-(--muted)">
                                  {provider.providerCategory ||
                                    "Service Provider"}
                                </p>
                              </div>
                            </div>

                            {/* Offer Price */}
                            <div className="text-left sm:text-right">
                              <p className="text-sm text-(--muted) mb-1">
                                Offered Price
                              </p>
                              <p className="text-2xl font-bold text-(--accent)">
                                Rs. {offer.offeredPrice?.toLocaleString()}
                              </p>
                              <p className="text-xs text-(--muted) mt-1">
                                {new Date(
                                  offer.createdAt!,
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {/* Contact Information */}
                          <div className="bg-(--primary) rounded-lg p-3 mb-4 space-y-2 border border-(--border)">
                            <p className="flex items-center gap-2 text-sm text-(--text)">
                              <Mail className="w-4 h-4 text-(--muted) shrink-0" />
                              <span className="truncate">{provider.email}</span>
                            </p>
                            <p className="flex items-center gap-2 text-sm text-(--text)">
                              <Phone className="w-4 h-4 text-(--muted) shrink-0" />
                              <span>{provider.phoneNumber}</span>
                            </p>
                            {provider.address && (
                              <p className="flex items-center gap-2 text-sm text-(--text)">
                                <MapPin className="w-4 h-4 text-(--muted) shrink-0" />
                                <span className="truncate">
                                  {provider.address}
                                </span>
                              </p>
                            )}
                          </div>

                          {/* Action Button */}
                          <button
                            onClick={() => {
                              setShowOfferAcceptDialog(true);
                              setAcceptOfferId(offer?._id || "");
                            }}
                            className="w-full sm:w-auto px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-green-700 transition shadow-sm"
                          >
                            <Check className="w-4 h-4" />
                            Accept Offer
                          </button>

                          {showOfferAcceptDialog && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                              <div className="bg-(--primary) rounded-xl max-w-md w-full p-6 shadow-xl">
                                <div className="flex items-start gap-4 mb-4">
                                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                                    <AlertCircle className="w-6 h-6 text-red-600" />
                                  </div>
                                  <div>
                                    <h3 className="text-lg font-bold text-(--text) mb-1">
                                      Accept this offer?
                                    </h3>
                                    <p className="text-sm text-(--muted)">
                                      Are you sure you want to accept this
                                      offer? This action cannot be undone.
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-3 justify-end">
                                  <button
                                    onClick={() =>
                                      setShowOfferAcceptDialog(false)
                                    }
                                    className="px-4 py-2 border border-(--border) text-(--text) rounded-lg hover:bg-(--secondary) transition"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleOfferAccept(acceptOfferId)
                                    }
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                  >
                                    Yes, Accept offer
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-(--secondary) border border-(--border) rounded-full mb-4">
                      <Inbox className="w-8 h-8 text-(--muted)" />
                    </div>
                    <h4 className="text-lg font-semibold text-(--text) mb-2">
                      No Offers Yet
                    </h4>
                    <p className="text-(--muted) max-w-md mx-auto">
                      Service providers haven't submitted any offers for this
                      job yet. Check back later!
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Job Tracking */}
          {job.jobStatus === "completed" && (
            <div className="bg-(--primary) border border-(--border) rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold text-(--text) mb-4 flex items-center gap-2">
                Job Progress
              </h3>

              <div className="flex items-center justify-between">
                {/* Step 1 */}
                <div className="flex flex-col items-center text-center flex-1">
                  <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center">
                    <Check className="w-5 h-5" />
                  </div>
                  <p className="mt-2 text-sm font-medium text-(--text)">
                    Job Accepted
                  </p>
                </div>

                <div className="flex-1 h-1 bg-green-600 mx-2 rounded" />

                {/* Step 2 */}
                <div className="flex flex-col items-center text-center flex-1">
                  <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center">
                    <Check className="w-5 h-5" />
                  </div>
                  <p className="mt-2 text-sm font-medium text-(--text)">
                    In Progress
                  </p>
                </div>

                <div className="flex-1 h-1 bg-green-600 mx-2 rounded" />

                {/* Step 3 */}
                <div className="flex flex-col items-center text-center flex-1">
                  <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center">
                    <Check className="w-5 h-5" />
                  </div>
                  <p className="mt-2 text-sm font-medium text-(--text)">
                    Completed
                  </p>
                </div>
              </div>
            </div>
          )}

          {job.jobStatus === "completed" && provider && (
            <div className="bg-(--primary) border border-(--border) rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold text-(--text) mb-2">
                Leave a Review
              </h3>
              <p className="text-sm text-(--muted) mb-4">
                Share your experience with {provider.fullName || "the provider"}.
              </p>

              {reviewSubmitted ? (
                <div className="text-green-700 bg-green-50 border border-green-200 rounded-lg p-4">
                  Thanks! Your review has been submitted.
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-(--text) mb-2">
                      Rating
                    </label>
                    <select
                      value={reviewRating}
                      onChange={(e) => setReviewRating(Number(e.target.value))}
                      className="w-full border border-(--border) rounded-lg px-3 py-2 bg-(--primary) text-(--text)"
                    >
                      <option value={0}>Select rating</option>
                      {[1, 2, 3, 4, 5].map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-(--text) mb-2">
                      Comment (optional)
                    </label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={4}
                      className="w-full border border-(--border) rounded-lg px-3 py-2 bg-(--primary) text-(--text)"
                      placeholder="Share details about the service"
                    />
                  </div>

                  <button
                    onClick={handleSubmitReview}
                    disabled={reviewSubmitting}
                    className="px-5 py-2.5 bg-(--accent) text-white rounded-lg hover:bg-(--accent-hover) transition disabled:opacity-60"
                  >
                    {reviewSubmitting ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              )}
            </div>
          )}

          {job.jobStatus === "in-progress" && (
            <div className="bg-(--primary) border border-(--border) rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold text-(--text) mb-4 flex items-center gap-2">
                Job Progress
              </h3>

              <div className="flex items-center justify-between">
                {/* Step 1 */}
                <div className="flex flex-col items-center text-center flex-1">
                  <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center">
                    <Check className="w-5 h-5" />
                  </div>
                  <p className="mt-2 text-sm font-medium text-(--text)">
                    Job Accepted
                  </p>
                </div>

                <div className="flex-1 h-1 bg-green-600 mx-2 rounded" />

                {/* Step 2 */}
                <div className="flex flex-col items-center text-center flex-1">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                  <p className="mt-2 text-sm font-medium text-(--text)">
                    In Progress
                  </p>
                </div>

                <div className="flex-1 h-1 bg-(--border) mx-2 rounded" />

                {/* Step 3 */}
                <div className="flex flex-col items-center text-center flex-1">
                  <div className="w-10 h-10 rounded-full bg-(--secondary) border border-(--border) flex items-center justify-center">
                    <Check className="w-5 h-5 text-(--muted)" />
                  </div>
                  <p className="mt-2 text-sm text-(--muted)">Completed</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Cancel Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-(--primary) rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-(--text) mb-1">
                  Cancel Job?
                </h3>
                <p className="text-sm text-(--muted)">
                  Are you sure you want to cancel this job? This action cannot
                  be undone and all pending offers will be removed.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCancelDialog(false)}
                className="px-4 py-2 border border-(--border) text-(--text) rounded-lg hover:bg-(--secondary) transition"
              >
                Keep Job
              </button>
              <button
                onClick={() => handleCancelJob(job._id ?? "")}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Yes, Cancel Job
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
