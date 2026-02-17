import { useRouter } from "expo-router";
import { Pressable, Text, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Wrench,
  Zap,
  Shield,
  Star,
  Home,
  Droplet,
  Wind,
  Paintbrush,
  Hammer,
  Lock
} from "lucide-react-native";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";

export default function Index() {
  const router = useRouter();

  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;

    if (user.role === "user") {
      router.replace("/protected/user/dashboard");
      return;
    }

    if (user.role === "serviceProvider") {
      router.replace("/protected/service-provider/dashboard");
      return;
    }

    router.replace("/protected/jobs");
  }, [user, router]);


  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pb-8">
          {/* Header with Logo */}
          <View className="pt-4 pb-6">
            <View className="flex-row items-center gap-2">
              <Text className="text-6xl font-bold text-text">FixLink</Text>
            </View>
          </View>

          {/* Hero Section */}
          <View className="gap-3 mb-8">
            <Text className="text-4xl font-bold text-text leading-tight">
              Home Repairs,{'\n'}
              <Text className="text-accent">Made Simple</Text>
            </Text>
            <Text className="text-lg text-muted leading-relaxed">
              Connect with verified local service providers for quick, reliable home repairs and maintenance.
            </Text>
          </View>

          {/* Popular Services */}
          <View className="mb-8">
            <Text className="text-lg font-semibold text-text mb-3">Services</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="gap-3"
            >
              <View className="bg-accent/10 border border-accent/30 rounded-xl px-4 py-3 mr-2 flex-row items-center gap-2">
                <Zap size={18} color="#3B82F6" />
                <Text className="text-accent font-medium">Electrical</Text>
              </View>
              <View className="bg-accent/10 border border-accent/30 rounded-xl px-4 py-3 mr-2 flex-row items-center gap-2">
                <Droplet size={18} color="#3B82F6" />
                <Text className="text-accent font-medium">Plumbing</Text>
              </View>
              <View className="bg-accent/10 border border-accent/30 rounded-xl px-4 py-3 mr-2 flex-row items-center gap-2">
                <Wind size={18} color="#3B82F6" />
                <Text className="text-accent font-medium">HVAC</Text>
              </View>
              <View className="bg-accent/10 border border-accent/30 rounded-xl px-4 py-3 mr-2 flex-row items-center gap-2">
                <Paintbrush size={18} color="#3B82F6" />
                <Text className="text-accent font-medium">Painting</Text>
              </View>
              <View className="bg-accent/10 border border-accent/30 rounded-xl px-4 py-3 flex-row items-center gap-2">
                <Hammer size={18} color="#3B82F6" />
                <Text className="text-accent font-medium">Carpentry</Text>
              </View>
            </ScrollView>
          </View>

          {/* CTA Buttons */}
          <View className="gap-3 mb-6">
            <Pressable
              className="bg-accent rounded-xl py-4 items-center active:opacity-90"
              onPress={() => router.push("/public/login")}
            >
              <Text className="text-white text-lg font-bold">Get Started</Text>
            </Pressable>
          </View>

          {/* Trust Badge */}
          <View className="items-center pb-4">
            <View className="bg-secondary border border-border rounded-full px-6 py-3 flex-row items-center gap-2">
              <Lock size={16} color="#9CA3AF" />
              <Text className="text-sm text-muted text-center">
                Secure • Trusted
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}