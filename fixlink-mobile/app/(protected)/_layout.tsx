import { Redirect, Stack, usePathname } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { isServiceProviderProfileComplete } from "@/utils/serviceProviderProfile";


// Guards protected routes and redirects by auth and role.
export default function ProtectedLayout() {
    const { user } = useAuthStore();
    const pathname = usePathname();
    // Check provider onboarding status for guarded routes.
    const isProviderComplete = isServiceProviderProfileComplete(user);

    // Block unauthenticated access to protected routes.
    if (!user) {
        return <Redirect href="/public/login" />;
    }

    if (
        user.role === "serviceProvider" &&
        !isProviderComplete &&
        pathname !== "/service-provider/complete-profile"
    ) {
        // Incomplete provider profile goes to the complete profile page.
        return <Redirect href="/service-provider/complete-profile" />;
    }

    if (
        user.role === "serviceProvider" &&
        isProviderComplete &&
        pathname === "/service-provider/complete-profile" &&
        user.verificationStatus !== "rejected"
    ) {
        return <Redirect href="/service-provider/dashboard" />;
    }

    if (user.role === "admin" && pathname !== "/admin-mobile") {
        return <Redirect href="/admin-mobile" />;
    }

    return <Stack screenOptions={{ headerShown: false }} />;
}
