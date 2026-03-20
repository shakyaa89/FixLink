import { Redirect, Stack } from "expo-router";
import { useAuthStore } from "@/store/authStore";

export default function RootLayout() {
  const { user } = useAuthStore();

  if (!user) {
    return <Redirect href="/" />;
  }

  if (user.role !== "serviceProvider") {
    if (user.role === "user") {
      return <Redirect href="/user/dashboard" />;
    }

    if (user.role === "admin") {
      return <Redirect href="/admin-mobile" />;
    }

    return <Redirect href="/jobs" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
