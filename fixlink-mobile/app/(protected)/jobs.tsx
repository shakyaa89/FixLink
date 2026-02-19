import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, BriefcaseBusiness, Calendar, MapPin } from "lucide-react-native";
import colors from "../_constants/theme";
import { JobApi, type JobData } from "@/api/Apis";
import { useAuthStore } from "@/store/authStore";
import { useCallback, useEffect, useMemo, useState } from "react";

function Jobs() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const role = user?.role;

  const screenMeta = useMemo(() => {
    if (role === "serviceProvider") {
      return {
        title: "Available Jobs",
        subtitle: `Jobs in ${user?.providerCategory || "your category"}`,
      };
    }

    if (role === "user") {
      return {
        title: "My Jobs",
        subtitle: "View and manage your posted jobs",
      };
    }

    if (role === "admin") {
      return {
        title: "All Jobs",
        subtitle: "Review all jobs in the platform",
      };
    }

    return {
      title: "Jobs",
      subtitle: "Sign in to view role-based jobs",
    };
  }, [role, user?.providerCategory]);

  const getStatusStyles = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "open":
      case "pending":
        return "bg-green-100 border-green-200";
      case "in-progress":
        return "bg-blue-100 border-blue-200";
      case "completed":
        return "bg-indigo-100 border-indigo-200";
      case "closed":
        return "bg-red-100 border-red-200";
      default:
        return "bg-secondary border-border";
    }
  };

  const fetchJobs = useCallback(async () => {
    if (!user) {
      setJobs([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setError(null);

      let response;
      if (user.role === "serviceProvider") {
        const category = user.providerCategory || "";
        response = await JobApi.fetchProviderJobsApi(category);
      } else if (user.role === "user") {
        response = await JobApi.fetchUserJobsApi();
      } else {
        response = await JobApi.fetchAllJobsApi();
      }

      setJobs(response?.data?.jobs || []);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Failed to load jobs. Please try again.");
      setJobs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    fetchJobs();
  }, [fetchJobs]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchJobs();
  };


  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="px-6 py-6 gap-6">
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 border border-border rounded-xl items-center justify-center active:bg-secondary"
            >
              <ArrowLeft size={20} color={colors.text} />
            </Pressable>
            <View className="gap-1">
              <Text className="text-2xl font-bold text-text">{screenMeta.title}</Text>
              <Text className="text-sm text-muted">{screenMeta.subtitle}</Text>
            </View>
          </View>

          {role === "user" && (
            <Pressable
              onPress={() => router.push("/user/create-job")}
              className="bg-accent rounded-xl py-3 items-center"
            >
              <Text className="text-white text-sm font-semibold">Create Job</Text>
            </Pressable>
          )}

          <View className="gap-4">
            {loading && (
              <View className="py-12 items-center justify-center">
                <ActivityIndicator size="large" color={colors.accent} />
                <Text className="text-sm text-muted mt-3">Loading jobs...</Text>
              </View>
            )}

            {!loading && error && (
              <View className="border border-red-200 rounded-2xl p-4 bg-red-50">
                <Text className="text-red-700 font-semibold">{error}</Text>
                <Pressable
                  className="mt-3 bg-red-600 rounded-xl py-2.5 items-center"
                  onPress={() => {
                    setLoading(true);
                    fetchJobs();
                  }}
                >
                  <Text className="text-white text-sm font-semibold">Retry</Text>
                </Pressable>
              </View>
            )}

            {!loading && !error && jobs.length === 0 && (
              <View className="border border-border rounded-2xl p-6 bg-secondary">
                <Text className="text-base font-semibold text-text">No jobs found</Text>
                <Text className="text-sm text-muted mt-1">
                  {role === "serviceProvider"
                    ? "No jobs available for your category right now."
                    : role === "user"
                      ? "You haven’t posted any jobs yet."
                      : "No jobs are available right now."}
                </Text>
              </View>
            )}

            {jobs.map((job) => {
              return (
                <View
                  key={job._id}
                  className="border border-border rounded-2xl p-4 bg-secondary"
                >
                  <View className="flex-row items-center gap-3">
                    <View className="w-12 h-12 rounded-xl bg-accent/10 items-center justify-center">
                      <BriefcaseBusiness size={22} color={colors.accent} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-text">
                        {job.title}
                      </Text>
                      <Text className="text-sm text-muted">
                        {job.jobCategory}
                      </Text>
                    </View>
                    <Text className="text-base font-semibold text-accent">
                      Rs. {(job.jobStatus === "open" ? job.userPrice : job.finalPrice ?? job.userPrice)?.toLocaleString()}
                    </Text>
                  </View>

                  <Text className="text-sm text-muted mt-3">
                    {job.description}
                  </Text>

                  <View className="flex-row items-center gap-4 mt-4">
                    <View className="flex-row items-center gap-2">
                      <MapPin size={16} color={colors.muted} />
                      <Text className="text-sm text-muted">{job.location}</Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <Calendar size={16} color={colors.muted} />
                      <Text className="text-sm text-muted">
                        {job.createdAt
                          ? new Date(job.createdAt).toLocaleDateString()
                          : "N/A"}
                      </Text>
                    </View>
                  </View>

                  <View
                    className={`mt-3 self-start rounded-full border px-3 py-1 ${getStatusStyles(job.jobStatus)}`}
                  >
                    <Text className="text-xs text-text capitalize">{job.jobStatus || "unknown"}</Text>
                  </View>

                  <Pressable
                    className="mt-4 bg-accent rounded-xl py-3 items-center active:opacity-90"
                    onPress={() => {
                      if (!job._id) return;
                      router.push({
                        pathname: "/job-details/[jobId]",
                        params: { jobId: job._id },
                      });
                    }}
                  >
                    <Text className="text-white text-sm font-semibold">
                      View Details
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default Jobs;
