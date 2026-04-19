import { Redirect, Stack } from "expo-router";
import { useAuthStore } from "@/store/authStore";

// Keeps only normal users inside this route group.
export default function RootLayout() {
  const { user } = useAuthStore();

  // Keep unauthenticated users in public routes.
  if (!user) {
    return <Redirect href="/" />;
  }

  // Only allow user role inside the user route group.
  if (user.role !== "user") {
    if (user.role === "serviceProvider") {
      return <Redirect href="/service-provider/dashboard" />;
    }

    if (user.role === "admin") {
      return <Redirect href="/admin-mobile" />;
    }

    return <Redirect href="/jobs" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
