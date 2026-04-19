import { useState } from "react";
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
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import axios, { AxiosError } from "axios";
import Toast from "react-native-toast-message";
import {
  ArrowLeft,
  BadgeCheck,
  FileText,
  Link2,
  Upload,
} from "lucide-react-native";
import colors from "@/app/_constants/theme";
import { AiApi, AuthApi, CLOUDINARY_UPLOAD_URL } from "@/api/Apis";
import { useAuthStore } from "@/store/authStore";

const PROVIDER_CATEGORIES = [
  "Plumbing",
  "Electrical",
  "Carpentry",
  "Painting",
  "Landscaping",
  "General Repairs",
];

const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;

// Collects provider verification details and submits profile.
export default function CompleteProviderProfileScreen() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const address = user?.address?.trim() || "";
  const isResubmission = user?.verificationStatus === "rejected";

  const [providerCategory, setProviderCategory] = useState(user?.providerCategory || "");
  const [addressDescription, setAddressDescription] = useState(user?.addressDescription || "");
  const [addressURL, setAddressURL] = useState(user?.addressURL || user?.addressUrl || "");

  const [verificationProofFile, setVerificationProofFile] =
    useState<ImagePicker.ImagePickerAsset | null>(null);
  const [idProofFile, setIdProofFile] = useState<ImagePicker.ImagePickerAsset | null>(null);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Picks one document image for the selected field.
  const pickImage = async (
    setter: (asset: ImagePicker.ImagePickerAsset | null) => void
  ) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Toast.show({ type: "error", text1: "Media permission is required" });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: true,
    });

    if (result.canceled || result.assets.length === 0) return;

    const selectedAsset = result.assets[0];
    if (
      typeof selectedAsset.fileSize === "number" &&
      selectedAsset.fileSize > MAX_IMAGE_SIZE_BYTES
    ) {
      Toast.show({ type: "error", text1: "Image must be 2MB or smaller" });
      return;
    }

    setter(selectedAsset);
  };

  // Uploads one image file and returns URL.
  const uploadToCloudinary = async (asset: ImagePicker.ImagePickerAsset) => {
    if (
      typeof asset.fileSize === "number" &&
      asset.fileSize > MAX_IMAGE_SIZE_BYTES
    ) {
      throw new Error("Image must be 2MB or smaller");
    }

    const formData = new FormData();
    formData.append("file", {
      uri: asset.uri,
      type: asset.mimeType || "image/jpeg",
      name: asset.fileName || `provider-${Date.now()}.jpg`,
    } as any);
    formData.append("upload_preset", "unsigned_upload");

    const { data } = await axios.post(
      CLOUDINARY_UPLOAD_URL,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return data.secure_url as string;
  };

  // Validates all required fields and submits provider profile.
  const handleSubmit = async () => {
    if (!address) {
      Toast.show({ type: "error", text1: "Address is missing from your profile" });
      return;
    }

    if (!providerCategory || !address || !verificationProofFile || !idProofFile) {
      Toast.show({ type: "error", text1: "Please fill all required fields" });
      return;
    }

    try {
      setLoading(true);
      setUploading(true);

      // Upload both required proof files before verification and profile update.
      const [verificationProofURL, idURL] = await Promise.all([
        uploadToCloudinary(verificationProofFile),
        uploadToCloudinary(idProofFile),
      ]);

      setUploading(false);

      const verification = await AiApi.verifyProvider({
        verificationProofURL,
        category: providerCategory,
      });

      let verificationStatus: "pending" | "verified" | "rejected" = "pending";
      let rejectionReason = "";

      // Map AI verification response profile status.
      if (verification?.data?.reply === "PROPER") {
        verificationStatus = "verified";
      } else {
        verificationStatus = "rejected";
        rejectionReason = verification?.data?.reply || "Verification failed";
      }

      const response = await AuthApi.completeServiceProviderProfile({
        providerCategory,
        address,
        addressDescription,
        addressURL,
        verificationProofURL,
        idURL,
        verificationStatus,
        rejectionReason,
      });

      const updatedUser = response?.data?.user;
      if (updatedUser) {
        setUser(updatedUser);
      }

      Toast.show({
        type: "success",
        text1:
          response?.data?.message ||
          (verificationStatus === "verified"
            ? "Profile completed and verified"
            : "Profile submitted. Please review your verification status."),
      });

      router.replace("/service-provider/dashboard");
    } catch (error: unknown) {
      Toast.show({
        type: "error",
        text1:
          error instanceof AxiosError
            ? error.response?.data?.message || "Unable to complete profile"
            : "Unable to complete profile",
      });
    } finally {
      setUploading(false);
      setLoading(false);
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
              <Text className="text-2xl font-bold text-text">
                {isResubmission ? "Reupload Verification" : "Complete Profile"}
              </Text>
              <Text className="text-sm text-muted">
                {isResubmission
                  ? "Your previous verification was rejected. Upload updated documents for review."
                  : "Submit required details to continue"}
              </Text>
            </View>
            <View className="w-10 h-10 rounded-xl bg-accent/10 items-center justify-center">
              <FileText size={18} color={colors.accent} />
            </View>
          </View>

          {isResubmission && (
            <View className="bg-red-50 border border-red-200 rounded-xl px-3 py-3">
              <Text className="text-sm font-semibold text-red-800">Previous verification was rejected</Text>
              <Text className="text-sm text-red-700 mt-1">
                {user?.rejectionReason || "No rejection reason provided."}
              </Text>
            </View>
          )}

          <View className="bg-secondary border border-border rounded-2xl p-4 gap-3">
            <View className="flex-row items-center gap-2">
              <BadgeCheck size={16} color={colors.accent} />
              <Text className="text-sm font-semibold text-text">Provider Details</Text>
            </View>

            <Text className="text-sm font-semibold text-text">Service Category *</Text>
            <View className="border border-border rounded-xl bg-primary overflow-hidden">
              <Picker
                selectedValue={providerCategory}
                onValueChange={(value) => setProviderCategory(value)}
                style={{ color: colors.text }}
              >
                <Picker.Item label="Select category" value="" />
                {PROVIDER_CATEGORIES.map((category) => (
                  <Picker.Item key={category} label={category} value={category} />
                ))}
              </Picker>
            </View>

            <Text className="text-sm font-semibold text-text">Address Description</Text>
            <TextInput
              value={addressDescription}
              onChangeText={setAddressDescription}
              placeholder="Additional location details"
              placeholderTextColor={colors.muted}
              multiline
              textAlignVertical="top"
              className="border border-border rounded-xl px-3 py-3 text-text bg-primary min-h-[90px]"
            />

            <Text className="text-sm font-semibold text-text">Address URL (Optional)</Text>
            <View className="border border-border rounded-xl px-3 py-3 flex-row items-center gap-2 bg-primary">
              <Link2 size={16} color={colors.muted} />
              <TextInput
                value={addressURL}
                onChangeText={setAddressURL}
                placeholder="https://maps.google.com/..."
                placeholderTextColor={colors.muted}
                autoCapitalize="none"
                className="flex-1 text-text"
              />
            </View>
          </View>

          <View className="bg-secondary border border-border rounded-2xl p-4 gap-3">
            <Text className="text-sm font-semibold text-text">Service License Document *</Text>
            <Pressable
              onPress={() => pickImage(setVerificationProofFile)}
              className="border border-dashed border-border rounded-xl p-4 bg-primary items-center justify-center gap-2"
            >
              <Upload size={18} color={colors.muted} />
              <Text className="text-text font-medium">Upload verification proof</Text>
            </Pressable>
            {verificationProofFile?.uri ? (
              <View className="flex-row items-center gap-2">
                <Image
                  source={{ uri: verificationProofFile.uri }}
                  style={{ width: 42, height: 42, borderRadius: 8 }}
                />
                <Text className="text-sm text-muted flex-1" numberOfLines={1}>
                  {verificationProofFile.fileName || "Verification document selected"}
                </Text>
              </View>
            ) : null}

            <Text className="text-sm font-semibold text-text">Citizenship / ID Document *</Text>
            <Pressable
              onPress={() => pickImage(setIdProofFile)}
              className="border border-dashed border-border rounded-xl p-4 bg-primary items-center justify-center gap-2"
            >
              <Upload size={18} color={colors.muted} />
              <Text className="text-text font-medium">Upload ID document</Text>
            </Pressable>
            {idProofFile?.uri ? (
              <View className="flex-row items-center gap-2">
                <Image
                  source={{ uri: idProofFile.uri }}
                  style={{ width: 42, height: 42, borderRadius: 8 }}
                />
                <Text className="text-sm text-muted flex-1" numberOfLines={1}>
                  {idProofFile.fileName || "ID document selected"}
                </Text>
              </View>
            ) : null}
          </View>

          <Pressable
            className="bg-accent rounded-xl py-4 items-center disabled:opacity-60 mb-8"
            disabled={loading || uploading}
            onPress={handleSubmit}
          >
            {loading || uploading ? (
              <View className="flex-row items-center gap-2">
                <ActivityIndicator size="small" color="#fff" />
                <Text className="text-white font-semibold">
                  {uploading ? "Uploading documents..." : "Submitting..."}
                </Text>
              </View>
            ) : (
              <Text className="text-white font-semibold">
                {isResubmission ? "Re-submit Documents" : "Submit Documents"}
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
