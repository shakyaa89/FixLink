import { Redirect, Stack } from "expo-router";
import { useAuthStore } from "@/store/authStore";


export default function PublicLayout() {
    const { user } = useAuthStore();

    if (user) {
        return <Redirect href="/jobs" />;
    }

    return <Stack screenOptions={{ headerShown: false }} />;
}
