import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { ArrowLeft, AlertCircle, ChevronDown, AlertTriangle } from "lucide-react-native";
import colors from "@/app/_constants/theme";
import { useAuthStore } from "@/store/authStore";
import Toast from "react-native-toast-message";
import { AuthApi, DisputeApi } from "@/api/Apis";
import { Picker } from "@react-native-picker/picker";

interface Dispute {
  _id: string;
  jobId: { _id?: string; title?: string } | string;
  title: string;
  description: string;
  status: "open" | "resolved";
  priority: "low" | "medium" | "high";
  reportedBy?: string;
  createdAt?: string;
}

export default function ReportDisputeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobsResponse, disputesResponse] = await Promise.all([
        DisputeApi.getDisputableJobs(),
        DisputeApi.getMyDisputes(),
      ]);
      if (jobsResponse.data.jobs) {
        setJobs(jobsResponse.data.jobs);
      }
      if (disputesResponse.data.disputes) {
        setDisputes(disputesResponse.data.disputes);
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to load data",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDispute = async () => {
    if (!selectedJobId.trim()) {
      Toast.show({
        type: "error",
        text1: "Please select a job",
      });
      return;
    }

    if (!title.trim()) {
      Toast.show({
        type: "error",
        text1: "Please enter a dispute title",
      });
      return;
    }

    if (!description.trim()) {
      Toast.show({
        type: "error",
        text1: "Please enter a description",
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await DisputeApi.createDispute({
        jobId: selectedJobId,
        title: title.trim(),
        description: description.trim(),
        priority,
      });

      Toast.show({
        type: "success",
        text1: response?.data?.message || "Dispute reported successfully",
      });

      setSelectedJobId("");
      setTitle("");
      setDescription("");
      setPriority("medium");
      fetchData();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to report dispute",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return colors.danger;
      case "medium":
        return colors.accent;
      case "low":
        return "#10b981";
      default:
        return colors.muted;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    return status === "resolved" ? "#10b981" : colors.accent;
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-primary items-center justify-center">
        <ActivityIndicator size="large" color={colors.accent} />
      </SafeAreaView>
    );
  }

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
              <Text className="text-2xl font-bold text-text">Report Dispute</Text>
              <Text className="text-sm text-muted">Report an issue with a job</Text>
            </View>
          </View>

          <View className="bg-secondary border border-border rounded-2xl px-4 py-3.5 flex-row gap-2">
            <AlertCircle size={18} color={colors.accent} />
            <Text className="text-sm text-muted flex-1">
              Please provide details about the disputed job to help us resolve the issue quickly.
            </Text>
          </View>

          <View className="gap-4">
            <View className="gap-2">
              <Text className="text-sm text-text font-semibold">Select Job *</Text>
              <View className="border border-border rounded-xl px-1 bg-primary">
                <Picker
                  selectedValue={selectedJobId}
                  onValueChange={(itemValue) => setSelectedJobId(itemValue)}
                  style={{ color: colors.text }}
                  dropdownIconColor={colors.muted}
                >
                  <Picker.Item label="Choose a job" value="" color={colors.muted} />
                  {jobs.map((job) => (
                    <Picker.Item
                      key={job._id}
                      label={job.title}
                      value={job._id}
                    />
                  ))}
                </Picker>
              </View>
              {jobs.length === 0 && !loading && (
                <Text className="text-xs text-muted">
                  No disputable jobs found. Complete or accept jobs to report disputes.
                </Text>
              )}
            </View>

            <View className="gap-2">
              <Text className="text-sm text-text font-semibold">Dispute Title *</Text>
              <TextInput
                className="text-base text-text border border-border rounded-xl px-3 py-2.5 bg-primary"
                placeholder="e.g., Service not completed"
                placeholderTextColor={colors.muted}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View className="gap-2">
              <Text className="text-sm text-text font-semibold">Description *</Text>
              <TextInput
                className="text-base text-text border border-border rounded-xl px-3 py-2.5 min-h-[120px] bg-primary"
                placeholder="Describe the issue in detail..."
                placeholderTextColor={colors.muted}
                multiline
                textAlignVertical="top"
                value={description}
                onChangeText={setDescription}
              />
            </View>

            <View className="gap-2">
              <Text className="text-sm text-text font-semibold">Priority</Text>
              <View className="border border-border rounded-xl px-1 bg-primary">
                <Picker
                  selectedValue={priority}
                  onValueChange={(itemValue) => setPriority(itemValue)}
                  style={{ color: colors.text }}
                  dropdownIconColor={colors.muted}
                >
                  <Picker.Item label="Low" value="low" />
                  <Picker.Item label="Medium" value="medium" />
                  <Picker.Item label="High" value="high" />
                </Picker>
              </View>
            </View>

            <Pressable
              className="bg-accent rounded-2xl px-4 py-3.5 mt-4 flex-row items-center justify-center gap-2 active:opacity-90"
              disabled={submitting}
              onPress={handleSubmitDispute}
            >
              {submitting && <ActivityIndicator size="small" color="white" />}
              <Text className="text-white font-semibold">
                {submitting ? "Reporting..." : "Report Dispute"}
              </Text>
            </Pressable>
          </View>

          {/* My Disputes Section */}
          <View className="gap-3 mt-8">
            <View className="flex-row items-center gap-2">
              <AlertTriangle size={20} color={colors.accent} />
              <Text className="text-lg font-semibold text-text">Your Disputes</Text>
            </View>

            {disputes.length > 0 ? (
              <View className="gap-3">
                {disputes.map((dispute) => {
                  const jobTitle =
                    typeof dispute.jobId === "string"
                      ? "Job"
                      : dispute.jobId?.title || "Job";
                  const date = dispute.createdAt
                    ? new Date(dispute.createdAt).toLocaleDateString()
                    : "Unknown date";

                  return (
                    <View
                      key={dispute._id}
                      className="bg-secondary border border-border rounded-2xl px-4 py-4 gap-3"
                    >
                      <View className="flex-row items-start justify-between gap-2">
                        <View className="flex-1">
                          <Text className="text-base font-semibold text-text" numberOfLines={1}>
                            {dispute.title}
                          </Text>
                          <Text className="text-sm text-muted mt-1">{jobTitle}</Text>
                        </View>
                        <View className="flex-row gap-2 items-center">
                          <View
                            className="px-2 py-1 rounded-lg"
                            style={{
                              backgroundColor: getStatusBadgeColor(dispute.status),
                              opacity: 0.2,
                            }}
                          >
                            <Text
                              className="text-xs font-semibold capitalize"
                              style={{ color: getStatusBadgeColor(dispute.status) }}
                            >
                              {dispute.status}
                            </Text>
                          </View>
                          <View
                            className="px-2 py-1 rounded-lg"
                            style={{
                              backgroundColor: getPriorityColor(dispute.priority),
                              opacity: 0.2,
                            }}
                          >
                            <Text
                              className="text-xs font-semibold capitalize"
                              style={{ color: getPriorityColor(dispute.priority) }}
                            >
                              {dispute.priority}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {dispute.description && (
                        <Text className="text-sm text-text leading-5">
                          {dispute.description}
                        </Text>
                      )}

                      <Text className="text-xs text-muted">{date}</Text>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View className="bg-secondary border border-border rounded-2xl px-4 py-4">
                <Text className="text-sm text-muted text-center">
                  No disputes reported yet. Report an issue if you encounter problems with a job.
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
