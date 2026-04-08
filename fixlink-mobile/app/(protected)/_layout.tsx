import { Redirect, Stack, usePathname } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { isServiceProviderProfileComplete } from "@/utils/serviceProviderProfile";


export default function ProtectedLayout() {
    const { user } = useAuthStore();
    const pathname = usePathname();
    const isProviderComplete = isServiceProviderProfileComplete(user);

    if (!user) {
        return <Redirect href="/public/login" />;
    }

    if (
        user.role === "serviceProvider" &&
        !isProviderComplete &&
        pathname !== "/service-provider/complete-profile"
    ) {
        return <Redirect href="/service-provider/complete-profile" />;
    }

    if (
        user.role === "serviceProvider" &&
        isProviderComplete &&
        pathname === "/service-provider/complete-profile"
    ) {
        return <Redirect href="/service-provider/dashboard" />;
    }

    if (user.role === "admin" && pathname !== "/admin-mobile") {
        return <Redirect href="/admin-mobile" />;
    }

    return <Stack screenOptions={{ headerShown: false }} />;
}
