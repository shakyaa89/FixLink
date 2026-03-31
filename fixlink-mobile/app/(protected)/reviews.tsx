import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { ArrowLeft, Star } from "lucide-react-native";
import colors from "@/app/_constants/theme";
import { useAuthStore } from "@/store/authStore";
import Toast from "react-native-toast-message";
import { ReviewApi } from "@/api/Apis";

interface Review {
  _id: string;
  jobId: { _id?: string; title?: string } | string;
  reviewerId?: any;
  revieweeId?: any;
  rating: number;
  comment?: string;
  createdAt?: string;
}

export default function ReviewsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [receivedReviews, setReceivedReviews] = useState<Review[]>([]);
  const [sentReviews, setSentReviews] = useState<Review[]>([]);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await ReviewApi.fetchMyReceivedReviews();
      if (response.data.reviews) {
        setReceivedReviews(response.data.reviews);
      }
      
      const sentResponse = await ReviewApi.fetchMyReviews();
      if (sentResponse.data.reviews) {
        setSentReviews(sentResponse.data.reviews);
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to load reviews",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <View className="flex-row gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            color={star <= rating ? colors.accent : colors.border}
            fill={star <= rating ? colors.accent : "transparent"}
          />
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-primary items-center justify-center">
        <ActivityIndicator size="large" color={colors.accent} />
      </SafeAreaView>
    );
  }

  const hasReceivedReviews = receivedReviews.length > 0;
  const hasSentReviews = sentReviews.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-6 gap-6">
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 border border-border rounded-xl items-center justify-center active:bg-secondary"
            >
              <ArrowLeft size={20} color={colors.text} />
            </Pressable>
            <View className="gap-1">
              <Text className="text-2xl font-bold text-text">Reviews</Text>
              <Text className="text-sm text-muted">View your reviews</Text>
            </View>
          </View>

          {/* Received Reviews Section */}
          <View className="gap-3">
            <View className="flex-row items-center gap-2">
              <Star size={20} color={colors.accent} />
              <Text className="text-lg font-semibold text-text">Reviews You Received</Text>
            </View>

            {hasReceivedReviews ? (
              <View className="gap-3">
                {receivedReviews.map((review) => {
                  const reviewer = review.reviewerId;
                  const jobTitle = typeof review.jobId === "string" ? "Job" : review.jobId?.title || "Job";
                  const date = review.createdAt
                    ? new Date(review.createdAt).toLocaleDateString()
                    : "Unknown date";

                  return (
                    <View key={review._id} className="bg-secondary border border-border rounded-2xl px-4 py-4 gap-3">
                      <View className="flex-row items-start justify-between gap-3">
                        <View className="flex-1">
                          <Text className="text-base font-semibold text-text" numberOfLines={1}>
                            {reviewer?.fullName || "Anonymous"}
                          </Text>
                          <Text className="text-sm text-muted mt-1">{jobTitle}</Text>
                        </View>
                        <View className="items-end">
                          {renderStars(review.rating)}
                          <Text className="text-xs text-muted mt-1">{date}</Text>
                        </View>
                      </View>

                      {review.comment && (
                        <Text className="text-sm text-text leading-5">{review.comment}</Text>
                      )}
                    </View>
                  );
                })}
              </View>
            ) : (
              <View className="bg-secondary border border-border rounded-2xl px-4 py-4">
                <Text className="text-sm text-muted text-center">
                  No reviews received yet. Completed jobs will allow customers to leave reviews.
                </Text>
              </View>
            )}
          </View>

          {/* Sent Reviews Section */}
          <View className="gap-3">
            <View className="flex-row items-center gap-2">
              <Star size={20} color={colors.accent} />
              <Text className="text-lg font-semibold text-text">Reviews You Sent</Text>
            </View>

            {hasSentReviews ? (
              <View className="gap-3">
                {sentReviews.map((review) => {
                  const reviewer = review.revieweeId;
                  const jobTitle = typeof review.jobId === "string" ? "Job" : review.jobId?.title || "Job";
                  const date = review.createdAt
                    ? new Date(review.createdAt).toLocaleDateString()
                    : "Unknown date";

                  return (
                    <View key={review._id} className="bg-secondary border border-border rounded-2xl px-4 py-4 gap-3">
                      <View className="flex-row items-start justify-between gap-3">
                        <View className="flex-1">
                          <Text className="text-base font-semibold text-text" numberOfLines={1}>
                            {reviewer?.fullName || "Anonymous"}
                          </Text>
                          <Text className="text-sm text-muted mt-1">{jobTitle}</Text>
                        </View>
                        <View className="items-end">
                          {renderStars(review.rating)}
                          <Text className="text-xs text-muted mt-1">{date}</Text>
                        </View>
                      </View>

                      {review.comment && (
                        <Text className="text-sm text-text leading-5">{review.comment}</Text>
                      )}
                    </View>
                  );
                })}
              </View>
            ) : (
              <View className="bg-secondary border border-border rounded-2xl px-4 py-4">
                <Text className="text-sm text-muted text-center">
                  No reviews sent yet. Complete jobs to leave reviews for service providers.
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
