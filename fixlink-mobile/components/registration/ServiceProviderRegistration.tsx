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
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;

export default function ServiceProviderRegistration() {
    const router = useRouter();
    const { setUser } = useAuthStore();
        const [loading, setLoading] = useState(false);
        const [uploading, setUploading] = useState(false);
        const [showPassword, setShowPassword] = useState(false);
        const [showConfirmPassword, setShowConfirmPassword] = useState(false);
        const [agreeToTerms, setAgreeToTerms] = useState(false);

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [city, setCity] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [profilePicture, setProfilePicture] = useState<ImagePicker.ImagePickerAsset | null>(null);

    const pickImage = async (
        setImage: (img: ImagePicker.ImagePickerAsset | null) => void
    ) => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
        });

        if (!result.canceled) {
            const selectedAsset = result.assets[0];

            if (
                typeof selectedAsset.fileSize === "number" &&
                selectedAsset.fileSize > MAX_IMAGE_SIZE_BYTES
            ) {
                Toast.show({ type: "error", text1: "Image must be 2MB or smaller" });
                return;
            }

            setImage(selectedAsset);
        }
    };

    const uploadToCloudinary = async (asset: ImagePicker.ImagePickerAsset) => {
        if (
            typeof asset.fileSize === "number" &&
            asset.fileSize > MAX_IMAGE_SIZE_BYTES
        ) {
            throw new Error("Image must be 2MB or smaller");
        }

        const formData = new FormData();

        formData.append('file', {
            uri: asset.uri,
            type: asset.mimeType ?? 'image/jpeg',
            name: asset.fileName ?? `upload-${Date.now()}.jpg`,
        } as any);

        formData.append("upload_preset", "unsigned_upload");

        const response = await axios.post(
                "https://api.cloudinary.com/v1_1/diocl7ilu/image/upload",
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        return response.data.secure_url;
    };

    const handleRegisterSubmit = async () => {
        if (
            !fullName ||
            !email ||
            !phoneNumber ||
            !city ||
            !password ||
            !confirmPassword ||
            !profilePicture
        ) {
            Toast.show({ type: "error", text1: "Please fill in all required fields" });
            return;
        }

        if (!agreeToTerms) {
            Toast.show({ type: "error", text1: "Please accept Terms and Privacy Policy" });
            return;
        }

        if (password !== confirmPassword) {
            Toast.show({ type: "error", text1: "Passwords do not match" });
            return;
        }

        try {
            setLoading(true);
            setUploading(true);

            const profileUrl = await uploadToCloudinary(profilePicture);

            const response = await AuthApi.registerApi({
                fullName,
                email,
                phoneNumber,
                city,
                password,
                role: "serviceProvider",
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
            setAgreeToTerms(false);

            router.replace("/");
        } catch (err: any) {
            const message =
                err?.response?.data?.message ||
                err?.message ||
                "Registration failed";
            Toast.show({ type: "error", text1: message });
        } finally {
            setUploading(false);
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
                                    placeholder="984444231"
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
                                    secureTextEntry={!showConfirmPassword}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                />
                                <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    {showConfirmPassword ? (
                                        <EyeOff size={20} color={colors.muted} />
                                    ) : (
                                        <Eye size={20} color={colors.muted} />
                                    )}
                                </Pressable>
                            </View>
                        </View>

                        <View className="gap-2">
                            <Text className="text-sm font-medium text-text">Profile picture</Text>
                            <Pressable
                                onPress={() => pickImage(setProfilePicture)}
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
                    </View>

                    {/* Terms */}
                    <Pressable
                        onPress={() => setAgreeToTerms((prev) => !prev)}
                        className="bg-secondary border border-border rounded-xl p-4 flex-row items-start gap-3"
                    >
                        <View
                            className={`w-5 h-5 rounded border mt-0.5 items-center justify-center ${agreeToTerms ? "bg-accent border-accent" : "border-border"
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