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
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Home,
  MapPin,
  PlusCircle,
  TrendingUp,
  XCircle,
} from "lucide-react-native";
import colors from "@/app/_constants/theme";
import { JobApi, type JobData } from "@/api/Apis";
import { useAuthStore } from "@/store/authStore";

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: typeof CheckCircle2 }
> = {
  completed: {
    label: "Completed",
    color: "#16A34A",
    bg: "#DCFCE7",
    icon: CheckCircle2,
  },
  "in-progress": {
    label: "In Progress",
    color: "#D97706",
    bg: "#FEF3C7",
    icon: TrendingUp,
  },
  open: {
    label: "Open",
    color: "#2563EB",
    bg: "#DBEAFE",
    icon: Clock3,
  },
  pending: {
    label: "Pending",
    color: "#9CA3AF",
    bg: "#F3F4F6",
    icon: Clock3,
  },
  cancelled: {
    label: "Cancelled",
    color: "#DC2626",
    bg: "#FEE2E2",
    icon: XCircle,
  },
};

export default function UserDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchJobs = useCallback(async () => {
    if (!user || user.role !== "user") return;
    try {
      const response = await JobApi.fetchUserJobsApi();
      setJobs(response?.data?.jobs || []);
    } catch (error) {
      console.error("Error fetching user jobs:", error);
      setJobs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  const stats = useMemo(() => {
    const total = jobs.length;
    const active = jobs.filter(
      (j) =>
        j.jobStatus === "open" ||
        j.jobStatus === "in-progress" ||
        j.jobStatus === "pending"
    ).length;
    const completed = jobs.filter((j) => j.jobStatus === "completed").length;
    const inProgress = jobs.filter((j) => j.jobStatus === "in-progress").length;
    return { total, active, completed, inProgress };
  }, [jobs]);

  const firstName = user?.fullName?.split(" ")[0] ?? "there";
  const recentJobs = jobs.slice(0, 5);

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchJobs();
            }}
            tintColor={colors.accent}
          />
        }
      >
        <View className="px-6 pt-6 pb-10 gap-7">

          {/* Header */}
          <View className="flex-row items-center justify-between">
            <View className="gap-1">
              <Text className="text-sm text-muted font-medium">Hello,</Text>
              <Text className="text-2xl font-bold text-text">{firstName}</Text>
            </View>
            <View className="w-12 h-12 bg-accent rounded-2xl items-center justify-center">
              <Home size={24} color="white" />
            </View>
          </View>

          {/* Stats Row */}
          <View className="gap-3">
            <View className="flex-row gap-3">
              <View className="flex-1 bg-accent rounded-2xl p-4 gap-1">
                <Text className="text-white/70 text-xs font-medium">Total Jobs</Text>
                <Text className="text-white text-3xl font-bold">{stats.total}</Text>
                <Text className="text-white/60 text-xs">All time</Text>
              </View>
              <View className="flex-1 bg-secondary border border-border rounded-2xl p-4 gap-1">
                <Text className="text-muted text-xs font-medium">Active</Text>
                <Text className="text-text text-3xl font-bold">{stats.active}</Text>
                <Text className="text-muted text-xs">In queue</Text>
              </View>
            </View>
            <View className="flex-row gap-3">
              <View className="flex-1 bg-secondary border border-border rounded-2xl p-4 gap-1">
                <Text className="text-muted text-xs font-medium">In Progress</Text>
                <Text className="text-text text-3xl font-bold">{stats.inProgress}</Text>
                <Text className="text-muted text-xs">Being worked on</Text>
              </View>
              <View className="flex-1 bg-secondary border border-border rounded-2xl p-4 gap-1">
                <Text className="text-muted text-xs font-medium">Completed</Text>
                <Text className="text-text text-3xl font-bold">{stats.completed}</Text>
                <Text className="text-muted text-xs">Finished</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View className="gap-3">
            <Text className="text-base font-semibold text-text">Quick Actions</Text>
            <Pressable
              className="bg-accent rounded-2xl px-5 py-4 flex-row items-center justify-between active:opacity-90"
              onPress={() => router.push("/user/create-job")}
            >
              <View className="gap-1">
                <Text className="text-white font-bold text-base">Post a New Job</Text>
                <Text className="text-white/70 text-sm">Find a service provider fast</Text>
              </View>
              <View className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center">
                <PlusCircle size={22} color="white" />
              </View>
            </Pressable>

            <Pressable
              className="bg-secondary border border-border rounded-2xl px-5 py-4 flex-row items-center justify-between active:opacity-80"
              onPress={() => router.push("/jobs")}
            >
              <View className="gap-1">
                <Text className="text-text font-bold text-base">Browse My Jobs</Text>
                <Text className="text-muted text-sm">Track status and updates</Text>
              </View>
              <View className="w-10 h-10 bg-border rounded-xl items-center justify-center">
                <BriefcaseBusiness size={22} color={colors.text} />
              </View>
            </Pressable>
          </View>

          {/* Recent Jobs */}
          <View className="gap-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-semibold text-text">Recent Jobs</Text>
              <Pressable
                className="flex-row items-center gap-1"
                onPress={() => router.push("/jobs")}
              >
                <Text className="text-sm text-accent font-medium">See all</Text>
                <ChevronRight size={16} color={colors.accent} />
              </Pressable>
            </View>

            {loading ? (
              <View className="bg-secondary border border-border rounded-2xl py-12 items-center gap-3">
                <ActivityIndicator color={colors.accent} />
                <Text className="text-muted text-sm">Loading your jobs...</Text>
              </View>
            ) : recentJobs.length === 0 ? (
              <View className="bg-secondary border border-border rounded-2xl p-8 items-center gap-3">
                <View className="w-14 h-14 bg-border rounded-2xl items-center justify-center">
                  <BriefcaseBusiness size={28} color={colors.muted} />
                </View>
                <View className="items-center gap-1">
                  <Text className="text-text font-semibold">No jobs yet</Text>
                  <Text className="text-muted text-sm text-center">
                    Post your first job to get started
                  </Text>
                </View>
                <Pressable
                  className="bg-accent rounded-xl px-5 py-2.5 mt-1 active:opacity-90"
                  onPress={() => router.push("/user/create-job")}
                >
                  <Text className="text-white font-semibold text-sm">Post a Job</Text>
                </Pressable>
              </View>
            ) : (
              <View className="gap-3">
                {recentJobs.map((job) => {
                  const status = STATUS_CONFIG[job.jobStatus ?? "pending"] ?? STATUS_CONFIG.pending;
                  const StatusIcon = status.icon;

                  return (
                    <Pressable
                      key={job._id}
                      className="bg-secondary border border-border rounded-2xl p-4 gap-3 active:opacity-80"
                      onPress={() => {
                        if (!job._id) return;
                        router.push({
                          pathname: "/job-details/[jobId]",
                          params: { jobId: job._id },
                        });
                      }}
                    >
                      <View className="flex-row items-start justify-between gap-3">
                        <View className="flex-1 gap-1">
                          <Text className="text-text font-semibold text-base" numberOfLines={1}>
                            {job.title}
                          </Text>
                          <View className="flex-row items-center gap-1">
                            <MapPin size={13} color={colors.muted} />
                            <Text className="text-muted text-xs" numberOfLines={1}>
                              {job.jobCategory}
                            </Text>
                          </View>
                        </View>
                        <View
                          className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full"
                          style={{ backgroundColor: status.bg }}
                        >
                          <StatusIcon size={13} color={status.color} />
                          <Text
                            className="text-xs font-semibold"
                            style={{ color: status.color }}
                          >
                            {status.label}
                          </Text>
                        </View>
                      </View>

                      <View className="h-px bg-border" />

                      <View className="flex-row items-center justify-between">
                        <Text className="text-xs text-muted">Tap to view details</Text>
                        <ChevronRight size={16} color={colors.muted} />
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}