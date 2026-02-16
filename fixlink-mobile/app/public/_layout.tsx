import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";


export default function PublicLayout() {
    const { user } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (user) {
            router.replace("/jobs");
        }
    }, [user])

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false }} />
        </SafeAreaView>);
}
