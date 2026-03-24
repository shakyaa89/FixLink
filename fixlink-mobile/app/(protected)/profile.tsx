import { useRouter } from "expo-router";
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
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Star,
  Upload,
  User,
} from "lucide-react-native";
import colors from "@/app/_constants/theme";
import { useAuthStore } from "@/store/authStore";
import Toast from "react-native-toast-message";
import { AuthApi } from "@/api/Apis";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { Picker } from "@react-native-picker/picker";

const CITIES = ["Kathmandu", "Lalitpur", "Bhaktapur"];
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [fullNameInput, setFullNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [phoneNumberInput, setPhoneNumberInput] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [addressInput, setAddressInput] = useState("");
  const [addressDescriptionInput, setAddressDescriptionInput] = useState("");
  const [addressUrlInput, setAddressUrlInput] = useState("");

  useEffect(() => {
    setFullNameInput(user?.fullName || "");
    setEmailInput(user?.email || "");
    setPhoneNumberInput(user?.phoneNumber || "");
    setCityInput(user?.city || "");
    setAddressInput(user?.address || "");
    setAddressDescriptionInput(user?.addressDescription || "");
    setAddressUrlInput(user?.addressURL || user?.addressUrl || "");
  }, [user]);

  const fullName = user?.fullName || "Not provided";
  const email = user?.email || "Not provided";
  const phoneNumber = user?.phoneNumber || "Not provided";
  const role = user?.role || "Not provided";
  const city = user?.city || "Not provided";
  const address = user?.address || "Not provided";
  const providerCategory = user?.providerCategory || "Not provided";
  const ratingAverage =
    typeof user?.ratingAverage === "number"
      ? `${user.ratingAverage.toFixed(1)} / 5.0`
      : "Not available";
  const verificationStatus = user?.verificationStatus || "Not verified";
  let roleLabel = role;
  if (role === "serviceProvider") roleLabel = "Service Provider";
  if (role === "admin") roleLabel = "Admin";
  if (role === "user") roleLabel = "User";

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Toast.show({
        type: "error",
        text1: "Media permission is required",
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const selectedAsset = result.assets[0];

      if (
        typeof selectedAsset.fileSize === "number" &&
        selectedAsset.fileSize > MAX_IMAGE_SIZE_BYTES
      ) {
        Toast.show({ type: "error", text1: "Image must be 2MB or smaller" });
        return;
      }

      setSelectedImage(selectedAsset);
    }
  };

  const uploadToCloudinary = async (asset: ImagePicker.ImagePickerAsset) => {
    if (
      typeof asset.fileSize === "number" &&
      asset.fileSize > MAX_IMAGE_SIZE_BYTES
    ) {
      throw new Error("Image must be 2MB or smaller");
    }

    setUploading(true);
    const formData = new FormData();

    formData.append("file", {
      uri: asset.uri,
      type: asset.mimeType || "image/jpeg",
      name: asset.fileName || `profile-${Date.now()}.jpg`,
    } as any);
    formData.append("upload_preset", "unsigned_upload");

    try {
      const { data } = await axios.post(
        "https://api.cloudinary.com/v1_1/diocl7ilu/image/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return data.secure_url as string;
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFullNameInput(user?.fullName || "");
    setEmailInput(user?.email || "");
    setPhoneNumberInput(user?.phoneNumber || "");
    setCityInput(user?.city || "");
    setAddressInput(user?.address || "");
    setAddressDescriptionInput(user?.addressDescription || "");
    setAddressUrlInput(user?.addressURL || user?.addressUrl || "");
    setSelectedImage(null);
  };

  const handleSaveProfile = async () => {
    if (
      !fullNameInput.trim() ||
      !emailInput.trim() ||
      !phoneNumberInput.trim() ||
      !cityInput.trim() ||
      !addressInput.trim() ||
      !addressDescriptionInput.trim()
    ) {
      Toast.show({
        type: "error",
        text1: "Please fill in all required fields",
      });
      return;
    }

    try {
      setSaving(true);

      let profilePictureUrl = user?.profilePicture || "";
      if (selectedImage) {
        profilePictureUrl = await uploadToCloudinary(selectedImage);
      }

      const response = await AuthApi.updateUserProfile({
        fullName: fullNameInput.trim(),
        email: emailInput.trim(),
        phoneNumber: phoneNumberInput.trim(),
        city: cityInput.trim(),
        address: addressInput.trim(),
        addressDescription: addressDescriptionInput.trim(),
        addressURL: addressUrlInput.trim(),
        profilePicture: profilePictureUrl,
      });

      setUser(response.data.updatedUser || response.data.user || user);
      setSelectedImage(null);
      setIsEditing(false);

      Toast.show({
        type: "success",
        text1: response?.data?.message || "Profile updated successfully",
      });
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1:
          error?.response?.data?.message ||
          error?.message ||
          "Unable to update profile",
      });
    } finally {
      setSaving(false);
    }
  };

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
              <Text className="text-2xl font-bold text-text">My Profile</Text>
              <Text className="text-sm text-muted">Your account details</Text>
            </View>
          </View>

          <View className="bg-primary border border-border rounded-2xl px-5 py-5">
            <View className="flex-row items-center gap-4">
              {selectedImage?.uri || user?.profilePicture ? (
                <Image
                  source={{ uri: selectedImage?.uri || user?.profilePicture }}
                  style={{ width: 64, height: 64, borderRadius: 18 }}
                />
              ) : (
                <View className="w-16 h-16 rounded-2xl bg-secondary border border-border items-center justify-center">
                  <User size={30} color={colors.text} />
                </View>
              )}

              <View className="flex-1">
                <Text className="text-text text-xl font-bold" numberOfLines={1}>
                  {fullName}
                </Text>
                <Text className="text-muted text-sm mt-1" numberOfLines={1}>
                  {roleLabel}
                </Text>
              </View>
            </View>
          </View>

          <View className="gap-3">
            <Pressable
              className="bg-primary border border-border rounded-2xl px-4 py-3.5 flex-row items-center justify-center active:bg-secondary"
              onPress={() => {
                if (isEditing) {
                  resetForm();
                }
                setIsEditing((prev) => !prev);
              }}
            >
              <Text className="text-text font-semibold">
                {isEditing ? "Cancel Edit" : "Edit Profile"}
              </Text>
            </Pressable>

            {isEditing && (
              <View className="gap-3 bg-secondary border border-border rounded-2xl px-4 py-4">
                <View className="gap-2">
                  <Text className="text-xs text-muted font-medium">Full Name</Text>
                  <TextInput
                    className="text-base text-text border border-border rounded-xl px-3 py-2.5 bg-primary"
                    placeholder="Full name"
                    placeholderTextColor={colors.muted}
                    value={fullNameInput}
                    onChangeText={setFullNameInput}
                  />
                </View>

                <View className="gap-2">
                  <Text className="text-xs text-muted font-medium">Email</Text>
                  <TextInput
                    className="text-base text-text border border-border rounded-xl px-3 py-2.5 bg-primary"
                    placeholder="Email"
                    placeholderTextColor={colors.muted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={emailInput}
                    onChangeText={setEmailInput}
                  />
                </View>

                <View className="gap-2">
                  <Text className="text-xs text-muted font-medium">Phone Number</Text>
                  <TextInput
                    className="text-base text-text border border-border rounded-xl px-3 py-2.5 bg-primary"
                    placeholder="Phone number"
                    placeholderTextColor={colors.muted}
                    keyboardType="phone-pad"
                    value={phoneNumberInput}
                    onChangeText={setPhoneNumberInput}
                  />
                </View>

                <View className="gap-2">
                  <Text className="text-xs text-muted font-medium">City</Text>
                  <View className="border border-border rounded-xl px-1 bg-primary">
                    <Picker
                      selectedValue={cityInput}
                      onValueChange={(itemValue) => setCityInput(itemValue)}
                      style={{ color: colors.text }}
                      dropdownIconColor={colors.muted}
                    >
                      <Picker.Item label="Select city" value="" color={colors.muted} />
                      {CITIES.map((cityOption) => (
                        <Picker.Item key={cityOption} label={cityOption} value={cityOption} />
                      ))}
                    </Picker>
                  </View>
                </View>

                <View className="gap-2">
                  <Text className="text-xs text-muted font-medium">Address</Text>
                  <TextInput
                    className="text-base text-text border border-border rounded-xl px-3 py-2.5 bg-primary"
                    placeholder="Address"
                    placeholderTextColor={colors.muted}
                    value={addressInput}
                    onChangeText={setAddressInput}
                  />
                </View>

                <View className="gap-2">
                  <Text className="text-xs text-muted font-medium">Address Description</Text>
                  <TextInput
                    className="text-base text-text border border-border rounded-xl px-3 py-2.5 min-h-[88px] bg-primary"
                    placeholder="Additional address details"
                    placeholderTextColor={colors.muted}
                    multiline
                    textAlignVertical="top"
                    value={addressDescriptionInput}
                    onChangeText={setAddressDescriptionInput}
                  />
                </View>

                <View className="gap-2">
                  <Text className="text-xs text-muted font-medium">Address URL (optional)</Text>
                  <TextInput
                    className="text-base text-text border border-border rounded-xl px-3 py-2.5 bg-primary"
                    placeholder="https://maps.google.com/..."
                    placeholderTextColor={colors.muted}
                    autoCapitalize="none"
                    value={addressUrlInput}
                    onChangeText={setAddressUrlInput}
                  />
                </View>

                <View className="gap-2">
                  <Text className="text-xs text-muted font-medium">Profile Picture (optional)</Text>
                  <Pressable
                    onPress={pickImage}
                    className="border border-dashed border-border rounded-xl p-3 bg-primary flex-row items-center justify-center gap-2"
                  >
                    <Upload size={16} color={colors.muted} />
                    <Text className="text-text font-medium">Choose image</Text>
                  </Pressable>
                </View>

                <Pressable
                  className="bg-primary border border-border rounded-2xl px-4 py-3.5 mt-1 flex-row items-center justify-center gap-2 active:bg-secondary"
                  onPress={handleSaveProfile}
                  disabled={saving || uploading}
                >
                  {(saving || uploading) && <ActivityIndicator size="small" color={colors.text} />}
                  <Text className="text-text font-semibold">
                    {uploading ? "Uploading image..." : saving ? "Saving..." : "Save Profile"}
                  </Text>
                </Pressable>
              </View>
            )}

            <View className="bg-secondary border border-border rounded-2xl px-4 py-3.5">
              <View className="flex-row items-center gap-2 mb-1.5">
                <Mail size={16} color={colors.muted} />
                <Text className="text-xs text-muted font-medium">Email</Text>
              </View>
              <Text className="text-base text-text font-semibold">{email}</Text>
            </View>

            <View className="bg-secondary border border-border rounded-2xl px-4 py-3.5">
              <View className="flex-row items-center gap-2 mb-1.5">
                <Phone size={16} color={colors.muted} />
                <Text className="text-xs text-muted font-medium">Phone Number</Text>
              </View>
              <Text className="text-base text-text font-semibold">{phoneNumber}</Text>
            </View>

            <View className="bg-secondary border border-border rounded-2xl px-4 py-3.5">
              <View className="flex-row items-center gap-2 mb-1.5">
                <MapPin size={16} color={colors.muted} />
                <Text className="text-xs text-muted font-medium">City</Text>
              </View>
              <Text className="text-base text-text font-semibold">{city}</Text>
            </View>

            <View className="bg-secondary border border-border rounded-2xl px-4 py-3.5">
              <View className="flex-row items-center gap-2 mb-1.5">
                <Building2 size={16} color={colors.muted} />
                <Text className="text-xs text-muted font-medium">Address</Text>
              </View>
              <Text className="text-base text-text font-semibold">{address}</Text>
            </View>

            {role === "serviceProvider" && (
              <View className="bg-secondary border border-border rounded-2xl px-4 py-3.5">
                <View className="flex-row items-center gap-2 mb-1.5">
                  <BadgeCheck size={16} color={colors.muted} />
                  <Text className="text-xs text-muted font-medium">Service Category</Text>
                </View>
                <Text className="text-base text-text font-semibold">{providerCategory}</Text>
              </View>
            )}

            {role === "serviceProvider" && (
              <View className="bg-secondary border border-border rounded-2xl px-4 py-3.5">
                <View className="flex-row items-center gap-2 mb-1.5">
                  <Star size={16} color={colors.muted} />
                  <Text className="text-xs text-muted font-medium">Average Rating</Text>
                </View>
                <Text className="text-base text-text font-semibold">{ratingAverage}</Text>
              </View>
            )}

            <View className="bg-secondary border border-border rounded-2xl px-4 py-3.5">
              <View className="flex-row items-center gap-2 mb-1.5">
                <BadgeCheck size={16} color={colors.muted} />
                <Text className="text-xs text-muted font-medium">Verification Status</Text>
              </View>
              <Text className="text-base text-text font-semibold">{verificationStatus}</Text>
            </View>

            <Pressable
              className="bg-danger rounded-2xl px-4 py-3.5 mt-2 flex-row items-center justify-center gap-2 active:opacity-90"
              disabled={loggingOut}
              onPress={async () => {
                try {
                  setLoggingOut(true);
                  await logout();
                  router.replace("/");
                } finally {
                  setLoggingOut(false);
                }
              }}
            >
              {loggingOut ? (
                <>
                  <ActivityIndicator size="small" color="white" />
                  <Text className="text-white font-semibold">Logging out...</Text>
                </>
              ) : (
                <>
                  <LogOut size={18} color="white" />
                  <Text className="text-white font-semibold">Logout</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}