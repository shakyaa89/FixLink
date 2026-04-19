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
import { useFocusEffect } from "@react-navigation/native";
import {
  BriefcaseBusiness,
  Home,
  PlusCircle,
} from "lucide-react-native";
import colors from "@/app/_constants/theme";
import { JobApi, type JobData } from "@/api/Apis";
import { useAuthStore } from "@/store/authStore";

// Shows quick stats and actions for normal users.
export default function UserDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Loads jobs posted by this user.
  const fetchJobs = useCallback(async () => {
    if (!user || user.role !== "user") {
      setJobs([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }
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

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useFocusEffect(
    useCallback(() => {
      // Refresh when returning to this tab after creating/updating a job.
      fetchJobs();
    }, [fetchJobs])
  );

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
          <View className="flex-row items-center justify-between">
            <View className="gap-1">
              <Text className="text-sm text-muted font-medium">Hello,</Text>
              <Text className="text-2xl font-bold text-text">{firstName}</Text>
            </View>
            <View className="w-12 h-12 bg-accent rounded-2xl items-center justify-center">
              <Home size={24} color="white" />
            </View>
          </View>

          <View className="gap-3">
            {loading ? (
              <View className="bg-secondary border border-border rounded-2xl p-5 items-center justify-center">
                <ActivityIndicator color={colors.accent} />
                <Text className="text-muted text-sm mt-2">Loading dashboard stats...</Text>
              </View>
            ) : (
              <>
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
              </>
            )}
          </View>

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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
