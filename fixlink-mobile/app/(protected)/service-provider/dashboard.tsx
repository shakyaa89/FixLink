import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  AlertCircle,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  RefreshCcw,
  Wrench,
} from "lucide-react-native";
import colors from "@/app/_constants/theme";
import { JobApi, type JobData } from "@/api/Apis";
import { useAuthStore } from "@/store/authStore";

export default function ProviderDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchJobs = useCallback(async () => {
    if (!user || user.role !== "serviceProvider") return;
    try {
      const category = user.providerCategory || "";
      const response = await JobApi.fetchProviderJobsApi(category);
      setJobs(response?.data?.jobs || []);
    } catch (error) {
      console.error("Error fetching provider jobs:", error);
      setJobs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      router.replace("/public/login");
      return;
    }

    if (user.role !== "serviceProvider") {
      if (user.role === "user") {
        router.replace("/user/dashboard");
      } else {
        router.replace("/jobs");
      }
      return;
    }

    setLoading(true);
    fetchJobs();
  }, [user, fetchJobs, router]);

  const stats = useMemo(() => {
    const total = jobs.length;
    const available = jobs.filter(
      (job) => job.jobStatus === "open" || job.jobStatus === "pending"
    ).length;
    const inProgress = jobs.filter((job) => job.jobStatus === "in-progress").length;
    const completed = jobs.filter((job) => job.jobStatus === "completed").length;
    return { total, available, inProgress, completed };
  }, [jobs]);

  const verificationStatus = (user?.verificationStatus || "pending") as
    | "pending"
    | "verified"
    | "rejected"
    | "";

  const statusLabel =
    verificationStatus === "verified"
      ? "Verified"
      : verificationStatus === "rejected"
        ? "Rejected"
        : "Pending Review";

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchJobs();
            }}
          />
        }
      >
        <View className="px-6 py-6 gap-5">
          <View>
            <Text className="text-3xl font-bold text-text">Provider Dashboard</Text>
            <Text className="text-sm text-muted mt-1">
              Browse and manage jobs in {user?.providerCategory || "your category"}
            </Text>
          </View>

          <View className="bg-secondary border border-border rounded-2xl p-4">
            <View className="flex-row items-center gap-2">
              <AlertCircle size={16} color={colors.muted} />
              <Text className="text-xs text-muted">Verification Status</Text>
            </View>
            <Text className="text-base font-semibold text-text mt-1">{statusLabel}</Text>
            {verificationStatus === "rejected" && Boolean(user?.rejectionReason) && (
              <Text className="text-sm text-muted mt-2">{user?.rejectionReason}</Text>
            )}
            {verificationStatus === "rejected" && (
              <Pressable
                className="mt-3 bg-accent rounded-xl py-2.5 items-center"
                onPress={() => router.push("/service-provider/complete-profile")}
              >
                <Text className="text-white text-sm font-semibold">Reupload verification proof</Text>
              </Pressable>
            )}
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1 bg-secondary border border-border rounded-2xl p-4">
              <Text className="text-xs text-muted">Total</Text>
              <Text className="text-2xl font-bold text-text mt-1">{stats.total}</Text>
            </View>
            <View className="flex-1 bg-secondary border border-border rounded-2xl p-4">
              <Text className="text-xs text-muted">Available</Text>
              <Text className="text-2xl font-bold text-text mt-1">{stats.available}</Text>
            </View>
            <View className="flex-1 bg-secondary border border-border rounded-2xl p-4">
              <Text className="text-xs text-muted">In Progress</Text>
              <Text className="text-2xl font-bold text-text mt-1">{stats.inProgress}</Text>
            </View>
          </View>

          <View className="bg-secondary border border-border rounded-2xl p-4">
            <Text className="text-xs text-muted">Completed</Text>
            <Text className="text-2xl font-bold text-text mt-1">{stats.completed}</Text>
          </View>

          <Pressable
            className="bg-accent rounded-xl py-3.5 items-center"
            onPress={() => router.push("/jobs")}
          >
            <View className="flex-row items-center gap-2">
              <BriefcaseBusiness size={18} color="#fff" />
              <Text className="text-white font-semibold">View Available Jobs</Text>
            </View>
          </Pressable>

          <View className="bg-secondary border border-border rounded-2xl p-4">
            <Text className="text-lg font-semibold text-text mb-3">Recent Matches</Text>

            {loading ? (
              <View className="py-8 items-center">
                <ActivityIndicator color={colors.accent} />
                <Text className="text-muted text-sm mt-2">Loading jobs...</Text>
              </View>
            ) : jobs.length === 0 ? (
              <Text className="text-muted">No jobs available in your category yet.</Text>
            ) : (
              <View className="gap-3">
                {jobs.slice(0, 5).map((job) => (
                  <Pressable
                    key={job._id}
                    className="bg-primary border border-border rounded-xl p-3"
                    onPress={() => {
                      if (!job._id) return;
                      router.push({
                        pathname: "/job-details/[jobId]",
                        params: { jobId: job._id },
                      });
                    }}
                  >
                    <Text className="text-text font-semibold">{job.title}</Text>
                    <Text className="text-muted text-xs mt-1">{job.location}</Text>
                    <View className="flex-row items-center gap-2 mt-2">
                      {job.jobStatus === "completed" ? (
                        <CheckCircle2 size={14} color="#16A34A" />
                      ) : job.jobStatus === "in-progress" ? (
                        <Clock3 size={14} color="#2563EB" />
                      ) : (
                        <Wrench size={14} color={colors.muted} />
                      )}
                      <Text className="text-xs text-muted capitalize">
                        {job.jobStatus || "unknown"}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          <Pressable
            className="flex-row items-center justify-center gap-2 py-3"
            onPress={() => {
              setRefreshing(true);
              fetchJobs();
            }}
          >
            <RefreshCcw size={16} color={colors.muted} />
            <Text className="text-muted">Refresh</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
