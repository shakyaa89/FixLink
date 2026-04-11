import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  DollarSign,
  ExternalLink,
  FileText,
  Inbox,
  Loader2,
  MapPin,
  Phone,
  Tag,
  User,
  Mail,
  Star,
} from "lucide-react-native";
import Toast from "react-native-toast-message";
import { AxiosError } from "axios";
import colors from "@/app/_constants/theme";
import { JobApi, OfferApi, ReviewApi, type JobData } from "@/api/Apis";
import { useAuthStore } from "@/store/authStore";

export default function JobDetailsPage() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const router = useRouter();
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [job, setJob] = useState<JobData>();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const [showOfferAcceptDialog, setShowOfferAcceptDialog] = useState(false);
  const [acceptOfferId, setAcceptOfferId] = useState("");

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [cancelingJob, setCancelingJob] = useState(false);
  const [acceptingOffer, setAcceptingOffer] = useState(false);
  const [showCancelJobDialog, setShowCancelJobDialog] = useState(false);
  const [showCompleteJobDialog, setShowCompleteJobDialog] = useState(false);

  const [offeredPrice, setOfferedPrice] = useState("");
  const [offerSubmitting, setOfferSubmitting] = useState(false);
  const [completingJob, setCompletingJob] = useState(false);

  const currentUserId = user?._id || user?.id;

  const getEntityId = (value: any) => {
    if (!value) return undefined;
    if (typeof value === "string") return value;
    return value?._id || value?.id;
  };

  const fetchJob = async () => {
    if (!jobId) return;
    try {
      setLoading(true);
      setError(null);
      const response = await JobApi.fetchJobByIdApi(jobId);
      setJob(response?.data?.job);
    } catch (err) {
      console.error("Error fetching job:", err);
      setError("Failed to load job details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [jobId]);

  const getStatusStyles = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "open":
      case "pending":
        return "bg-green-100 border-green-200";
      case "closed":
        return "bg-red-100 border-red-200";
      case "in-progress":
        return "bg-blue-100 border-blue-200";
      case "completed":
        return "bg-indigo-100 border-indigo-200";
      default:
        return "bg-secondary border-border";
    }
  };

  const acceptedOffer = useMemo(
    () => job?.offers?.find((offer) => offer.status === "accepted"),
    [job?.offers]
  );

  const providerOffer = useMemo(() => {
    if (!job?.offers || !currentUserId) return null;
    return (
      job.offers.find((offer) => {
        const offerProviderId = getEntityId(offer.serviceProviderId);
        return offerProviderId === currentUserId;
      }) || null
    );
  }, [job?.offers, currentUserId]);

  const isAcceptedProvider =
    getEntityId(acceptedOffer?.serviceProviderId) === currentUserId;

  const handleCancelJob = async (id: string) => {
    try {
      setCancelingJob(true);
      const response = await JobApi.cancelJobApi(id);
      Toast.show({
        type: "success",
        text1: response?.data?.message || "Job canceled",
      });
      fetchJob();
    } catch (err: unknown) {
      console.error("Error cancelling job:", err);
      Toast.show({
        type: "error",
        text1:
          err instanceof AxiosError
            ? err.response?.data?.message || "Error cancelling the job"
            : "Error cancelling the job",
      });
    } finally {
      setCancelingJob(false);
    }
  };

  const handleOfferAccept = async (offerId: string) => {
    if (!offerId) return;
    try {
      setAcceptingOffer(true);
      const response = await OfferApi.acceptOffer({ offerId });
      Toast.show({
        type: "success",
        text1: response?.data?.message || "Offer accepted",
      });
      setShowOfferAcceptDialog(false);
      fetchJob();
    } catch (err: unknown) {
      console.error("Error accepting offer:", err);
      Toast.show({
        type: "error",
        text1:
          err instanceof AxiosError
            ? err.response?.data?.message || "Failed to accept offer"
            : "Failed to accept offer",
      });
    } finally {
      setAcceptingOffer(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!job?._id) return;
    if (reviewRating < 1 || reviewRating > 5) {
      Toast.show({ type: "error", text1: "Please select a rating between 1 and 5" });
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
      Toast.show({ type: "success", text1: "Review submitted" });
    } catch (err: unknown) {
      const message =
        err instanceof AxiosError
          ? err.response?.data?.message || "Failed to submit review"
          : "Failed to submit review";
      if (message === "Review already submitted") {
        setReviewSubmitted(true);
      }
      Toast.show({ type: "error", text1: message });
    } finally {
      setReviewSubmitting(false);
    }
  };

  const renderReviewStars = (rating: number) => {
    return (
      <View className="flex-row gap-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <Pressable key={value} onPress={() => setReviewRating(value)}>
            <Star
              size={28}
              color={value <= rating ? "#EAB308" : colors.border}
              fill={value <= rating ? "#EAB308" : "transparent"}
            />
          </Pressable>
        ))}
      </View>
    );
  };

  const handleCreateOffer = async () => {
    if (!job?._id) return;
    const offeredPriceNumber = Number(offeredPrice);

    if (!offeredPrice || Number.isNaN(offeredPriceNumber) || offeredPriceNumber <= 0) {
      Toast.show({ type: "error", text1: "Enter a valid offer price" });
      return;
    }

    const lowerLimit = job.userPrice - (job.userPrice * 20) / 100;
    const upperLimit = job.userPrice + (job.userPrice * 20) / 100;

    if (offeredPriceNumber < lowerLimit || offeredPriceNumber > upperLimit) {
      Toast.show({
        type: "error",
        text1: "Offer must be within ±20% of customer budget",
      });
      return;
    }

    try {
      setOfferSubmitting(true);
      await OfferApi.createOffer({
        jobId: job._id,
        offeredPrice: offeredPriceNumber,
      });
      setOfferedPrice("");
      Toast.show({ type: "success", text1: "Offer submitted" });
      fetchJob();
    } catch (err: unknown) {
      Toast.show({
        type: "error",
        text1:
          err instanceof AxiosError
            ? err.response?.data?.message || "Failed to submit offer"
            : "Failed to submit offer",
      });
    } finally {
      setOfferSubmitting(false);
    }
  };

  const handleCompleteJob = async () => {
    if (!job?._id) return;
    try {
      setCompletingJob(true);
      await JobApi.completeJobApi(job._id);
      Toast.show({ type: "success", text1: "Job marked as completed" });
      fetchJob();
    } catch (err: unknown) {
      Toast.show({
        type: "error",
        text1:
          err instanceof AxiosError
            ? err.response?.data?.message || "Failed to complete job"
            : "Failed to complete job",
      });
    } finally {
      setCompletingJob(false);
    }
  };

  const openLocation = async () => {
    if (!job?.locationURL) return;
    const canOpen = await Linking.canOpenURL(job.locationURL);
    if (canOpen) {
      Linking.openURL(job.locationURL);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-primary px-6 py-6">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 border border-border rounded-xl items-center justify-center active:bg-secondary"
        >
          <ArrowLeft size={20} color={colors.text} />
        </Pressable>

        <View className="flex-1 items-center justify-center">
          <Loader2 size={28} color={colors.accent} />
          <ActivityIndicator size="large" color={colors.accent} />
          <Text className="text-muted mt-3">Loading job details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !job) {
    return (
      <SafeAreaView className="flex-1 bg-primary px-6 py-6">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 border border-border rounded-xl items-center justify-center active:bg-secondary"
        >
          <ArrowLeft size={20} color={colors.text} />
        </Pressable>

        <View className="bg-red-50 border border-red-200 rounded-xl p-5 mt-6">
          <View className="flex-row items-start gap-3">
            <AlertCircle size={20} color="#DC2626" />
            <View className="flex-1">
              <Text className="text-red-900 text-base font-bold">Error Loading Job</Text>
              <Text className="text-red-700 mt-1">{error || "Job not found."}</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const acceptedProvider = acceptedOffer?.serviceProviderId as
    | { fullName?: string; email?: string; phoneNumber?: string }
    | undefined;

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-6 gap-5">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 border border-border rounded-xl items-center justify-center active:bg-secondary"
          >
            <ArrowLeft size={20} color={colors.text} />
          </Pressable>

          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-text">Job Details</Text>
              <Text className="text-muted mt-1">Complete information about this job</Text>
            </View>
            <View className={`rounded-full border px-3 py-1 ${getStatusStyles(job.jobStatus)}`}>
              <Text className="text-xs text-text capitalize">{job.jobStatus}</Text>
            </View>
          </View>

          <View className="bg-secondary border border-border rounded-2xl p-4">
            <Text className="text-xl font-bold text-text">{job.title}</Text>
            <View className="flex-row items-center gap-4 mt-2">
              <View className="flex-row items-center gap-1">
                <Calendar size={14} color={colors.muted} />
                <Text className="text-xs text-muted">
                  Posted {new Date(job.createdAt || "").toLocaleDateString()}
                </Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Tag size={14} color={colors.muted} />
                <Text className="text-xs text-muted">{job.jobCategory}</Text>
              </View>
            </View>
          </View>

          <View className="bg-secondary border border-border rounded-2xl p-4 gap-3">
            {job.images && job.images.length > 0 ? (
              <>
                <Image
                  source={{ uri: job.images[selectedImageIndex] }}
                  className="w-full h-60 rounded-xl"
                  resizeMode="cover"
                />

                {job.images.length > 1 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="flex-row gap-2">
                      {job.images.map((image, index) => (
                        <Pressable
                          key={`${image}-${index}`}
                          onPress={() => setSelectedImageIndex(index)}
                          className={`rounded-lg border-2 overflow-hidden ${
                            index === selectedImageIndex ? "border-accent" : "border-border"
                          }`}
                        >
                          <Image
                            source={{ uri: image }}
                            className="w-16 h-16"
                            resizeMode="cover"
                          />
                        </Pressable>
                      ))}
                    </View>
                  </ScrollView>
                )}
              </>
            ) : (
              <View className="h-56 items-center justify-center bg-primary rounded-xl border border-border">
                <FileText size={26} color={colors.muted} />
                <Text className="text-muted mt-2">No images available</Text>
              </View>
            )}
          </View>

          <View className="bg-secondary border border-border rounded-2xl p-4 gap-4">
            <View className="flex-row items-start gap-3">
              <DollarSign size={18} color={colors.accent} />
              <View>
                <Text className="text-xs text-muted">Price</Text>
                <Text className="text-2xl font-bold text-text">
                  Rs. {(job.jobStatus === "open" ? job.userPrice : job.finalPrice ?? job.userPrice)?.toLocaleString()}
                </Text>
              </View>
            </View>

            <View className="flex-row items-start gap-3">
              <Inbox size={18} color={colors.accent} />
              <View>
                <Text className="text-xs text-muted">Offers Received</Text>
                <Text className="text-lg font-semibold text-text">{job.offers?.length || 0}</Text>
              </View>
            </View>

            <View className="flex-row items-start gap-3">
              <MapPin size={18} color={colors.accent} />
              <View className="flex-1">
                <Text className="text-xs text-muted">Location</Text>
                {job.locationURL ? (
                  <Pressable onPress={openLocation} className="flex-row items-center gap-1 mt-1">
                    <Text className="text-accent">{job.location}</Text>
                    <ExternalLink size={12} color={colors.accent} />
                  </Pressable>
                ) : (
                  <Text className="text-text mt-1">{job.location || "Not specified"}</Text>
                )}
              </View>
            </View>
          </View>

          <View className="bg-secondary border border-border rounded-2xl p-4">
            <Text className="text-lg font-semibold text-text mb-2">Description</Text>
            <Text className="text-text leading-6">{job.description || "No description provided."}</Text>
          </View>

          {user?.role === "user" && (job.jobStatus === "open" || job.jobStatus === "in-progress") && (
            <Pressable
              className="bg-red-600 rounded-xl py-3 items-center active:opacity-90 disabled:opacity-60"
              disabled={cancelingJob}
              onPress={() => setShowCancelJobDialog(true)}
            >
              {cancelingJob ? (
                <View className="flex-row items-center gap-2">
                  <ActivityIndicator size="small" color="#fff" />
                  <Text className="text-white font-semibold">Cancelling...</Text>
                </View>
              ) : (
                <Text className="text-white font-semibold">Cancel Job</Text>
              )}
            </Pressable>
          )}

          {user?.role === "user" && job.jobStatus === "open" && (
            <View className="bg-secondary border border-border rounded-2xl p-4">
              <Text className="text-lg font-semibold text-text">Offers ({job.offers?.length || 0})</Text>
              <Text className="text-sm text-muted mt-1">Service providers interested in your job</Text>

              <View className="mt-4 gap-3">
                {job.offers && job.offers.length > 0 ? (
                  job.offers.map((offer) => {
                    const provider = offer.serviceProviderId as any;
                    return (
                      <View key={offer._id} className="bg-primary border border-border rounded-xl p-4">
                        <View className="flex-row items-start justify-between gap-2">
                          <View className="flex-1">
                            <Text className="text-base font-semibold text-text">{provider?.fullName || "Provider"}</Text>
                            <Text className="text-sm text-muted mt-1">
                              {provider?.providerCategory || "Service Provider"}
                            </Text>
                          </View>
                          <Text className="text-lg font-bold text-accent">
                            Rs. {offer.offeredPrice?.toLocaleString()}
                          </Text>
                        </View>

                        <View className="mt-3 gap-1">
                          <View className="flex-row items-center gap-2">
                            <Mail size={14} color={colors.muted} />
                            <Text className="text-sm text-text">{provider?.email || "N/A"}</Text>
                          </View>
                          <View className="flex-row items-center gap-2">
                            <Phone size={14} color={colors.muted} />
                            <Text className="text-sm text-text">{provider?.phoneNumber || "N/A"}</Text>
                          </View>
                        </View>

                        <Pressable
                          className="mt-4 bg-green-600 rounded-xl py-2.5 items-center"
                          onPress={() => {
                            setAcceptOfferId(offer?._id || "");
                            setShowOfferAcceptDialog(true);
                          }}
                        >
                          <Text className="text-white font-semibold">Accept Offer</Text>
                        </Pressable>
                      </View>
                    );
                  })
                ) : (
                  <Text className="text-sm text-muted mt-2">No offers yet.</Text>
                )}
              </View>
            </View>
          )}

          {user?.role === "serviceProvider" && job.jobStatus === "open" && !providerOffer && (
            <View className="bg-secondary border border-border rounded-2xl p-4 gap-3">
              <Text className="text-lg font-semibold text-text">Submit Your Offer</Text>
              <Text className="text-sm text-muted">Your offer must be within ±20% of customer budget.</Text>
              <TextInput
                value={offeredPrice}
                onChangeText={setOfferedPrice}
                keyboardType="numeric"
                className="border border-border rounded-xl px-3 py-3 text-text bg-primary"
                placeholder="Enter offered price"
                placeholderTextColor={colors.muted}
              />
              <Pressable
                onPress={handleCreateOffer}
                disabled={offerSubmitting}
                className="bg-accent rounded-xl py-3 items-center disabled:opacity-60"
              >
                <Text className="text-white font-semibold">
                  {offerSubmitting ? "Submitting..." : "Submit Offer"}
                </Text>
              </Pressable>
            </View>
          )}

          {user?.role === "serviceProvider" && providerOffer && (
            <View className="bg-secondary border border-border rounded-2xl p-4">
              <Text className="text-text font-semibold">Your Offer</Text>
              <Text className="text-accent text-xl font-bold mt-1">
                Rs. {providerOffer.offeredPrice?.toLocaleString()}
              </Text>
              <Text className="text-sm text-muted mt-1 capitalize">
                Status: {providerOffer.status || "pending"}
              </Text>
            </View>
          )}

          {(job.jobStatus === "in-progress" || job.jobStatus === "completed") && (
            <View className="bg-secondary border border-border rounded-2xl p-4">
              <Text className="text-lg font-semibold text-text mb-3">Job Progress</Text>

              <View className="flex-row items-center justify-between">
                <View className="items-center flex-1">
                  <View className="w-9 h-9 rounded-full bg-green-600 items-center justify-center">
                    <Check size={16} color="#FFFFFF" />
                  </View>
                  <Text className="text-xs text-text mt-2">Accepted</Text>
                </View>

                <View className="h-1 flex-1 bg-green-600 mx-2 rounded" />

                <View className="items-center flex-1">
                  <View
                    className={`w-9 h-9 rounded-full items-center justify-center ${
                      job.jobStatus === "completed" ? "bg-green-600" : "bg-blue-600"
                    }`}
                  >
                    {job.jobStatus === "completed" ? (
                      <Check size={16} color="#FFFFFF" />
                    ) : (
                      <Loader2 size={16} color="#FFF" className="animate-spin" />
                    )}
                  </View>
                  <Text className="text-xs text-text mt-2">In Progress</Text>
                </View>

                <View className={`h-1 flex-1 mx-2 rounded ${job.jobStatus === "completed" ? "bg-green-600" : "bg-border"}`} />

                <View className="items-center flex-1">
                  <View
                    className={`w-9 h-9 rounded-full items-center justify-center ${
                      job.jobStatus === "completed" ? "bg-green-600" : "bg-primary border border-border"
                    }`}
                  >
                    <Check size={16} color={job.jobStatus === "completed" ? "#FFFFFF" : colors.muted} />
                  </View>
                  <Text className="text-xs text-text mt-2">Completed</Text>
                </View>
              </View>
            </View>
          )}

          {user?.role === "user" && job.jobStatus === "completed" && acceptedProvider && (
            <View className="bg-secondary border border-border rounded-2xl p-4 gap-3">
              <Text className="text-lg font-semibold text-text">Leave a Review</Text>
              <Text className="text-sm text-muted">
                Share your experience with {acceptedProvider.fullName || "the provider"}.
              </Text>

              <View className="gap-2">
                <Text className="text-sm text-text font-semibold">Rating</Text>
                {renderReviewStars(reviewRating)}
              </View>

              <View className="gap-2">
                <Text className="text-sm text-text font-semibold">Comment (optional)</Text>
                <TextInput
                  value={reviewComment}
                  onChangeText={setReviewComment}
                  placeholder="Share details about the service"
                  placeholderTextColor={colors.muted}
                  className="border border-border rounded-xl px-3 py-3 text-text bg-primary min-h-[96px]"
                  multiline
                  textAlignVertical="top"
                />
              </View>

              <Pressable
                onPress={handleSubmitReview}
                disabled={reviewSubmitting || reviewSubmitted}
                className="bg-accent rounded-xl py-3 items-center disabled:opacity-60"
              >
                <Text className="text-white font-semibold">
                  {reviewSubmitted
                    ? "Review submitted"
                    : reviewSubmitting
                      ? "Submitting..."
                      : "Submit Review"}
                </Text>
              </Pressable>
            </View>
          )}

          {user?.role === "serviceProvider" && job.jobStatus === "completed" && isAcceptedProvider && (
            <View className="bg-secondary border border-border rounded-2xl p-4 gap-3">
              <Text className="text-lg font-semibold text-text">Leave a Review</Text>
              <Text className="text-sm text-muted">
                Share your experience with {(job.userId as any)?.fullName || "the client"}.
              </Text>

              <View className="gap-2">
                <Text className="text-sm text-text font-semibold">Rating</Text>
                {renderReviewStars(reviewRating)}
              </View>

              <View className="gap-2">
                <Text className="text-sm text-text font-semibold">Comment (optional)</Text>
                <TextInput
                  value={reviewComment}
                  onChangeText={setReviewComment}
                  placeholder="Share details about the client"
                  placeholderTextColor={colors.muted}
                  className="border border-border rounded-xl px-3 py-3 text-text bg-primary min-h-[96px]"
                  multiline
                  textAlignVertical="top"
                />
              </View>

              <Pressable
                onPress={handleSubmitReview}
                disabled={reviewSubmitting || reviewSubmitted}
                className="bg-accent rounded-xl py-3 items-center disabled:opacity-60"
              >
                <Text className="text-white font-semibold">
                  {reviewSubmitted
                    ? "Review submitted"
                    : reviewSubmitting
                      ? "Submitting..."
                      : "Submit Review"}
                </Text>
              </Pressable>
            </View>
          )}

          {user?.role === "serviceProvider" && job.jobStatus === "in-progress" && isAcceptedProvider && (
            <Pressable
              onPress={() => setShowCompleteJobDialog(true)}
              disabled={completingJob}
              className="bg-green-600 rounded-xl py-3 items-center disabled:opacity-60"
            >
              <Text className="text-white font-semibold">
                {completingJob ? "Completing..." : "Mark as Completed"}
              </Text>
            </Pressable>
          )}

          {user?.role === "serviceProvider" && (
            <View className="bg-secondary border border-border rounded-2xl p-4 mb-4">
              <Text className="text-lg font-semibold text-text">Customer</Text>
              <View className="mt-2 gap-2">
                <View className="flex-row items-center gap-2">
                  <User size={14} color={colors.muted} />
                  <Text className="text-text">{(job.userId as any)?.fullName || "User"}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Mail size={14} color={colors.muted} />
                  <Text className="text-text">{(job.userId as any)?.email || "N/A"}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Phone size={14} color={colors.muted} />
                  <Text className="text-text">{(job.userId as any)?.phoneNumber || "N/A"}</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal visible={showOfferAcceptDialog} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="bg-primary border border-border rounded-2xl p-5 w-full">
            <Text className="text-lg font-bold text-text">Accept this offer?</Text>
            <Text className="text-sm text-muted mt-1">
              This action cannot be undone.
            </Text>

            <View className="flex-row gap-3 mt-5">
              <Pressable
                className="flex-1 border border-border rounded-xl py-2.5 items-center"
                onPress={() => setShowOfferAcceptDialog(false)}
              >
                <Text className="text-text font-medium">Cancel</Text>
              </Pressable>
              <Pressable
                className="flex-1 bg-green-600 rounded-xl py-2.5 items-center disabled:opacity-60"
                disabled={acceptingOffer}
                onPress={() => handleOfferAccept(acceptOfferId)}
              >
                {acceptingOffer ? (
                  <View className="flex-row items-center gap-2">
                    <ActivityIndicator size="small" color="#fff" />
                    <Text className="text-white font-semibold">Accepting...</Text>
                  </View>
                ) : (
                  <Text className="text-white font-semibold">Accept</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showCancelJobDialog} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="bg-primary border border-border rounded-2xl p-5 w-full">
            <Text className="text-lg font-bold text-text">Cancel Job</Text>
            <Text className="text-sm text-muted mt-1">
              Are you sure you want to cancel this job?
            </Text>

            <View className="flex-row gap-3 mt-5">
              <Pressable
                className="flex-1 border border-border rounded-xl py-2.5 items-center"
                onPress={() => setShowCancelJobDialog(false)}
              >
                <Text className="text-text font-medium">No</Text>
              </Pressable>
              <Pressable
                className="flex-1 bg-red-600 rounded-xl py-2.5 items-center disabled:opacity-60"
                disabled={cancelingJob}
                onPress={async () => {
                  await handleCancelJob(job._id || "");
                  setShowCancelJobDialog(false);
                }}
              >
                {cancelingJob ? (
                  <View className="flex-row items-center gap-2">
                    <ActivityIndicator size="small" color="#fff" />
                    <Text className="text-white font-semibold">Cancelling...</Text>
                  </View>
                ) : (
                  <Text className="text-white font-semibold">Yes, Cancel</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showCompleteJobDialog} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="bg-primary border border-border rounded-2xl p-5 w-full">
            <Text className="text-lg font-bold text-text">Mark job as completed?</Text>
            <Text className="text-sm text-muted mt-1">
              Confirm that all work is done before continuing.
            </Text>

            <View className="flex-row gap-3 mt-5">
              <Pressable
                className="flex-1 border border-border rounded-xl py-2.5 items-center"
                onPress={() => setShowCompleteJobDialog(false)}
              >
                <Text className="text-text font-medium">Cancel</Text>
              </Pressable>
              <Pressable
                className="flex-1 bg-green-600 rounded-xl py-2.5 items-center disabled:opacity-60"
                disabled={completingJob}
                onPress={async () => {
                  await handleCompleteJob();
                  setShowCompleteJobDialog(false);
                }}
              >
                {completingJob ? (
                  <View className="flex-row items-center gap-2">
                    <ActivityIndicator size="small" color="#fff" />
                    <Text className="text-white font-semibold">Completing...</Text>
                  </View>
                ) : (
                  <Text className="text-white font-semibold">Yes, complete</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
