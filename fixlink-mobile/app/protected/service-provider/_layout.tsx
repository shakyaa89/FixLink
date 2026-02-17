import { Redirect, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/authStore";

export default function RootLayout() {
  const { user } = useAuthStore();

  if (!user) {
    return <Redirect href="/" />;
  }

  if (user.role !== "serviceProvider") {
    if (user.role === "user") {
      return <Redirect href="/protected/user/dashboard" />;
    }

    return <Redirect href="/protected/jobs" />;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaView>);
}
