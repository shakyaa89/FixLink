import { Redirect, Stack, usePathname } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { isServiceProviderProfileComplete } from "@/utils/serviceProviderProfile";

export default function RootLayout() {
  const { user } = useAuthStore();
  const pathname = usePathname();
  const isProviderComplete = isServiceProviderProfileComplete(user);

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

  if (!isProviderComplete && pathname !== "/service-provider/complete-profile") {
    return <Redirect href="/service-provider/complete-profile" />;
  }

  if (
    isProviderComplete &&
    pathname === "/service-provider/complete-profile" &&
    user.verificationStatus !== "rejected"
  ) {
    return <Redirect href="/service-provider/dashboard" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
