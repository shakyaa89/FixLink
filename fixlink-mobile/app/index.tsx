import { useRouter } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CheckCircle,
  Clock,
  Shield
} from "lucide-react-native";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";
import { isServiceProviderProfileComplete } from "@/utils/serviceProviderProfile";

export default function Index() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;

    if (user.role === "user") {
      router.replace("/user/dashboard");
      return;
    }

    if (user.role === "serviceProvider") {
      const isProviderComplete = isServiceProviderProfileComplete(user);
      router.replace(
        isProviderComplete
          ? "/service-provider/dashboard"
          : "/service-provider/complete-profile"
      );
      return;
    }

    if (user.role === "admin") {
      router.replace("/admin-mobile");
      return;
    }

    router.replace("/jobs");
  }, [user, router]);

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="flex-1 px-6 py-6 justify-between">


        {/* Hero Section */}
        <View className="gap-8 flex-1 justify-center items-center">
          <Image style={{ width: 200, height: 150}} resizeMode="contain" source={require('../assets/images/logo.png')} />
          <View className="gap-3">
            <Text className="text-5xl font-bold text-text leading-tight text-center">
              Home Repairs,{'\n'}
              <Text className="text-accent">Made Simple</Text>
            </Text>
            <Text className="text-lg text-muted leading-relaxed text-center">
              Connect with verified local service providers for quick, reliable home repairs.
            </Text>
          </View>

          {/* Quick Features */}
          <View className="flex-row gap-3">
            <View className="flex-1 bg-secondary border border-border rounded-xl p-3 items-center gap-2">
              <CheckCircle size={24} color="#3B82F6" />
              <Text className="text-xs text-text font-medium text-center">Verified{'\n'}Pros</Text>
            </View>
            <View className="flex-1 bg-secondary border border-border rounded-xl p-3 items-center gap-2">
              <Clock size={24} color="#3B82F6" />
              <Text className="text-xs text-text font-medium text-center">Fast{'\n'}Matching</Text>
            </View>
            <View className="flex-1 bg-secondary border border-border rounded-xl p-3 items-center gap-2">
              <Shield size={24} color="#3B82F6" />
              <Text className="text-xs text-text font-medium text-center">Quality{'\n'}Guarantee</Text>
            </View>
          </View>
        </View>

        {/* CTA Buttons */}
        <View className="gap-3">
          <Pressable
            className="bg-accent rounded-2xl py-4 items-center active:opacity-90"
            onPress={() => router.push("/public/login")}
          >
            <Text className="text-white text-lg font-bold">Get Started</Text>
          </Pressable>

          <View className="items-center pt-2">
            <Text className="text-xs text-muted">Highly Trusted by Users</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}