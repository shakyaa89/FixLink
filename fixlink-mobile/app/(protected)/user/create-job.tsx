import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import axios, { AxiosError } from "axios";
import Toast from "react-native-toast-message";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarClock,
  Check,
  ImagePlus,
} from "lucide-react-native";
import { Picker } from "@react-native-picker/picker";
import colors from "@/app/_constants/theme";
import { AiApi, CLOUDINARY_UPLOAD_URL, JobApi } from "@/api/Apis";
import { useAuthStore } from "@/store/authStore";
import { CITIES, LOCATION_OPTIONS } from "@/utils/nepalLocations";

const categories = [
  "Plumbing",
  "Electrical",
  "Carpentry",
  "Painting",
  "Landscaping",
  "General Repairs",
];
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;

// Creates a new job with optional schedule time.
export default function CreateJobPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [jobCategory, setJobCategory] = useState("");
  const [userPrice, setUserPrice] = useState("");
  const [city, setCity] = useState("");
  const [location, setLocation] = useState("");
  const [locationURL, setLocationURL] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [postType, setPostType] = useState<"now" | "schedule">("now");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const placeOptions = useMemo(() => {
    return city ? LOCATION_OPTIONS[city] ?? [] : [];
  }, [city]);

  // Picks images from gallery and checks size limit.
  const pickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Toast.show({ type: "error", text1: "Media permission is required" });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: 8,
    });

    if (result.canceled) return;

    const oversizedAsset = result.assets.find(
      (asset) =>
        typeof asset.fileSize === "number" &&
        asset.fileSize > MAX_IMAGE_SIZE_BYTES
    );

    if (oversizedAsset) {
      Toast.show({ type: "error", text1: "Each image must be 2MB or smaller" });
      return;
    }

    const uris = result.assets.map((asset) => asset.uri);
    setImages(uris);
  };

  // Uploads all selected images and returns cloud URLs.
  const uploadMultipleToCloudinary = async (fileUris: string[]) => {
    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const uri of fileUris) {
        const formData = new FormData();
        formData.append(
          "file",
          {
            uri,
            type: "image/jpeg",
            name: `job_${Date.now()}.jpg`,
          } as unknown as Blob
        );
        formData.append("upload_preset", "job_image_upload");

        const { data } = await axios.post(
          CLOUDINARY_UPLOAD_URL,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        uploadedUrls.push(data.secure_url);
      }

      return uploadedUrls;
    } finally {
      setUploading(false);
    }
  };

  // Validates form and submits the new job.
  const handleSubmit = async () => {
    const price = Number(userPrice);

    if (
      !title ||
      !description ||
      !jobCategory ||
      !price ||
      !city ||
      !location ||
      images.length === 0
    ) {
      Toast.show({ type: "error", text1: "Please fill all required fields" });
      return;
    }

    let scheduledForISO: string | null = null;

    // Extra validation is required for scheduled jobs.
    if (postType === "schedule") {
      if (!scheduledDate || !scheduledTime) {
        Toast.show({
          type: "error",
          text1: "Please enter both scheduled date and time",
        });
        return;
      }

      const datePattern = /^\d{4}-\d{2}-\d{2}$/;
      const timePattern = /^\d{2}:\d{2}$/;

      if (!datePattern.test(scheduledDate) || !timePattern.test(scheduledTime)) {
        Toast.show({
          type: "error",
          text1: "Use date YYYY-MM-DD and time HH:MM",
        });
        return;
      }

      const [year, month, day] = scheduledDate.split("-").map(Number);
      const [hour, minute] = scheduledTime.split(":").map(Number);

      if (
        !year ||
        !month ||
        !day ||
        Number.isNaN(hour) ||
        Number.isNaN(minute) ||
        month < 1 ||
        month > 12 ||
        day < 1 ||
        day > 31 ||
        hour < 0 ||
        hour > 23 ||
        minute < 0 ||
        minute > 59
      ) {
        Toast.show({ type: "error", text1: "Invalid date or time values" });
        return;
      }

      const scheduledForDate = new Date(year, month - 1, day, hour, minute, 0, 0);

      if (
        Number.isNaN(scheduledForDate.getTime()) ||
        scheduledForDate.getFullYear() !== year ||
        scheduledForDate.getMonth() !== month - 1 ||
        scheduledForDate.getDate() !== day
      ) {
        Toast.show({ type: "error", text1: "Invalid calendar date" });
        return;
      }

      const now = new Date();
      const maxScheduleDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      if (scheduledForDate <= now) {
        Toast.show({ type: "error", text1: "Scheduled time must be in the future" });
        return;
      }

      if (scheduledForDate > maxScheduleDate) {
        Toast.show({
          type: "error",
          text1: "Jobs can only be scheduled up to 1 week ahead",
        });
        return;
      }

      scheduledForISO = scheduledForDate.toISOString();
    }

    try {
      setSubmitting(true);

      // Run AI safety/quality verification before persisting the job.
      const verifyJob = await AiApi.verifyJob({
        title,
        description,
        userPrice: price,
      });

      if (verifyJob?.data?.reply !== "VALID") {
        Toast.show({
          type: "error",
          text1: verifyJob?.data?.reply || "Job did not pass AI verification",
        });
        return;
      }

      // Upload media first so API payload only contains hosted URLs.
      const imageUrls = await uploadMultipleToCloudinary(images);

      const jobPayload = {
        userId: user?._id,
        title,
        description,
        jobCategory,
        userPrice: price,
        location: `${city}, ${location}`,
        locationURL,
        images: imageUrls,
      };

      const response =
        postType === "schedule" && scheduledForISO
          ? await JobApi.scheduleJobApi({
              ...jobPayload,
              scheduledFor: scheduledForISO,
            } as any)
          : await JobApi.createJobApi(jobPayload as any);

      Toast.show({
        type: "success",
        text1:
          response?.data?.message ||
          (postType === "schedule" ? "Job scheduled successfully" : "Job created successfully"),
      });

      router.replace("/jobs");
    } catch (error: unknown) {
      Toast.show({
        type: "error",
        text1:
          error instanceof AxiosError
            ? error.response?.data?.message || "Error creating job"
            : "Error creating job",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-6 gap-5">
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 border border-border rounded-xl items-center justify-center active:bg-secondary"
            >
              <ArrowLeft size={20} color={colors.text} />
            </Pressable>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-text">Create Job</Text>
              <Text className="text-sm text-muted">Post your service request</Text>
            </View>
            <View className="w-10 h-10 rounded-xl bg-accent/10 items-center justify-center">
              <BriefcaseBusiness size={20} color={colors.accent} />
            </View>
          </View>

          <View className="bg-secondary border border-border rounded-2xl p-4 gap-3">
            <Text className="text-sm font-semibold text-text">Job Title *</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Fix leaking sink"
              placeholderTextColor={colors.muted}
              className="border border-border rounded-xl px-3 py-3 text-text bg-primary"
            />

            <Text className="text-sm font-semibold text-text">Category *</Text>
            <View className="border border-border rounded-xl bg-primary overflow-hidden">
              <Picker
                selectedValue={jobCategory}
                onValueChange={(value) => setJobCategory(value)}
                style={{ color: colors.text }}
              >
                <Picker.Item label="Select a category" value="" />
                {categories.map((category) => (
                  <Picker.Item key={category} label={category} value={category} />
                ))}
              </Picker>
            </View>
          </View>

          <View className="bg-secondary border border-border rounded-2xl p-4 gap-3">
            <Text className="text-sm font-semibold text-text">Description *</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              placeholder="Describe your service needs..."
              placeholderTextColor={colors.muted}
              className="border border-border rounded-xl px-3 py-3 text-text bg-primary min-h-[120px]"
            />
          </View>

          <View className="bg-secondary border border-border rounded-2xl p-4 gap-3">
            <View className="flex-row items-center gap-2">
              <CalendarClock size={16} color={colors.accent} />
              <Text className="text-sm font-semibold text-text">Posting Type *</Text>
            </View>

            <View className="flex-row gap-2">
              <Pressable
                onPress={() => setPostType("now")}
                className={`flex-1 rounded-xl py-2.5 items-center border ${
                  postType === "now"
                    ? "bg-accent border-accent"
                    : "bg-primary border-border"
                }`}
              >
                <Text
                  className={`font-semibold ${
                    postType === "now" ? "text-white" : "text-text"
                  }`}
                >
                  Post Now
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setPostType("schedule")}
                className={`flex-1 rounded-xl py-2.5 items-center border ${
                  postType === "schedule"
                    ? "bg-accent border-accent"
                    : "bg-primary border-border"
                }`}
              >
                <Text
                  className={`font-semibold ${
                    postType === "schedule" ? "text-white" : "text-text"
                  }`}
                >
                  Schedule
                </Text>
              </Pressable>
            </View>

            {postType === "schedule" && (
              <View className="gap-3">
                <Text className="text-sm text-muted">
                  Enter local date and time. Scheduling is limited to the next 7 days.
                </Text>
                <TextInput
                  value={scheduledDate}
                  onChangeText={setScheduledDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.muted}
                  className="border border-border rounded-xl px-3 py-3 text-text bg-primary"
                />
                <TextInput
                  value={scheduledTime}
                  onChangeText={setScheduledTime}
                  placeholder="HH:MM (24-hour)"
                  placeholderTextColor={colors.muted}
                  className="border border-border rounded-xl px-3 py-3 text-text bg-primary"
                />
              </View>
            )}

            <Text className="text-sm font-semibold text-text">Your Price (Rs) *</Text>
            <TextInput
              value={userPrice}
              onChangeText={setUserPrice}
              keyboardType="numeric"
              placeholder="1200"
              placeholderTextColor={colors.muted}
              className="border border-border rounded-xl px-3 py-3 text-text bg-primary"
            />

            <Text className="text-sm font-semibold text-text">City *</Text>
            <View className="border border-border rounded-xl bg-primary overflow-hidden">
              <Picker
                selectedValue={city}
                onValueChange={(value) => {
                  setCity(value);
                  setLocation("");
                }}
                style={{ color: colors.text }}
              >
                <Picker.Item label="Select city" value="" />
                {CITIES.map((cityOption) => (
                  <Picker.Item key={cityOption} label={cityOption} value={cityOption} />
                ))}
              </Picker>
            </View>

            <Text className="text-sm font-semibold text-text">Location *</Text>
            <View
              className={`border border-border rounded-xl bg-primary overflow-hidden ${
                !city ? "opacity-60" : ""
              }`}
            >
              <Picker
                selectedValue={location}
                enabled={Boolean(city)}
                onValueChange={(value) => setLocation(value)}
                style={{ color: colors.text }}
              >
                <Picker.Item
                  label={city ? "Select location" : "Select city first"}
                  value=""
                />
                {placeOptions.map((placeOption) => (
                  <Picker.Item key={placeOption} label={placeOption} value={placeOption} />
                ))}
              </Picker>
            </View>

            <Text className="text-sm font-semibold text-text">Location URL (Optional)</Text>
            <TextInput
              value={locationURL}
              onChangeText={setLocationURL}
              placeholder="Google Maps URL"
              placeholderTextColor={colors.muted}
              className="border border-border rounded-xl px-3 py-3 text-text bg-primary"
            />
          </View>

          <View className="bg-secondary border border-border rounded-2xl p-4 gap-3">
            <Text className="text-sm font-semibold text-text">Images *</Text>

            <Pressable
              className="border-2 border-dashed border-border rounded-xl p-6 items-center justify-center bg-primary"
              onPress={pickImages}
            >
              <ImagePlus size={24} color={colors.accent} />
              <Text className="text-text font-medium mt-2">Select Images</Text>
              <Text className="text-muted text-xs mt-1">PNG, JPG, WEBP</Text>
            </Pressable>

            {images.length > 0 && (
              <View className="gap-2">
                <Text className="text-sm text-muted">{images.length} selected</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row gap-2">
                    {images.map((uri, index) => (
                      <View key={`${uri}-${index}`} className="relative">
                        <Image
                          source={{ uri }}
                          className="w-20 h-20 rounded-lg"
                          resizeMode="cover"
                        />
                        <View className="absolute right-1 top-1 bg-green-600 rounded-full p-0.5">
                          <Check size={10} color="#fff" />
                        </View>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}
          </View>

          <Pressable
            onPress={handleSubmit}
            disabled={submitting || uploading}
            className="bg-accent rounded-xl py-4 items-center disabled:opacity-60 mb-8"
          >
            {submitting || uploading ? (
              <View className="flex-row items-center gap-2">
                <ActivityIndicator size="small" color="#fff" />
                <Text className="text-white font-semibold">
                    {uploading
                      ? "Uploading images..."
                      : postType === "schedule"
                        ? "Scheduling..."
                        : "Submitting..."}
                </Text>
              </View>
            ) : (
                <Text className="text-white font-semibold">
                  {postType === "schedule" ? "Schedule Job" : "Submit Job"}
                </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
