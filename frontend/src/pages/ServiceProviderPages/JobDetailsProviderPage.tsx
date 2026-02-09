import Sidebar from "../../components/Sidebar/Sidebar";
import { JobApi, type JobData, OfferApi, ReviewApi } from "../../api/Apis";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Loader2,
  Tag,
  DollarSign,
  MapPin,
  Calendar,
  FileText,
  PlusCircle,
  Check,
  AlertCircle,
  ArrowLeft,
  ExternalLink,
  User,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";

export default function JobDetailsProviderPage() {
  const [job, setJob] = useState<JobData>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [offerModal, setOfferModal] = useState(false);
  const [offerSuccessModal, setOfferSuccessModal] = useState(false);
  const [offeredPrice, setOfferedPrice] = useState("");
  const [modalError, setModalError] = useState("");
  const [sendingOffer, setSendingOffer] = useState(false);
  const [completingJob, setCompletingJob] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const { user } = useAuthStore();

  const getProviderOffer = (jobData?: JobData) => {
    if (!jobData?.offers) return null;
    const currentUserId = user?._id || user?.id;
    if (!currentUserId) return null;
    return (
      jobData.offers.find((offer) => {
        const offerProviderId =
          (offer.serviceProviderId as { _id?: string })?._id ||
          (offer.serviceProviderId as unknown as string);
        return offerProviderId === currentUserId;
      }) || null
    );
  };

  const providerOffer = getProviderOffer(job);

  const fetchJob = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await JobApi.fetchJobByIdApi(jobId!);

      setJob(response.data.job);
    } catch (error) {
      console.log(error);
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

  async function handleSendOffer() {
    const offeredPriceNum = Number(offeredPrice);

    const offerLowerLimit = job?.userPrice! - (job?.userPrice! * 20) / 100;

    const offerUpperLimit = job?.userPrice! + (job?.userPrice! * 20) / 100;

    if (!offeredPrice) {
      setModalError("Please enter an offer price.");
      return;
    } else if (offeredPriceNum < offerLowerLimit) {
      setModalError("Offer price too low.");
      return;
    } else if (offeredPriceNum > offerUpperLimit) {
      setModalError("Offer price is too high.");
      return;
    }

    setModalError("");

    try {
      setSendingOffer(true);
      await OfferApi.createOffer({
        jobId: job?._id!,
        offeredPrice: offeredPriceNum,
      });

      if (jobId) {
        const updatedJob = await JobApi.fetchJobByIdApi(jobId);
        setJob(updatedJob.data.job);
      }

      setOfferModal(false);
      setOfferedPrice("");
      setOfferSuccessModal(true);
    } catch (err: any) {
      console.error(err);
      setModalError(err?.response?.data?.message || "Failed to submit offer");
    } finally {
      setSendingOffer(false);
    }
  }

  const handleCompleteJob = async () => {
    if (!job?._id) return;
    try {
      setCompletingJob(true);
      await JobApi.completeJobApi(job._id);
      await fetchJob();
    } catch (err) {
      console.error(err);
    } finally {
      setCompletingJob(false);
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
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const jobOwner = job.userId as { fullName?: string } | undefined;

  return (
    <div className="flex min-h-screen bg-(--secondary)">
      <Sidebar />

      {offerModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-(--primary) rounded-2xl w-full max-w-md shadow-xl border border-(--border)">
            <div className="p-5 border-b border-(--border)">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-(--text)">
                    Send Offer
                  </h3>
                  <p className="text-sm text-(--muted) mt-1">
                    Enter your offer price for this job.
                  </p>
                </div>
                <button
                  onClick={() => setOfferModal(false)}
                  className="text-(--muted) hover:text-(--text) transition"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-(--secondary) border border-(--border) rounded-xl p-3">
                <p className="text-sm text-(--muted)">Customer Budget</p>
                <p className="text-2xl font-bold text-(--text)">
                  Rs. {job.userPrice?.toLocaleString()}
                </p>
                <p className="text-xs text-(--muted) mt-1">
                  Your offer must be within ±20% of the budget.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-(--text) mb-2">
                  Offer Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-(--muted)">
                    Rs.
                  </span>
                  <input
                    type="number"
                    value={offeredPrice}
                    onChange={(e) => {
                      setOfferedPrice(e.target.value);
                      setModalError("");
                    }}
                    placeholder={job.userPrice?.toString() || "0"}
                    className="w-full pl-10 pr-3 py-2.5 border border-(--border) rounded-lg focus:outline-none focus:ring-2 focus:ring-(--accent) bg-(--secondary) text-(--text)"
                  />
                </div>
                {modalError && (
                  <p className="text-sm text-red-600 mt-2">{modalError}</p>
                )}
              </div>
            </div>

            <div className="p-5 border-t border-(--border) flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                onClick={() => setOfferModal(false)}
                className="px-4 py-2 border border-(--border) rounded-lg text-(--text) hover:bg-(--secondary) transition"
              >
                Cancel
              </button>

              <button
                onClick={() => handleSendOffer()}
                disabled={sendingOffer || !offeredPrice}
                className="px-4 py-2 bg-(--accent) text-(--primary) rounded-lg disabled:opacity-60 flex items-center gap-2 justify-center"
              >
                {sendingOffer ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4" />
                    Submitting...
                  </>
                ) : (
                  "Submit Offer"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {!loading && offerSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-(--primary) rounded-2xl w-full max-w-md shadow-xl border border-(--border)">
            <div className="p-6 text-center">
              <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-(--text)">
                Offer Sent
              </h3>
              <p className="text-sm text-(--muted) mt-2">
                Your offer has been submitted successfully.
              </p>
            </div>
            <div className="p-5 border-t border-(--border) flex justify-center">
              <button
                onClick={() => setOfferSuccessModal(false)}
                className="px-5 py-2 bg-(--accent) text-(--primary) rounded-lg hover:bg-(--accent-hover) transition font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

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
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-medium capitalize w-fit ${getStatusStyles(
                    job.jobStatus,
                  )}`}
                >
                  {job.jobStatus}
                </span>
                {job.jobStatus === "in-progress" &&
                  (() => {
                    if (!providerOffer) return null;
                    const offerUi = {
                      accepted: {
                        label: "Offer Accepted",
                        styles:
                          "bg-blue-100 text-blue-700 border border-blue-200",
                      },
                      rejected: {
                        label: "Offer Rejected",
                        styles: "bg-red-100 text-red-700 border border-red-200",
                      },
                      pending: {
                        label: "Offer Sent",
                        styles:
                          "bg-amber-100 text-amber-700 border border-amber-200",
                      },
                    } as const;
                    const offerInfo =
                      offerUi[providerOffer.status as keyof typeof offerUi] ||
                      offerUi.pending;
                    return (
                      <span
                        className={`px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap ${offerInfo.styles}`}
                      >
                        {offerInfo.label}
                      </span>
                    );
                  })()}
              </div>
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
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {job.userId?.fullName}
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
                          Rs. {job.userPrice?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-(--secondary) rounded-xl p-4 border border-(--border)">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-(--primary) rounded-lg flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-(--muted) mb-1">Posted By</p>
                        <p className="text-(--text) font-medium">
                          {job.userId?.fullName}
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
                {job.jobStatus === "open" && !providerOffer && (
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setOfferModal(true)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-(--accent) text-(--primary) rounded-lg hover:bg-(--accent-hover) transition font-medium shadow-sm"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Send Offer
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {job?.jobStatus === "completed" && (
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

          {job?.jobStatus === "completed" && jobOwner && (
            <div className="bg-(--primary) border border-(--border) rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold text-(--text) mb-2">
                Leave a Review
              </h3>
              <p className="text-sm text-(--muted) mb-4">
                Share your experience with {jobOwner.fullName || "the client"}.
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
                      placeholder="Share details about the client"
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

          {job?.jobStatus === "in-progress" && (
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

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleCompleteJob}
                  disabled={completingJob}
                  className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-60"
                >
                  {completingJob ? "Completing..." : "Mark as Completed"}
                </button>
              </div>
            </div>
          )}

          {providerOffer && (
            <div className="bg-(--primary) border border-(--border) rounded-xl overflow-hidden mb-6">
              <div className="p-4 sm:p-6 border-b border-(--border)">
                <h3 className="text-xl font-bold text-(--text)">Your Offer</h3>
                <p className="text-sm text-(--muted) mt-1">
                  Details of the offer you submitted for this job
                </p>
              </div>

              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-(--secondary) rounded-xl p-4 border border-(--border)">
                    <p className="text-sm text-(--muted) mb-1">Offer Price</p>
                    <p className="text-2xl font-bold text-(--text)">
                      Rs. {providerOffer.offeredPrice?.toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-(--secondary) rounded-xl p-4 border border-(--border)">
                    <p className="text-sm text-(--muted) mb-1">Status</p>
                    <p className="text-lg font-semibold text-(--text) capitalize">
                      {providerOffer.status || "pending"}
                    </p>
                  </div>

                  <div className="bg-(--secondary) rounded-xl p-4 border border-(--border)">
                    <p className="text-sm text-(--muted) mb-1">Offer Date</p>
                    <p className="text-lg font-semibold text-(--text)">
                      {providerOffer.createdAt
                        ? new Date(providerOffer.createdAt).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
