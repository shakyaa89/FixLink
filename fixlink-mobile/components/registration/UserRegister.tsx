import { useRouter } from "expo-router";
import {
  Pressable,
  Text,
  TextInput,
  View,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Link2,
  Upload,
} from "lucide-react-native";
import { Picker } from "@react-native-picker/picker";
import colors from "@/app/_constants/theme";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import Toast from "react-native-toast-message";
import { AuthApi } from "@/api/Apis";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "@/store/authStore";

const CITIES = ["Kathmandu", "Lalitpur", "Bhaktapur"];

export default function UserRegister() {
  const router = useRouter();
  const { setUser } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [address, setAddress] = useState("");
  const [addressDescription, setAddressDescription] = useState("");
  const [addressUrl, setAddressUrl] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);

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
      setProfilePicture(result.assets[0]);
    }
  };

  const uploadToCloudinary = async (asset: ImagePicker.ImagePickerAsset) => {
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

  const handleRegisterSubmit = async () => {
    if (
      !fullName ||
      !email ||
      !phoneNumber ||
      !city ||
      !password ||
      !confirmPassword ||
      !address ||
      !addressDescription ||
      !profilePicture
    ) {
      Toast.show({ type: "error", text1: "Please fill in all required fields" });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({ type: "error", text1: "Passwords do not match" });
      return;
    }

    if (!agreeToTerms) {
      Toast.show({
        type: "error",
        text1: "Please agree to Terms and Privacy Policy",
      });
      return;
    }

    try {
      setLoading(true);
      const profileUrl = await uploadToCloudinary(profilePicture);

      const response = await AuthApi.registerApi({
        fullName,
        email,
        phoneNumber,
        city,
        password,
        address,
        addressDescription,
        addressURL: addressUrl,
        profilePicture: profileUrl,
      });

      await AsyncStorage.setItem("jwtToken", response.data.token);
      setUser(response.data.user);

      Toast.show({
        type: "success",
        text1: response?.data?.message || "Account created successfully",
      });

      setFullName("");
      setEmail("");
      setPhoneNumber("");
      setCity("");
      setPassword("");
      setConfirmPassword("");
      setProfilePicture(null);
      setAddress("");
      setAddressDescription("");
      setAddressUrl("");
      setAgreeToTerms(false);

      router.replace("/");
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Registration failed";
      Toast.show({ type: "error", text1: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 py-8 gap-8">
          {/* Header */}
          <View className="gap-4">
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 border border-border rounded-xl items-center justify-center active:bg-secondary"
            >
              <ArrowLeft size={20} color={colors.text} />
            </Pressable>

            <View className="gap-2">
              <Text className="text-4xl font-bold text-text">Create account</Text>
              <Text className="text-base text-muted leading-relaxed">
                Set up your FixLink profile in minutes.
              </Text>
            </View>
          </View>

          {/* Form */}
          <View className="gap-5">
            <View className="gap-2">
              <Text className="text-sm font-medium text-text">Full name</Text>
              <View className="border border-border rounded-xl px-4 py-3 flex-row items-center gap-3 bg-secondary">
                <User size={20} color={colors.muted} />
                <TextInput
                  className="flex-1 text-text text-base"
                  placeholder="Jane Doe"
                  placeholderTextColor={colors.muted}
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>
            </View>

            <View className="gap-2">
              <Text className="text-sm font-medium text-text">Email</Text>
              <View className="border border-border rounded-xl px-4 py-3 flex-row items-center gap-3 bg-secondary">
                <Mail size={20} color={colors.muted} />
                <TextInput
                  className="flex-1 text-text text-base"
                  placeholder="you@example.com"
                  placeholderTextColor={colors.muted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <View className="gap-2">
              <Text className="text-sm font-medium text-text">Phone number</Text>
              <View className="border border-border rounded-xl px-4 py-3 flex-row items-center gap-3 bg-secondary">
                <Phone size={20} color={colors.muted} />
                <TextInput
                  className="flex-1 text-text text-base"
                  placeholder="(555) 123-4567"
                  placeholderTextColor={colors.muted}
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                />
              </View>
            </View>

            <View className="gap-2">
              <Text className="text-sm font-medium text-text">City</Text>
              <View className="border border-border rounded-xl px-1 bg-secondary">
                <Picker
                  selectedValue={city}
                  onValueChange={(itemValue) => setCity(itemValue)}
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
              <Text className="text-sm font-medium text-text">Password</Text>
              <View className="border border-border rounded-xl px-4 py-3 flex-row items-center gap-3 bg-secondary">
                <Lock size={20} color={colors.muted} />
                <TextInput
                  className="flex-1 text-text text-base"
                  placeholder="Create a password"
                  placeholderTextColor={colors.muted}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff size={20} color={colors.muted} />
                  ) : (
                    <Eye size={20} color={colors.muted} />
                  )}
                </Pressable>
              </View>
              <Text className="text-xs text-muted">
                At least 8 characters with a mix of letters and numbers
              </Text>
            </View>

            <View className="gap-2">
              <Text className="text-sm font-medium text-text">Confirm password</Text>
              <View className="border border-border rounded-xl px-4 py-3 flex-row items-center gap-3 bg-secondary">
                <Lock size={20} color={colors.muted} />
                <TextInput
                  className="flex-1 text-text text-base"
                  placeholder="Confirm your password"
                  placeholderTextColor={colors.muted}
                  secureTextEntry={!showPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>
            </View>

            <View className="gap-2">
              <Text className="text-sm font-medium text-text">Profile picture</Text>
              <Pressable
                onPress={pickImage}
                className="border border-dashed border-border rounded-xl p-4 bg-secondary flex-row items-center justify-center gap-2"
              >
                <Upload size={18} color={colors.muted} />
                <Text className="text-text font-medium">Choose image</Text>
              </Pressable>
              {profilePicture?.uri ? (
                <View className="flex-row items-center gap-3 mt-2">
                  <Image
                    source={{ uri: profilePicture.uri }}
                    style={{ width: 44, height: 44, borderRadius: 8 }}
                  />
                  <Text className="text-sm text-muted flex-1" numberOfLines={1}>
                    {profilePicture.fileName || "Selected image"}
                  </Text>
                </View>
              ) : null}
            </View>

            <View className="gap-2">
              <Text className="text-sm font-medium text-text">Address</Text>
              <View className="border border-border rounded-xl px-4 py-3 flex-row items-center gap-3 bg-secondary">
                <MapPin size={20} color={colors.muted} />
                <TextInput
                  className="flex-1 text-text text-base"
                  placeholder="Enter your address"
                  placeholderTextColor={colors.muted}
                  value={address}
                  onChangeText={setAddress}
                />
              </View>
            </View>

            <View className="gap-2">
              <Text className="text-sm font-medium text-text">Address description</Text>
              <TextInput
                className="text-text text-base border border-border rounded-xl px-4 py-3 bg-secondary min-h-[88px]"
                placeholder="Additional details"
                placeholderTextColor={colors.muted}
                multiline
                textAlignVertical="top"
                value={addressDescription}
                onChangeText={setAddressDescription}
              />
            </View>

            <View className="gap-2">
              <Text className="text-sm font-medium text-text">Address URL (optional)</Text>
              <View className="border border-border rounded-xl px-4 py-3 flex-row items-center gap-3 bg-secondary">
                <Link2 size={20} color={colors.muted} />
                <TextInput
                  className="flex-1 text-text text-base"
                  placeholder="Enter map link"
                  placeholderTextColor={colors.muted}
                  autoCapitalize="none"
                  value={addressUrl}
                  onChangeText={setAddressUrl}
                />
              </View>
            </View>
          </View>

          {/* Terms */}
          <Pressable
            onPress={() => setAgreeToTerms((prev) => !prev)}
            className="bg-secondary border border-border rounded-xl p-4 flex-row items-start gap-3"
          >
            <View
              className={`w-5 h-5 rounded border mt-0.5 items-center justify-center ${
                agreeToTerms ? "bg-accent border-accent" : "border-border"
              }`}
            >
              {agreeToTerms ? <Text className="text-white text-xs">✓</Text> : null}
            </View>
            <Text className="text-sm text-muted leading-relaxed flex-1">
              I agree to the <Text className="text-accent font-medium">Terms of Service</Text> and{" "}
              <Text className="text-accent font-medium">Privacy Policy</Text>
            </Text>
          </Pressable>

          {/* CTA */}
          <View className="gap-4">
            <Pressable
              className="bg-accent rounded-xl py-4 items-center active:opacity-90"
              onPress={handleRegisterSubmit}
              disabled={loading}
            >
              {loading ? (
                <View className="flex-row items-center gap-2">
                  <ActivityIndicator color="#fff" />
                  <Text className="text-white text-base font-bold">
                    {uploading ? "Uploading picture..." : "Creating account..."}
                  </Text>
                </View>
              ) : (
                <Text className="text-white text-base font-bold">Create Account</Text>
              )}
            </Pressable>

            <View className="flex-row items-center gap-3">
              <View className="flex-1 h-px bg-border" />
              <Text className="text-sm text-muted">or</Text>
              <View className="flex-1 h-px bg-border" />
            </View>

            <Pressable
              className="border border-border rounded-xl py-4 items-center bg-secondary active:bg-border/20"
              onPress={() => { }}
            >
              <Text className="text-text text-base font-semibold">Continue with Google</Text>
            </Pressable>
          </View>

          {/* Footer */}
          <View className="items-center pt-4 pb-6">
            <Pressable
              onPress={() => router.push("/public/login")}
            >
              <Text className="text-base text-muted">
                Already have an account?{" "}
                <Text className="text-accent font-semibold">Log in</Text>
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}