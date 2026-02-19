import { useEffect, useState } from "react";
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
import axios from "axios";
import Toast from "react-native-toast-message";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Check,
  ImagePlus,
} from "lucide-react-native";
import { Picker } from "@react-native-picker/picker";
import colors from "@/app/_constants/theme";
import { JobApi } from "@/api/Apis";
import { useAuthStore } from "@/store/authStore";

const categories = [
  "Plumbing",
  "Electrical",
  "Carpentry",
  "Painting",
  "Landscaping",
  "General Repairs",
];

export default function CreateJobPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [jobCategory, setJobCategory] = useState("");
  const [userPrice, setUserPrice] = useState("");
  const [location, setLocation] = useState("");
  const [locationURL, setLocationURL] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

    const uris = result.assets.map((asset) => asset.uri);
    setImages(uris);
  };

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
          "https://api.cloudinary.com/v1_1/diocl7ilu/image/upload",
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

  const handleSubmit = async () => {
    const price = Number(userPrice);

    if (
      !title ||
      !description ||
      !jobCategory ||
      !price ||
      !location ||
      images.length === 0
    ) {
      Toast.show({ type: "error", text1: "Please fill all required fields" });
      return;
    }

    try {
      setSubmitting(true);
      const imageUrls = await uploadMultipleToCloudinary(images);

      const response = await JobApi.createJobApi({
        userId: user?._id,
        title,
        description,
        jobCategory,
        userPrice: price,
        location,
        locationURL,
        images: imageUrls,
      } as any);

      Toast.show({
        type: "success",
        text1: response?.data?.message || "Job created successfully",
      });

      router.replace("/jobs");
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: error?.response?.data?.message || "Error creating job",
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
            <Text className="text-sm font-semibold text-text">Your Price (Rs) *</Text>
            <TextInput
              value={userPrice}
              onChangeText={setUserPrice}
              keyboardType="numeric"
              placeholder="1200"
              placeholderTextColor={colors.muted}
              className="border border-border rounded-xl px-3 py-3 text-text bg-primary"
            />

            <Text className="text-sm font-semibold text-text">Location *</Text>
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="Enter your location"
              placeholderTextColor={colors.muted}
              className="border border-border rounded-xl px-3 py-3 text-text bg-primary"
            />

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
                  {uploading ? "Uploading images..." : "Submitting..."}
                </Text>
              </View>
            ) : (
              <Text className="text-white font-semibold">Submit Job</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
