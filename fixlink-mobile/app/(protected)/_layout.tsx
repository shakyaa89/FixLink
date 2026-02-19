import { Redirect, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/authStore";


export default function ProtectedLayout() {
    const { user } = useAuthStore();

    if (!user) {
        return <Redirect href="/public/login" />;
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false }} />
        </SafeAreaView>);
}
