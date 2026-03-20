import { Redirect, Stack, usePathname } from "expo-router";
import { useAuthStore } from "@/store/authStore";


export default function ProtectedLayout() {
    const { user } = useAuthStore();
    const pathname = usePathname();

    if (!user) {
        return <Redirect href="/public/login" />;
    }

    if (user.role === "admin" && pathname !== "/admin-mobile") {
        return <Redirect href="/admin-mobile" />;
    }

    return <Stack screenOptions={{ headerShown: false }} />;
}
