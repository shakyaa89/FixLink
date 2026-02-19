import { Redirect, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/authStore";

export default function RootLayout() {
  const { user } = useAuthStore();

  if (!user) {
    return <Redirect href="/" />;
  }

  if (user.role !== "user") {
    if (user.role === "serviceProvider") {
      return <Redirect href="/service-provider/dashboard" />;
    }

    return <Redirect href="/jobs" />;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaView>);
}
