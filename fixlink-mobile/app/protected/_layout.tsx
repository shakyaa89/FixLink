import { Redirect, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/authStore";
import { ActivityIndicator } from "react-native";

export default function RootLayout() {
  const { checking, user } = useAuthStore();

  if (checking) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ActivityIndicator />
      </SafeAreaView>);
  }

  if (!user) {
    return <Redirect href="/" />;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaView>);
}
