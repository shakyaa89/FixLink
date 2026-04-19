import { Redirect, Stack } from "expo-router";
import { useAuthStore } from "@/store/authStore";


// Wraps public routes and blocks signed-in users.
export default function PublicLayout() {
    // Public pages are for login and register only.
    const { user } = useAuthStore();

    // Authenticated users should not stay on public auth routes.
    if (user) {
        return <Redirect href="/jobs" />;
    }

    return <Stack screenOptions={{ headerShown: false }} />;
}
