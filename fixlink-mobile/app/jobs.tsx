import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Calendar, MapPin, Wrench, Zap, Droplet } from "lucide-react-native";
import colors from "./_constants/theme";

const filters = [
  "All",
  "Plumbing",
  "Electrical",
  "Carpentry",
  "Painting",
  "Landscaping",
  "General Repairs",
];

const jobs = [
  {
    _id: "job-1",
    userId: "user-1",
    offers: [],
    title: "Fix leaking kitchen sink",
    jobCategory: "Plumbing",
    description: "Replace gasket and seal the drain properly.",
    userPrice: 65,
    finalPrice: "",
    location: "Downtown",
    locationURL: "",
    images: [],
    jobStatus: "open",
    createdAt: "2026-02-15T09:00:00.000Z",
    updatedAt: "2026-02-15T09:00:00.000Z",
    icon: Droplet,
  },
  {
    _id: "job-2",
    userId: "user-2",
    offers: [],
    title: "Replace ceiling light",
    jobCategory: "Electrical",
    description: "Swap old fixture and test wiring safely.",
    userPrice: 80,
    finalPrice: "",
    location: "West Side",
    locationURL: "",
    images: [],
    jobStatus: "open",
    createdAt: "2026-02-14T15:30:00.000Z",
    updatedAt: "2026-02-14T15:30:00.000Z",
    icon: Zap,
  },
  {
    _id: "job-3",
    userId: "user-3",
    offers: [],
    title: "Fix door handle",
    jobCategory: "General Repairs",
    description: "Tighten hardware and align latch.",
    userPrice: 45,
    finalPrice: "",
    location: "Uptown",
    locationURL: "",
    images: [],
    jobStatus: "in-progress",
    createdAt: "2026-02-13T12:10:00.000Z",
    updatedAt: "2026-02-14T08:45:00.000Z",
    icon: Wrench,
  },
];

function Jobs() {
  const router = useRouter();

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
              <Text className="text-2xl font-bold text-text">Jobs</Text>
              <Text className="text-sm text-muted">Find work nearby</Text>
            </View>
          </View>

          <View className="flex-row flex-wrap gap-2">
            {filters.map((filter) => (
              <View
                key={filter}
                className={`px-4 py-2 rounded-full border ${
                  filter === "All"
                    ? "bg-accent border-accent"
                    : "bg-secondary border-border"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    filter === "All" ? "text-white" : "text-text"
                  }`}
                >
                  {filter}
                </Text>
              </View>
            ))}
          </View>

          <View className="gap-4">
            {jobs.map((job) => {
              const Icon = job.icon;
              return (
                <View
                  key={job._id}
                  className="border border-border rounded-2xl p-4 bg-secondary"
                >
                  <View className="flex-row items-center gap-3">
                    <View className="w-12 h-12 rounded-xl bg-accent/10 items-center justify-center">
                      <Icon size={22} color={colors.accent} />
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
                      ${job.userPrice}
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
                        {new Date(job.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>

                  <View className="mt-3 self-start rounded-full border border-border px-3 py-1">
                    <Text className="text-xs text-muted">{job.jobStatus}</Text>
                  </View>

                  <Pressable
                    className="mt-4 bg-accent rounded-xl py-3 items-center active:opacity-90"
                    onPress={() => router.push("/login")}
                  >
                    <Text className="text-white text-sm font-semibold">
                      Apply for Job
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
