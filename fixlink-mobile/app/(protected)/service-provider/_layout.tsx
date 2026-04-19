import { Redirect, Stack, usePathname } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { isServiceProviderProfileComplete } from "@/utils/serviceProviderProfile";

// Keeps service-provider routes safe and role-specific.
export default function RootLayout() {
  const { user } = useAuthStore();
  const pathname = usePathname();
  // Check whether provider profile has all required fields.
  const isProviderComplete = isServiceProviderProfileComplete(user);

  // Unauthenticated users are sent to the public entry page.
  if (!user) {
    return <Redirect href="/" />;
  }

  // Keep non-service-provider roles inside their own route groups.
  if (user.role !== "serviceProvider") {
    if (user.role === "user") {
      return <Redirect href="/user/dashboard" />;
    }

    if (user.role === "admin") {
      return <Redirect href="/admin-mobile" />;
    }

    return <Redirect href="/jobs" />;
  }

  // Force service providers to finish onboarding before accessing protected pages.
  if (!isProviderComplete && pathname !== "/service-provider/complete-profile") {
    return <Redirect href="/service-provider/complete-profile" />;
  }

  // Completed providers should not revisit onboarding unless verification was rejected.
  if (
    isProviderComplete &&
    pathname === "/service-provider/complete-profile" &&
    user.verificationStatus !== "rejected"
  ) {
    return <Redirect href="/service-provider/dashboard" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
